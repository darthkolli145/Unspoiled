import type {
  Building, RiskScore, Pricing, BuildingSummary,
  BuildingDetail, FloorStress, ResonancePoint, SeismicEvent,
  RiskLevel, TrendDirection,
} from "./types";

// ── Seed buildings ──────────────────────────────────────────────────────────
const RAW_BUILDINGS: Omit<Building, "id">[] = [
  { address: "555 California St",       city: "San Francisco", state: "CA", floors: 52, structureType: "masonry",      yearBuilt: 1964, sqftK: 1560 },
  { address: "350 Mission St",          city: "San Francisco", state: "CA", floors: 48, structureType: "rc_shear_wall", yearBuilt: 2017, sqftK: 780  },
  { address: "Salesforce Tower",        city: "San Francisco", state: "CA", floors: 61, structureType: "steel_moment",  yearBuilt: 2018, sqftK: 1420 },
  { address: "Transamerica Pyramid",    city: "San Francisco", state: "CA", floors: 48, structureType: "steel_moment",  yearBuilt: 1972, sqftK: 530  },
  { address: "275 Battery St",          city: "San Francisco", state: "CA", floors: 22, structureType: "masonry",      yearBuilt: 1958, sqftK: 310  },
  { address: "101 California St",       city: "San Francisco", state: "CA", floors: 48, structureType: "steel_moment",  yearBuilt: 1982, sqftK: 900  },
  { address: "560 Mission St",          city: "San Francisco", state: "CA", floors: 31, structureType: "rc_shear_wall", yearBuilt: 2002, sqftK: 480  },
  { address: "One Market Plaza",        city: "San Francisco", state: "CA", floors: 43, structureType: "rc_shear_wall", yearBuilt: 1976, sqftK: 1100 },
  { address: "Wilshire Grand Center",   city: "Los Angeles",   state: "CA", floors: 73, structureType: "rc_shear_wall", yearBuilt: 2017, sqftK: 1650 },
  { address: "777 Tower",              city: "Los Angeles",   state: "CA", floors: 54, structureType: "steel_moment",  yearBuilt: 1991, sqftK: 1020 },
  { address: "Gas Company Tower",       city: "Los Angeles",   state: "CA", floors: 54, structureType: "steel_moment",  yearBuilt: 1991, sqftK: 980  },
  { address: "US Bank Tower",          city: "Los Angeles",   state: "CA", floors: 73, structureType: "steel_moment",  yearBuilt: 1989, sqftK: 1360 },
  { address: "Columbia Center",         city: "Seattle",       state: "WA", floors: 76, structureType: "steel_moment",  yearBuilt: 1985, sqftK: 1500 },
  { address: "1201 Third Avenue",       city: "Seattle",       state: "WA", floors: 56, structureType: "rc_shear_wall", yearBuilt: 2006, sqftK: 760  },
  { address: "Russell Investments Ctr", city: "Seattle",       state: "WA", floors: 42, structureType: "cft",           yearBuilt: 2006, sqftK: 540  },
];

// Deterministic risk scores (hand-tuned for realistic variance)
const RISK_SCORES_RAW: number[] = [
  0.81, 0.73, 0.68, 0.59, 0.62,
  0.45, 0.41, 0.28, 0.55, 0.42,
  0.31, 0.51, 0.44, 0.22, 0.19,
];

const TRENDS: TrendDirection[] = [
  "rising", "stable", "falling", "rising", "stable",
  "stable", "falling", "stable",  "rising", "falling",
  "stable", "rising",  "stable",  "falling", "stable",
];

function riskLevel(score: number): RiskLevel {
  if (score >= 0.70) return "critical";
  if (score >= 0.50) return "elevated";
  if (score >= 0.33) return "moderate";
  return "low";
}

function dominantFreq(floors: number): number {
  // Simplified: taller = lower fundamental frequency
  return Math.round((10 / floors) * 100) / 100;
}

function peakStressFloor(floors: number, score: number): number {
  return Math.round(floors * (0.75 + score * 0.2));
}

function premiumUsd(score: number): number {
  if (score >= 0.75) return Math.round(2400 + score * 3600);
  if (score >= 0.55) return Math.round(700 + score * 2200);
  if (score >= 0.33) return Math.round(200 + score * 900);
  return Math.round(80 + score * 500);
}

function payoutCapUsd(score: number, sqftK: number): number {
  const base = sqftK * 8000; // $8K/sqft exposure
  return Math.round(base * (0.3 + score * 0.7) / 100000) * 100000;
}

function triggerPgv(score: number): number {
  // Lower score = higher threshold (less sensitive)
  return Math.round((18 - score * 11) * 10) / 10;
}

const NOW = new Date().toISOString();

export const BUILDINGS: Building[] = RAW_BUILDINGS.map((b, i) => ({
  ...b,
  id: `bldg-${String(i + 1).padStart(3, "0")}`,
}));

export const RISK_SCORES: RiskScore[] = BUILDINGS.map((b, i) => ({
  buildingId: b.id,
  score: RISK_SCORES_RAW[i],
  level: riskLevel(RISK_SCORES_RAW[i]),
  peakStressFloor: peakStressFloor(b.floors, RISK_SCORES_RAW[i]),
  dominantFreqHz: dominantFreq(b.floors),
  computedAt: NOW,
}));

export const PRICINGS: Pricing[] = BUILDINGS.map((b, i) => {
  const s = RISK_SCORES_RAW[i];
  return {
    premiumUsdMonth: premiumUsd(s),
    payoutCapUsd: payoutCapUsd(s, b.sqftK),
    triggerPgvCms: triggerPgv(s),
  };
});

export function getBuildingSummaries(): BuildingSummary[] {
  return BUILDINGS.map((building, i) => ({
    building,
    risk: RISK_SCORES[i],
    pricing: PRICINGS[i],
    trend: TRENDS[i],
    payoutTriggered: RISK_SCORES_RAW[i] >= 0.75,
  }));
}

export function getBuildingDetail(id: string): BuildingDetail | null {
  const idx = BUILDINGS.findIndex((b) => b.id === id);
  if (idx === -1) return null;

  const building = BUILDINGS[idx];
  const risk = RISK_SCORES[idx];
  const pricing = PRICINGS[idx];
  const score = RISK_SCORES_RAW[idx];

  // Per-floor stress
  const GROUPS = 8;
  const groupSize = Math.ceil(building.floors / GROUPS);
  const floorStress: FloorStress[] = Array.from({ length: GROUPS }, (_, g) => {
    const floorNum = Math.min((g + 1) * groupSize, building.floors);
    const groupRatio = (g + 1) / GROUPS;
    // Stress peaks toward the top
    const rawStress = score * (0.3 + groupRatio * 0.85);
    const stress = Math.min(rawStress, 1.0);
    return {
      floor: floorNum,
      label: g === GROUPS - 1 ? `Fl ${floorNum}` : `Fl ${(g * groupSize) + 1}–${floorNum}`,
      stress,
      level: riskLevel(stress),
    };
  });

  // Resonance profile (0.05–3.0 Hz sweep)
  const freqs = [0.05, 0.1, 0.2, 0.3, 0.5, 0.7, 1.0, 1.3, 1.6, 2.0, 2.5, 3.0];
  const fn = dominantFreq(building.floors);
  const resonance: ResonancePoint[] = freqs.map((f) => {
    // Lorentzian peak near dominant freq
    const delta = f - fn;
    const Q = 8;
    const amplitude = score / (1 + (Q * delta) ** 2);
    // Add harmonics
    const harmonic = score * 0.3 / (1 + (Q * (f - fn * 2)) ** 2);
    return { freqHz: f, amplitude: Math.min(amplitude + harmonic, 1.0) };
  });

  return { building, risk, pricing, floorStress, resonance };
}

// ── Seismic events ───────────────────────────────────────────────────────────
const EVENT_LOCATIONS = [
  { location: "Hayward Fault, CA",       distanceKm: 12 },
  { location: "San Andreas Fault, CA",   distanceKm: 48 },
  { location: "Calaveras Fault, CA",     distanceKm: 31 },
  { location: "Cascadia Subduction, OR", distanceKm: 820 },
  { location: "Puget Sound, WA",         distanceKm: 18 },
  { location: "Elsinore Fault, CA",      distanceKm: 62 },
  { location: "Newport-Inglewood, CA",   distanceKm: 9  },
  { location: "Whittier Fault, CA",      distanceKm: 22 },
];

const MS_PER_DAY = 86_400_000;

export function getSeismicEvents(): SeismicEvent[] {
  const now = Date.now();
  return [
    { daysAgo: 0.2,  mag: 3.1, locIdx: 0, pgv: 4.2,  depth: 12, aff: 3,  triggered: false },
    { daysAgo: 0.8,  mag: 4.4, locIdx: 6, pgv: 14.8, depth: 8,  aff: 11, triggered: true  },
    { daysAgo: 1.1,  mag: 2.8, locIdx: 2, pgv: 1.9,  depth: 15, aff: 1,  triggered: false },
    { daysAgo: 2.4,  mag: 3.6, locIdx: 1, pgv: 6.1,  depth: 22, aff: 5,  triggered: false },
    { daysAgo: 3.0,  mag: 5.1, locIdx: 0, pgv: 31.4, depth: 7,  aff: 15, triggered: true  },
    { daysAgo: 4.5,  mag: 2.5, locIdx: 7, pgv: 1.2,  depth: 18, aff: 0,  triggered: false },
    { daysAgo: 6.2,  mag: 3.9, locIdx: 4, pgv: 9.3,  depth: 25, aff: 6,  triggered: false },
    { daysAgo: 8.0,  mag: 4.7, locIdx: 1, pgv: 18.2, depth: 11, aff: 12, triggered: true  },
    { daysAgo: 10.3, mag: 3.2, locIdx: 2, pgv: 3.8,  depth: 9,  aff: 2,  triggered: false },
    { daysAgo: 13.1, mag: 2.9, locIdx: 5, pgv: 2.1,  depth: 14, aff: 0,  triggered: false },
    { daysAgo: 15.6, mag: 4.2, locIdx: 3, pgv: 11.6, depth: 30, aff: 8,  triggered: false },
    { daysAgo: 19.2, mag: 5.8, locIdx: 0, pgv: 54.3, depth: 6,  aff: 15, triggered: true  },
    { daysAgo: 22.0, mag: 3.4, locIdx: 7, pgv: 5.4,  depth: 20, aff: 4,  triggered: false },
    { daysAgo: 25.5, mag: 3.0, locIdx: 6, pgv: 2.7,  depth: 16, aff: 1,  triggered: false },
    { daysAgo: 28.1, mag: 4.5, locIdx: 4, pgv: 15.9, depth: 12, aff: 9,  triggered: true  },
  ].map((e, i) => {
    const loc = EVENT_LOCATIONS[e.locIdx];
    const triggered = e.triggered;
    const payoutUsd = triggered
      ? Math.round((e.pgv * 180000 + e.aff * 420000) / 10000) * 10000
      : null;
    return {
      id: `evt-${String(i + 1).padStart(3, "0")}`,
      timestamp: new Date(now - e.daysAgo * MS_PER_DAY).toISOString(),
      magnitude: e.mag,
      location: loc.location,
      depthKm: e.depth,
      pgvCms: e.pgv,
      distanceKm: loc.distanceKm,
      status: triggered ? "triggered" : e.daysAgo < 1 ? "monitoring" : "cleared",
      payoutUsd,
      affectedBuildings: e.aff,
    } as SeismicEvent;
  });
}
