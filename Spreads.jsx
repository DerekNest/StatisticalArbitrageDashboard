import React, { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useApi } from '../hooks/useApi'
import Panel from './Panel'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)', padding: '8px 12px', borderRadius: '3px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
      <div style={{ color: 'var(--text-dim)', marginBottom: '4px' }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: {Number(p.value).toFixed(3)}
        </div>
      ))}
    </div>
  )
}

function ZScoreBadge({ z }) {
  const abs = Math.abs(z)
  const color = abs > 2 ? 'var(--accent-red)' : abs > 1 ? 'var(--accent)' : 'var(--accent-green)'
  const signal = abs > 2 ? (z > 0 ? '▼ SHORT SPREAD' : '▲ LONG SPREAD') : 'NEUTRAL'
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 600, color }}>{z.toFixed(3)}</span>
      <span style={{ fontSize: '10px', color, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{signal}</span>
    </div>
  )
}

export default function Spreads() {
  const { data, loading, error } = useApi('/spreads', 300000)
  const [activeIdx, setActiveIdx] = useState(0)

  const spreads = data?.spreads ?? []
  const active = spreads[activeIdx]

  return (
    <Panel title="Pair Spreads (Z-Score)" meta="90-day · OLS hedge ratio" style={{ gridColumn: 'span 2' }}>
      {loading && <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '12px' }}>Fetching price history from yfinance...</div>}
      {error && <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-red)', fontSize: '12px' }}>Error: {error}</div>}

      {!loading && !error && active && (
        <>
          {/* Pair selector tabs */}
          <div style={{ display: 'flex', gap: '2px', marginBottom: '16px' }}>
            {spreads.map((s, i) => (
              <button
                key={s.pair}
                onClick={() => setActiveIdx(i)}
                style={{
                  padding: '4px 12px',
                  background: i === activeIdx ? 'var(--accent-dim)' : 'transparent',
                  border: `1px solid ${i === activeIdx ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: '3px',
                  color: i === activeIdx ? 'var(--accent)' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: i === activeIdx ? 600 : 400,
                }}
              >
                {s.pair}
              </button>
            ))}
          </div>

          {/* Current z-score + meta */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Current Z-Score</div>
              <ZScoreBadge z={active.current_zscore} />
            </div>
            <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--text-dim)' }}>
              <div>Hedge Ratio: <span style={{ color: 'var(--text-secondary)' }}>{active.hedge_ratio.toFixed(4)}</span></div>
              <div>Spread μ: <span style={{ color: 'var(--text-secondary)' }}>{active.spread_mean.toFixed(4)}</span></div>
              <div>Spread σ: <span style={{ color: 'var(--text-secondary)' }}>{active.spread_std.toFixed(4)}</span></div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={active.data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--text-dim)' }} tickLine={false} axisLine={{ stroke: 'var(--border)' }} interval="preserveStartEnd" />
              <YAxis tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--text-dim)' }} tickLine={false} axisLine={false} width={32} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={2} stroke="var(--accent-red)" strokeDasharray="3 3" strokeOpacity={0.6} />
              <ReferenceLine y={-2} stroke="var(--accent-green)" strokeDasharray="3 3" strokeOpacity={0.6} />
              <ReferenceLine y={1} stroke="var(--border-bright)" strokeDasharray="2 4" strokeOpacity={0.4} />
              <ReferenceLine y={-1} stroke="var(--border-bright)" strokeDasharray="2 4" strokeOpacity={0.4} />
              <ReferenceLine y={0} stroke="var(--border-bright)" strokeOpacity={0.6} />
              <Line type="monotone" dataKey="zscore" stroke="var(--accent-blue)" strokeWidth={1.5} dot={false} activeDot={{ r: 3, fill: 'var(--accent-blue)', strokeWidth: 0 }} name="Z-Score" />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </Panel>
  )
}
