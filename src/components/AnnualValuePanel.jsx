import React from 'react';

const s = {
  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 22px', marginBottom: '16px' },
  label: { fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '14px' },
  fracRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' },
  fracLabel: { fontSize: '12px', color: 'var(--text-secondary)', minWidth: '130px' },
  fracVal: { fontSize: '14px', fontWeight: '500', fontFamily: 'var(--font-mono)', minWidth: '80px', textAlign: 'right' },
  bigVal: { fontSize: '36px', fontWeight: '300', letterSpacing: '-0.02em', fontFamily: 'var(--font-mono)', marginBottom: '4px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '14px' },
  stat: { background: 'var(--bg-raised)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' },
  statLabel: { fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '3px' },
  statVal: { fontSize: '14px', fontWeight: '500', fontFamily: 'var(--font-mono)' },
};

function fmt(val) {
  if (Math.abs(val) >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
  if (Math.abs(val) >= 1000) return `$${(val / 1000).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
}

export default function AnnualValuePanel({ spread, nglRevenue, fracCost }) {
  const [throughputBblD, setThroughputBblD] = React.useState(5000);

  const annualBbl = throughputBblD * 365;
  const annualSpread = spread * annualBbl;
  const annualRevenue = nglRevenue * annualBbl;
  const annualFracCost = fracCost * annualBbl;
  const spreadColor = spread >= 0 ? '#10b981' : '#ef4444';

  return (
    <div style={s.card}>
      <div style={s.label}>Annual value estimator</div>

      <div style={s.fracRow}>
        <span style={s.fracLabel}>NGL throughput</span>
        <input
          type="range" min="500" max="50000" step="500" value={throughputBblD}
          onChange={e => setThroughputBblD(parseInt(e.target.value))}
          style={{ flex: 1, accentColor: 'var(--teal)' }}
        />
        <span style={{ ...s.fracVal, color: 'var(--teal)' }}>
          {throughputBblD.toLocaleString()} bbl/d
        </span>
      </div>

      <div style={{ ...s.bigVal, color: spreadColor }}>
        {annualSpread >= 0 ? '+' : ''}{fmt(annualSpread)}
        <span style={{ fontSize: '16px', color: 'var(--text-secondary)', marginLeft: '8px' }}>/year</span>
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
        Net frac spread at {throughputBblD.toLocaleString()} bbl/d throughput
      </div>

      <div style={s.grid}>
        <div style={s.stat}>
          <div style={s.statLabel}>Annual NGL revenue</div>
          <div style={{ ...s.statVal, color: '#10b981' }}>{fmt(annualRevenue)}</div>
        </div>
        <div style={s.stat}>
          <div style={s.statLabel}>Annual frac cost</div>
          <div style={{ ...s.statVal, color: '#ef4444' }}>-{fmt(annualFracCost)}</div>
        </div>
        <div style={s.stat}>
          <div style={s.statLabel}>Per-unit spread</div>
          <div style={{ ...s.statVal, color: spreadColor }}>
            {spread >= 0 ? '+' : ''}${spread.toFixed(2)}/bbl
          </div>
        </div>
        <div style={s.stat}>
          <div style={s.statLabel}>Annualized barrels</div>
          <div style={{ ...s.statVal, color: 'var(--text-primary)' }}>{(annualBbl / 1000000).toFixed(2)}M bbl</div>
        </div>
        <div style={s.stat}>
          <div style={s.statLabel}>$0.10 propane move</div>
          <div style={{ ...s.statVal, color: 'var(--amber)' }}>
            {fmt(42 * 0.25 * 0.10 * throughputBblD * 365)}
          </div>
        </div>
        <div style={s.stat}>
          <div style={s.statLabel}>$1 gas price move</div>
          <div style={{ ...s.statVal, color: '#8b5cf6' }}>
            -{fmt(1.020 * 5.615 * throughputBblD * 365)}
          </div>
        </div>
      </div>
    </div>
  );
}
