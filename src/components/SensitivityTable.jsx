import React, { useMemo } from 'react';
import { NGL_COMPONENTS } from '../data/nglData';

function calcSpread(propanePrice, gasPrice, composition, fracCost, basePrices) {
  let nglRev = 0;
  NGL_COMPONENTS.forEach(c => {
    const price = c.id === 'propane' ? propanePrice : basePrices[c.id];
    const frac = composition[c.id] || 0;
    nglRev += price * c.galPerBbl * frac;
  });
  const gasVal = (1.020 * 5.615) * gasPrice;
  return nglRev - fracCost - gasVal;
}

function getColor(spread) {
  if (spread > 10) return { bg: 'rgba(16,185,129,0.25)', text: '#10b981' };
  if (spread > 5) return { bg: 'rgba(16,185,129,0.12)', text: '#10b981' };
  if (spread > 0) return { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b' };
  if (spread > -5) return { bg: 'rgba(239,68,68,0.12)', text: '#ef4444' };
  return { bg: 'rgba(239,68,68,0.25)', text: '#ef4444' };
}

const s = {
  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 22px', marginBottom: '16px' },
  label: { fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '14px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '12px', fontFamily: 'var(--font-mono)' },
  th: { padding: '6px 10px', color: 'var(--text-muted)', fontSize: '10px', textAlign: 'center', borderBottom: '1px solid var(--border)', letterSpacing: '0.04em' },
  thLeft: { padding: '6px 10px', color: 'var(--text-muted)', fontSize: '10px', textAlign: 'left', borderBottom: '1px solid var(--border)' },
  td: { padding: '7px 10px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '12px', fontWeight: '500' },
  tdLabel: { padding: '7px 10px', textAlign: 'left', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  axisLabel: { fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px' },
  legend: { display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap' },
  legItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' },
  legSwatch: { width: '12px', height: '12px', borderRadius: '2px' },
};

export default function SensitivityTable({ currentPropane, currentGas, composition, fracCost, basePrices }) {
  const propaneSteps = useMemo(() => {
    const base = currentPropane || 0.72;
    return [-0.20, -0.10, 0, +0.10, +0.20].map(d => parseFloat((base + d).toFixed(2)));
  }, [currentPropane]);

  const gasSteps = useMemo(() => {
    const base = currentGas || 3.20;
    return [-1.00, -0.50, 0, +0.50, +1.00].map(d => parseFloat((base + d).toFixed(2)));
  }, [currentGas]);

  const table = useMemo(() => {
    return gasSteps.map(gas => ({
      gas,
      cells: propaneSteps.map(prop => ({
        propane: prop,
        spread: calcSpread(prop, gas, composition, fracCost, basePrices),
      })),
    }));
  }, [propaneSteps, gasSteps, composition, fracCost, basePrices]);

  return (
    <div style={s.card}>
      <div style={s.label}>Sensitivity table -- frac spread ($/bbl)</div>
      <div style={s.axisLabel}>Rows: gas price ($/MMBtu) | Columns: propane price ($/gal)</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.thLeft}>Gas \ Propane</th>
              {propaneSteps.map(p => (
                <th key={p} style={{ ...s.th, background: Math.abs(p - (currentPropane || 0.72)) < 0.001 ? 'rgba(59,130,246,0.08)' : 'transparent' }}>
                  ${p.toFixed(2)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.map(row => (
              <tr key={row.gas}>
                <td style={{ ...s.tdLabel, background: Math.abs(row.gas - (currentGas || 3.20)) < 0.001 ? 'rgba(59,130,246,0.08)' : 'transparent', fontFamily: 'var(--font-mono)' }}>
                  ${row.gas.toFixed(2)}/MMBtu
                  {Math.abs(row.gas - (currentGas || 3.20)) < 0.001 && (
                    <span style={{ fontSize: '9px', color: 'var(--blue)', marginLeft: '6px', padding: '1px 5px', background: 'rgba(59,130,246,0.15)', borderRadius: '10px' }}>now</span>
                  )}
                </td>
                {row.cells.map(cell => {
                  const { bg, text } = getColor(cell.spread);
                  const isCurrent = Math.abs(cell.propane - (currentPropane || 0.72)) < 0.001 && Math.abs(row.gas - (currentGas || 3.20)) < 0.001;
                  return (
                    <td key={cell.propane} style={{
                      ...s.td, background: bg, color: text,
                      border: isCurrent ? '2px solid rgba(59,130,246,0.6)' : undefined,
                    }}>
                      {cell.spread >= 0 ? '+' : ''}{cell.spread.toFixed(1)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={s.legend}>
        {[
          { color: 'rgba(16,185,129,0.25)', label: 'Strong (>$10)' },
          { color: 'rgba(16,185,129,0.12)', label: 'Good ($5-10)' },
          { color: 'rgba(245,158,11,0.12)', label: 'Marginal ($0-5)' },
          { color: 'rgba(239,68,68,0.12)', label: 'Thin (0 to -$5)' },
          { color: 'rgba(239,68,68,0.25)', label: 'Negative (<-$5)' },
        ].map(l => (
          <div key={l.label} style={s.legItem}>
            <div style={{ ...s.legSwatch, background: l.color, border: '1px solid rgba(255,255,255,0.1)' }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}
