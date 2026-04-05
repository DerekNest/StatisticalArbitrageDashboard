import React from 'react'
import { useApi } from '../hooks/useApi'
import Panel from './Panel'

const fmt = (n, d = 2) => (typeof n === 'number' ? n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—')
const pnlColor = (n) => n > 0 ? 'var(--accent-green)' : n < 0 ? 'var(--accent-red)' : 'var(--text-secondary)'

const row = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }
const cell = { fontFamily: 'var(--font-mono)', fontSize: '12px' }
const label = { fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }

export default function Positions() {
  const { data, loading, error } = useApi('/positions', 30000)

  const pairs = data?.pairs ?? []
  const positions = data?.positions ?? []

  return (
    <Panel title="Open Positions" meta={`${positions.length} legs · ${pairs.length} pairs`}>
      {loading && <div style={{ color: 'var(--text-dim)', fontSize: '12px' }}>Loading positions...</div>}
      {error && <div style={{ color: 'var(--accent-red)', fontSize: '12px' }}>Error: {error}</div>}

      {!loading && !error && (
        <>
          {/* Pair-level summary */}
          {pairs.map((pair) => (
            <div key={pair.pair} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: 'var(--accent)' }}>
                  {pair.pair}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '13px',
                  color: pnlColor(pair.net_unrealized_pl)
                }}>
                  {pair.net_unrealized_pl >= 0 ? '+' : ''}${fmt(pair.net_unrealized_pl)} net
                </span>
              </div>

              {[pair.leg1, pair.leg2].map((leg) => (
                <div key={leg.symbol} style={{ ...row, paddingLeft: '10px' }}>
                  <div>
                    <div style={{ ...cell, color: 'var(--text-primary)', fontWeight: 500 }}>
                      {leg.symbol}
                      <span style={{ marginLeft: '8px', fontSize: '10px', color: leg.side === 'long' ? 'var(--accent-green)' : 'var(--accent-red)', textTransform: 'uppercase' }}>
                        {leg.side}
                      </span>
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>
                      {Math.abs(leg.qty)} shares @ ${fmt(leg.avg_entry_price)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ ...cell, color: pnlColor(leg.unrealized_pl), fontWeight: 500 }}>
                      {leg.unrealized_pl >= 0 ? '+' : ''}${fmt(leg.unrealized_pl)}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                      ${fmt(leg.current_price)} now
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Any unpaired positions */}
          {positions.filter(p => !pairs.some(pair => pair.leg1.symbol === p.symbol || pair.leg2.symbol === p.symbol)).map(p => (
            <div key={p.symbol} style={row}>
              <div style={{ ...cell }}>{p.symbol} <span style={{ color: 'var(--text-dim)' }}>({p.side})</span></div>
              <div style={{ ...cell, color: pnlColor(p.unrealized_pl) }}>{p.unrealized_pl >= 0 ? '+' : ''}${fmt(p.unrealized_pl)}</div>
            </div>
          ))}

          {positions.length === 0 && (
            <div style={{ color: 'var(--text-dim)', fontSize: '12px', textAlign: 'center', padding: '16px 0' }}>No open positions</div>
          )}
        </>
      )}
    </Panel>
  )
}
