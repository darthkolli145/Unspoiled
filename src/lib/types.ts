export type RiskLevel = "critical" | "elevated" | "moderate" | "low";
export type StructureType = "rc_shear_wall" | "steel_moment" | "cft" | "masonry";
export type TrendDirection = "rising" | "falling" | "stable";
export type EventStatus = "triggered" | "monitoring" | "cleared";

export interface Building {
  id: string;
  address: string;
  city: string;
  state: string;
  floors: number;
  structureType: StructureType;
  yearBuilt: number;
  sqftK: number;
}

export interface RiskScore {
  buildingId: string;
  score: number;
  level: RiskLevel;
  peakStressFloor: number;
  dominantFreqHz: number;
  computedAt: string;
}

export interface Pricing {
  premiumUsdMonth: number;
  payoutCapUsd: number;
  triggerPgvCms: number;
}

export interface BuildingSummary {
  building: Building;
  risk: RiskScore;
  pricing: Pricing;
  trend: TrendDirection;
  payoutTriggered: boolean;
}

export interface FloorStress {
  floor: number;
  label: string;
  stress: number;
  level: RiskLevel;
}

export interface ResonancePoint {
  freqHz: number;
  amplitude: number;
}

export interface BuildingDetail {
  building: Building;
  risk: RiskScore;
  pricing: Pricing;
  floorStress: FloorStress[];
  resonance: ResonancePoint[];
}

export interface SeismicEvent {
  id: string;
  timestamp: string;
  magnitude: number;
  location: string;
  depthKm: number;
  pgvCms: number;
  distanceKm: number;
  status: EventStatus;
  payoutUsd: number | null;
  affectedBuildings: number;
}
