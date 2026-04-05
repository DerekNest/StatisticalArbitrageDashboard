import React, { useState } from 'react'
import { useApi } from '../hooks/useApi'
import Panel from './Panel'

const fmt = (n, d = 2) => (typeof n === 'number' ? n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—')

function StatusBadge({ status }) {
  const colors = {
    filled: 'var(--accent-green)',
    expired: 'var(--text-dim)',
    canceled: 'var(--accent-red)',
    new: 'var(--accent-blue)',
    partially_filled: 'var(--accent)',
  }
  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase',
      letterSpacing: '0.06em', color: colors[status] || 'var(--text-secondary)',
      fontWeight: 600,
    }}>
      {status}
    </span>
  )
}

export default function Trades() {
  const { data, loading, error } = useApi('/trades', 60000)
  const [filter, setFilter] = useState('all')

  const trades = data?.trades ?? []
  const filtered = filter === 'all' ? trades : trades.filter(t => t.status === filter)

  const th = { padding: '6px 8px', textAlign: 'left', fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)', fontWeight: 400 }
  const td = { padding: '7px 8px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }

  return (
    <Panel title="Trade History" meta={`${trades.length} orders`} style={{ gridColumn: 'span 2' }} bodyStyle={{ padding: 0 }}>
      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '2px', padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
        {['all', 'filled', 'expired', 'canceled'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '3px 10px', background: filter === f ? 'var(--accent-dim)' : 'transparent',
            border: `1px solid ${filter === f ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: '3px', color: filter === f ? 'var(--accent)' : 'var(--text-dim)',
            fontFamily: 'var(--font-mono)', fontSize: '11px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            {f}
          </button>
        ))}
      </div>

      {loading && <div style={{ padding: '16px', color: 'var(--text-dim)', fontSize: '12px' }}>Loading orders...</div>}
      {error && <div style={{ padding: '16px', color: 'var(--accent-red)', fontSize: '12px' }}>Error: {error}</div>}

      {!loading && !error && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Symbol</th>
                <th style={th}>Side</th>
                <th style={th}>Qty</th>
                <th style={th}>Filled</th>
                <th style={th}>Avg Price</th>
                <th style={th}>Status</th>
                <th style={th}>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} style={{ transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ ...td, color: 'var(--text-primary)', fontWeight: 500 }}>{t.symbol}</td>
                  <td style={{ ...td, color: t.side === 'buy' ? 'var(--accent-green)' : 'var(--accent-red)', textTransform: 'uppercase', fontWeight: 600 }}>{t.side}</td>
                  <td style={td}>{t.qty}</td>
                  <td style={td}>{t.filled_qty}</td>
                  <td style={td}>{t.avg_fill_price ? `$${fmt(t.avg_fill_price)}` : '—'}</td>
                  <td style={td}><StatusBadge status={t.status} /></td>
                  <td style={{ ...td, color: 'var(--text-dim)', fontSize: '11px' }}>
                    {t.submitted_at ? new Date(t.submitted_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: '16px', color: 'var(--text-dim)', fontSize: '12px', textAlign: 'center' }}>No orders match filter</div>
          )}
        </div>
      )}
    </Panel>
  )
}
