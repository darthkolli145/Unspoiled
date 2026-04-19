# Seismic Structural Health Index (SSHI)
### Project Specification — v0.1

---

## Problem Statement

Earthquake insurance is priced on **location, not condition.**

Two identical buildings in the same ZIP code pay the same premium regardless of their actual structural history. A building that absorbed three moderate earthquakes over the past decade is priced identically to one that experienced none — even though it is meaningfully more vulnerable. Insurers have no visibility into cumulative seismic damage. They assume a building is as strong as the day it was built, forever.

This creates three broken outcomes:

**For insurers:** They price blind. When a major event hits, claims are larger and more widespread than models predicted because accumulated micro-damage made buildings far more vulnerable than premiums reflected. This is why insurers are exiting markets like California entirely — the models are structurally inaccurate.

**For homeowners:** They have no signal that their risk has grown over time. They pay the same premium as their neighbor whose building is in better shape, with no incentive to retrofit and no warning before a catastrophic event.

**For the market:** Inaccurate pricing forces insurers to either overprice to protect themselves or exit. The result is a widening coverage gap, leaving millions uninsured in the highest-risk zones.

**The problem in one sentence:** Insurance is priced on where you are, not what has happened to you.

---

## What We Are Building

The **Seismic Structural Health Index (SSHI)** — a data infrastructure layer that tracks cumulative seismic impact on individual buildings over time and produces a live, updatable structural condition score.

SSHI gives insurers what they have never had: an accurate, current picture of the actual risk they are covering. Not a ZIP code proxy. Not a static construction-year estimate. A dynamic building-level score that reflects real seismic history.

We are not building an insurance product. We are building the data layer that makes accurate earthquake insurance possible.

---

## Core Concept

Every earthquake delivers a measurable amount of ground motion energy to a specific location. USGS publishes ShakeMap data within minutes of any event globally. If you know a building's location, construction type, and seismic history, you can model how much structural capacity it has consumed — like a fatigue model for metal. Each stress cycle degrades it incrementally. The SSHI score represents remaining structural integrity.

```
Score 90-100   Minimal seismic exposure. Near-original condition.
Score 70-89    Moderate cumulative exposure. Monitor.
Score 50-69    Significant degradation. Elevated risk. Inspection recommended.
Score 30-49    High cumulative damage. Premium adjustment warranted.
Score 0-29     Critical state. Coverage terms should reflect imminent risk.
```

The score is building-specific, continuously updated, and actuarially defensible.

---

## How It Works

### Data Inputs

**Seismic Event Data**
- USGS ShakeMap — free, near real-time, global coverage
- Shake intensity at building location (Peak Ground Acceleration / Modified Mercalli Intensity)
- Event magnitude, depth, distance from epicenter

**Building Metadata**
- Construction type (wood frame, concrete, masonry, steel)
- Year built / seismic code era
- Number of stories
- Foundation type
- Retrofit history

**Soil and Geology Layer**
- USGS Vs30 data (soil shear velocity — determines ground motion amplification)
- Liquefaction susceptibility maps
- Site class per ASCE 7

**Optional: Direct Measurement**
- IoT accelerometer sensors installed on structure
- Real-time shake data per building during events
- Enables highest-accuracy scoring for commercial/high-value properties

### Score Calculation Model

For each seismic event affecting a building:

```
Impact Factor = f(PGA, distance, soil amplification, building vulnerability class)
Damage Increment = Impact Factor × Remaining Capacity Weight
New Score = Current Score − Damage Increment
```

Building vulnerability class is derived from construction type and code era. Older unreinforced masonry scores highest impact per unit of ground motion. Modern code-compliant wood frame scores lowest.

Score recovers partially after verified retrofit or post-event inspection showing no significant damage. Score does not recover passively over time — degradation is permanent unless physically remediated.

### Premium Mapping

SSHI outputs a score. Insurers map that score to premium tiers. Example framework:

| Score Range | Risk Tier | Premium Modifier |
|-------------|-----------|-----------------|
| 85-100 | Standard | Baseline |
| 70-84 | Elevated | +15% to +30% |
| 55-69 | High | +40% to +70% |
| 40-54 | Very High | +80% to +150% |
| Below 40 | Critical | Underwriting review required |

Insurers define their own tier cutoffs and modifiers. SSHI provides the score. Pricing decisions remain with the insurer.

---

## System Architecture

```
┌─────────────────────────────────────────┐
│           DATA INGESTION LAYER          │
│  USGS ShakeMap API  │  Building Registry│
│  Soil/Geology DB    │  IoT Sensor Feed  │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│           SCORING ENGINE                │
│  Event Parser → Impact Calculator       │
│  Building Vulnerability Model           │
│  Cumulative Damage Tracker              │
│  Score Generator + History Log          │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│              API LAYER                  │
│  GET /buildings/{id}/score              │
│  GET /buildings/{id}/history            │
│  POST /buildings/register               │
│  GET /events/{region}/impact            │
│  Webhook: score_updated                 │
└────────────────┬────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
┌───────▼──────┐  ┌───────▼──────────┐
│  INSURER     │  │  PROPERTY OWNER  │
│  DASHBOARD   │  │  PORTAL          │
│  Portfolio   │  │  My building     │
│  risk view   │  │  score + history │
│  Premium API │  │  Retrofit impact │
└──────────────┘  └──────────────────┘
```

---

## Product Surfaces

### 1. Insurer API (Primary)
REST API that insurers integrate directly into their underwriting systems. Per-building score lookup, portfolio-level risk aggregation, webhook notifications on score changes post-event.

### 2. Insurer Dashboard
Web interface for underwriters to view portfolio exposure, filter by score tier, identify buildings that need re-underwriting after a seismic event.

### 3. Property Owner Portal
Consumer-facing interface where homeowners or commercial property owners can register their building and see their SSHI score, historical event impacts, and projected premium impact. Retrofit simulator: "If you bolt your cripple wall, your score improves by X points."

---

## Phased Roadmap

### Phase 1 — Foundation (Months 1-3)
- USGS ShakeMap integration and event ingestion pipeline
- Building registration system with metadata schema
- Core scoring engine v1 (no IoT, USGS data only)
- REST API with authentication
- Internal testing on California building dataset

### Phase 2 — Insurer Pilot (Months 4-6)
- Insurer dashboard MVP
- Portfolio-level scoring and export
- Pilot with 1-2 insurance partners
- Actuarial validation of score-to-loss correlation
- Webhook infrastructure for real-time score updates post-event

### Phase 3 — Scale and Sensors (Months 7-12)
- Property owner portal
- IoT sensor integration for high-value commercial properties
- Retrofit credit system
- Expanded geography beyond California
- Reinsurance market integration

---

## Key Differentiators

**vs. Current Cat Models (RMS, AIR, CoreLogic)**
Those models are event-based and probabilistic. They estimate future risk from historical frequency. SSHI tracks actual cumulative impact on actual buildings. It is empirical, not modeled.

**vs. Parametric Insurance**
Parametric triggers payment based on shake intensity thresholds. It does not feed that data back into future risk assessment. The loop is not closed. SSHI closes the loop.

**vs. Manual Inspection**
Inspections are expensive, infrequent, and subjective. SSHI is continuous, automated, and consistent across all buildings in a portfolio.

---

## Business Model

**Primary:** API access fee per building per year (B2B, insurers and reinsurers)

**Secondary:** Per-query pricing for spot lookups during underwriting

**Tertiary:** Premium property owner subscriptions (building owners who want continuous monitoring)

**Data licensing:** Anonymized aggregate seismic impact data to research institutions, city planners, reinsurers

---

## Validation Approach

Actuarial validity is critical for insurer adoption. Validation strategy:

- Backtest scoring model against USGS historical ShakeMap data and known post-earthquake damage surveys (FEMA, PEER database)
- Correlate SSHI score at time of event to actual claim amounts from historical insurer data (via pilot partner data sharing)
- Third-party actuarial review before commercial launch
- Ongoing calibration as new damage data becomes available

---

## Open Questions

- What is the minimum building metadata required for a defensible score vs. what is obtainable at scale?
- How do we handle buildings with no seismic history data prior to registration?
- Regulatory requirements for using a proprietary score in insurance pricing (state-by-state insurance commission approval)?
- Liability framework if a score fails to predict damage accurately?
- Partnership vs. acquisition interest from existing cat modeling firms (RMS, Verisk)?

---

*SSHI Project Spec v0.1 — Internal Working Document*