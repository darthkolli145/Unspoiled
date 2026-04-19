# Seismic

**Parametric Insurance API for Seismic Risk on High-Rise Structures**

Seismic models building-specific structural resonance from first principles and issues automated parametric insurance payouts — without a claims adjuster — the moment ground motion exceeds a policy threshold.

---

## The Idea

Traditional earthquake insurance uses coarse regional hazard maps. Seismic prices to the physics of each individual building: its height, structure type, foundation mass, and dominant resonance frequency. A 1964 masonry tower in San Francisco has a fundamentally different risk profile than a 2017 RC shear-wall tower on the same block.

We ingest Scripps synthetic seismograms and USGS 3D building geometries, run per-floor stress simulations via a PyTorch-accelerated backend using the **alpa_(ti) decay** variable, and produce a risk score, monthly premium, and payout cap — in a single API call.

---

## Platform

### Risk Dashboard
Two-tab interface at `/dashboard`:

**Portfolio tab** — All monitored buildings with live risk scores, premiums, payout caps, and trend direction. Click any row to open a detail panel showing:
- Building metadata (structure type, floors, sqft, year built)
- Resonance profile chart (0.05–3.0 Hz sweep, Lorentzian peak at dominant frequency)
- Per-floor stress bars (red = critical, amber = elevated, yellow = moderate, green = low)
- Trigger PGV threshold and payout cap

**Seismic Events tab** — 30-day event feed from USGS, showing magnitude, fault location, depth, peak ground velocity, affected portfolio buildings, and payout status.

### Marketing Site
Full B2B landing page at `/` targeted at REITs and commercial carriers. Sections: hero (WebGL shader background), logo strip, product grid, technical pipeline (Scripps → USGS → PyTorch → payout), capabilities split with pixelated cityscape illustration, developer API card, testimonial, enterprise, CTA.

---

## Data Model

| Concept | Description |
|---------|-------------|
| `Building` | Address, city, floors, structure type, year built, sqft |
| `RiskScore` | 0–1 score, level (critical/elevated/moderate/low), peak stress floor, dominant Hz |
| `Pricing` | Monthly premium (USD), payout cap (USD), trigger PGV (cm/s) |
| `BuildingSummary` | Building + risk + pricing + trend + payout status |
| `BuildingDetail` | Summary + per-floor stress array + resonance profile |
| `SeismicEvent` | Magnitude, fault, depth, PGV, distance, trigger status, payout amount |

---

## Risk Score Thresholds

| Level | Score | Typical Premium | Typical Cap |
|-------|-------|----------------|-------------|
| Critical | ≥ 0.70 | $2,400–$5,000/mo | $10M–$20M |
| Elevated | 0.50–0.69 | $700–$2,400/mo | $4M–$10M |
| Moderate | 0.33–0.49 | $200–$700/mo | $1.5M–$4M |
| Low | < 0.33 | $80–$200/mo | $500K–$1.5M |

---

## API Routes

| Route | Description |
|-------|-------------|
| `GET /api/portfolio` | List of `BuildingSummary[]`, filterable by `city` and `level` |
| `GET /api/portfolio/[id]` | `BuildingDetail` for a single building |
| `GET /api/events` | Array of `SeismicEvent[]` for the past 30 days |

---

## Tech Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4** + **shadcn/ui**
- **WebGL** for animated hero shader background (gray plasma wave, `shader-background.tsx`)
- Pure **SVG** charts for resonance profiles and floor stress (no Recharts dependency)

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — marketing site.
Dashboard at [http://localhost:3000/dashboard](http://localhost:3000/dashboard).

No external API keys required. All risk data is generated deterministically from a seeded building database.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                        # Marketing site (Seismic landing page)
│   ├── dashboard/page.tsx              # Dashboard shell (Portfolio + Events tabs)
│   └── api/
│       ├── portfolio/route.ts          # Building list API
│       ├── portfolio/[id]/route.ts     # Building detail API
│       └── events/route.ts            # Seismic events API
├── components/
│   ├── marketing/SiteNav.tsx           # Top nav
│   ├── dashboard/
│   │   ├── DashboardShell.tsx          # Portfolio tab shell
│   │   ├── SummaryCards.tsx            # Portfolio/critical/payout/GWP metric cards
│   │   ├── FilterBar.tsx               # City + risk level filters
│   │   ├── UnitsTable.tsx              # Buildings table
│   │   └── StatusBadge.tsx             # Risk level badge
│   ├── detail/
│   │   ├── DetailPanel.tsx             # Side-panel drawer for building detail
│   │   ├── UnitMetaCard.tsx            # Building metadata + score/premium/cap
│   │   ├── HourlyTrendChart.tsx        # Resonance profile SVG chart
│   │   └── AnomalyScoreChart.tsx       # Per-floor stress bar chart
│   ├── fcu/FcuShell.tsx               # Seismic events tab (30-day feed)
│   └── ui/
│       └── shader-background.tsx       # WebGL animated gray plasma shader (hero)
└── lib/
    ├── types.ts                        # Building, RiskScore, Pricing, SeismicEvent types
    ├── seismic-data.ts                 # Seed buildings + deterministic risk/event generator
    └── utils.ts                        # cn(), formatting helpers
```

---

## Planned Data Integration

### [Zenodo: SeisSol Southern California Ground Motion Database](https://zenodo.org/records/12520845)

Physics-based synthetic seismograms computed with SeisSol (3D velocity model, viscoelastic attenuation, topography).

| File | Size | Contents |
|------|------|----------|
| `velocity_time_series.npy` | 176.7 GB | Full dataset — shape `(500, 8181, 3, 6000)` |
| `seismos_16_receivers.npy` | 38.4 MB | 16-receiver demo — suitable for dev/testing |
| `source_locations.csv` | 18 kB | Lat/lon for all 500 earthquake sources |
| `seissol_input_files.zip` | 94 MB | Mesh, material properties, SeisSol config |
| `seismogram_rom_demo.ipynb` | 101 kB | Tutorial notebook |

**Schema:** 500 sources × 8181 receivers × 3 components (E-W, N-S, vertical) × 6000 timesteps (60s at 100 Hz)

**Integration plan:**
1. **Receiver → building mapping** — geocode receiver lat/lons, spatial-join to portfolio addresses
2. **Scenario lookup** — for a new USGS event, find the nearest source in the 500-scenario database
3. **PGV extraction** — `max(abs(v_timeseries))` per component → trigger threshold check
4. **Resonance profiling** — FFT the 3-component series at building's dominant Hz (derived from floor count); produces the spectral input for the `alpa_(ti)` decay model
5. **Per-floor stress** — convolve site ground motion with building transfer function (MDOF model, floor-by-floor mass/stiffness from USGS geometry)

**Architecture:** Python/FastAPI sidecar service reads `.npy` chunks; Next.js `/api/portfolio` and `/api/events` proxy to it. The 38 MB demo file covers development with 16 receivers.

### Other sources
- [USGS ShakeMap](https://earthquake.usgs.gov/data/shakemap/) — real-time PGV/PGA maps for live trigger evaluation
- [USGS 3D Building Geometries](https://www.usgs.gov/) — floor-by-floor mass and stiffness inputs
- [Scripps Institution of Oceanography](https://ds.iris.edu/) — additional synthetic seismogram validation
