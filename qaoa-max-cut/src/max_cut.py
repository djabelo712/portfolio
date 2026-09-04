"""
Max-Cut problem class
====================

Encapsulates a Max-Cut instance: a graph G = (V, E), and provides:
  - The cost Hamiltonian as a Qiskit PauliSumOp
  - The QUBO matrix for classical solvers
  - The brute-force optimal cut (exact, for small graphs)
  - Visualization helpers

Author: Djabon Ounimborbitibou
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Iterable

import networkx as nx
import numpy as np


@dataclass
class MaxCut:
    """
    A Max-Cut problem on a graph G = (V, E).

    Convention
    ----------
    Each node i is assigned a binary variable z_i ∈ {0, 1}, where z_i = 0 means
    "side A of the cut" and z_i = 1 means "side B". An edge (i, j) is *cut* iff
    z_i ≠ z_j, equivalently when the spin s_i = (-1)^z_i = +1 and s_j = -1 or vice versa.

    The Max-Cut objective is:
        C(z) = Σ_{(i,j) ∈ E} [z_i ⊕ z_j] = (1/2) Σ_{(i,j) ∈ E} (1 - s_i s_j)

    Maximizing C is equivalent to minimizing the Ising energy:
        H_C = -Σ_{(i,j) ∈ E} (1 - σ_i^z σ_j^z) / 2  ≡  -Σ_{(i,j) ∈ E} (1 - Z_i Z_j) / 2

    (The constant offset of |E|/2 doesn't affect the optimizer.)
    """

    graph: nx.Graph
    name: str = "max-cut"

    # ----------------------------------------------------------------
    # Construction
    # ----------------------------------------------------------------
    @classmethod
    def from_edges(cls, n: int, edges: Iterable[tuple[int, int]], name: str = "max-cut") -> "MaxCut":
        """Build a MaxCut instance from an explicit edge list."""
        G = nx.Graph()
        G.add_nodes_from(range(n))
        G.add_edges_from(edges)
        return cls(graph=G, name=name)

    @classmethod
    def petersen(cls) -> "MaxCut":
        """The Petersen graph — a classic 10-node 3-regular graph used in QAOA papers."""
        return cls(graph=nx.petersen_graph(), name="Petersen")

    @classmethod
    def cycle(cls, n: int) -> "MaxCut":
        """Cycle graph on n vertices — trivial Max-Cut, useful for unit tests."""
        return cls(graph=nx.cycle_graph(n), name=f"cycle-{n}")

    @classmethod
    def random_regular(cls, n: int, d: int, seed: int | None = None) -> "MaxCut":
        """
        Random d-regular graph on n vertices. The standard test case for
        QAOA research (Farhi et al. 2019 use 3-regular graphs).
        """
        G = nx.random_regular_graph(d, n, seed=seed)
        return cls(graph=G, name=f"reg-{n}-{d}")

    # ----------------------------------------------------------------
    # Properties
    # ----------------------------------------------------------------
    @property
    def n(self) -> int:
        """Number of nodes (= number of qubits needed)."""
        return self.graph.number_of_nodes()

    @property
    def m(self) -> int:
        """Number of edges."""
        return self.graph.number_of_edges()

    @property
    def edges(self) -> list[tuple[int, int]]:
        return list(self.graph.edges())

    # ----------------------------------------------------------------
    # Classical evaluation
    # ----------------------------------------------------------------
    def cut_value(self, assignment: tuple[int, ...] | str | np.ndarray) -> int:
        """
        Number of edges cut by `assignment` (a binary string of length n).
        Example: assignment = "00110" means nodes 2 and 3 are on side B; rest on A.
        """
        if isinstance(assignment, str):
            assignment = np.array([int(c) for c in assignment], dtype=int)
        else:
            assignment = np.asarray(assignment, dtype=int)

        cut = 0
        for i, j in self.edges:
            if assignment[i] != assignment[j]:
                cut += 1
        return cut

    def brute_force_optimal(self) -> tuple[int, str]:
        """
        Exact optimal cut by exhaustive search. Only feasible for n ≤ ~20.

        Returns (max_cut_value, optimal_bitstring).
        """
        best = -1
        best_z: str = ""
        for k in range(2 ** self.n):
            z = format(k, f"0{self.n}b")
            v = self.cut_value(z)
            if v > best:
                best = v
                best_z = z
        return best, best_z

    def brute_force_all_optimal(self) -> list[str]:
        """All optimal bitstrings (there may be several — bit-flip symmetry)."""
        best, _ = self.brute_force_optimal()
        return [format(k, f"0{self.n}b") for k in range(2 ** self.n) if self.cut_value(format(k, f"0{self.n}b")) == best]

    # ----------------------------------------------------------------
    # QUBO matrix (for classical QUBO solvers and QAOA-on-QUBO)
    # ----------------------------------------------------------------
    def qubo_matrix(self) -> np.ndarray:
        """
        The QUBO matrix Q such that
            x^T Q x  = -C(x)   (we minimize, Max-Cut maximizes)

        Standard Max-Cut QUBO (with x_i ∈ {0, 1}):
            minimize  -Σ_{(i,j) ∈ E} (x_i + x_j - 2 x_i x_j)
            which equals  -Σ_{(i,j)} (x_i + x_j) + 2 Σ_{(i,j)} x_i x_j
        """
        Q = np.zeros((self.n, self.n))
        for i, j in self.edges:
            Q[i, i] -= 1
            Q[j, j] -= 1
            Q[i, j] += 2
            Q[j, i] += 2
        return Q

    # ----------------------------------------------------------------
    # Qiskit Hamiltonian
    # ----------------------------------------------------------------
    def cost_hamiltonian(self):
        """
        The Max-Cut cost Hamiltonian:
            H_C = Σ_{(i,j) ∈ E} (1 - Z_i Z_j) / 2

        We drop the constant 1/2 (no observable effect on optimization);
        the operator we return is therefore:
            H_C = -Σ_{(i,j) ∈ E} (Z_i Z_j) / 2

        Equivalent to maximizing Σ_{(i,j)} (Z_i Z_j) → but QAOA convention is to
        minimize ⟨H_C⟩, so we use the form that matches the textbook QAOA.

        Returns a Qiskit `SparsePauliOp`.
        """
        from qiskit.quantum_info import SparsePauliOp

        n = self.n
        # Pauli strings are stored left-to-right as q_{n-1}...q_1 q_0 in Qiskit.
        # We construct one term Z_i Z_j per edge.
        paulis: list[str] = []
        coeffs: list[float] = []
        for i, j in self.edges:
            # Build the Pauli label: 'I' on every qubit except i, j
            label = ["I"] * n
            label[n - 1 - i] = "Z"
            label[n - 1 - j] = "Z"
            paulis.append("".join(label))
            coeffs.append(-0.5)  # coefficient of -1/2 to match -Z_i Z_j / 2

        return SparsePauliOp.from_list(list(zip(paulis, coeffs)))

    def mixer_hamiltonian(self):
        """
        The standard QAOA mixer:
            H_M = Σ_i X_i

        Returns a Qiskit `SparsePauliOp`.
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
    # Visualization
    # ----------------------------------------------------------------
    def draw(self, assignment: str | None = None, ax=None, title: str | None = None):
        """
        Draw the graph. If `assignment` is given, color nodes by side (red/blue)
        and highlight cut edges in gold.
        """
        import matplotlib.pyplot as plt

        if ax is None:
            fig, ax = plt.subplots(figsize=(5, 5), constrained_layout=True)

        pos = nx.spring_layout(self.graph, seed=42)

        if assignment is None:
            node_colors = "#1B2A4E"
            edge_colors = "#5C6478"
            edge_widths = 1.5
        else:
            if isinstance(assignment, str):
                bits = [int(c) for c in assignment]
            else:
                bits = list(assignment)
            # Two-tone nodes
            node_colors = ["#1B2A4E" if b == 0 else "#B87333" for b in bits]
            # Highlight cut edges
            cut_edges: list[tuple[int, int]] = []
            uncut_edges: list[tuple[int, int]] = []
            for i, j in self.edges:
                if bits[i] != bits[j]:
                    cut_edges.append((i, j))
                else:
                    uncut_edges.append((i, j))
            nx.draw_networkx_edges(self.graph, pos, edgelist=uncut_edges,
                                   edge_color="#9CA3AF", width=1.2, ax=ax)
            nx.draw_networkx_edges(self.graph, pos, edgelist=cut_edges,
                                   edge_color="#B87333", width=3.0, ax=ax, style="solid")
            edge_widths = 0  # already drawn

        nx.draw_networkx_nodes(self.graph, pos, node_color=node_colors,
                               node_size=520, ax=ax, edgecolors="white", linewidths=2)
        nx.draw_networkx_labels(self.graph, pos, font_color="white", font_size=11,
                                font_weight="bold", ax=ax)

        if assignment is None:
            nx.draw_networkx_edges(self.graph, pos, edge_color=edge_colors,
                                   width=edge_widths, ax=ax)

        if title:
            ax.set_title(title, fontsize=13, fontweight="bold", color="#1B2A4E")
        ax.axis("off")

        return ax

    # ----------------------------------------------------------------
    # Summary
    # ----------------------------------------------------------------
    def summary(self) -> str:
        best, z = self.brute_force_optimal() if self.n <= 20 else (-1, "?")
        lines = [
            f"Max-Cut instance: {self.name}",
            f"  Nodes (qubits): {self.n}",
            f"  Edges:          {self.m}",
            f"  Max cut:        {best}  (bitstring: {z})" if best >= 0 else f"  Max cut:        (too large for brute force)",
            f"  Edge density:   {2 * self.m / (self.n * (self.n - 1)):.3f}",
        ]
        return "\n".join(lines)

    def __repr__(self) -> str:
        return f"MaxCut(name={self.name!r}, n={self.n}, m={self.m})"
