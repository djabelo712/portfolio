# QAOA for Portfolio Optimization

A quantum-classical approach to the Markowitz mean-variance portfolio optimization problem. We encode the problem as a QUBO (Quadratic Unconstrained Binary Optimization), build the cost Hamiltonian, and run QAOA at depths p=1, 2, 3 on the Qiskit Aer simulator. Compared against the classical brute-force Markowitz optimum.

## Problem formulation

Given n assets with expected returns mu and covariance matrix Sigma, select exactly k assets (x in {0,1}^n with sum(x) = k) to maximize:

    max  mu^T x - lambda * x^T Sigma x
    s.t. sum(x) = k

The cardinality constraint sum(x) = k is enforced via a quadratic penalty:

    min  -mu^T x + lambda * x^T Sigma x + P * (sum(x) - k)^2

This is a QUBO, directly encodable as an Ising Hamiltonian for QAOA.

## Key results (7-stock portfolio)

Select 4 of 7 stocks (AAPL, MSFT, GOOGL, AMZN, JPM, TSLA, META) with risk aversion lambda=1.0 and penalty P=15.0.

| Method                     | Portfolio                          | Objective | Approx. ratio |
|----------------------------|------------------------------------|----------:|--------------:|
| Random (mean)               | varies                             | 0.065     | 0.275         |
| Best random                | varies                             | 0.180     | 0.762         |
| QAOA p=1                   | AAPL, MSFT, JPM, TSLA              | 0.236     | 1.000         |
| QAOA p=2                   | AAPL, MSFT, JPM, TSLA              | 0.236     | 1.000         |
| QAOA p=3                   | AAPL, MSFT, JPM, TSLA              | 0.236     | 1.000         |
| **Markowitz (optimal)**     | **AAPL, MSFT, JPM, TSLA**          | **0.236** | **1.000**     |

**Headline result**: QAOA finds the classical Markowitz optimum at p=1 on the 7-stock portfolio. The optimal portfolio selects AAPL, MSFT, JPM, and TSLA for an expected annual return of 96.1% and risk (variance) of 72.5%.

## Quick start

```bash
git clone https://github.com/djabelo712/qaoa-portfolio.git
cd qaoa-portfolio
pip install -r requirements.txt
python generate_results.py
```

## Project structure

```
qaoa-portfolio/
  src/
    portfolio.py         # Markowitz problem class + QUBO encoding
    qaoa_portfolio.py    # QAOA implementation for portfolio optimization
    data_fetcher.py       # Stock data (yfinance or synthetic fallback)
    plotting.py           # Efficient frontier, weight charts, comparison
  notebooks/             # 4 Jupyter notebooks (theory, simulator, classical, comparison)
  figures/               # 5 generated figures
  generate_results.py    # Run everything + generate figures
  requirements.txt
  LICENSE (MIT)
```

## What I learned

1. **QUBO encoding**: the cardinality constraint sum(x)=k is enforced as a quadratic penalty P*(sum(x)-k)^2, which maps directly to a Z_i Z_j + Z_i Hamiltonian. The penalty P must be large enough to dominate the objective but not so large that it creates barren plateaus.
2. **QAOA matches classical at p=1**: for a 7-asset portfolio with k=4 (35 feasible portfolios), QAOA at p=1 already finds the Markowitz optimum. This confirms that QAOA is effective for small combinatorial optimization problems.
3. **Efficient frontier**: the continuous Markowitz frontier (without the binary constraint) provides an upper bound on the binary-constrained problem. QAOA's solution sits on the boundary of the feasible region.
4. **Financial relevance**: portfolio optimization is one of the most promising near-term applications of quantum optimization, with active research at Goldman Sachs, JPMorgan, and IBM.

## References

1. H. Markowitz. *Portfolio Selection.* Journal of Finance 7(1), 77-91 (1952).
2. E. Farhi et al. *A Quantum Approximate Optimization Algorithm.* arXiv:1411.4028 (2014).
3. P. Rosenberg et al. *Solving the Optimal Trading Strategy Problem with a Quantum Annealer.* arXiv:1907.05282 (2019).

## Author

**Djabon Ounimborbitibou** - MSc Mathematical Sciences (Distinction, AIMS Ghana)
GitHub: @djabelo712 | Email: djabon@aims.edu.gh

## License

MIT. See `LICENSE`.
