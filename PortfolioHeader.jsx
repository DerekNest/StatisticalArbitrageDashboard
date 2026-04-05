import React from 'react'
import { useApi } from '../hooks/useApi'

const fmt = (n, decimals = 2) =>
  typeof n === 'number' ? n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : '—'

const fmtDollar = (n) => (n >= 0 ? '+$' : '-$') + fmt(Math.abs(n))

export default function PortfolioHeader() {
  const { data, loading, error } = useApi('/portfolio', 30000)

  const s = {
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-panel)',
    },
    left: { display: 'flex', alignItems: 'baseline', gap: '12px' },
    title: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: '20px',
      color: 'var(--text-primary)',
      letterSpacing: '-0.02em',
    },
    sub: { fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.05em' },
    equity: {
      fontFamily: 'var(--font-mono)',
      fontWeight: 600,
      fontSize: '28px',
      color: 'var(--text-primary)',
      letterSpacing: '-0.02em',
    },
    pnl: {
      fontFamily: 'var(--font-mono)',
      fontSize: '13px',
      fontWeight: 500,
    },
    stats: { display: 'flex', gap: '32px', alignItems: 'center' },
    stat: { textAlign: 'right' },
    statLabel: { fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' },
    statVal: { fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' },
    dot: {
      width: '6px', height: '6px', borderRadius: '50%',
      background: 'var(--accent-green)',
      boxShadow: '0 0 6px var(--accent-green)',
      animation: 'pulse 2s ease-in-out infinite',
      display: 'inline-block', marginRight: '6px',
    },
  }

  if (loading) return (
    <div style={s.header}>
      <div style={s.left}>
        <span style={s.title}>StatArb Dashboard</span>
        <span style={s.sub}>DEREK NEST · PAPER TRADING</span>
      </div>
      <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>Loading...</span>
    </div>
  )

  const pnl = data?.total_pnl ?? 0
  const pnlPct = data?.total_pnl_pct ?? 0

  return (
    <>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      <div style={s.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={s.dot} />
            <span style={s.title}>StatArb Dashboard</span>
            <span style={s.sub}>DEREK NEST · PAPER TRADING</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <span style={s.equity}>${fmt(data?.equity)}</span>
            <span style={{ ...s.pnl, color: pnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
              {fmtDollar(pnl)} ({pnl >= 0 ? '+' : ''}{fmt(pnlPct)}%)
            </span>
          </div>
        </div>
        <div style={s.stats}>
          <div style={s.stat}>
            <div style={s.statLabel}>Cash</div>
            <div style={s.statVal}>${fmt(data?.cash)}</div>
          </div>
          <div style={s.stat}>
            <div style={s.statLabel}>Buying Power</div>
            <div style={s.statVal}>${fmt(data?.buying_power)}</div>
          </div>
          <div style={s.stat}>
            <div style={s.statLabel}>Initial Capital</div>
            <div style={s.statVal}>$100,000.00</div>
          </div>
        </div>
      </div>
    </>
  )
}
