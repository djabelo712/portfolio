"""
QAOA for Portfolio Optimization
=============================

Builds the QAOA ansatz for the Markowitz portfolio optimization problem.
Reuses the same alternating-ansatz structure as Max-Cut QAOA but with a
different cost Hamiltonian derived from the QUBO encoding.

Author: Djabon Ounimborbitibou
"""

from __future__ import annotations
from dataclasses import dataclass
from typing import Callable, Optional
import numpy as np

from portfolio import PortfolioOptimization


@dataclass
class PortfolioQAOAResult:
    params: np.ndarray
    optimal_value: float
    approximation_ratio: float
    best_bitstring: str
    best_objective: float
    counts: dict[str, int]
    n_shots: int
    depth: int
    optimizer_iters: int


def build_portfolio_qaoa_circuit(
    port: PortfolioOptimization,
    gammas: list[float],
    betas: list[float],
):
    """
    Build the QAOA ansatz for portfolio optimization.

    The cost Hamiltonian is derived from the QUBO matrix Q:
        H_C = sum_{i<j} (Q_{ij}/4) Z_i Z_j + sum_i c_i Z_i

    The circuit alternates:
        1. RZZ(2*gamma*Q_{ij}/4) for each pair (i,j) with non-zero Q_{ij}
        2. RZ(2*gamma*c_i) for each qubit i with non-zero c_i
        3. RX(2*beta) for each qubit (mixer)
    """
    from qiskit import QuantumCircuit

    n = port.n
    p = len(gammas)
    assert len(betas) == p

    Q = port.qubo_matrix()
    qc = QuantumCircuit(n, n)

    # 1. Initial state: |+>^n
    for i in range(n):
        qc.h(i)

    # 2. p layers of cost + mixer
    for layer in range(p):
        gamma = gammas[layer]
        beta = betas[layer]

        # Cost evolution: two-qubit terms (Z_i Z_j)
        for i in range(n):
            for j in range(i + 1, n):
                if abs(Q[i, j]) > 1e-10:
                    qc.rzz(2 * gamma * Q[i, j] / 4, i, j)

        # Cost evolution: single-qubit terms (Z_i)
        for i in range(n):
            off_diag_sum = sum(Q[i, j] for j in range(n) if j != i)
            coeff = Q[i, i] / 2 - off_diag_sum / 4
            if abs(coeff) > 1e-10:
                qc.rz(2 * gamma * coeff, i)

        # Mixer evolution: Rx
        for i in range(n):
            qc.rx(2 * beta, i)

    # 3. Measure
    qc.measure(range(n), range(n))
    return qc


def run_portfolio_qaoa(
    port: PortfolioOptimization,
    depth: int = 1,
    n_shots: int = 4096,
    max_iter: int = 200,
    seed: int = 42,
    verbose: bool = True,
) -> PortfolioQAOAResult:
    """
    Run QAOA on the portfolio optimization problem.

    Returns a PortfolioQAOAResult with the optimized parameters, best bitstring,
    and approximation ratio relative to the classical Markowitz optimum.
    """
    from qiskit_aer import AerSimulator
    from qiskit import transpile
    from scipy.optimize import minimize
    from itertools import combinations

    rng = np.random.default_rng(seed)

    # 1. Initial parameters
    init_params = np.concatenate([
        rng.uniform(0, np.pi, depth),
        rng.uniform(0, np.pi / 2, depth),
    ])

    sim = AerSimulator(seed_simulator=seed)

    # 2. Classical optimal (brute force over C(n,k) subsets)
    classical_opt = port.classical_markowitz()
    opt_obj = classical_opt["objective"]

    # 3. Objective function: minimize the QUBO = maximize the Markowitz objective
    def objective(params: np.ndarray) -> float:
        gammas = params[:depth]
        betas = params[depth:]
        qc = build_portfolio_qaoa_circuit(port, gammas, betas)
        compiled = transpile(qc, sim, optimization_level=1)
        result = sim.run(compiled, shots=n_shots).result()
        counts = result.get_counts()

        # Compute mean QUBO value (= mean Markowitz objective * -1)
        total = sum(counts.values())
        mean_qubo = 0.0
        for bitstring, count in counts.items():
            x = np.array([int(c) for c in bitstring], dtype=int)
            mean_qubo += port.penalty_objective(x) * (count / total)
        return mean_qubo  # minimize

    # 4. Optimize with COBYLA
    result_opt = minimize(
        objective, init_params, method="COBYLA",
        options={"maxiter": max_iter, "rhobeg": 0.5},
    )
    optimal_params = result_opt.x

    # 5. Final circuit with optimized params
    gammas = optimal_params[:depth]
    betas = optimal_params[depth:]
    qc_final = build_portfolio_qaoa_circuit(port, gammas, betas)
    compiled = transpile(qc_final, sim, optimization_level=1)
    final_result = sim.run(compiled, shots=n_shots).result()
    final_counts = final_result.get_counts()

    # 6. Find best bitstring (highest Markowitz objective among feasible)
    best_bitstring = ""
    best_obj = -np.inf
    for bitstring, count in final_counts.items():
        x = np.array([int(c) for c in bitstring], dtype=int)
        # Only consider feasible solutions (budget = k)
        if np.sum(x) == port.k:
            obj = port.objective(x)
            if obj > best_obj:
                best_obj = obj
                best_bitstring = bitstring

    # If no feasible solution found, use the most probable
    if not best_bitstring:
        best_bitstring = max(final_counts, key=final_counts.get)
        x = np.array([int(c) for c in best_bitstring], dtype=int)
        best_obj = port.objective(x)

    # Approximation ratio: relative improvement over the worst feasible portfolio
    # For maximization problems with possibly negative objectives, use:
    #   ratio = (best - worst) / (opt - worst)   [0 = worst, 1 = optimal]
    from itertools import combinations
    all_objs = [port.objective(np.array([1 if i in combo else 0 for i in range(port.n)]))
                for combo in combinations(range(port.n), port.k)]
    worst_obj = min(all_objs)
    if opt_obj != worst_obj:
        approx_ratio = (best_obj - worst_obj) / (opt_obj - worst_obj)
    else:
        approx_ratio = 1.0

    if verbose:
        print(f"\nPortfolio QAOA (p={depth}, shots={n_shots})")
        print(f"  Classical optimal objective:  {opt_obj:.4f}")
        print(f"  Best QAOA objective:           {best_obj:.4f}")
        print(f"  Approximation ratio:           {approx_ratio:.4f}")
        print(f"  Best bitstring:                {best_bitstring}")
        print(f"  Budget satisfied:              {np.sum([int(c) for c in best_bitstring])} / {port.k}")
        print(f"  Optimizer evaluations:        {result_opt.nfev}")
        print(f"  Optimal gamma:                 {np.round(gammas, 4).tolist()}")
        print(f"  Optimal beta:                  {np.round(betas, 4).tolist()}")

    return PortfolioQAOAResult(
        params=optimal_params,
        optimal_value=best_obj,
        approximation_ratio=approx_ratio,
        best_bitstring=best_bitstring,
        best_objective=best_obj,
        counts=final_counts,
        n_shots=n_shots,
        depth=depth,
        optimizer_iters=result_opt.nfev,
    )
