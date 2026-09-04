"""
Portfolio optimization problem class
====================================

Encapsulates the Markowitz mean-variance portfolio optimization problem:
    max  mu^T x  -  lambda * x^T Sigma x
    s.t. sum(x_i) = k       (budget: pick exactly k of n assets)
         x_i in {0, 1}      (binary: include or not)

Encodes it as a QUBO for QAOA and provides:
  - Classical Markowitz solution (via scipy)
  - QUBO matrix construction
  - Qiskit cost Hamiltonian
  - Visualization (efficient frontier, weight bar chart)

Author: Djabon Ounimborbitibou
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional

import numpy as np


@dataclass
class PortfolioOptimization:
    """
    Markowitz portfolio optimization with a cardinality constraint.

    Problem:
        max  mu^T x - lambda * x^T Sigma x
        s.t. sum(x_i) = k, x in {0,1}^n

    where:
        mu    = expected returns vector (n,)
        Sigma = covariance matrix (n, n)
        k     = budget (number of assets to select)
        lambda = risk aversion parameter

    The QUBO encodes the cardinality constraint as a penalty:
        min  -mu^T x + lambda * x^T Sigma x + P * (sum(x) - k)^2

    where P is a large penalty coefficient.
    """

    mu: np.ndarray              # expected returns (n,)
    Sigma: np.ndarray           # covariance matrix (n, n)
    k: int                       # budget (number of assets to select)
    risk_aversion: float = 1.0   # lambda
    penalty: float = 10.0        # P (cardinality constraint penalty)
    asset_names: list[str] = field(default_factory=list)
    name: str = "portfolio"

    # ----------------------------------------------------------------
    @classmethod
    def from_returns(
        cls,
        returns: np.ndarray,
        k: int = 3,
        risk_aversion: float = 1.0,
        penalty: float = 10.0,
        asset_names: list[str] | None = None,
    ) -> "PortfolioOptimization":
        """
        Build from a returns matrix (T x n): each column is the time series
        of returns for asset i.

        Computes mu = mean(returns, axis=0) and Sigma = cov(returns, rowvar=False).
        """
        mu = np.mean(returns, axis=0)
        Sigma = np.cov(returns, rowvar=False)
        if asset_names is None:
            asset_names = [f"Asset_{i}" for i in range(len(mu))]
        return cls(
            mu=mu, Sigma=Sigma, k=k,
            risk_aversion=risk_aversion, penalty=penalty,
            asset_names=asset_names,
        )

    # ----------------------------------------------------------------
    @property
    def n(self) -> int:
        """Number of assets (= number of qubits)."""
        return len(self.mu)

    # ----------------------------------------------------------------
    def objective(self, x: np.ndarray) -> float:
        """
        Markowitz objective: mu^T x - lambda * x^T Sigma x
        (higher = better; we want to maximize this)
        """
        return float(self.mu @ x - self.risk_aversion * x @ self.Sigma @ x)

    # ----------------------------------------------------------------
    def penalty_objective(self, x: np.ndarray) -> float:
        """
        Full QUBO objective (minimization):
            -mu^T x + lambda * x^T Sigma x + P * (sum(x) - k)^2
        """
        budget_penalty = self.penalty * (np.sum(x) - self.k) ** 2
        return -self.mu @ x + self.risk_aversion * x @ self.Sigma @ x + budget_penalty

    # ----------------------------------------------------------------
    def qubo_matrix(self) -> np.ndarray:
        """
        The QUBO matrix Q such that min x^T Q x equals the penalty objective.

        Expanding:
            -mu^T x + lambda * x^T Sigma x + P * (sum(x) - k)^2
            = -mu^T x + lambda * x^T Sigma x + P * (sum x)^2 - 2Pk * sum(x) + P * k^2
            = x^T (lambda * Sigma + P * J) x + (-mu - 2Pk * 1) x + P * k^2

        where J = all-ones matrix (from (sum x)^2 = x^T J x).

        The QUBO matrix (without the constant) is:
            Q = lambda * Sigma + P * J  - diag(mu + 2Pk)
        (diagonal absorbs the linear terms: -mu_i - 2*P*k on position i)

        We drop the constant P * k^2 (no effect on optimization).
        """
        n = self.n
        Q = self.risk_aversion * self.Sigma.copy()
        Q += self.penalty * np.ones((n, n))  # P * J
        np.fill_diagonal(Q, np.diag(Q) - self.mu - 2 * self.penalty * self.k)
        return Q

    # ----------------------------------------------------------------
    def cost_hamiltonian(self):
        """
        Build the cost Hamiltonian from the QUBO matrix.

        For a QUBO min x^T Q x with x_i in {0,1}:
            x_i = (1 - Z_i) / 2
            x^T Q x = sum_{i<j} Q_{ij} (1-Z_i)(1-Z_j)/4 + sum_i Q_{ii} (1-Z_i)/2

        The Hamiltonian is the Ising form:
            H_C = sum_{i<j} Q_{ij} Z_i Z_j / 4 + sum_i (Q_{ii}/2 - sum_{j!=i} Q_{ij}/4) Z_i + const
        """
        from qiskit.quantum_info import SparsePauliOp

        n = self.n
        Q = self.qubo_matrix()
        paulis: list[str] = []
        coeffs: list[float] = []

        # Two-qubit terms: Z_i Z_j with coefficient Q_{ij}/4
        for i in range(n):
            for j in range(i + 1, n):
                if abs(Q[i, j]) > 1e-10:
                    label = ["I"] * n
                    label[n - 1 - i] = "Z"
                    label[n - 1 - j] = "Z"
                    paulis.append("".join(label))
                    coeffs.append(Q[i, j] / 4)

        # Single-qubit terms: Z_i with coefficient (Q_{ii}/2 - sum_{j!=i} Q_{ij}/4)
        for i in range(n):
            off_diag_sum = sum(Q[i, j] for j in range(n) if j != i)
            coeff = Q[i, i] / 2 - off_diag_sum / 4
            if abs(coeff) > 1e-10:
                label = ["I"] * n
                label[n - 1 - i] = "Z"
                paulis.append("".join(label))
                coeffs.append(coeff)

        return SparsePauliOp.from_list(list(zip(paulis, coeffs)))

    # ----------------------------------------------------------------
    def mixer_hamiltonian(self):
        """
        Standard X mixer: H_M = sum_i X_i
        """
        from qiskit.quantum_info import SparsePauliOp

        n = self.n
        paulis: list[str] = []
        coeffs: list[float] = []
        for i in range(n):
            label = ["I"] * n
            label[n - 1 - i] = "X"
            paulis.append("".join(label))
            coeffs.append(1.0)
        return SparsePauliOp.from_list(list(zip(paulis, coeffs)))

    # ----------------------------------------------------------------
    def classical_markowitz(self) -> dict:
        """
        Classical solution: enumerate all C(n,k) subsets of size k,
        evaluate the Markowitz objective for each, return the best.

        This is exact for n <= ~20 (C(20,10) = 184756 — feasible).
        """
        from itertools import combinations

        best_obj = -np.inf
        best_x = None
        for combo in combinations(range(self.n), self.k):
            x = np.zeros(self.n, dtype=int)
            x[list(combo)] = 1
            obj = self.objective(x)
            if obj > best_obj:
                best_obj = obj
                best_x = x.copy()

        return {
            "x": best_x,
            "objective": best_obj,
            "return": float(self.mu @ best_x),
            "risk": float(best_x @ self.Sigma @ best_x),
            "assets": [self.asset_names[i] for i in range(self.n) if best_x[i] == 1],
        }

    # ----------------------------------------------------------------
    def evaluate_portfolio(self, x: np.ndarray) -> dict:
        """Evaluate a binary portfolio vector."""
        x = np.asarray(x, dtype=int)
        if isinstance(x, str):
            x = np.array([int(c) for c in x], dtype=int)
        return {
            "x": x,
            "objective": self.objective(x),
            "return": float(self.mu @ x),
            "risk": float(x @ self.Sigma @ x),
            "budget": int(np.sum(x)),
            "assets": [self.asset_names[i] for i in range(self.n) if x[i] == 1],
        }

    # ----------------------------------------------------------------
    def brute_force_optimal(self) -> tuple[float, str]:
        """Same as classical_markowitz but returns (objective, bitstring)."""
        result = self.classical_markowitz()
        bitstring = "".join(str(int(b)) for b in result["x"])
        return result["objective"], bitstring

    # ----------------------------------------------------------------
    def efficient_frontier(self, n_points: int = 50) -> np.ndarray:
        """
        Compute the efficient frontier: for each target return level,
        find the minimum-variance portfolio (continuous relaxation, not binary).

        Returns an array of shape (n_points, 2): [return, risk].
        """
        from scipy.optimize import minimize

        n = self.n
        frontier = []

        for target_return in np.linspace(min(self.mu), max(self.mu), n_points):
            def neg_sharpe(w):
                ret = self.mu @ w
                risk = w @ self.Sigma @ w
                return risk

            cons = [
                {"type": "eq", "fun": lambda w: np.sum(w) - 1.0},
                {"type": "eq", "fun": lambda w: self.mu @ w - target_return},
            ]
            bounds = [(0, 1)] * n
            w0 = np.ones(n) / n
            res = minimize(neg_sharpe, w0, method="SLSQP",
                           bounds=bounds, constraints=cons,
                           options={"maxiter": 500, "ftol": 1e-10})
            if res.success:
                frontier.append([target_return, res.fun])

        return np.array(frontier)

    # ----------------------------------------------------------------
    def summary(self) -> str:
        lines = [
            f"Portfolio Optimization: {self.name}",
            f"  Assets (qubits): {self.n}",
            f"  Budget k:        {self.k}",
            f"  Risk aversion:  {self.risk_aversion}",
            f"  Penalty P:       {self.penalty}",
            f"  Expected returns: {np.round(self.mu, 4).tolist()}",
            f"  Asset names:     {self.asset_names}",
        ]
        return "\n".join(lines)

    def __repr__(self) -> str:
        return f"PortfolioOptimization(n={self.n}, k={self.k}, name={self.name!r})"
