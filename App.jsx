import React from 'react'
import PortfolioHeader from './components/PortfolioHeader'
import EquityCurve from './components/EquityCurve'
import Positions from './components/Positions'
import Stats from './components/Stats'
import Spreads from './components/Spreads'
import Trades from './components/Trades'

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '12px',
  padding: '16px',
}

export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <PortfolioHeader />

      <main style={{ flex: 1, padding: '16px' }}>
        {/* Row 1: Equity curve (2/3) + Stats (1/3) */}
        <div style={{ ...grid, paddingTop: 0, paddingLeft: 0, paddingRight: 0 }}>
          <EquityCurve />
          <Stats />
        </div>

        {/* Row 2: Spreads (2/3) + Positions (1/3) */}
        <div style={{ ...grid, paddingTop: 0, paddingLeft: 0, paddingRight: 0, marginTop: '12px' }}>
          <Spreads />
          <Positions />
        </div>

        {/* Row 3: Full-width trades */}
        <div style={{ marginTop: '12px' }}>
          <Trades />
        </div>
      </main>

      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '8px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '10px',
        color: 'var(--text-dim)',
        fontFamily: 'var(--font-mono)',
      }}>
        <span>DEREK NEST · STATISTICAL ARBITRAGE ENGINE · PAPER TRADING</span>
        <span>
          <a href="https://github.com/DerekNest" target="_blank" rel="noreferrer" style={{ color: 'var(--text-dim)', textDecoration: 'none', marginRight: '16px' }}>github.com/DerekNest</a>
          <a href="https://linkedin.com/in/dereknest" target="_blank" rel="noreferrer" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>linkedin.com/in/dereknest</a>
        </span>
      </footer>
    </div>
  )
}
