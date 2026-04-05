import React from 'react'
import { useApi } from '../hooks/useApi'
import Panel from './Panel'

const fmt = (n, d = 3) => (typeof n === 'number' ? n.toFixed(d) : '—')

function StatRow({ label, value, valueColor }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 500, color: valueColor || 'var(--text-primary)' }}>{value}</span>
    </div>
  )
}

export default function Stats() {
  const { data, loading, error } = useApi('/stats', 60000)

  if (loading) return <Panel title="Performance Stats"><div style={{ color: 'var(--text-dim)', fontSize: '12px' }}>Computing...</div></Panel>
  if (error) return <Panel title="Performance Stats"><div style={{ color: 'var(--accent-red)', fontSize: '12px' }}>Error: {error}</div></Panel>

  const sharpeColor = data?.sharpe_ratio > 1 ? 'var(--accent-green)' : data?.sharpe_ratio > 0 ? 'var(--accent)' : 'var(--accent-red)'
  const ddColor = data?.max_drawdown_pct < -10 ? 'var(--accent-red)' : 'var(--text-primary)'
  const retColor = data?.total_return_pct >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'

  return (
    <Panel title="Performance Stats" meta={`${data?.num_trading_days ?? '—'}d history`}>
      <StatRow label="Sharpe Ratio" value={fmt(data?.sharpe_ratio)} valueColor={sharpeColor} />
      <StatRow label="Total Return" value={`${data?.total_return_pct >= 0 ? '+' : ''}${fmt(data?.total_return_pct, 2)}%`} valueColor={retColor} />
      <StatRow label="Max Drawdown" value={`${fmt(data?.max_drawdown_pct, 2)}%`} valueColor={ddColor} />
      <StatRow label="Ann. Volatility" value={`${fmt(data?.annualized_volatility_pct, 2)}%`} />
      <StatRow label="Win Rate" value={`${fmt(data?.win_rate_pct, 1)}%`} />
      <StatRow label="Avg Win" value={`${fmt(data?.avg_win_pct, 3)}%`} valueColor="var(--accent-green)" />
      <StatRow label="Avg Loss" value={`${fmt(data?.avg_loss_pct, 3)}%`} valueColor="var(--accent-red)" />
      <StatRow label="Profit Factor" value={data?.profit_factor != null ? fmt(data.profit_factor, 2) : '—'} />
    </Panel>
  )
}
