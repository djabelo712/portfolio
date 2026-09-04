"""
Classical baselines for Max-Cut
==============================

Provides two classical references against which QAOA is compared:

  1. Brute force — exact optimum for small graphs (n ≤ ~20)
  2. Goemans-Williamson (GW) SDP relaxation — best known polynomial-time
     classical approximation, guaranteed approximation ratio ≥ 0.878

Author: Djabon Ounimborbitibou
"""

from __future__ import annotations

import numpy as np
import networkx as nx

from max_cut import MaxCut


def brute_force_optimal(max_cut: MaxCut) -> tuple[int, str]:
    """
    Exact optimal cut by exhaustive enumeration. Exponential in n.

    Use for n ≤ 20 (≈ 1M evaluations, ~1 sec).
    """
    return max_cut.brute_force_optimal()


def random_cut(max_cut: MaxCut, seed: int | None = None) -> tuple[int, str]:
    """
    Random cut: assign each node to side 0 or 1 with probability 1/2 each.
    Expected cut value = m/2 (each edge is cut with probability 1/2).
    """
    rng = np.random.default_rng(seed)
    bits = rng.integers(0, 2, size=max_cut.n)
    bitstring = "".join(str(b) for b in bits)
    return max_cut.cut_value(bitstring), bitstring


def greedy_cut(max_cut: MaxCut, seed: int | None = None) -> tuple[int, str]:
    """
    Simple greedy heuristic: assign nodes one at a time, each to the side
    that maximizes the local cut contribution from already-assigned neighbors.

    Not optimal but very fast (O(n + m)).
    """
    rng = np.random.default_rng(seed)
    G = max_cut.graph
    n = max_cut.n
    assignment = [-1] * n
    # Process nodes in random order
    order = list(range(n))
    rng.shuffle(order)

    for v in order:
        # Try both sides, pick the one that cuts more already-assigned edges
        cut_if_0 = sum(1 for u in G.neighbors(v) if assignment[u] == 1)
        cut_if_1 = sum(1 for u in G.neighbors(v) if assignment[u] == 0)
        assignment[v] = 0 if cut_if_0 >= cut_if_1 else 1

    bitstring = "".join(str(b) for b in assignment)
    return max_cut.cut_value(bitstring), bitstring


def goemans_williamson(max_cut: MaxCut, seed: int | None = 42) -> tuple[int, str]:
    """
    Goemans-Williamson SDP relaxation (1995).

    Guaranteed approximation ratio ≥ 0.878 (and ≥ 0.929 under the
    Unique Games Conjecture — Khot-Kindler-Mossel-O'Donnell 2007).

    Algorithm
    ---------
    1. Solve the SDP relaxation:
       max  Σ_{(i,j)∈E} (1 - ⟨v_i, v_j⟩) / 2
       s.t. ‖v_i‖² = 1 ∀i
    2. Round via random hyperplane: choose random vector g ∈ R^n,
       assign node i to side 0 if ⟨g, v_i⟩ ≥ 0, else side 1.

    The SDP is solved via `cvxpy`. Install with: `pip install cvxpy`.

    Args:
        max_cut: Max-Cut instance
        seed:    RNG seed for the rounding step

    Returns:
        (cut_value, bitstring)
    """
    import cvxpy as cp

    G = max_cut.graph
    n = max_cut.n

    # 1. SDP variables: each v_i is a unit vector in R^n
    V = cp.Variable((n, n), symmetric=True)
    # Constraints: ‖v_i‖² = 1 → diagonal of V·Vᵀ = 1, i.e. V[i,i] = 1 (since V = Vᵀ·V)
    constraints = [V >> 0]  # PSD
    for i in range(n):
        constraints.append(V[i, i] == 1)

    # Objective: maximize Σ (1 - V[i,j]) / 2  over edges
    sdp_obj = 0
    for i, j in G.edges():
        sdp_obj += (1 - V[i, j]) / 2
    prob = cp.Problem(cp.Maximize(sdp_obj), constraints)
    prob.solve(solver=cp.SCS, verbose=False)

    # 2. Extract the Gram matrix: V_opt = X·Xᵀ where X is the SDP solution
    V_opt = V.value
    # Make sure V_opt is symmetric and PSD (numerical safety)
    V_opt = (V_opt + V_opt.T) / 2
    # Eigenvalue clip to handle numerical issues from cvxpy
    eigvals, eigvecs = np.linalg.eigh(V_opt)
    eigvals = np.clip(eigvals, 0, None)
    V_opt = eigvecs @ np.diag(eigvals) @ eigvecs.T
    # Add small jitter for stability, then Cholesky-factorize
    X = np.linalg.cholesky(V_opt + 1e-6 * np.eye(n))

    # 3. Random hyperplane rounding
    rng = np.random.default_rng(seed)
    g = rng.standard_normal(n)
    g /= np.linalg.norm(g)

    assignments = (X @ g) >= 0
    bitstring = "".join(str(int(b)) for b in assignments)
    return max_cut.cut_value(bitstring), bitstring


def all_baselines(max_cut: MaxCut, seed: int | None = 42) -> dict:
    """
    Run all classical baselines on `max_cut` and return a summary dict.
    """
    results = {}
    # Random
    val, b = random_cut(max_cut, seed=seed)
    results["random"] = {"value": val, "bitstring": b, "approx_ratio": val / max_cut.m if max_cut.m > 0 else 0}
    # Greedy
    val, b = greedy_cut(max_cut, seed=seed)
    results["greedy"] = {"value": val, "bitstring": b, "approx_ratio": val / max_cut.m if max_cut.m > 0 else 0}
    # Goemans-Williamson (only if cvxpy is available)
    try:
        val, b = goemans_williamson(max_cut, seed=seed)
        results["goemans_williamson"] = {"value": val, "bitstring": b, "approx_ratio": val / max_cut.m if max_cut.m > 0 else 0}
    except ImportError:
        results["goemans_williamson"] = {"value": None, "bitstring": None, "approx_ratio": None, "note": "cvxpy not installed"}
    # Brute force (only for small graphs)
    if max_cut.n <= 20:
        val, b = brute_force_optimal(max_cut)
        results["brute_force"] = {"value": val, "bitstring": b, "approx_ratio": 1.0}  # optimal = 1.0
    else:
        results["brute_force"] = {"value": None, "bitstring": None, "approx_ratio": None, "note": "graph too large for brute force"}
    return results
