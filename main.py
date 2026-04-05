import os
import numpy as np
import pandas as pd
import yfinance as yf
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from alpaca.trading.client import TradingClient
from alpaca.trading.requests import GetOrdersRequest
from alpaca.trading.enums import OrderStatus
from alpaca.data.historical import StockHistoricalDataClient
from alpaca.data.requests import StockBarsRequest
from alpaca.data.timeframe import TimeFrame
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("APCA_API_KEY_ID")
API_SECRET = os.getenv("APCA_API_SECRET_KEY")

trading_client = TradingClient(API_KEY, API_SECRET, paper=True)
data_client = StockHistoricalDataClient(API_KEY, API_SECRET)

app = FastAPI(title="StatArb Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PAIRS = [
    {"leg1": "BAC", "leg2": "AXP", "name": "BAC/AXP"},
    {"leg1": "AEP", "leg2": "ETR", "name": "AEP/ETR"},
]


def compute_sharpe(returns: pd.Series, periods_per_year: int = 252) -> float:
    if returns.std() == 0 or len(returns) < 2:
        return 0.0
    return float((returns.mean() / returns.std()) * np.sqrt(periods_per_year))


def compute_max_drawdown(equity: pd.Series) -> float:
    roll_max = equity.cummax()
    drawdown = (equity - roll_max) / roll_max
    return float(drawdown.min())


@app.get("/health")
def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


@app.get("/portfolio")
def get_portfolio():
    try:
        account = trading_client.get_account()
        return {
            "equity": float(account.equity),
            "cash": float(account.cash),
            "buying_power": float(account.buying_power),
            "portfolio_value": float(account.portfolio_value),
            "initial_capital": 100000.0,
            "total_pnl": float(account.equity) - 100000.0,
            "total_pnl_pct": ((float(account.equity) - 100000.0) / 100000.0) * 100,
            "daytrade_count": int(account.daytrade_count),
            "last_updated": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/equity-curve")
def get_equity_curve():
    try:
        # Alpaca portfolio history — last 30 days, daily
        from alpaca.trading.requests import GetPortfolioHistoryRequest
        req = GetPortfolioHistoryRequest(
            period="1M",
            timeframe="1D",
            extended_hours=False,
        )
        history = trading_client.get_portfolio_history(req)

        timestamps = history.timestamp
        equity_vals = history.equity

        data = []
        for ts, eq in zip(timestamps, equity_vals):
            if eq is not None:
                data.append({
                    "date": datetime.utcfromtimestamp(ts).strftime("%Y-%m-%d"),
                    "equity": round(float(eq), 2),
                })

        equity_series = pd.Series([d["equity"] for d in data])
        returns = equity_series.pct_change().dropna()
        sharpe = compute_sharpe(returns)
        max_dd = compute_max_drawdown(equity_series)

        return {
            "curve": data,
            "sharpe_ratio": round(sharpe, 4),
            "max_drawdown": round(max_dd * 100, 4),
            "period": "1M",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/positions")
def get_positions():
    try:
        positions = trading_client.get_all_positions()
        result = []
        for p in positions:
            result.append({
                "symbol": p.symbol,
                "qty": float(p.qty),
                "side": p.side.value,
                "avg_entry_price": float(p.avg_entry_price),
                "current_price": float(p.current_price),
                "market_value": float(p.market_value),
                "unrealized_pl": float(p.unrealized_pl),
                "unrealized_plpc": float(p.unrealized_plpc) * 100,
                "cost_basis": float(p.cost_basis),
            })

        # Compute pair-level P&L
        pos_map = {p["symbol"]: p for p in result}
        pair_pnl = []
        for pair in PAIRS:
            leg1 = pos_map.get(pair["leg1"])
            leg2 = pos_map.get(pair["leg2"])
            if leg1 and leg2:
                net_pl = leg1["unrealized_pl"] + leg2["unrealized_pl"]
                pair_pnl.append({
                    "pair": pair["name"],
                    "leg1": leg1,
                    "leg2": leg2,
                    "net_unrealized_pl": round(net_pl, 2),
                })

        return {"positions": result, "pairs": pair_pnl}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/trades")
def get_trades():
    try:
        req = GetOrdersRequest(status=OrderStatus.ALL, limit=50)
        orders = trading_client.get_orders(req)
        result = []
        for o in orders:
            result.append({
                "id": str(o.id),
                "symbol": o.symbol,
                "side": o.side.value,
                "order_type": o.order_type.value,
                "qty": float(o.qty) if o.qty else None,
                "filled_qty": float(o.filled_qty) if o.filled_qty else 0,
                "avg_fill_price": float(o.filled_avg_price) if o.filled_avg_price else None,
                "status": o.status.value,
                "submitted_at": o.submitted_at.isoformat() if o.submitted_at else None,
                "filled_at": o.filled_at.isoformat() if o.filled_at else None,
            })
        return {"trades": result, "count": len(result)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/stats")
def get_stats():
    try:
        from alpaca.trading.requests import GetPortfolioHistoryRequest
        req = GetPortfolioHistoryRequest(period="1M", timeframe="1D", extended_hours=False)
        history = trading_client.get_portfolio_history(req)

        equity_vals = [float(e) for e in history.equity if e is not None]
        equity_series = pd.Series(equity_vals)
        returns = equity_series.pct_change().dropna()

        sharpe = compute_sharpe(returns)
        max_dd = compute_max_drawdown(equity_series)
        total_return = (equity_vals[-1] - equity_vals[0]) / equity_vals[0] * 100 if equity_vals else 0
        volatility = float(returns.std() * np.sqrt(252) * 100) if len(returns) > 1 else 0
        win_rate = float((returns > 0).sum() / len(returns) * 100) if len(returns) > 0 else 0
        avg_win = float(returns[returns > 0].mean() * 100) if (returns > 0).any() else 0
        avg_loss = float(returns[returns < 0].mean() * 100) if (returns < 0).any() else 0

        return {
            "sharpe_ratio": round(sharpe, 4),
            "max_drawdown_pct": round(max_dd * 100, 4),
            "total_return_pct": round(total_return, 4),
            "annualized_volatility_pct": round(volatility, 4),
            "win_rate_pct": round(win_rate, 2),
            "avg_win_pct": round(avg_win, 4),
            "avg_loss_pct": round(avg_loss, 4),
            "num_trading_days": len(equity_vals),
            "profit_factor": round(abs(avg_win / avg_loss), 3) if avg_loss != 0 else None,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/spreads")
def get_spreads():
    try:
        end = datetime.today()
        start = end - timedelta(days=90)
        result = []

        for pair in PAIRS:
            tickers = [pair["leg1"], pair["leg2"]]
            df = yf.download(tickers, start=start, end=end, auto_adjust=True, progress=False)["Close"]
            df = df.dropna()

            if df.empty:
                continue

            leg1_prices = df[pair["leg1"]]
            leg2_prices = df[pair["leg2"]]

            # OLS hedge ratio
            from numpy.linalg import lstsq
            X = np.column_stack([leg2_prices.values, np.ones(len(leg2_prices))])
            beta, _, _, _ = lstsq(X, leg1_prices.values, rcond=None)
            hedge_ratio = beta[0]

            spread = leg1_prices - hedge_ratio * leg2_prices
            spread_mean = spread.mean()
            spread_std = spread.std()
            zscore = (spread - spread_mean) / spread_std

            spread_data = []
            for date, s, z in zip(df.index, spread, zscore):
                spread_data.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "spread": round(float(s), 4),
                    "zscore": round(float(z), 4),
                })

            result.append({
                "pair": pair["name"],
                "leg1": pair["leg1"],
                "leg2": pair["leg2"],
                "hedge_ratio": round(float(hedge_ratio), 4),
                "spread_mean": round(float(spread_mean), 4),
                "spread_std": round(float(spread_std), 4),
                "current_zscore": round(float(zscore.iloc[-1]), 4),
                "data": spread_data,
            })

        return {"spreads": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
