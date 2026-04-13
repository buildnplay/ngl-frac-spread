import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-hover)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.fill }}>{p.name}: ${p.value?.toFixed(2)}/bbl</div>
      ))}
    </div>
  );
};

export default function SpreadChart({ components, prices, composition, fracCost, gasValuePerBbl }) {
  const data = components.map(c => {
    const frac = composition[c.id] || 0;
    const revenue = prices[c.id] * c.galPerBbl * frac;
    return { name: c.symbol, revenue: parseFloat(revenue.toFixed(2)), color: c.color };
  });

  const totalRevenue = data.reduce((a, b) => a + b.revenue, 0);
  const spread = totalRevenue - fracCost - gasValuePerBbl;

  const summaryData = [
    { name: 'NGL revenue', value: parseFloat(totalRevenue.toFixed(2)), color: '#10b981' },
    { name: 'Gas value', value: parseFloat(gasValuePerBbl.toFixed(2)), color: '#8b5cf6' },
    { name: 'Frac cost', value: -parseFloat(fracCost.toFixed(2)), color: '#ef4444' },
    { name: 'Net spread', value: parseFloat(spread.toFixed(2)), color: spread >= 0 ? '#10b981' : '#ef4444' },
  ];

  return (
    <div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Revenue by component ($/bbl stream)</div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fill: '#4a5060', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#4a5060', fontSize: 10, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} width={40} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="revenue" name="Revenue">
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '16px 0 10px' }}>Spread waterfall ($/bbl)</div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={summaryData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fill: '#4a5060', fontSize: 10, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#4a5060', fontSize: 10, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} width={40} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" name="Value">
            {summaryData.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
