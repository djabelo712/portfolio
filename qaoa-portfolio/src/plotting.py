"""
Plotting for portfolio optimization QAOA
=======================================

Author: Djabon Ounimborbitibou
"""

import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path

PRIMARY = "#1B2A4E"
ACCENT = "#B87333"
WARM = "#D49968"
INK = "#1B2A4E"
PAPER = "#FAF7F2"
MUTED = "#5C6478"
TAN = "#E8E2D5"


def setup_matplotlib():
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
    })


def plot_efficient_frontier(port, frontier, qaoa_solution=None, classical_solution=None,
                            save_path=None):
    """Plot the efficient frontier with optional QAOA and classical solutions."""
    setup_matplotlib()
    fig, ax = plt.subplots(figsize=(7, 5), constrained_layout=True)

    # Efficient frontier
    ax.plot(frontier[:, 1], frontier[:, 0], color=PRIMARY, linewidth=2,
            label="Efficient frontier", zorder=2)

    # Individual assets
    for i in range(port.n):
        risk = np.sqrt(port.Sigma[i, i])
        ret = port.mu[i]
        ax.scatter(risk, ret, color=MUTED, s=60, zorder=3, edgecolors="white", linewidths=1.5)
        ax.annotate(port.asset_names[i], (risk, ret), textcoords="offset points",
                    xytext=(8, 5), fontsize=9, color=MUTED)

    # Classical optimal (binary)
    if classical_solution is not None:
        x = classical_solution["x"]
        risk = np.sqrt(x @ port.Sigma @ x)
        ret = port.mu @ x
        ax.scatter(risk, ret, color=ACCENT, s=150, marker="*", zorder=5,
                   edgecolors=INK, linewidths=1.5, label=f"Classical optimal (k={port.k})")

    # QAOA solution
    if qaoa_solution is not None:
        x = qaoa_solution
        risk = np.sqrt(x @ port.Sigma @ x)
        ret = port.mu @ x
        ax.scatter(risk, ret, color="#10B981", s=150, marker="D", zorder=5,
                   edgecolors=INK, linewidths=1.5, label="QAOA solution")

    ax.set_xlabel("Risk (portfolio volatility)")
    ax.set_ylabel("Expected return")
    ax.set_title("Efficient Frontier: Portfolio Optimization")
    ax.legend(loc="upper left")
    ax.grid(True, color=TAN, alpha=0.5)
    if save_path:
        fig.savefig(save_path)
    plt.close(fig)


def plot_portfolio_weights(port, classical_x, qaoa_x, save_path=None):
    """Bar chart comparing classical vs QAOA portfolio weights."""
    setup_matplotlib()
    fig, ax = plt.subplots(figsize=(7, 4), constrained_layout=True)
    x_pos = np.arange(port.n)
    width = 0.35
    ax.bar(x_pos - width/2, classical_x, width, color=ACCENT, label="Classical optimal",
           edgecolor="white", linewidth=1.2)
    ax.bar(x_pos + width/2, qaoa_x, width, color="#10B981", label="QAOA",
           edgecolor="white", linewidth=1.2)
    ax.set_xticks(x_pos)
    ax.set_xticklabels(port.asset_names, fontsize=10)
    ax.set_ylabel("Weight (0 or 1)")
    ax.set_title("Portfolio Weights: Classical vs QAOA")
    ax.legend(loc="upper right")
    ax.set_ylim(-0.1, 1.2)
    ax.grid(axis="y", color=TAN, alpha=0.5)
    if save_path:
        fig.savefig(save_path)
    plt.close(fig)


def plot_qaoa_vs_classical_portfolio(methods, objectives, optimal, save_path=None):
    """Bar chart comparing QAOA at various p vs classical methods."""
    setup_matplotlib()
    fig, ax = plt.subplots(figsize=(7, 4), constrained_layout=True)
    colors = [MUTED, ACCENT, ACCENT, "#10B981", "#10B981", "#10B981"]
    bars = ax.bar(methods, objectives, color=colors, edgecolor="white", linewidth=1.5)
    ax.axhline(y=optimal, color="green", linestyle="--", linewidth=1.5,
               label=f"Optimal = {optimal:.4f}")
    ax.set_ylabel("Markowitz objective")
    ax.set_title("QAOA vs Classical: Portfolio Optimization")
    ax.legend(loc="lower left")
    for b, v in zip(bars, objectives):
        ax.text(b.get_x() + b.get_width() / 2, v + 0.001, f"{v:.3f}",
                ha="center", va="bottom", color=INK, fontsize=9, fontweight="bold")
    if save_path:
        fig.savefig(save_path)
    plt.close(fig)


def plot_approx_ratio_portfolio(p_values, ratios, save_path=None):
    """Approximation ratio vs QAOA depth."""
    setup_matplotlib()
    fig, ax = plt.subplots(figsize=(6, 4), constrained_layout=True)
    ax.plot(p_values, ratios, "o-", color=PRIMARY, linewidth=2, markersize=10, label="QAOA")
    ax.axhline(y=1.0, color="green", linestyle=":", linewidth=1.0, alpha=0.5, label="Optimal")
    ax.set_xlabel("QAOA depth $p$")
    ax.set_ylabel("Approximation ratio")
    ax.set_title("QAOA Approximation Ratio vs Depth")
    ax.set_xticks(p_values)
    ax.set_ylim(0, 1.15)
    ax.grid(True, color=TAN, alpha=0.5)
    ax.legend(loc="lower right")
    if save_path:
        fig.savefig(save_path)
    plt.close(fig)
