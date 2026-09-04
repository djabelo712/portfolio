"""
Plotting helpers for Max-Cut QAOA
================================

Generates publication-ready figures for the portfolio.

Author: Djabon Ounimborbitibou
"""

from __future__ import annotations
from pathlib import Path

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm

# Use a clean academic look + the Quantum Indigo palette of the portfolio
PRIMARY = "#1B2A4E"
ACCENT = "#B87333"
WARM = "#D49968"
INK = "#1B2A4E"
PAPER = "#FAF7F2"
MUTED = "#5C6478"
TAN = "#E8E2D5"


def setup_matplotlib():
    """Apply the academic style to all subsequent matplotlib plots."""
    plt.rcParams.update({
        "font.family": "serif",
        "font.size": 11,
        "axes.titlesize": 13,
        "axes.titleweight": "bold",
        "axes.labelsize": 11,
        "axes.labelcolor": INK,
        "axes.edgecolor": MUTED,
        "axes.linewidth": 0.8,
        "axes.spines.top": False,
        "axes.spines.right": False,
        "xtick.color": MUTED,
        "ytick.color": MUTED,
        "xtick.labelsize": 10,
        "ytick.labelsize": 10,
        "legend.frameon": False,
        "legend.fontsize": 10,
        "figure.facecolor": "white",
        "axes.facecolor": "white",
        "savefig.facecolor": "white",
        "savefig.dpi": 200,
        "savefig.bbox": "tight",
        "savefig.pad_inches": 0.15,
    })


def plot_petersen_graph(max_cut, save_path: str | Path):
    """Plot the Petersen (or any small) graph without a cut."""
    setup_matplotlib()
    fig, ax = plt.subplots(figsize=(5, 5), constrained_layout=True)
    max_cut.draw(ax=ax, title=f"{max_cut.name} graph — n={max_cut.n}, m={max_cut.m}")
    fig.savefig(save_path)
    plt.close(fig)


def plot_optimal_cut(max_cut, optimal_bitstring: str, save_path: str | Path):
    """Plot the graph with the optimal cut highlighted."""
    setup_matplotlib()
    fig, ax = plt.subplots(figsize=(5, 5), constrained_layout=True)
    cut = max_cut.cut_value(optimal_bitstring)
    max_cut.draw(assignment=optimal_bitstring, ax=ax,
                 title=f"Optimal Max-Cut — {cut} / {max_cut.m} edges cut")
    fig.savefig(save_path)
    plt.close(fig)


def plot_approximation_ratio(p_values, approx_ratios_qaoa, save_path: str | Path):
    """
    Approximation ratio of QAOA as a function of depth p.

    Also annotates the Goemans-Williamson ratio (0.878) for reference.
    """
    setup_matplotlib()
    fig, ax = plt.subplots(figsize=(6, 4), constrained_layout=True)
    ax.plot(p_values, approx_ratios_qaoa, "o-", color=PRIMARY,
            linewidth=2, markersize=10, label="QAOA")
    ax.axhline(y=0.878, color=ACCENT, linestyle="--", linewidth=1.5,
               label="Goemans-Williamson (0.878)")
    ax.axhline(y=1.0, color="green", linestyle=":", linewidth=1.0, alpha=0.5,
               label="Optimal (1.0)")
    ax.set_xlabel("QAOA depth $p$")
    ax.set_ylabel("Approximation ratio")
    ax.set_title("QAOA approximation ratio vs depth")
    ax.set_xticks(p_values)
    ax.set_ylim(0.5, 1.05)
    ax.grid(True, color=TAN, alpha=0.5)
    ax.legend(loc="lower right")
    fig.savefig(save_path)
    plt.close(fig)


def plot_qaoa_vs_classical(methods: list[str], values: list[float], optimal: int, save_path: str | Path):
    """
    Bar chart comparing QAOA (at various p) vs classical methods.
    """
    setup_matplotlib()
    fig, ax = plt.subplots(figsize=(7, 4), constrained_layout=True)
    colors = [MUTED, MUTED, ACCENT, PRIMARY, PRIMARY, PRIMARY]
    # First few are classical (random, greedy, GW); last 3 are QAOA at p=1,2,3
    bars = ax.bar(methods, values, color=colors, edgecolor="white", linewidth=1.5)
    ax.axhline(y=optimal, color="green", linestyle="--", linewidth=1.5,
               label=f"Optimal = {optimal}")
    ax.set_ylabel("Cut value (out of m edges)")
    ax.set_title("QAOA vs classical baselines")
    ax.legend(loc="upper left")
    ax.set_ylim(0, max(values) * 1.15)
    for b, v in zip(bars, values):
        ax.text(b.get_x() + b.get_width() / 2, v + 0.2, f"{v:.2f}",
                ha="center", va="bottom", color=INK, fontsize=10, fontweight="bold")
    fig.savefig(save_path)
    plt.close(fig)


def plot_measurement_distribution(counts: dict[str, int], max_cut, save_path: str | Path, top_k: int = 16):
    """
    Bar chart of the top-k most probable measurement outcomes.

    Bitstrings are colored: optimal = green, suboptimal = muted.
    """
    setup_matplotlib()
    sorted_items = sorted(counts.items(), key=lambda x: -x[1])[:top_k]
    bitstrings, frequencies = zip(*sorted_items)
    total = sum(counts.values())
    frequencies = [f / total for f in frequencies]

    optimal_value, _ = max_cut.brute_force_optimal() if max_cut.n <= 20 else (-1, "?")
    colors = ["#10B981" if (max_cut.cut_value(b) == optimal_value and optimal_value > 0) else MUTED for b in bitstrings]

    fig, ax = plt.subplots(figsize=(8, 4), constrained_layout=True)
    ax.bar(range(len(bitstrings)), frequencies, color=colors, edgecolor="white", linewidth=1.2)
    ax.set_xticks(range(len(bitstrings)))
    ax.set_xticklabels(bitstrings, rotation=45, ha="right", fontsize=8)
    ax.set_xlabel("Measured bitstring $z$")
    ax.set_ylabel("Probability")
    ax.set_title("Top measurement outcomes (green = optimal cut)")
    fig.savefig(save_path)
    plt.close(fig)


def plot_qaoa_circuit(qc, save_path: str | Path):
    """Save the QAOA circuit diagram as a PNG."""
    from qiskit.visualization import circuit_drawer
    fig = circuit_drawer(qc, output="mpl", style={"backgroundcolor": "white"})
    fig.savefig(save_path, bbox_inches="tight", dpi=200)
    plt.close(fig)


def plot_energy_vs_p(p_values, mean_cuts, optimal: int, save_path: str | Path):
    """Mean cut value ⟨C⟩ vs QAOA depth p."""
    setup_matplotlib()
    fig, ax = plt.subplots(figsize=(6, 4), constrained_layout=True)
    ax.plot(p_values, mean_cuts, "s-", color=ACCENT, linewidth=2, markersize=10, label="QAOA ⟨C⟩")
    ax.axhline(y=optimal, color="green", linestyle="--", linewidth=1.5, label=f"Optimal = {optimal}")
    ax.axhline(y=optimal * 0.878, color=PRIMARY, linestyle=":", linewidth=1.5,
               label=f"GW (0.878 · optimal = {optimal * 0.878:.1f})")
    ax.set_xlabel("QAOA depth $p$")
    ax.set_ylabel("Mean cut value ⟨C⟩")
    ax.set_xticks(p_values)
    ax.set_title("Mean cut value vs QAOA depth")
    ax.legend(loc="lower right")
    ax.grid(True, color=TAN, alpha=0.5)
    fig.savefig(save_path)
    plt.close(fig)
