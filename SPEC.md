# Unspoiled — Product Spec

Track: **Business & Analytics**

## Guiding constraint

**Only work with the data we are trained on.** Every number shown must trace
back to the Dryad OWB dataset (bzkh189h4) or to the trained PyTorch model's
direct outputs. No synthetic tipping fees, haul rates, emissions factors, or
fabricated testimonials. Where the study has no recorded value (e.g. MA has
no `composting_effect`), we report a dash.

## Problem

Commercial food waste is a large, regulated, heterogeneous stream. Eight US
states have organic-waste bans with tonnage and distance-to-processor
thresholds that keep falling. Regulators, haulers, and portfolio operators
lack a single source of truth that joins:

1. Per-business generator rosters (MA DEP, VT ANR).
2. State-level ban thresholds with explicit tonnage + distance rules.
3. Causal effect sizes estimated in the Dryad synthetic-control study.
4. The permitted food-scrap processor network.

Unspoiled joins all four, predicts per-business tonnage with a PyTorch MLP,
and publishes the result as a dashboard + API with zero fabricated fields.

## Users

| Buyer | Jobs-to-be-done |
|-------|-----------------|
| Commercial hauler BD | Where does real, modeled tonnage sit, and how far is the nearest processor? |
| State / municipal compliance | Who is above the threshold today and near the next phase? |
| REIT / operator ESG | What does the regulator's own dataset say about each of my properties? |

We intentionally do not publish pricing plans because the dataset contains no
willingness-to-pay signal.

## Inputs (Dryad dataset)

- `food_generators_MA.csv` — annual tons per MA business
- `food_generators_VT.csv` — tons per week per VT business
- `food_processors_list_MA.csv` — MA permitted processors (Category, lat, long)
- `food_processors_list_VT.csv` — VT permitted processors with FOOD SCRAPS flag
- `bans_thresholds.csv` — state-year tonnage + distance thresholds
- `composting_effect.csv` — state-year causal composting effect size
- `disposal_effect_size2.csv` — state-year causal disposal effect size
- `uscities.csv`, `population_2020.csv` — Census population join
- `towns_coordinates_VT.csv` — VT town lat/lon
- `wb_enforcements.csv` — MassDEP enforcement log (row count published as
  evidence)
- `boulder_waste.csv` — Boulder, CO diversion by sector (time-series)
- `seattle_composting.csv` — Seattle, WA monthly composting (time-series)

## Outputs (JSON artifacts)

| File | Contents |
|------|----------|
| `generators.json` | Per-business: tonsPerYear, predictedTonsPerYear, residualTons, compostingEffect, disposalEffect, divertedTonsPerYear (null where the study has no effect size), coveredByBan, thresholdStatus, nearestProcessor* |
| `processors.json` | Permitted processor network |
| `bans.json` | Latest ban threshold per state |
| `model_metrics.json` | Training history, R² (log + raw), MAE, MAPE |
| `evidence.json` | Per-state effect sizes, Boulder history, Seattle history, MA enforcement count, category counts, full ban history |

## Model

Single-task PyTorch MLP regressor:

- Inputs: category embedding (12-d), state embedding (4-d), and four
  standardized numeric features (population, lat, lon, nearest-processor km).
- Hidden layers: 128 → 128 → 64 with ReLU + dropout 0.15.
- Target: `log1p(tons_per_year)` winsorized at p99.5.
- Loss: Smooth-L1; optimizer: Adam; schedule: cosine; 300 epochs.
- Reported metrics: R² in log space ≈ 0.49, R² on raw tons ≈ 0.24, MAE ≈ 24
  tons/year on held-out 20%.

## Threshold labels

- `covered_by_ban = tons ≥ banThreshold AND processorMiles ≤ banDistance`.
- `threshold_status = above | near | below`, where `near` means
  `tons ≥ 0.5 × banThreshold` and not covered.

Both the tonnage and distance thresholds come directly from
`bans_thresholds.csv`. The 50% cut-off is the only Unspoiled-supplied
constant and is exposed as such in the FAQ.

## Diversion estimate

`divertedTonsPerYear = tonsPerYear × compostingEffect`. Both factors are from
the Dryad study. When `compositing_effect` is null for a state (MA, CA, RI
in the current bundle), the diverted column is null. No fallback value is
substituted.

## What Unspoiled intentionally does NOT show

- $ savings — the dataset has no tipping fee or hauling rate column.
- tCO2e avoided — the dataset has no emissions factor column.
- Subscription prices — the dataset has no willingness-to-pay signal.
- Customer testimonials — we have none.
- Risk "tiers" beyond the three threshold labels — the dataset defines
  thresholds, not tiers.

## Roadmap (dataset-constrained)

- Load CA, CT, and RI generator rosters once we acquire them.
- Integrate `wb_enforcements.csv` as weak supervision for non-compliance.
- Surface the `mc_*.csv` Monte-Carlo panels as uncertainty bands on the
  state-level effect sizes.
- Extend the model with per-county population density from `uscities.csv`
  `density` column.
