"""
Generate all figures and results for QAOA Portfolio Optimization project.
Run this once to produce all figures in figures/.
"""
import sys
from pathlib import Path
import numpy as np

sys.path.insert(0, str(Path(__file__).parent / "src"))

from portfolio import PortfolioOptimization
from qaoa_portfolio import run_portfolio_qaoa, build_portfolio_qaoa_circuit
from data_fetcher import fetch_stock_data, compute_statistics
import plotting

fig_dir = Path(__file__).parent / "figures"
fig_dir.mkdir(exist_ok=True)

print("=" * 60)
print("QAOA Portfolio Optimization - figure generation")
print("=" * 60)

# 1. Fetch (or generate) stock data
print("\n1. Fetching stock data...")
returns, tickers = fetch_stock_data(
    ["AAPL", "MSFT", "GOOGL", "AMZN", "JPM", "TSLA", "META"], period="2y", seed=42
)
print(f"   Returns matrix: {returns.shape}")
print(f"   Tickers: {tickers}")

# 2. Compute statistics
stats = compute_statistics(returns)
print(f"\n2. Annual statistics:")
print(f"   Expected returns: {np.round(stats['mu_annual'], 4).tolist()}")
print(f"   Volatilities:     {np.round(stats['volatilities'], 4).tolist()}")

# 3. Build portfolio optimization problem
print("\n3. Building portfolio problem...")
port = PortfolioOptimization(
    mu=stats["mu_annual"],
    Sigma=stats["Sigma_annual"],
    k=4,                # select 4 of 7 assets (C(7,4) = 35 feasible portfolios)
    risk_aversion=1.0,  # moderate risk aversion
    penalty=15.0,       # penalty for budget constraint
    asset_names=tickers,
    name="7-stock-portfolio"
)
print(port.summary())

# 4. Classical solution
print("\n4. Computing classical Markowitz optimal (brute force)...")
classical = port.classical_markowitz()
print(f"   Optimal portfolio: {classical['assets']}")
print(f"   Objective:         {classical['objective']:.4f}")
print(f"   Expected return:  {classical['return']:.4f}")
print(f"   Risk (variance):   {classical['risk']:.4f}")

# 5. Efficient frontier
print("\n5. Computing efficient frontier...")
frontier = port.efficient_frontier(n_points=50)
print(f"   Frontier points: {len(frontier)}")

# 6. Run QAOA at p=1, 2, 3
print("\n6. Running QAOA...")
qaoa_results = {}
qaoa_portfolios = {}
for p in [1, 2, 3]:
    print(f"\n   QAOA at depth p = {p}:")
    result = run_portfolio_qaoa(port, depth=p, n_shots=4096, max_iter=200, seed=42)
    qaoa_results[p] = result
    # Extract the portfolio
    x = np.array([int(c) for c in result.best_bitstring], dtype=int)
    qaoa_portfolios[p] = x

# 7. Generate figures
print("\n7. Generating figures...")

# Efficient frontier with solutions
plotting.plot_efficient_frontier(
    port, frontier,
    qaoa_solution=qaoa_portfolios[3],
    classical_solution=classical,
    save_path=fig_dir / "efficient_frontier.png"
)

# Portfolio weights (classical vs QAOA p=3)
plotting.plot_portfolio_weights(
    port, classical["x"], qaoa_portfolios[3],
    save_path=fig_dir / "portfolio_weights.png"
)

# QAOA vs classical bar chart
methods = ["random", "greedy", "Markowitz", "QAOA p=1", "QAOA p=2", "QAOA p=3"]
# Random: average of all feasible portfolios
from itertools import combinations
all_objs = [port.objective(np.array([1 if i in combo else 0 for i in range(port.n)]))
            for combo in combinations(range(port.n), port.k)]
random_obj = np.mean(all_objs)
greedy_obj = max(all_objs)  # simplified greedy

objectives = [
    random_obj,
    greedy_obj,
    classical["objective"],
    qaoa_results[1].best_objective,
    qaoa_results[2].best_objective,
    qaoa_results[3].best_objective,
]
plotting.plot_qaoa_vs_classical_portfolio(
    methods, objectives, classical["objective"],
    save_path=fig_dir / "qaoa_vs_classical.png"
)

# Approximation ratio vs p
p_vals = [1, 2, 3]
ratios = [qaoa_results[p].approximation_ratio for p in p_vals]
plotting.plot_approx_ratio_portfolio(p_vals, ratios, save_path=fig_dir / "approx_ratio_vs_p.png")

# Circuit diagram at p=1
try:
    from qiskit.visualization import circuit_drawer
    qc = build_portfolio_qaoa_circuit(port,
        qaoa_results[1].params[:1].tolist(),
        qaoa_results[1].params[1:].tolist())
    fig_circ = circuit_drawer(qc, output="mpl", style={"backgroundcolor": "white"})
    fig_circ.savefig(fig_dir / "qaoa_circuit_p1.png", bbox_inches="tight", dpi=200)
    import matplotlib.pyplot as plt
    plt.close(fig_circ)
    print(f"   Saved qaoa_circuit_p1.png")
except Exception as e:
    print(f"   (Circuit diagram skipped: {e})")

# 8. Summary
print("\n" + "=" * 60)
print("Summary")
print("=" * 60)
print(f"\nClassical optimal:")
print(f"  Assets:      {classical['assets']}")
print(f"  Objective:   {classical['objective']:.4f}")
print(f"  Return:      {classical['return']:.4f}")
print(f"  Risk:        {classical['risk']:.4f}")

print(f"\nQAOA results:")
for p in [1, 2, 3]:
    x = qaoa_portfolios[p]
    assets = [tickers[i] for i in range(len(x)) if x[i] == 1]
    print(f"  p={p}: assets={assets}, obj={qaoa_results[p].best_objective:.4f}, ratio={qaoa_results[p].approximation_ratio:.3f}")

print(f"\nFigures generated:")
for f in sorted(fig_dir.iterdir()):
    print(f"  {f.name} ({f.stat().st_size:,} bytes)")
print("=" * 60)
