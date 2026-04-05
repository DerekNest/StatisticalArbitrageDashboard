import React from 'react'

const styles = {
  panel: {
    background: 'var(--bg-panel)',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-elevated)',
  },
  label: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: '11px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--accent)',
  },
  meta: {
    fontSize: '10px',
    color: 'var(--text-dim)',
    fontFamily: 'var(--font-mono)',
  },
  body: {
    padding: '16px',
  },
}

export default function Panel({ title, meta, children, style, bodyStyle }) {
  return (
    <div style={{ ...styles.panel, ...style }}>
      {title && (
        <div style={styles.header}>
          <span style={styles.label}>{title}</span>
          {meta && <span style={styles.meta}>{meta}</span>}
        </div>
      )}
      <div style={{ ...styles.body, ...bodyStyle }}>{children}</div>
    </div>
  )
}
