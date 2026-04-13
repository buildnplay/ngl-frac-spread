import React, { useState } from 'react';

const s = {
  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 22px', marginBottom: '16px' },
  label: { fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '14px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' },
  contractCard: { borderRadius: 'var(--radius)', padding: '14px 16px', border: '1px solid var(--border)', position: 'relative', cursor: 'pointer', transition: 'border-color 0.15s' },
  contractName: { fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '4px' },
  contractAbbr: { fontSize: '10px', fontFamily: 'var(--font-mono)', padding: '2px 7px', borderRadius: '20px', display: 'inline-block', marginBottom: '8px' },
  contractVal: { fontSize: '24px', fontWeight: '300', fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em', marginBottom: '2px' },
  contractSub: { fontSize: '11px', color: 'var(--text-muted)' },
  winnerBadge: { position: 'absolute', top: '10px', right: '10px', fontSize: '9px', padding: '2px 8px', borderRadius: '20px', fontFamily: 'var(--font-mono)', background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' },
  paramsRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  paramLabel: { fontSize: '12px', color: 'var(--text-secondary)', minWidth: '140px' },
  paramVal: { fontSize: '13px', fontWeight: '500', fontFamily: 'var(--font-mono)', minWidth: '60px', textAlign: 'right' },
  compTable: { width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginTop: '8px' },
  th: { padding: '6px 10px', color: 'var(--text-muted)', fontSize: '10px', textAlign: 'right', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' },
  thLeft: { padding: '6px 10px', color: 'var(--text-muted)', fontSize: '10px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' },
  td: { padding: '7px 10px', textAlign: 'right', borderBottom: '1px solid rgba(255,255,255,0.04)', fontFamily: 'var(--font-mono)' },
  tdLeft: { padding: '7px 10px', textAlign: 'left', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  insight: { fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', padding: '10px 12px', background: 'var(--bg-raised)', borderRadius: 'var(--radius-sm)', marginTop: '12px' },
  sliderRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
};

function getColor(val, best) {
  if (val === best) return '#10b981';
  if (val > 0) return '#f59e0b';
  return '#ef4444';
}

export default function ContractComparison({ nglRevenue, fracCost, gasPrice, gasValueBbl, spread, throughputBblD = 5000 }) {
  const [popPct, setPopPct] = useState(65);
  const [feeFixed, setFeeFixed] = useState(3.50);

  // Keep-whole: processor takes full NGL uplift risk, pays producer gas value
  // Producer gets: gas value of inlet stream
  // Processor earns: NGL revenue - gas value paid - frac cost = frac spread
  const keepWhole = {
    name: 'Keep-whole',
    abbr: 'KW',
    color: '#3b82f6',
    processorMargin: spread, // = NGL revenue - frac cost - gas value
    producerValue: gasValueBbl,
    processorRevenue: nglRevenue,
    processorCost: fracCost + gasValueBbl,
    description: 'Processor bears full NGL price risk. Best for processor when NGL/gas ratio is high.',
  };

  // Percentage of proceeds: producer gets % of NGL revenue, processor keeps rest minus frac cost
  // Producer gets: popPct% of NGL revenue
  // Processor earns: (1-popPct%) of NGL revenue - frac cost
  const producerPOP = nglRevenue * (popPct / 100);
  const processorPOP = nglRevenue * ((100 - popPct) / 100) - fracCost;
  const pop = {
    name: 'Percent of proceeds',
    abbr: 'POP',
    color: '#8b5cf6',
    processorMargin: processorPOP,
    producerValue: producerPOP,
    processorRevenue: nglRevenue * ((100 - popPct) / 100),
    processorCost: fracCost,
    description: `Producer gets ${popPct}% of NGL revenue. Risk shared between parties.`,
  };

  // Fixed fee: processor charges flat fee per barrel, keeps upside/downside
  // Producer gets: NGL revenue - fixed fee
  // Processor earns: fixed fee - frac cost
  const processorFee = feeFixed - fracCost;
  const fee = {
    name: 'Fixed fee',
    abbr: 'Fee',
    color: '#14b8a6',
    processorMargin: processorFee,
    producerValue: nglRevenue - feeFixed,
    processorRevenue: feeFixed,
    processorCost: fracCost,
    description: `Processor charges $${feeFixed.toFixed(2)}/bbl. Producer takes all NGL price upside/downside.`,
  };

  const contracts = [keepWhole, pop, fee];
  const bestProcessor = Math.max(keepWhole.processorMargin, pop.processorMargin, fee.processorMargin);
  const bestProducer = Math.max(keepWhole.producerValue, pop.producerValue, fee.producerValue);

  const annualFactor = (throughputBblD || 5000) * 365;

  function fmt(v) {
    const a = Math.abs(v * annualFactor);
    const sign = v >= 0 ? '+' : '-';
    if (a >= 1000000) return `${sign}$${(a / 1000000).toFixed(1)}M/yr`;
    return `${sign}$${(a / 1000).toFixed(0)}K/yr`;
  }

  const winner = contracts.reduce((a, b) => a.processorMargin > b.processorMargin ? a : b);

  const insight = () => {
    if (keepWhole.processorMargin === bestProcessor) {
      return `Keep-whole is currently best for the processor at $${keepWhole.processorMargin.toFixed(2)}/bbl. This typically holds when the NGL/gas ratio is high -- NGLs are worth significantly more than their heat-value equivalent in gas. At current prices, every $0.10/gal move in propane shifts keep-whole margin by ~$1.05/bbl.`;
    } else if (pop.processorMargin === bestProcessor) {
      return `POP at ${popPct}% is currently optimal for the processor at $${pop.processorMargin.toFixed(2)}/bbl. This is common when NGL prices are moderate relative to gas -- both parties share commodity risk. If NGL prices rise significantly, keep-whole becomes more attractive.`;
    } else {
      return `Fixed fee at $${feeFixed.toFixed(2)}/bbl gives the processor $${fee.processorMargin.toFixed(2)}/bbl regardless of commodity prices. This is attractive in volatile markets or when the processor wants predictable margins. The producer captures full upside if NGL prices rally.`;
    }
  };

  return (
    <div style={s.card}>
      <div style={s.label}>Contract structure comparison</div>

      <div style={{ marginBottom: '16px' }}>
        <div style={s.sliderRow}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', minWidth: '160px' }}>POP producer share</span>
          <input type="range" min="50" max="85" step="1" value={popPct}
            onChange={e => setPopPct(parseInt(e.target.value))}
            style={{ flex: 1, accentColor: '#8b5cf6' }} />
          <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: '#8b5cf6', minWidth: '45px', textAlign: 'right' }}>{popPct}%</span>
        </div>
        <div style={s.sliderRow}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', minWidth: '160px' }}>Fixed fee</span>
          <input type="range" min="1.00" max="10.00" step="0.25" value={feeFixed}
            onChange={e => setFeeFixed(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: '#14b8a6' }} />
          <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: '#14b8a6', minWidth: '65px', textAlign: 'right' }}>${feeFixed.toFixed(2)}/bbl</span>
        </div>
      </div>

      <div style={s.grid}>
        {contracts.map(c => {
          const isWinner = c.processorMargin === bestProcessor;
          const color = getColor(c.processorMargin, bestProcessor);
          return (
            <div key={c.abbr} style={{
              ...s.contractCard,
              background: isWinner ? `${c.color}0d` : 'var(--bg-raised)',
              borderColor: isWinner ? `${c.color}50` : 'var(--border)',
            }}>
              {isWinner && <span style={s.winnerBadge}>best for processor</span>}
              <div style={{ ...s.contractAbbr, background: `${c.color}18`, color: c.color }}>{c.abbr}</div>
              <div style={s.contractName}>{c.name}</div>
              <div style={{ ...s.contractVal, color }}>
                {c.processorMargin >= 0 ? '+' : ''}${c.processorMargin.toFixed(2)}
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>/bbl</span>
              </div>
              <div style={s.contractSub}>Processor margin</div>
              <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                Producer gets: <span style={{ color: 'var(--text-secondary)' }}>${c.producerValue.toFixed(2)}/bbl</span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.4' }}>{c.description}</div>
            </div>
          );
        })}
      </div>

      <table style={s.compTable}>
        <thead>
          <tr>
            <th style={s.thLeft}>Metric</th>
            <th style={{ ...s.th, color: '#3b82f6' }}>Keep-whole</th>
            <th style={{ ...s.th, color: '#8b5cf6' }}>POP {popPct}%</th>
            <th style={{ ...s.th, color: '#14b8a6' }}>Fixed fee</th>
          </tr>
        </thead>
        <tbody>
          {[
            { label: 'Processor margin ($/bbl)', vals: [keepWhole.processorMargin, pop.processorMargin, fee.processorMargin], fmt: v => `${v >= 0 ? '+' : ''}$${v.toFixed(2)}` },
            { label: 'Producer value ($/bbl)', vals: [keepWhole.producerValue, pop.producerValue, fee.producerValue], fmt: v => `$${v.toFixed(2)}` },
            { label: 'Processor annual value', vals: [keepWhole.processorMargin, pop.processorMargin, fee.processorMargin], fmt: v => fmt(v) },
            { label: 'NGL price risk borne by', vals: ['Processor', `Shared ${popPct}/${100-popPct}`, 'Producer'], fmt: v => v, isText: true },
            { label: 'Gas price sensitivity', vals: ['High', 'Medium', 'None'], fmt: v => v, isText: true },
          ].map((row, i) => {
            const best = row.isText ? null : Math.max(...row.vals.map(v => typeof v === 'number' ? v : -Infinity));
            return (
              <tr key={i}>
                <td style={s.tdLeft}>{row.label}</td>
                {row.vals.map((v, j) => {
                  const isBest = !row.isText && v === best;
                  const colors = ['#3b82f6', '#8b5cf6', '#14b8a6'];
                  return (
                    <td key={j} style={{ ...s.td, color: isBest ? '#10b981' : row.isText ? 'var(--text-secondary)' : typeof v === 'number' && v < 0 ? '#ef4444' : 'var(--text-primary)', fontWeight: isBest ? '500' : '400' }}>
                      {row.fmt(v)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={s.insight}>{insight()}</div>

      <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '10px', lineHeight: '1.5' }}>
        Keep-whole: processor pays producer gas value, keeps NGL revenue minus frac cost.
        POP: producer receives {popPct}% of NGL revenue, processor keeps remainder minus frac cost.
        Fixed fee: producer receives NGL revenue minus flat fee, processor keeps fee minus frac cost.
        Annual values at {(throughputBblD || 5000).toLocaleString()} bbl/d throughput.
      </div>
    </div>
  );
}
