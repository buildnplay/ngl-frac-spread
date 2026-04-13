import React from 'react';

// EIA quarterly NGPL composite price and frac spread estimates
// Source: EIA quarterly petroleum reports, industry estimates
const HISTORICAL_SPREADS = [
  { period: 'Q1 2024', spread: 4.2, propane: 0.68, gas: 2.40 },
  { period: 'Q2 2024', spread: 3.8, propane: 0.62, gas: 1.90 },
  { period: 'Q3 2024', spread: 5.1, propane: 0.65, gas: 2.10 },
  { period: 'Q4 2024', spread: 6.8, propane: 0.75, gas: 2.90 },
  { period: 'Q1 2025', spread: 8.2, propane: 0.82, gas: 3.80 },
  { period: 'Q2 2025', spread: 6.5, propane: 0.74, gas: 2.80 },
  { period: 'Q3 2025', spread: 5.9, propane: 0.70, gas: 2.60 },
  { period: 'Q4 2025', spread: 7.1, propane: 0.76, gas: 3.10 },
  { period: 'Q1 2026', spread: 7.4, propane: 0.78, gas: 3.40 },
];

function getPercentile(value, data) {
  const sorted = [...data].sort((a, b) => a - b);
  const idx = sorted.findIndex(v => v >= value);
  return idx === -1 ? 100 : Math.round((idx / sorted.length) * 100);
}

const s = {
  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 22px', marginBottom: '16px' },
  label: { fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '14px' },
  barWrap: { display: 'flex', alignItems: 'flex-end', gap: '6px', height: '100px', marginBottom: '6px' },
  bar: { flex: 1, borderRadius: '3px 3px 0 0', transition: 'height 0.3s ease', minHeight: '4px', position: 'relative', cursor: 'default' },
  barLabel: { fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textAlign: 'center', marginTop: '4px' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '12px' },
  stat: { background: 'var(--bg-raised)', borderRadius: 'var(--radius-sm)', padding: '8px 10px' },
  statLabel: { fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '3px' },
  statVal: { fontSize: '14px', fontWeight: '500', fontFamily: 'var(--font-mono)' },
  pctBar: { height: '6px', background: 'var(--bg-raised)', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px', marginTop: '10px' },
  insight: { fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', padding: '10px 12px', background: 'var(--bg-raised)', borderRadius: 'var(--radius-sm)', marginTop: '10px' },
  disclaimer: { fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '8px' },
};

export default function HistoricalContext({ currentSpread }) {
  const spreads = HISTORICAL_SPREADS.map(h => h.spread);
  const maxSpread = Math.max(...spreads, currentSpread);
  const minSpread = Math.min(...spreads, currentSpread);
  const avgSpread = spreads.reduce((a, b) => a + b, 0) / spreads.length;
  const pct = getPercentile(currentSpread, spreads);
  const spreadColor = currentSpread > avgSpread ? '#10b981' : currentSpread > 0 ? '#f59e0b' : '#ef4444';

  return (
    <div style={s.card}>
      <div style={s.label}>Historical context -- trailing 5 quarters (est.)</div>

      <div style={s.barWrap}>
        {HISTORICAL_SPREADS.map((h, i) => {
          const heightPct = ((h.spread - minSpread) / (maxSpread - minSpread)) * 80 + 10;
          const isRecent = i === HISTORICAL_SPREADS.length - 1;
          return (
            <div key={h.period} style={{ flex: 1 }}>
              <div style={{
                ...s.bar,
                height: `${heightPct}%`,
                background: isRecent ? 'rgba(59,130,246,0.4)' : h.spread > avgSpread ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.25)',
                border: isRecent ? '1px solid rgba(59,130,246,0.5)' : 'none',
              }} title={`${h.period}: $${h.spread.toFixed(1)}/bbl`} />
              <div style={s.barLabel}>{h.period.replace(' 20', " '")}</div>
            </div>
          );
        })}
        <div style={{ flex: 1 }}>
          <div style={{
            ...s.bar,
            height: `${((currentSpread - minSpread) / (maxSpread - minSpread)) * 80 + 10}%`,
            background: currentSpread > avgSpread ? 'rgba(16,185,129,0.6)' : 'rgba(239,68,68,0.4)',
            border: `1px solid ${spreadColor}`,
          }} title={`Current: $${currentSpread.toFixed(1)}/bbl`} />
          <div style={{ ...s.barLabel, color: spreadColor }}>Current</div>
        </div>
      </div>

      <div style={s.pctBar}>
        <div style={{ height: '100%', width: `${pct}%`, background: spreadColor, borderRadius: '3px' }} />
      </div>
      <div style={{ fontSize: '11px', color: spreadColor, fontFamily: 'var(--font-mono)' }}>
        Current spread is at the {pct}th percentile of the trailing period
      </div>

      <div style={s.statsRow}>
        <div style={s.stat}>
          <div style={s.statLabel}>Period avg</div>
          <div style={{ ...s.statVal, color: 'var(--text-primary)' }}>${avgSpread.toFixed(1)}/bbl</div>
        </div>
        <div style={s.stat}>
          <div style={s.statLabel}>Period high</div>
          <div style={{ ...s.statVal, color: '#10b981' }}>${maxSpread.toFixed(1)}/bbl</div>
        </div>
        <div style={s.stat}>
          <div style={s.statLabel}>Period low</div>
          <div style={{ ...s.statVal, color: '#ef4444' }}>${minSpread.toFixed(1)}/bbl</div>
        </div>
        <div style={s.stat}>
          <div style={s.statLabel}>vs avg</div>
          <div style={{ ...s.statVal, color: spreadColor }}>
            {currentSpread > avgSpread ? '+' : ''}{(currentSpread - avgSpread).toFixed(1)}/bbl
          </div>
        </div>
      </div>

      <div style={s.insight}>
        {currentSpread > avgSpread
          ? `Current spread of $${currentSpread.toFixed(1)}/bbl is $${(currentSpread - avgSpread).toFixed(1)}/bbl above the trailing average -- above-average processing economics. Strong incentive for full NGL recovery.`
          : currentSpread > 0
          ? `Current spread of $${currentSpread.toFixed(1)}/bbl is $${(avgSpread - currentSpread).toFixed(1)}/bbl below the trailing average -- below-average but still positive. Monitor ethane rejection economics closely.`
          : `Spread has turned negative -- below keep-whole threshold. Under percentage-of-proceeds or keep-whole contracts, processors would be incentivized to reduce NGL recovery.`
        }
      </div>

      <div style={s.disclaimer}>
        Historical spreads are EIA-calibrated estimates based on quarterly NGPL composite price reports and industry data. Not derived from actual plant-level data.
      </div>
    </div>
  );
}
