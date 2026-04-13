import React, { useState, useMemo } from 'react';
import { NGL_COMPONENTS, BASIN_PROFILES, FRAC_COST_DEFAULT } from './data/nglData';
import { useFredLatest } from './hooks/useFred';
import PriceSlider from './components/PriceSlider';
import SpreadChart from './components/SpreadChart';
import BreakEvenPanel from './components/BreakEvenPanel';
import SensitivityTable from './components/SensitivityTable';
import AnnualValuePanel from './components/AnnualValuePanel';
import HistoricalContext from './components/HistoricalContext';
import ContractComparison from './components/ContractComparison';

const s = {
  shell: { minHeight: '100vh', background: 'var(--bg)' },
  header: { borderBottom: '1px solid var(--border)', padding: '0 32px', height: '52px', display: 'flex', alignItems: 'center', gap: '16px' },
  wordmark: { fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' },
  divider: { width: '1px', height: '18px', background: 'var(--border)' },
  sub: { fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' },
  main: { maxWidth: '1380px', margin: '0 auto', padding: '28px 32px' },
  pageTitle: { fontSize: '22px', fontWeight: '300', letterSpacing: '-0.02em', marginBottom: '4px' },
  pageSub: { fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' },
  layout: { display: 'grid', gridTemplateColumns: '380px 1fr 1fr', gap: '20px', alignItems: 'start' },
  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 22px', marginBottom: '16px' },
  sectionLabel: { fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '14px' },
  spreadVal: { fontSize: '48px', fontWeight: '300', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '4px' },
  spreadSub: { fontSize: '13px', fontFamily: 'var(--font-mono)', marginBottom: '16px' },
  bar: { height: '5px', background: 'var(--bg-raised)', borderRadius: '3px', overflow: 'hidden', marginBottom: '16px' },
  barFill: { height: '100%', borderRadius: '3px', transition: 'width 0.3s ease' },
  metricsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' },
  metric: { background: 'var(--bg-raised)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' },
  metricLabel: { fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' },
  metricVal: { fontSize: '16px', fontWeight: '500', fontFamily: 'var(--font-mono)' },
  profileBtn: { fontSize: '12px', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-mono)' },
  profileBtnActive: { background: 'rgba(59,130,246,0.12)', borderColor: 'rgba(59,130,246,0.4)', color: 'var(--blue)' },
  compRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '12px' },
  disclaimer: { fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', lineHeight: '1.6' },
  fracRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' },
  fracLabel: { fontSize: '12px', color: 'var(--text-secondary)', minWidth: '120px' },
  fracVal: { fontSize: '14px', fontWeight: '500', fontFamily: 'var(--font-mono)', minWidth: '70px', textAlign: 'right' },
};

function getSpreadColor(s) {
  if (s > 8) return '#10b981';
  if (s > 3) return '#f59e0b';
  if (s > 0) return '#f97316';
  return '#ef4444';
}

function getSpreadLabel(s) {
  if (s > 8) return 'Strong -- attractive processing economics';
  if (s > 3) return 'Moderate -- marginal processing incentive';
  if (s > 0) return 'Thin -- approaching keep-whole threshold';
  return 'Negative -- gas value exceeds NGL recovery value';
}

export default function App() {
  const { value: propaneLive, date: propaneDate, loading: propaneLoading } = useFredLatest('DPROPANEMBTX');
  const [activeProfile, setActiveProfile] = useState('montney');
  const [prices, setPrices] = useState(() => {
    const p = {};
    NGL_COMPONENTS.forEach(c => { p[c.id] = c.defaultPriceGal; });
    return p;
  });
  const [fracCost, setFracCost] = useState(FRAC_COST_DEFAULT);
  const [gasPrice, setGasPrice] = useState(3.20);

  const composition = useMemo(() => BASIN_PROFILES.find(b => b.id === activeProfile)?.composition || BASIN_PROFILES[0].composition, [activeProfile]);

  const calc = useMemo(() => {
    let totalRevenueBbl = 0;
    const componentBreakdown = NGL_COMPONENTS.map(c => {
      const frac = composition[c.id] || 0;
      const revBbl = prices[c.id] * c.galPerBbl * frac;
      totalRevenueBbl += revBbl;
      return { ...c, frac, revBbl };
    });
    const gasValueBbl = (1.020 * 5.615) * gasPrice;
    const spread = totalRevenueBbl - fracCost - gasValueBbl;
    const barPct = Math.max(0, Math.min(100, ((spread + 5) / 25) * 100));
    return { totalRevenueBbl, spread, barPct, gasValueBbl, componentBreakdown };
  }, [prices, composition, fracCost, gasPrice]);

  const handlePriceChange = (id, val) => setPrices(prev => ({ ...prev, [id]: val }));

  return (
    <div style={s.shell}>
      <header style={s.header}>
        <span style={s.wordmark}>NGL FRAC SPREAD</span>
        <div style={s.divider} />
        <span style={s.sub}>Calculator & Market Monitor</span>
        <div style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {propaneLoading ? 'Loading FRED...' : propaneDate ? `Propane live: ${propaneDate}` : 'FRED offline'}
        </div>
      </header>

      <main style={s.main}>
        <div style={s.pageTitle}>NGL fractionation spread calculator</div>
        <div style={s.pageSub}>
          Processing economics for WCSB and reference basins -- EIA NGL data, GPA Midstream BTU standards
        </div>

        <div style={s.layout}>
          <div>
            <div style={s.card}>
              <div style={s.sectionLabel}>Basin profile</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                {BASIN_PROFILES.map(p => (
                  <button key={p.id} style={{ ...s.profileBtn, ...(activeProfile === p.id ? s.profileBtnActive : {}) }} onClick={() => setActiveProfile(p.id)}>
                    {p.name}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                {BASIN_PROFILES.find(b => b.id === activeProfile)?.description}
              </div>
            </div>

            <div style={s.card}>
              <div style={s.sectionLabel}>NGL component prices</div>
              {NGL_COMPONENTS.map(c => (
                <PriceSlider key={c.id} component={c} value={prices[c.id]}
                  onChange={val => handlePriceChange(c.id, val)}
                  liveValue={c.id === 'propane' && !propaneLoading ? propaneLive : null}
                  liveDate={c.id === 'propane' ? propaneDate : null}
                />
              ))}
            </div>

            <div style={s.card}>
              <div style={s.sectionLabel}>Cost inputs</div>
              <div style={s.fracRow}>
                <span style={s.fracLabel}>Frac cost</span>
                <input type="range" min="1" max="15" step="0.5" value={fracCost}
                  onChange={e => setFracCost(parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: 'var(--red)' }} />
                <span style={{ ...s.fracVal, color: 'var(--red)' }}>-${fracCost.toFixed(2)}/bbl</span>
              </div>
              <div style={s.fracRow}>
                <span style={s.fracLabel}>Gas price</span>
                <input type="range" min="0.50" max="8.00" step="0.10" value={gasPrice}
                  onChange={e => setGasPrice(parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: '#8b5cf6' }} />
                <span style={{ ...s.fracVal, color: '#8b5cf6' }}>${gasPrice.toFixed(2)}/MMBtu</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '4px', lineHeight: '1.5' }}>
                Frac cost: cost to separate NGL barrel. Gas price: keep-whole economics threshold.
              </div>
            </div>
          </div>

          <div>
            <div style={s.card}>
              <div style={s.sectionLabel}>Frac spread result</div>
              <div style={{ ...s.spreadVal, color: getSpreadColor(calc.spread) }}>
                {calc.spread >= 0 ? '+' : ''}${calc.spread.toFixed(2)}
                <span style={{ fontSize: '18px', color: 'var(--text-secondary)', marginLeft: '6px' }}>/bbl</span>
              </div>
              <div style={{ ...s.spreadSub, color: getSpreadColor(calc.spread) }}>{getSpreadLabel(calc.spread)}</div>
              <div style={s.bar}>
                <div style={{ ...s.barFill, width: `${calc.barPct}%`, background: getSpreadColor(calc.spread) }} />
              </div>
              <div style={s.metricsGrid}>
                <div style={s.metric}><div style={s.metricLabel}>NGL revenue</div><div style={{ ...s.metricVal, color: '#10b981' }}>${calc.totalRevenueBbl.toFixed(2)}/bbl</div></div>
                <div style={s.metric}><div style={s.metricLabel}>Gas keep-whole</div><div style={{ ...s.metricVal, color: '#8b5cf6' }}>${calc.gasValueBbl.toFixed(2)}/bbl</div></div>
                <div style={s.metric}><div style={s.metricLabel}>Frac cost</div><div style={{ ...s.metricVal, color: '#ef4444' }}>-${fracCost.toFixed(2)}/bbl</div></div>
                <div style={s.metric}><div style={s.metricLabel}>Net spread</div><div style={{ ...s.metricVal, color: getSpreadColor(calc.spread) }}>{calc.spread >= 0 ? '+' : ''}${calc.spread.toFixed(2)}/bbl</div></div>
              </div>
            </div>

            <div style={s.card}>
              <div style={s.sectionLabel}>Component breakdown -- {BASIN_PROFILES.find(b => b.id === activeProfile)?.name}</div>
              {calc.componentBreakdown.map(c => (
                <div key={c.id} style={s.compRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.color }} />
                    <span style={{ color: 'var(--text-secondary)', minWidth: '110px' }}>{c.name}</span>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', minWidth: '40px' }}>{(c.frac * 100).toFixed(0)}%</span>
                  <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', minWidth: '80px' }}>${prices[c.id].toFixed(3)}/gal</span>
                  <span style={{ color: c.color, fontFamily: 'var(--font-mono)' }}>${c.revBbl.toFixed(2)}/bbl</span>
                </div>
              ))}
              <div style={{ ...s.compRow, borderBottom: 'none', marginTop: '4px' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Total NGL revenue</span>
                <span style={{ color: '#10b981', fontFamily: 'var(--font-mono)', fontWeight: '500' }}>${calc.totalRevenueBbl.toFixed(2)}/bbl</span>
              </div>
            </div>

            <div style={s.card}>
              <SpreadChart components={NGL_COMPONENTS} prices={prices} composition={composition} fracCost={fracCost} gasValuePerBbl={calc.gasValueBbl} />
            </div>
          </div>

          <div>
            <BreakEvenPanel
              nglRevenue={calc.totalRevenueBbl}
              fracCost={fracCost}
              gasValuePerBbl={calc.gasValueBbl}
              gasPrice={gasPrice}
              spread={calc.spread}
            />
            <AnnualValuePanel
              spread={calc.spread}
              nglRevenue={calc.totalRevenueBbl}
              fracCost={fracCost}
            />
            <SensitivityTable
              currentPropane={prices.propane}
              currentGas={gasPrice}
              composition={composition}
              fracCost={fracCost}
              basePrices={prices}
            />
            <ContractComparison
              nglRevenue={calc.totalRevenueBbl}
              fracCost={fracCost}
              gasPrice={gasPrice}
              gasValueBbl={calc.gasValueBbl}
              spread={calc.spread}
              throughputBblD={5000}
            />
            <HistoricalContext currentSpread={calc.spread} />
            <div style={{ ...s.card, background: 'transparent' }}>
              <div style={s.disclaimer}>
                Propane: EIA via FRED (live). Ethane, isobutane, nC4, C5+: user-adjustable, calibrated to EIA quarterly NGPL reports. BTU content: GPA Midstream standards. Basin compositions are indicative. For internal analysis only.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
