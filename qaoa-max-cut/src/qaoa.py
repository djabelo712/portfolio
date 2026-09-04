"""
QAOA implementation
==================

Builds the Quantum Approximate Optimization Algorithm (Farhi, Goldstone, Gutmann 2014)
for the Max-Cut problem, using Qiskit.

  - Builds the QAOA ansatz |ψ(γ, β)⟩ at depth p
  - Optimizes (γ, β) via classical optimization (COBYLA or SPSA)
  - Runs on AerSimulator (or IBM Quantum hardware, optional)
  - Returns the most probable bitstrings and the approximation ratio

Author: Djabon Ounimborbitibou
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Callable, Optional

import numpy as np
import networkx as nx

from max_cut import MaxCut


@dataclass
class QAOAResult:
    """Container for QAOA run results."""
    params: np.ndarray                  # optimized (γ, β) values
    optimal_value: float                # final energy = -⟨H_C⟩
    approximation_ratio: float         # (mean cut value) / (optimal cut)
    best_bitstring: str                 # most probable measurement outcome
    best_cut_value: int                # cut value of best_bitstring
    counts: dict[str, int]             # measurement histogram
    n_shots: int
    depth: int                          # QAOA depth p
    optimizer_iters: int               # number of optimizer iterations


def build_qaoa_circuit(max_cut: MaxCut, gammas: list[float], betas: list[float]):
    """
    Build the QAOA ansatz circuit at depth p.

        |ψ(γ, β)⟩ = exp(-i β_p H_M) exp(-i γ_p H_C) ⋯ exp(-i β_1 H_M) exp(-i γ_1 H_C) |+⟩^⊗n

    where:
        H_C = -Σ_{(i,j)∈E} (1 - Z_i Z_j) / 2      (cost)
        H_M = Σ_i X_i                              (mixer)
        |+⟩^⊗n = H^⊗n |0⟩^⊗n                        (uniform superposition)

    Args:
        max_cut:   the Max-Cut instance
        gammas:    list of p cost-phase angles γ_k
        betas:     list of p mixer angles β_k

    Returns:
        A Qiskit `QuantumCircuit`.
    """
    from qiskit import QuantumCircuit
    from qiskit.circuit import Parameter

    n = max_cut.n
    p = len(gammas)
    assert len(betas) == p, "gammas and betas must have same length"

    qc = QuantumCircuit(n, n)

    # 1. Initial state: Hadamard on every qubit
    for i in range(n):
        qc.h(i)

    # 2. Apply p layers of (cost evolution, mixer evolution)
    for k in range(p):
        gamma = gammas[k]
        beta = betas[k]

        # Cost evolution: for each edge (i, j), apply a ZZ rotation
        #   exp(-i γ H_C) on the term -Z_i Z_j / 2  =  RZZ(γ) on edge (i, j)
        # (since exp(+i γ Z_i Z_j / 2) = RZZ(γ) — note the sign convention)
        for i, j in max_cut.edges:
            qc.rzz(2 * gamma, i, j)  # rzz(θ) = exp(-i θ Z⊗Z / 2); use θ = 2γ to absorb the 1/2

        # Mixer evolution: for each qubit, apply Rx rotation
        #   exp(-i β X_i) = Rx(2β)
        for i in range(n):
            qc.rx(2 * beta, i)

    # 3. Measurement
    qc.measure(range(n), range(n))
    return qc


def expectation_value(counts: dict[str, int], max_cut: MaxCut) -> float:
    """
    The QAOA *energy* is ⟨H_C⟩ = -⟨Σ (1 - Z_i Z_j)/2⟩, which equals
    -(mean cut value).

    But for visualization we usually want the **mean cut value** = ⟨C⟩ = -⟨H_C⟩.
    Here we return the mean cut value (higher = better).
    """
    total = sum(counts.values())
    if total == 0:
        return 0.0
    mean_cut = 0.0
    for bitstring, count in counts.items():
        cut = max_cut.cut_value(bitstring)
        mean_cut += cut * (count / total)
    return mean_cut


def run_qaoa(
    max_cut: MaxCut,
    depth: int = 1,
    n_shots: int = 2048,
    optimizer: str = "COBYLA",
    max_iter: int = 100,
    seed: int | None = 42,
    init_params: Optional[np.ndarray] = None,
    verbose: bool = True,
) -> QAOAResult:
    """
    Run QAOA on the given Max-Cut instance.

    Args:
        max_cut:    the Max-Cut problem instance
        depth:      QAOA depth p
        n_shots:    number of shots per energy evaluation
        optimizer:  'COBYLA' or 'SPSA'
        max_iter:   optimizer iteration count
        seed:       RNG seed for reproducibility
        init_params: initial (γ, β) values. If None, random in [0, π].
        verbose:    print progress

    Returns:
        A `QAOAResult` object with all the run details.
    """
    from qiskit_aer import AerSimulator
    from qiskit import transpile
    from scipy.optimize import minimize

    rng = np.random.default_rng(seed)

    # 1. Initialize parameters
    if init_params is None:
        init_params = np.concatenate([
            rng.uniform(0, np.pi, depth),       # γ_1, ..., γ_p
            rng.uniform(0, np.pi / 2, depth),   # β_1, ..., β_p
        ])

    sim = AerSimulator(seed_simulator=seed)

    # 2. Pre-compute optimal cut value (for approximation ratio)
    if max_cut.n <= 20:
        opt_cut, _ = max_cut.brute_force_optimal()
    else:
        # For large graphs: estimate from GW lower bound (we'll add classical.py later)
        opt_cut = max_cut.m / 2  # trivial lower bound: random cut gives m/2

    # 3. Define the objective function
    def objective(params: np.ndarray) -> float:
        gammas = params[:depth]
        betas = params[depth:]
        qc = build_qaoa_circuit(max_cut, gammas, betas)
        compiled = transpile(qc, sim, optimization_level=1)
        result = sim.run(compiled, shots=n_shots).result()
        counts = result.get_counts()
        mean_cut = expectation_value(counts, max_cut)
        # We minimize -mean_cut (so optimizer converges to max cut)
        return -mean_cut

    # 4. Optimize
    if optimizer.upper() == "COBYLA":
        from scipy.optimize import minimize as sci_minimize
        result_opt = sci_minimize(
            objective, init_params, method="COBYLA",
            options={"maxiter": max_iter, "rhobeg": 0.5},
        )
        optimal_params = result_opt.x
        n_iters = result_opt.nfev
    elif optimizer.upper() == "SPSA":
        # SPSA — robust to noise, recommended for hardware
        # Use a simple SPSA implementation
        optimal_params, n_iters = spsa_optimize(objective, init_params, max_iter=max_iter)
    else:
        raise ValueError(f"Unknown optimizer: {optimizer}")

    # 5. Run final circuit with optimized params
    gammas = optimal_params[:depth]
    betas = optimal_params[depth:]
    qc_final = build_qaoa_circuit(max_cut, gammas, betas)
    compiled = transpile(qc_final, sim, optimization_level=1)
    final_result = sim.run(compiled, shots=n_shots).result()
    final_counts = final_result.get_counts()

    # 6. Extract best bitstring (most probable)
    best_bitstring = max(final_counts, key=final_counts.get)
    best_cut = max_cut.cut_value(best_bitstring)

    # 7. Compute approximation ratio
    mean_cut = expectation_value(final_counts, max_cut)
    approx_ratio = mean_cut / opt_cut if opt_cut > 0 else 0.0

    if verbose:
        print(f"\nQAOA (p={depth}, optimizer={optimizer}, shots={n_shots})")
        print(f"  Optimal cut value:        {opt_cut}")
        print(f"  Best bitstring found:      {best_bitstring}  (cut = {best_cut})")
        print(f"  Mean cut value ⟨C⟩:       {mean_cut:.3f}")
        print(f"  Approximation ratio:       {approx_ratio:.4f}")
        print(f"  Optimizer evaluations:    {n_iters}")
        print(f"  Optimal γ:                 {np.round(gammas, 4).tolist()}")
        print(f"  Optimal β:                 {np.round(betas, 4).tolist()}")

    return QAOAResult(
        params=optimal_params,
        optimal_value=-mean_cut,
        approximation_ratio=approx_ratio,
        best_bitstring=best_bitstring,
        best_cut_value=best_cut,
        counts=final_counts,
        n_shots=n_shots,
        depth=depth,
        optimizer_iters=n_iters,
    )


def spsa_optimize(
    func: Callable[[np.ndarray], float],
    x0: np.ndarray,
    max_iter: int = 100,
    a: float = 0.1,
    c: float = 0.1,
    alpha: float = 0.602,
    gamma: float = 0.101,
    seed: int | None = 42,
) -> tuple[np.ndarray, int]:
    """
    Simple SPSA (Simultaneous Perturbation Stochastic Approximation) optimizer.
    Robust to noise in function evaluations — recommended for quantum hardware.
    """
    rng = np.random.default_rng(seed)
    x = x0.copy()
    A = max_iter / 10  # stability constant

    for k in range(1, max_iter + 1):
        # Step sizes
        a_k = a / (k + A) ** alpha
        c_k = c / k ** gamma

        # Random ±1 perturbation
        delta = rng.choice([-1, 1], size=x.shape)

        # Two-point gradient estimate
        f_plus = func(x + c_k * delta)
        f_minus = func(x - c_k * delta)
        grad = (f_plus - f_minus) / (2 * c_k * delta)

        # Update
        x = x - a_k * grad

    return x, max_iter
