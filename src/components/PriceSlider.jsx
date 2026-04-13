import React from 'react';
const s = {
  wrap: { marginBottom: '14px' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' },
  nameRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  dot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  symbol: { fontSize: '11px', fontFamily: 'var(--font-mono)', padding: '2px 7px', borderRadius: '20px', background: 'var(--bg-raised)', color: 'var(--text-muted)' },
  name: { fontSize: '13px', color: 'var(--text-secondary)' },
  val: { fontSize: '15px', fontWeight: '500', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' },
  live: { fontSize: '10px', padding: '2px 6px', borderRadius: '20px', background: 'rgba(16,185,129,0.12)', color: '#10b981', fontFamily: 'var(--font-mono)', marginLeft: '6px' },
  desc: { fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' },
};
export default function PriceSlider({ component, value, onChange, liveValue, liveDate }) {
  const isLive = liveValue != null;
  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div style={s.nameRow}>
          <div style={{ ...s.dot, background: component.color }} />
          <span style={s.symbol}>{component.symbol}</span>
          <span style={s.name}>{component.name}</span>
          {isLive && <span style={s.live}>live</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isLive && (
            <button
              style={{ fontSize: '10px', color: '#10b981', background: 'transparent', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '20px', padding: '2px 8px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
              onClick={() => onChange(liveValue)}
            >
              use live
            </button>
          )}
          <span style={s.val}>${value.toFixed(3)}/gal</span>
        </div>
      </div>
      <input
        type="range"
        min={component.minPrice}
        max={component.maxPrice}
        step={component.step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ accentColor: component.color }}
      />
      <div style={s.desc}>{component.description}{isLive && liveDate ? ` -- FRED as of ${liveDate}` : ''}</div>
    </div>
  );
}
