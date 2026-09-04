"""
Data fetcher for portfolio optimization
=======================================

Fetches real stock price data using yfinance (if available) or
generates realistic synthetic data as a fallback.

Author: Djabon Ounimborbitibou
"""

import numpy as np


def fetch_stock_data(
    tickers: list[str] = ["AAPL", "MSFT", "GOOGL", "AMZN", "JPM"],
    period: str = "2y",
    seed: int | None = 42,
) -> tuple[np.ndarray, list[str]]:
    """
    Fetch daily returns for the given tickers.

    Returns:
        returns: (T, n) array of daily returns
        tickers: list of ticker symbols

    If yfinance is not installed, falls back to synthetic data calibrated
    to realistic S&P 500 parameters (annual mean ~10%, volatility ~20%).
    """
    try:
        import yfinance as yf
        import pandas as pd

        data = yf.download(tickers, period=period, progress=False)["Adj Close"]
        returns = data.pct_change().dropna().values
        return returns, tickers

    except (ImportError, Exception):
        # Synthetic fallback: generate realistic daily returns
        # Annual mean ~10%, annual vol ~20% -> daily mean ~0.04%, daily vol ~1.26%
        rng = np.random.default_rng(seed)
        n = len(tickers)
        T = 504  # ~2 years of trading days

        # Calibrated annual parameters (typical S&P 500 stocks)
        annual_means = np.array([0.12, 0.15, 0.10, 0.08, 0.09, 0.25, 0.14])[:n]
        annual_vols = np.array([0.25, 0.22, 0.28, 0.30, 0.20, 0.45, 0.32])[:n]

        # Convert to daily
        daily_means = annual_means / 252
        daily_vols = annual_vols / np.sqrt(252)

        # Generate correlated returns with a realistic correlation structure
        if n <= 5:
            corr = np.array([
                [1.00, 0.65, 0.70, 0.60, 0.40],
                [0.65, 1.00, 0.68, 0.55, 0.38],
                [0.70, 0.68, 1.00, 0.62, 0.35],
                [0.60, 0.55, 0.62, 1.00, 0.30],
                [0.40, 0.38, 0.35, 0.30, 1.00],
            ])[:n, :n]
        else:
            # Extend to n=7 with TSLA and META
            corr = np.array([
                [1.00, 0.65, 0.70, 0.60, 0.40, 0.50, 0.55],
                [0.65, 1.00, 0.68, 0.55, 0.38, 0.52, 0.58],
                [0.70, 0.68, 1.00, 0.62, 0.35, 0.45, 0.50],
                [0.60, 0.55, 0.62, 1.00, 0.30, 0.42, 0.48],
                [0.40, 0.38, 0.35, 0.30, 1.00, 0.20, 0.25],
                [0.50, 0.52, 0.45, 0.42, 0.20, 1.00, 0.60],
                [0.55, 0.58, 0.50, 0.48, 0.25, 0.60, 1.00],
            ])[:n, :n]

        # Cholesky decomposition for correlated normals
        vols = np.diag(daily_vols)
        cov = vols @ corr @ vols
        L = np.linalg.cholesky(cov)

        returns = daily_means + (rng.standard_normal((T, n)) @ L.T)
        return returns, tickers


def compute_statistics(returns: np.ndarray) -> dict:
    """Compute annualized statistics from daily returns."""
    mu_daily = np.mean(returns, axis=0)
    Sigma_daily = np.cov(returns, rowvar=False)
    mu_annual = mu_daily * 252
    Sigma_annual = Sigma_daily * 252
    return {
        "mu_daily": mu_daily,
        "Sigma_daily": Sigma_daily,
        "mu_annual": mu_annual,
        "Sigma_annual": Sigma_annual,
        "volatilities": np.sqrt(np.diag(Sigma_annual)),
        "correlation": Sigma_daily / np.outer(np.sqrt(np.diag(Sigma_daily)), np.sqrt(np.diag(Sigma_daily))),
    }
