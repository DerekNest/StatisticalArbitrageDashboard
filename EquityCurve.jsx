import React from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useApi } from '../hooks/useApi'
import Panel from './Panel'

const fmt = (n, d = 2) => (typeof n === 'number' ? n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—')

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const val = payload[0]?.value
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-bright)',
      padding: '8px 12px',
      borderRadius: '3px',
      fontFamily: 'var(--font-mono)',
      fontSize: '12px',
    }}>
      <div style={{ color: 'var(--text-dim)', marginBottom: '2px' }}>{label}</div>
      <div style={{ color: 'var(--accent)', fontWeight: 600 }}>${fmt(val)}</div>
    </div>
  )
}

export default function EquityCurve() {
  const { data, loading, error } = useApi('/equity-curve', 60000)

  const curve = data?.curve ?? []
  const minEq = curve.length ? Math.min(...curve.map(d => d.equity)) * 0.995 : 98000
  const maxEq = curve.length ? Math.max(...curve.map(d => d.equity)) * 1.005 : 102000

  const sharpe = data?.sharpe_ratio
  const dd = data?.max_drawdown_pct

  return (
    <Panel
      title="Equity Curve"
      meta={`Sharpe: ${sharpe != null ? sharpe.toFixed(3) : '—'} · Max DD: ${dd != null ? dd.toFixed(2) : '—'}%`}
      style={{ gridColumn: 'span 2' }}
    >
      {loading && <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>Fetching equity history...</div>}
      {error && <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-red)', fontSize: '12px' }}>Error: {error}</div>}
      {!loading && !error && (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={curve} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f0b429" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f0b429" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--text-dim)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[minEq, maxEq]}
              tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--text-dim)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={100000} stroke="var(--border-bright)" strokeDasharray="3 3" />
            <Area
              type="monotone"
              dataKey="equity"
              stroke="var(--accent)"
              strokeWidth={1.5}
              fill="url(#equityGrad)"
              dot={false}
              activeDot={{ r: 3, fill: 'var(--accent)', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Panel>
  )
}
