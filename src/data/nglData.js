export const NGL_COMPONENTS = [
  {
    id: 'ethane', name: 'Ethane', symbol: 'C2', color: '#3b82f6',
    btuPerGal: 56573, galPerBbl: 42, defaultPriceGal: 0.22,
    minPrice: 0.05, maxPrice: 0.60, step: 0.01,
    description: 'Petrochemical feedstock -- price linked to natural gas',
    typicalYield: 0.35,
  },
  {
    id: 'propane', name: 'Propane', symbol: 'C3', color: '#f59e0b',
    btuPerGal: 91502, galPerBbl: 42, defaultPriceGal: 0.72,
    minPrice: 0.20, maxPrice: 1.80, step: 0.01,
    description: 'Heating fuel & feedstock -- FRED live data',
    typicalYield: 0.25, fredSeries: 'DPROPANEMBTX',
  },
  {
    id: 'isobutane', name: 'Isobutane', symbol: 'iC4', color: '#8b5cf6',
    btuPerGal: 98931, galPerBbl: 42, defaultPriceGal: 0.88,
    minPrice: 0.30, maxPrice: 2.00, step: 0.01,
    description: 'Alkylation feedstock -- typically above propane',
    typicalYield: 0.10,
  },
  {
    id: 'normalbutane', name: 'Normal Butane', symbol: 'nC4', color: '#14b8a6',
    btuPerGal: 103097, galPerBbl: 42, defaultPriceGal: 0.85,
    minPrice: 0.30, maxPrice: 2.00, step: 0.01,
    description: 'Blending & LPG -- near propane on heat-value basis',
    typicalYield: 0.12,
  },
  {
    id: 'naturalGasoline', name: 'Natural Gasoline', symbol: 'C5+', color: '#f97316',
    btuPerGal: 120093, galPerBbl: 42, defaultPriceGal: 1.45,
    minPrice: 0.50, maxPrice: 3.00, step: 0.01,
    description: 'Blending stock -- premium to crude on heat value',
    typicalYield: 0.08,
  },
];

export const BASIN_PROFILES = [
  {
    id: 'montney', name: 'Montney (NE BC)', description: 'Rich gas -- high C3+ content',
    composition: { ethane: 0.30, propane: 0.28, isobutane: 0.10, normalbutane: 0.14, naturalGasoline: 0.18 },
  },
  {
    id: 'wcsb_avg', name: 'WCSB Average', description: 'Western Canadian average',
    composition: { ethane: 0.35, propane: 0.25, isobutane: 0.10, normalbutane: 0.12, naturalGasoline: 0.08 },
  },
  {
    id: 'permian', name: 'Permian Basin', description: 'US reference -- rich associated gas',
    composition: { ethane: 0.40, propane: 0.26, isobutane: 0.09, normalbutane: 0.13, naturalGasoline: 0.12 },
  },
  {
    id: 'lean', name: 'Lean Gas', description: 'Dry/lean stream -- ethane dominant',
    composition: { ethane: 0.55, propane: 0.22, isobutane: 0.07, normalbutane: 0.09, naturalGasoline: 0.07 },
  },
];

export const FRAC_COST_DEFAULT = 5.50;
export const GAS_BTU_MCF = 1020000;
