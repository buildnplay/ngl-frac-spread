import React from 'react';

const s = {
  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 22px', marginBottom: '16px' },
  label: { fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '14px' },
  beRow: { display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '10px' },
  beVal: { fontSize: '32px', fontWeight: '300', fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' },
  beSub: { fontSize: '13px', color: 'var(--text-muted)' },
  meter: { height: '8px', background: 'var(--bg-raised)', borderRadius: '4px', overflow: 'visible', position: 'relative', marginBottom: '8px', marginTop: '8px' },
  tick: { position: 'absolute', top: '-3px', width: '3px', height: '14px', borderRadius: '2px', transform: 'translateX(-50%)' },
  tickLabel: { position: 'absolute', top: '16px', fontSize: '10px', fontFamily: 'var(--font-mono)', transform: 'translateX(-50%)', whiteSpace: 'nowrap' },
  insight: { fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '12px', padding: '10px 12px', background: 'var(--bg-raised)', borderRadius: 'var(--radius-sm)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '10px' },
  stat: { background: 'var(--bg-raised)', borderRadius: 'var(--radius-sm)', padding: '8px 10px' },
  statLabel: { fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '3px' },
  statVal: { fontSize: '14px', fontWeight: '500', fontFamily: 'var(--font-mono)' },
};

export default function BreakEvenPanel({ nglRevenue, fracCost, gasValuePerBbl, gasPrice, spread }) {
  // Break-even gas price: NGL revenue - frac cost = gas keep-whole value
  // gas keep-whole = (1020000/1000000) * gasPrice * 5.615
  // So: breakEvenGas = (nglRevenue - fracCost) / (1.020 * 5.615)
  const breakEvenGas = (nglRevenue - fracCost) / (1.020 * 5.615);
  const margin = breakEvenGas - gasPrice; // positive = gas is below break-even = processing is economic
  const isPositive = margin >= 0;

  // Position on a $0-8 scale
  const bePos = Math.max(0, Math.min(100, (breakEvenGas / 8) * 100));
  const currentPos = Math.max(0, Math.min(100, (gasPrice / 8) * 100));

  const spreadPerPct = nglRevenue * 0.01; // $value of 1% NGL price move

  return (
    <div style={s.card}>
      <div style={s.label}>Break-even analysis</div>

      <div style={s.beRow}>
        <span style={{ ...s.beVal, color: isPositive ? '#10b981' : '#ef4444' }}>
          ${breakEvenGas.toFixed(2)}
        </span>
        <span style={s.beSub}>/MMBtu break-even gas price</span>
      </div>

      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
        Processing is economic as long as gas stays below this level
      </div>

      <div style={s.meter}>
        <div style={{ height: '100%', background: 'var(--bg-raised)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(bePos, currentPos)}%`, background: isPositive ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)' }} />
        </div>
        <div style={{ ...s.tick, left: `${bePos}%`, background: '#f59e0b' }} />
        <span style={{ ...s.tickLabel, left: `${bePos}%`, color: '#f59e0b' }}>BE ${breakEvenGas.toFixed(2)}</span>
        <div style={{ ...s.tick, left: `${currentPos}%`, background: isPositive ? '#10b981' : '#ef4444' }} />
        <span style={{ ...s.tickLabel, left: `${currentPos}%`, color: isPositive ? '#10b981' : '#ef4444' }}>Now ${gasPrice.toFixed(2)}</span>
      </div>

      <div style={{ marginTop: '32px' }}>
        <div style={s.grid}>
          <div style={s.stat}>
            <div style={s.statLabel}>Gas headroom</div>
            <div style={{ ...s.statVal, color: isPositive ? '#10b981' : '#ef4444' }}>
              {isPositive ? '+' : ''}{margin.toFixed(2)}/MMBtu
            </div>
          </div>
          <div style={s.stat}>
            <div style={s.statLabel}>NGL/gas ratio</div>
            <div style={{ ...s.statVal, color: 'var(--text-primary)' }}>
              {(nglRevenue / gasValuePerBbl).toFixed(2)}x
            </div>
          </div>
          <div style={s.stat}>
            <div style={s.statLabel}>$0.10/gal propane move</div>
            <div style={{ ...s.statVal, color: 'var(--amber)' }}>
              ~${(42 * 0.25 * 0.10).toFixed(2)}/bbl
            </div>
          </div>
        </div>
      </div>

      <div style={s.insight}>
        {isPositive
          ? `At current gas prices ($${gasPrice.toFixed(2)}/MMBtu), processing has $${margin.toFixed(2)}/MMBtu of headroom. Gas prices would need to rise ${((margin / gasPrice) * 100).toFixed(0)}% to reach the break-even level of $${breakEvenGas.toFixed(2)}/MMBtu.`
          : `Current gas price ($${gasPrice.toFixed(2)}/MMBtu) exceeds the break-even of $${breakEvenGas.toFixed(2)}/MMBtu. Under keep-whole contracts, processors would be incentivized to reject ethane back into the gas stream to reduce NGL recovery costs.`
        }
      </div>
    </div>
  );
}
