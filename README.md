# Unspoiled

**Food-Waste Routing & Compliance Intelligence**

Unspoiled turns the Dryad organic-waste-ban dataset (bzkh189h4) and a trained
PyTorch tonnage regressor into a portfolio-level analytics surface: per-business
tonnage forecasts, organic-waste-ban threshold labels, nearest-processor
routing, and study-backed diversion estimates.

**Every numeric value surfaced by the site traces back to one of three things:**

1. A column that exists in the Dryad dataset (`data/raw/*.csv`).
2. A direct output of the PyTorch model (`models/unspoiled.pt`).
3. A transformation whose inputs are both in (1) or (2) — for example,
   `divertedTonsPerYear = tonsPerYear × compostingEffect`.

There are **no invented tipping fees, hauling rates, emissions factors, or
testimonials**. Where the Dryad study records no value (e.g. MA and CA have no
`composting_effect` entry), Unspoiled displays a dash rather than making one
up.

---

## Product

### Operator console (`/dashboard`)

- **Generators** — filterable / searchable table over every modeled business
  with actual tonnage (dataset), predicted tonnage (model), residual (model),
  diverted tonnage (dataset × dataset, blank when unavailable), nearest
  processor miles (dataset), ban coverage flag (dataset thresholds), and a
  threshold status (`above` / `near` / `below`) derived directly from
  `bans_thresholds.csv`.
- **Map** — Leaflet canvas map of every generator + processor, with layer
  toggles (`All` / `At or near ban` / `Above only` / `Enforcement density`)
  and a dashed coral polyline from any selected generator to its nearest
  processor. Tiles: CartoDB Positron (no API key).
- **Processor Network** — every permitted food-scrap processor in the MA and
  VT rosters with type and location.
- **Enforcement** — MassDEP waste-ban enforcement intelligence parsed from
  `wb_enforcements.csv`. Summary cards (total actions, penalties, years
  covered), per-year + per-type bar charts, top-12 towns leaderboard, and a
  full searchable + type-filterable records table. **Important:** this is a
  town-level rollup, not a per-business claim — see the redaction note below.
- **Model** — predicted-vs-actual log-log scatter, metric cards, training
  configuration, validation-loss trace.

### Landing site (`/`)

A Misfits-styled narrative pulling live numbers from the dataset and the
trained model. The former testimonial and pricing-tier sections were
replaced by dataset-backed evidence panels:

- **Per-state ban effects** — the `compositing_effect` and `disposal_effect`
  values from the Dryad CSVs, cell by cell. Blanks shown where the study has
  no value.
- **Boulder, CO diversion rate** — the full time-series in
  `boulder_waste.csv`, rolled up from sector-level rows to annual totals.
- **Seattle, WA composting** — monthly composting tons from
  `seattle_composting.csv`, rolled up to annual totals.
- **MA enforcement count** — the literal row count of
  `wb_enforcements.csv`.

---

## Model

A PyTorch MLP predicts `tons_per_year` for every commercial food-waste
generator from:

- **Generator category** (Restaurant, Grocery, Hospital, School, College,
  Cafeteria, Prison, FoodService, Bakery, FoodManufacturer, Warehouse,
  Lodging, Other) as a 12-d embedding
- **State** as a 4-d embedding
- **Town population** (US Census join) — log-scaled
- **Latitude / longitude**
- **Nearest-processor distance (km)** — log-scaled

Target is `log1p(tons_per_year)` with the top 0.5% winsorized. Loss is
Smooth-L1. Optimizer: Adam + cosine LR schedule. Architecture: 128 → 128 → 64.
Dropout 0.15, 300 epochs, seed 42.

Dataset: ~11,000 commercial generators harmonized across MA (`tons`) and VT
(`TonsPerWeek × 52`), 80/20 train/val split.

**Held-out validation metrics:**

- R² (log-tonnage): ≈ 0.49
- R² (raw tons): ≈ 0.24
- MAE: ≈ 24 tons/year

Model artifacts: `models/unspoiled.pt` (state dict + category / state
encoders + scaler stats).

---

## Data files consumed

| File | What Unspoiled uses from it |
|------|-----------------------------|
| `food_generators_MA.csv` | DEP_Code, Name, Town_City, Type, tons, Lat, Long, Status |
| `food_generators_VT.csv` | ID, FSGName, Town, TYPE1, TYPE2, TonsPerWeek, Active |
| `food_processors_list_MA.csv` | Number, Company, Category, Cit, lat, long |
| `food_processors_list_VT.csv` | SWID, NAME, TYPE, FOOD SCRAPS, TOWN, Latitude, Longitude |
| `bans_thresholds.csv` | state_id, year, phase, material, threshold, distance_threshold |
| `composting_effect.csv` | state_id, year, composting_effect |
| `disposal_effect_size2.csv` | state_id, year, effect_size |
| `uscities.csv` | city_ascii, state_id, population |
| `population_2020.csv` | (reserved for future state-level joins) |
| `towns_coordinates_VT.csv` | town_name, lat_gen, long_gen |
| `wb_enforcements.csv` | Row count (MA enforcement actions) |
| `boulder_waste.csv` | Year, Landfill, Recycle, Organics by sector (annual roll-up) |
| `seattle_composting.csv` | year, residential, commercial, self_haul (annual roll-up) |

---

## Enforcement layer — what's honest and what isn't

`wb_enforcements.csv` contains **933 MassDEP waste-ban enforcement actions** from
2016–2021. Every row has:

- `SiteName` — **redacted on all 933 rows**
- `Municipality` — **redacted on all 933 rows**
- `DocumentNumber` — **redacted on all 933 rows**
- `IssuedDate` — real
- `EnforcementTypeDescription` — real (874 Notices Of Non-Compliance, 55
  ACO-with-penalty, 4 other orders)
- `ProgramCategory` — real (870 `GEN-SW`, 63 `HAULER`)
- `PenaltyCashAssessed` — real (52 non-zero, $116,108 total assessed)
- `Comment` — real free-text

Because SiteName and Municipality are redacted, Unspoiled **does not** claim
any individual business received an enforcement notice. Instead, we parse the
Comment field for mentions of MA towns that also appear in the MA generator
roster (gazetteer of 259 towns), and aggregate:

- **67 MA towns** are mentioned across the log (Peabody 87, Saugus 69, North
  Andover 67, Braintree 61, Holliston 59, …).
- Every MA generator receives a `townEnforcementActions`,
  `townEnforcementPenaltyUsd`, and `townEnforcementWithPenalty` — **labeled
  explicitly as a town-level signal** in the UI.
- VT generators always receive `0` because the dataset has no enforcement log
  for VT.

The dashboard's Enforcement tab + the detail panel's "Town-level enforcement"
section spell out this caveat inline. Nothing in Unspoiled fuzzy-matches a
business by name to an enforcement row.

## Threshold status

| Status | Condition |
|--------|-----------|
| Above threshold | `tonsPerYear ≥ banThreshold` AND `nearestProcessorMiles ≤ distance_threshold` (both thresholds from `bans_thresholds.csv`) |
| Near threshold | `tonsPerYear ≥ 0.5 × banThreshold` AND not above |
| Below threshold | Otherwise |

---

## API routes

| Route | Description |
|-------|-------------|
| `GET /api/generators` | Paginated / filtered list: `state`, `category`, `status`, `covered`, `q`, `sort`, `order`, `limit`, `offset` |
| `GET /api/generators/[id]` | Single generator + top-5 nearest processors + applicable ban |
| `GET /api/processors` | All permitted food-scrap processors |
| `GET /api/summary` | Portfolio-level aggregates (by state, category, threshold status) |
| `GET /api/model` | Model metrics + 600-point predicted-vs-actual scatter |
| `GET /api/bans` | Latest ban threshold per state + full ban history + state effect sizes |
| `GET /api/evidence` | Dryad evidence bundle (state effects, Boulder, Seattle, enforcement count, category counts) |
| `GET /api/enforcement` | Summary (totals + per-year + per-type + per-program + top-towns leaderboard). Append `?full=1` for the 933 redaction-safe records. |
| `GET /api/generators/points` | Minimal per-generator payload (id, lat, lon, state, category, tons, nearest-processor id, threshold status, town enforcement count) for the map layer. |

---

## Getting started

Train the model (writes JSON + PyTorch weights):

```bash
python3 -m pip install -r scripts/requirements.txt
python3 scripts/train.py
```

Run the web app:

```bash
npm install
npm run dev
```

- Landing: [http://localhost:3000](http://localhost:3000)
- Dashboard: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

No API keys. No external calls at runtime.

---

## Project structure

```
data/raw/                            # curated CSVs from the Dryad OWB dataset
models/                              # PyTorch checkpoints (unspoiled.pt)
scripts/
├── train.py                         # data prep + training + JSON export
└── requirements.txt
src/
├── app/
│   ├── page.tsx                     # landing site
│   ├── dashboard/page.tsx           # operator console (server component)
│   └── api/
│       ├── generators/route.ts
│       ├── generators/[id]/route.ts
│       ├── processors/route.ts
│       ├── summary/route.ts
│       ├── model/route.ts
│       ├── bans/route.ts
│       └── evidence/route.ts
├── components/
│   ├── marketing/SiteNav.tsx
│   ├── dashboard/
│   │   ├── DashboardShell.tsx
│   │   ├── SummaryCards.tsx
│   │   ├── GeneratorsTable.tsx
│   │   ├── ProcessorsTable.tsx
│   │   ├── GeneratorDetailPanel.tsx
│   │   ├── ModelPerformance.tsx
│   │   └── ComplianceBadge.tsx
│   ├── charts/
│   │   ├── ScatterChart.tsx
│   │   └── BarChart.tsx
│   └── ui/                         # shadcn primitives
└── lib/
    ├── types.ts
    ├── harvest-data.ts             # server-side data module
    ├── utils.ts
    └── data/                       # JSON written by scripts/train.py
        ├── generators.json
        ├── processors.json
        ├── bans.json
        ├── model_metrics.json
        └── evidence.json
```
