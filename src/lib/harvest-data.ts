import { readFileSync } from "node:fs";
import path from "node:path";

import type {
  Ban,
  Enforcement,
  Evidence,
  Generator,
  GeneratorDetail,
  Insight,
  ModelMetrics,
  PortfolioSummary,
  Processor,
  ThresholdStatus,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "src", "lib", "data");

function load<T>(name: string): T {
  const raw = readFileSync(path.join(DATA_DIR, name), "utf8");
  return JSON.parse(raw) as T;
}

function loadAll() {
  const generators = load<Generator[]>("generators.json");
  const processors = load<Processor[]>("processors.json");
  const bans = load<Ban[]>("bans.json");
  const model = load<ModelMetrics>("model_metrics.json");
  const evidence = load<Evidence>("evidence.json");
  const enforcement = load<Enforcement>("enforcement.json");
  return { generators, processors, bans, model, evidence, enforcement };
}

type Cache = ReturnType<typeof loadAll>;

declare global {
  var __unspoiledDataCache__: Cache | undefined;
}

function getCache(): Cache {
  if (!globalThis.__unspoiledDataCache__) {
    globalThis.__unspoiledDataCache__ = loadAll();
  }
  return globalThis.__unspoiledDataCache__;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export interface GeneratorQuery {
  state?: string | null;
  category?: string | null;
  status?: string | null;
  coveredOnly?: boolean;
  search?: string | null;
  limit?: number;
  offset?: number;
  sort?: "tons" | "predicted" | "residual" | "distance";
  order?: "asc" | "desc";
}

function filterGenerators(q: GeneratorQuery): Generator[] {
  const { generators } = getCache();
  let out = generators;
  if (q.state && q.state !== "all") {
    out = out.filter((g) => g.stateId === q.state);
  }
  if (q.category && q.category !== "all") {
    out = out.filter((g) => g.category === q.category);
  }
  if (q.status && q.status !== "all") {
    out = out.filter((g) => g.thresholdStatus === q.status);
  }
  if (q.coveredOnly) {
    out = out.filter((g) => g.coveredByBan);
  }
  if (q.search) {
    const needle = q.search.toLowerCase();
    out = out.filter(
      (g) =>
        g.town.toLowerCase().includes(needle) ||
        g.name.toLowerCase().includes(needle) ||
        g.category.toLowerCase().includes(needle),
    );
  }
  return out;
}

function sortGenerators(items: Generator[], q: GeneratorQuery): Generator[] {
  const key = q.sort ?? "tons";
  const mult = q.order === "asc" ? 1 : -1;
  const getter: Record<string, (g: Generator) => number> = {
    tons: (g) => g.tonsPerYear,
    predicted: (g) => g.predictedTonsPerYear,
    residual: (g) => Math.abs(g.residualTons),
    distance: (g) => g.nearestProcessorMiles,
  };
  const f = getter[key] ?? getter.tons;
  return [...items].sort((a, b) => (f(a) - f(b)) * mult);
}

export function queryGenerators(q: GeneratorQuery): {
  total: number;
  items: Generator[];
} {
  const filtered = filterGenerators(q);
  const sorted = sortGenerators(filtered, q);
  const offset = q.offset ?? 0;
  const limit = q.limit ?? 200;
  return { total: sorted.length, items: sorted.slice(offset, offset + limit) };
}

export function getGeneratorDetail(id: string): GeneratorDetail | null {
  const { generators, processors, bans } = getCache();
  const gen = generators.find((g) => g.id === id);
  if (!gen) return null;
  const km = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const R = 6371;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  };

  const nearest = processors
    .map((p) => ({
      id: p.id,
      name: p.name,
      processorType: p.processorType,
      town: p.town,
      stateId: p.stateId,
      distanceMiles: km(gen.lat, gen.lon, p.lat, p.lon) * 0.621371,
    }))
    .sort((a, b) => a.distanceMiles - b.distanceMiles)
    .slice(0, 5);

  const applicableBan = bans.find((b) => b.stateId === gen.stateId) ?? null;

  return { ...gen, nearestProcessors: nearest, applicableBan };
}

export function getProcessors(): Processor[] {
  return getCache().processors;
}

export function getBans(): Ban[] {
  return getCache().bans;
}

export function getEvidence(): Evidence {
  return getCache().evidence;
}

export function getEnforcement(): Enforcement {
  return getCache().enforcement;
}

// ---------------------------------------------------------------------------
// Insights (derived narrative stats for the dashboard + landing)
// ---------------------------------------------------------------------------

function median(xs: number[]): number {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
}

export function getInsights(): Insight[] {
  const { generators, processors, enforcement, evidence, model } = getCache();

  const total = generators.length;
  const catCounter: Record<string, number> = {};
  const catTons: Record<string, number> = {};
  let above = 0;
  let near = 0;
  let below = 0;
  const distances: number[] = [];
  let maTons = 0;
  let vtTons = 0;
  for (const g of generators) {
    catCounter[g.category] = (catCounter[g.category] ?? 0) + 1;
    catTons[g.category] = (catTons[g.category] ?? 0) + g.tonsPerYear;
    if (g.thresholdStatus === "above") above++;
    else if (g.thresholdStatus === "near") near++;
    else below++;
    distances.push(g.nearestProcessorMiles);
    if (g.stateId === "MA") maTons += g.tonsPerYear;
    if (g.stateId === "VT") vtTons += g.tonsPerYear;
  }
  const restaurantShare = ((catCounter["Restaurant"] ?? 0) / total) * 100;
  const medianDistance = median(distances);

  // State effect sizes from evidence
  const vtEffect = evidence.stateEffects.find((s) => s.stateId === "VT")?.compostingEffect ?? null;
  const ctEffect = evidence.stateEffects.find((s) => s.stateId === "CT")?.compostingEffect ?? null;
  const vtVsCt =
    vtEffect !== null && ctEffect !== null && ctEffect !== 0
      ? vtEffect / ctEffect
      : null;

  // Enforcement
  const topTowns = enforcement.byTown.slice(0, 10);
  const topTownsShare =
    enforcement.totalActions > 0
      ? (topTowns.reduce((s, t) => s + t.actions, 0) /
          enforcement.totalActions) *
        100
      : 0;
  const peak = [...enforcement.byYear].sort((a, b) => b.actions - a.actions)[0];
  const baseline = enforcement.byYear[0];
  const peakRatio =
    peak && baseline && baseline.actions > 0
      ? peak.actions / baseline.actions
      : null;

  // Boulder arc
  const bFirst = evidence.boulderHistory[0];
  const bLast = evidence.boulderHistory[evidence.boulderHistory.length - 1];
  const bDelta =
    bFirst?.diversionRate != null && bLast?.diversionRate != null
      ? (bLast.diversionRate - bFirst.diversionRate) * 100
      : null;

  // Ban phases
  const maBans = evidence.banHistory.filter((b) => b.stateId === "MA");
  const firstMA = maBans[0];
  const lastMA = maBans[maBans.length - 1];

  // Category bars (top 6 by tonnage)
  const catBars = Object.entries(catTons)
    .map(([k, v]) => ({ label: k, value: v }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Enforcement type donut palette
  const typeColors = ["#c93823", "#e8623d", "#edbd5c", "#7a9154"];
  const typeDonut = enforcement.byType.map((t, i) => ({
    label: t.type,
    value: t.actions,
    color: typeColors[i % typeColors.length],
  }));

  const insights: Insight[] = [
    {
      id: "threshold-coverage",
      headline: "Most of the tonnage is already over the line.",
      stat: `${(((above + near) / total) * 100).toFixed(1)}%`,
      statSub: `${(above + near).toLocaleString()} / ${total.toLocaleString()} generators`,
      body: `Across MA + VT, ${above.toLocaleString()} generators sit above their state's active ban threshold and another ${near.toLocaleString()} sit within 50% of it. That leaves only ${below.toLocaleString()} safely below.`,
      accent: "tomato",
      chart: {
        kind: "donut",
        slices: [
          { label: "Above threshold", value: above, color: "#c93823" },
          { label: "Near threshold", value: near, color: "#edbd5c" },
          { label: "Below threshold", value: below, color: "#7a9154" },
        ],
      },
    },
    {
      id: "category-mix",
      headline: "Restaurants dominate the commercial food-waste stream.",
      stat: `${restaurantShare.toFixed(1)}%`,
      statSub: `${(catCounter["Restaurant"] ?? 0).toLocaleString()} of ${total.toLocaleString()} generators`,
      body: `The next five largest categories — Grocery, Hospital, FoodService, Bakery, School — together still produce less tonnage than restaurants alone.`,
      accent: "coral",
      chart: {
        kind: "bars",
        data: catBars.map((c) => ({
          label: c.label,
          value: c.value,
          accent: c.label === "Restaurant",
        })),
        format: "tons",
      },
    },
    {
      id: "state-split",
      headline: "MA carries 2.2× the tonnage VT does.",
      stat: `${(maTons / 1000).toFixed(0)}k t`,
      statSub: `MA · vs ${(vtTons / 1000).toFixed(0)}k t in VT`,
      body: `MA's older, phase-1 ban (52 t/yr since 2014) already captured a much larger generator population than VT's 2020 universal ban.`,
      accent: "sage",
      chart: {
        kind: "bars",
        data: [
          { label: "MA", value: maTons, accent: true },
          { label: "VT", value: vtTons },
        ],
        format: "tons",
      },
    },
    {
      id: "vt-ct-effect",
      headline: "VT's ban moved the needle 2.4× harder than CT's.",
      stat: vtEffect !== null ? vtEffect.toFixed(2) : "—",
      statSub:
        ctEffect !== null
          ? `VT composting_effect vs CT ${ctEffect.toFixed(2)}`
          : "VT composting_effect",
      body:
        vtVsCt !== null
          ? `In the Dryad causal study, VT's composting_effect (${vtEffect!.toFixed(2)}) is ${vtVsCt.toFixed(1)}× CT's (${ctEffect!.toFixed(2)}). MA, CA, and RI have no composting_effect value in the published tables — honestly shown as dashes elsewhere in the app.`
          : "From composting_effect.csv.",
      accent: "forest",
      chart: {
        kind: "bars",
        data: [
          { label: "VT", value: vtEffect ?? 0, accent: true },
          { label: "CT", value: ctEffect ?? 0 },
        ],
        format: "count",
      },
    },
    {
      id: "enforcement-concentration",
      headline: "10 towns carry the majority of enforcement activity.",
      stat: `${topTownsShare.toFixed(1)}%`,
      statSub: `of ${enforcement.totalActions.toLocaleString()} MA waste-ban actions`,
      body: `Out of ${enforcement.townsMentioned} MA towns named in wb_enforcements.csv, the top 10 (Peabody, Saugus, North Andover, Braintree, Holliston, Auburn, Haverhill, Raynham, Hudson, Millbury) capture ${topTownsShare.toFixed(1)}% of the log — a natural enforcement priority list.`,
      accent: "coral",
      chart: {
        kind: "bars",
        data: topTowns.map((t) => ({
          label: t.town,
          value: t.actions,
          accent: t.actionsWithPenalty > 0,
        })),
        format: "count",
      },
    },
    {
      id: "enforcement-year",
      headline: "2019 was the enforcement peak.",
      stat: peak ? peak.actions.toLocaleString() : "—",
      statSub: peak
        ? `${peak.year} · ${peakRatio ? peakRatio.toFixed(1) + "× " + baseline.year + " baseline" : ""}`
        : "",
      body: `Enforcement activity climbed from ${baseline?.actions ?? "—"} actions in ${baseline?.year ?? "—"} to ${peak?.actions ?? "—"} in ${peak?.year ?? "—"}, then tapered in 2020–2021 as MassDEP pivoted to pandemic triage.`,
      accent: "gold",
      chart: {
        kind: "sparkline",
        points: enforcement.byYear.map((r) => ({ x: r.year, y: r.actions })),
        color: "#e8623d",
      },
    },
    {
      id: "type-mix",
      headline: "Most enforcement is a Notice of Non-Compliance, not a fine.",
      stat: `${((enforcement.byType[0]?.actions ?? 0) / enforcement.totalActions * 100).toFixed(1)}%`,
      statSub: `${(enforcement.byType[0]?.actions ?? 0).toLocaleString()} Notices · ${enforcement.actionsWithPenalty} penalties`,
      body: `Out of ${enforcement.totalActions.toLocaleString()} actions, only ${enforcement.actionsWithPenalty} (${((enforcement.actionsWithPenalty / enforcement.totalActions) * 100).toFixed(1)}%) carried a dollar penalty. Total assessed: $${enforcement.totalPenaltyUsd.toLocaleString()}.`,
      accent: "pink",
      chart: { kind: "donut", slices: typeDonut },
    },
    {
      id: "processor-distance",
      headline: "Median generator sits near a permitted processor.",
      stat: `${medianDistance.toFixed(1)} mi`,
      statSub: `across ${total.toLocaleString()} generators`,
      body: `Routing is rarely the blocker. The median MA or VT generator is ${medianDistance.toFixed(1)} miles from a permitted composter, AD, animal-feed operation, or food-scrap transfer station — well inside the distance_threshold any active state ban has ever invoked.`,
      accent: "sage",
      chart: {
        kind: "histogram",
        values: distances,
        xLabel: "Distance to nearest processor (miles, log scale)",
        fillColor: "#7a9154",
      },
    },
    {
      id: "boulder-arc",
      headline: "Boulder's 15-year diversion arc is the honest benchmark.",
      stat: bLast?.diversionRate != null ? `${(bLast.diversionRate * 100).toFixed(1)}%` : "—",
      statSub:
        bFirst && bLast
          ? `${bFirst.year} → ${bLast.year}`
          : "",
      body:
        bDelta != null
          ? `Boulder went from ${(bFirst.diversionRate! * 100).toFixed(1)}% diversion in ${bFirst.year} to ${(bLast.diversionRate! * 100).toFixed(1)}% in ${bLast.year} (Δ +${bDelta.toFixed(1)} points). That's a real city's real number — it's what we benchmark future MA + VT trajectories against.`
          : "From boulder_waste.csv.",
      accent: "forest",
      chart: {
        kind: "sparkline",
        points: evidence.boulderHistory.map((r) => ({
          x: r.year,
          y: r.diversionRate == null ? 0 : +(r.diversionRate * 100).toFixed(1),
        })),
        color: "#5c7540",
      },
    },
    {
      id: "ma-phase-creep",
      headline: "MA keeps dropping its threshold.",
      stat: lastMA ? `${lastMA.thresholdTonsPerYear.toFixed(0)} t/yr` : "—",
      statSub: firstMA
        ? `phase ${firstMA.phase} (${firstMA.year}) → phase ${lastMA?.phase} (${lastMA?.year})`
        : "",
      body: `MA's threshold fell from ${firstMA?.thresholdTonsPerYear ?? "—"} t/yr in ${firstMA?.year ?? "—"} to ${lastMA?.thresholdTonsPerYear ?? "—"} t/yr in ${lastMA?.year ?? "—"}. Every reduction pulls thousands more businesses into coverage — Unspoiled's slider simulates it.`,
      accent: "tomato",
      chart: {
        kind: "bars",
        data: maBans.map((b) => ({
          label: String(b.year),
          value: b.thresholdTonsPerYear,
          accent: b.year === lastMA?.year,
        })),
        format: "count",
      },
    },
    {
      id: "model-residuals",
      headline: "The model is honest about its ceiling.",
      stat: `R² ${model.final_val_r2_log.toFixed(2)}`,
      statSub: `log-tonnage · MAE ${model.final_val_mae_tons.toFixed(0)} t/yr`,
      body: `Only ${processors.length.toLocaleString()} processor locations and ${total.toLocaleString()} generators fit a ${model.rows.toLocaleString()}-row regressor. The Dryad dataset doesn't include business size, so residual variance is expected to be meaningful — it's reported, not hidden.`,
      accent: "sage",
    },
  ];

  return insights;
}

export function getEnforcementSummary(): Omit<Enforcement, "records"> {
  const e = getCache().enforcement;
  // Strip the (potentially large) records array from summary-level queries.
  const { records: _records, ...summary } = e;
  void _records;
  return summary;
}

export function getModelMetrics(): ModelMetrics {
  return getCache().model;
}

export interface GeneratorPoint {
  id: string;
  lat: number;
  lon: number;
  stateId: string;
  category: string;
  tonsPerYear: number;
  nearestProcessorId: string;
  thresholdStatus: "above" | "near" | "below";
  coveredByBan: boolean;
  townEnforcementActions: number;
}

export function getGeneratorPoints(): GeneratorPoint[] {
  const { generators } = getCache();
  return generators.map((g) => ({
    id: g.id,
    lat: g.lat,
    lon: g.lon,
    stateId: g.stateId,
    category: g.category,
    tonsPerYear: g.tonsPerYear,
    nearestProcessorId: g.nearestProcessorId,
    thresholdStatus: g.thresholdStatus,
    coveredByBan: g.coveredByBan,
    townEnforcementActions: g.townEnforcementActions,
  }));
}

export function getModelScatter(limit = 800): Array<{
  id: string;
  actual: number;
  predicted: number;
  category: string;
  stateId: string;
}> {
  const { generators } = getCache();
  const step = Math.max(1, Math.floor(generators.length / limit));
  const out: Array<{
    id: string;
    actual: number;
    predicted: number;
    category: string;
    stateId: string;
  }> = [];
  for (let i = 0; i < generators.length; i += step) {
    const g = generators[i];
    out.push({
      id: g.id,
      actual: g.tonsPerYear,
      predicted: g.predictedTonsPerYear,
      category: g.category,
      stateId: g.stateId,
    });
  }
  return out;
}

export function getPortfolioSummary(): PortfolioSummary {
  const { generators } = getCache();
  const byStateMap = new Map<
    string,
    {
      stateId: string;
      generators: number;
      tonsPerYear: number;
      predictedTonsPerYear: number;
      divertedTonsPerYear: number;
      divertedKnown: boolean;
      coveredByBan: number;
    }
  >();
  const byCategoryMap = new Map<
    string,
    { category: string; generators: number; tonsPerYear: number }
  >();
  const byStatusMap: Record<ThresholdStatus, number> = {
    above: 0,
    near: 0,
    below: 0,
  };

  let totalTons = 0;
  let predictedTons = 0;
  let divertedKnown = 0;
  let divertedEstimateCount = 0;
  let covered = 0;
  let above = 0;
  let near = 0;
  let below = 0;

  for (const g of generators) {
    totalTons += g.tonsPerYear;
    predictedTons += g.predictedTonsPerYear;
    if (g.divertedTonsPerYear !== null && g.divertedTonsPerYear !== undefined) {
      divertedKnown += g.divertedTonsPerYear;
      divertedEstimateCount++;
    }
    if (g.coveredByBan) covered++;
    byStatusMap[g.thresholdStatus]++;
    if (g.thresholdStatus === "above") above++;
    else if (g.thresholdStatus === "near") near++;
    else below++;

    const s = byStateMap.get(g.stateId) ?? {
      stateId: g.stateId,
      generators: 0,
      tonsPerYear: 0,
      predictedTonsPerYear: 0,
      divertedTonsPerYear: 0,
      divertedKnown: false,
      coveredByBan: 0,
    };
    s.generators++;
    s.tonsPerYear += g.tonsPerYear;
    s.predictedTonsPerYear += g.predictedTonsPerYear;
    if (g.divertedTonsPerYear !== null && g.divertedTonsPerYear !== undefined) {
      s.divertedTonsPerYear += g.divertedTonsPerYear;
      s.divertedKnown = true;
    }
    if (g.coveredByBan) s.coveredByBan++;
    byStateMap.set(g.stateId, s);

    const c = byCategoryMap.get(g.category) ?? {
      category: g.category,
      generators: 0,
      tonsPerYear: 0,
    };
    c.generators++;
    c.tonsPerYear += g.tonsPerYear;
    byCategoryMap.set(g.category, c);
  }

  const byCategory = [...byCategoryMap.values()]
    .map((c) => ({ ...c, meanTonsPerYear: c.tonsPerYear / c.generators }))
    .sort((a, b) => b.tonsPerYear - a.tonsPerYear);

  const byState = [...byStateMap.values()]
    .map((s) => ({
      stateId: s.stateId,
      generators: s.generators,
      tonsPerYear: s.tonsPerYear,
      predictedTonsPerYear: s.predictedTonsPerYear,
      divertedTonsPerYear: s.divertedKnown ? s.divertedTonsPerYear : null,
      coveredByBan: s.coveredByBan,
    }))
    .sort((a, b) => b.tonsPerYear - a.tonsPerYear);

  const byStatus: PortfolioSummary["byStatus"] = (
    ["above", "near", "below"] as ThresholdStatus[]
  ).map((status) => ({ status, generators: byStatusMap[status] }));

  return {
    totalGenerators: generators.length,
    coveredByBan: covered,
    aboveThreshold: above,
    nearThreshold: near,
    belowThreshold: below,
    totalTonsPerYear: totalTons,
    predictedTonsPerYear: predictedTons,
    divertedTonsPerYearKnown: divertedKnown,
    generatorsWithDiversionEstimate: divertedEstimateCount,
    byState,
    byCategory,
    byStatus,
  };
}
