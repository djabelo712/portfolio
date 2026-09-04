"""
Generate all figures and benchmark results for the QAOA Max-Cut project.
Run this script once to produce all figures in figures/.
"""
import sys
from pathlib import Path

# Add src/ to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from max_cut import MaxCut
from qaoa import build_qaoa_circuit, run_qaoa
from classical import all_baselines, brute_force_optimal, goemans_williamson
import plotting

# Output
fig_dir = Path(__file__).parent / "figures"
fig_dir.mkdir(exist_ok=True)

# Use a 5-node graph: triangle with two appendages — clean QAOA convergence story
# (Petersen graph is harder for small-depth QAOA due to frustration)
print("=" * 60)
print("Max-Cut QAOA — figure generation")
print("=" * 60)

mc = MaxCut.from_edges(5, [(0,1), (1,2), (2,0), (1,3), (3,4), (4,0)], name="5-node test")
print(mc.summary())
print()

# 1. Brute force optimal cut (n=10, feasible)
optimal_cut, optimal_z = brute_force_optimal(mc)
print(f"Brute-force optimal: {optimal_cut} (bitstring: {optimal_z})")
print()

# 2. Classical baselines
print("Running classical baselines...")
baselines = all_baselines(mc, seed=42)
for name, res in baselines.items():
    if res["value"] is not None:
        print(f"  {name:25s}: cut = {res['value']:3d}  (ratio {res['approx_ratio']:.3f})")
    else:
        print(f"  {name:25s}: skipped ({res.get('note', '')})")
print()

# 3. Plot the Petersen graph + optimal cut
print("Generating figures...")
plotting.plot_petersen_graph(mc, fig_dir / "petersen_graph.png")
plotting.plot_optimal_cut(mc, optimal_z, fig_dir / "petersen_optimal_cut.png")

# 4. Run QAOA at depths p = 1, 2, 3
qaoa_results = {}
approx_ratios = []
mean_cuts = []
p_values = [1, 2, 3]

for p in p_values:
    print(f"\nRunning QAOA at depth p = {p}...")
    result = run_qaoa(mc, depth=p, n_shots=4096, max_iter=200, verbose=True, seed=123)
    qaoa_results[p] = result
    approx_ratios.append(result.approximation_ratio)
    mean_cuts.append(result.best_cut_value)
    # Save circuit diagram
    qc = build_qaoa_circuit(mc, result.params[:p].tolist(), result.params[p:].tolist())
    try:
        plotting.plot_qaoa_circuit(qc, fig_dir / f"qaoa_circuit_p{p}.png")
    except Exception as e:
        print(f"  (Could not save circuit diagram: {e})")

# 5. Approximation ratio vs p
plotting.plot_approximation_ratio(p_values, approx_ratios, fig_dir / "approx_ratio_vs_p.png")

# 6. Mean cut value vs p
plotting.plot_energy_vs_p(p_values, mean_cuts, optimal_cut, fig_dir / "energy_vs_p.png")

# 7. QAOA vs classical bar chart
methods = ["random", "greedy", "GW", "QAOA p=1", "QAOA p=2", "QAOA p=3"]
values = [
    baselines["random"]["value"],
    baselines["greedy"]["value"],
    baselines["goemans_williamson"]["value"],
    qaoa_results[1].best_cut_value,
    qaoa_results[2].best_cut_value,
    qaoa_results[3].best_cut_value,
]
plotting.plot_qaoa_vs_classical(methods, values, optimal_cut, fig_dir / "qaoa_vs_classical.png")

# 8. Measurement distribution at p=3 (most likely)
plotting.plot_measurement_distribution(qaoa_results[3].counts, mc, fig_dir / "measurement_distribution.png")

print("\n" + "=" * 60)
print("All figures generated:")
for f in sorted(fig_dir.iterdir()):
    print(f"  {f.name} ({f.stat().st_size:,} bytes)")
print("=" * 60)
