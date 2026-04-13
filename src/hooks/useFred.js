import { useState, useEffect } from 'react';
const BASE = 'https://api.stlouisfed.org/fred/series/observations';
export function useFredLatest(seriesId) {
  const [value, setValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(null);
  useEffect(() => {
    if (!seriesId) return;
    const key = import.meta.env.VITE_FRED_KEY || 'demo';
    const params = new URLSearchParams({
      series_id: seriesId, api_key: key, file_type: 'json',
      observation_start: '2024-01-01', sort_order: 'desc', limit: 30,
    });
    fetch(`${BASE}?${params}`)
      .then(r => r.json())
      .then(json => {
        const valid = (json.observations || []).find(o => o.value !== '.' && o.value !== 'ND');
        if (valid) { setValue(parseFloat(valid.value)); setDate(valid.date); }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [seriesId]);
  return { value, date, loading };
}
