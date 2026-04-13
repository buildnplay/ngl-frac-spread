# NGL Frac Spread Calculator

Interactive fractionation spread calculator for WCSB and reference basin NGL streams.

## Setup
1. Copy .env.example to .env and add your FRED key
2. npm install
3. npm start -- runs at http://localhost:5173

## How frac spread is calculated
Frac Spread ($/bbl) = NGL Revenue - Fractionation Cost - Gas Keep-Whole Value

Where:
- NGL Revenue = sum of (component price x gallons x stream fraction) for each product
- Fractionation Cost = cost to separate NGL barrel into products (~$3.50-8.00/bbl)
- Gas Keep-Whole Value = value of leaving NGLs in gas stream at current gas price

A positive spread means processing is economically preferred over leaving NGLs in the gas.

## Data sources
- Propane: EIA via FRED (DPROPANEMBTX) - live
- Other NGLs: User-adjustable, calibrated to EIA quarterly NGPL price reports
- BTU content: GPA Midstream standards
