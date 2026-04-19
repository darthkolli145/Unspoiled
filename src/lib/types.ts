export type ThresholdStatus = "above" | "near" | "below";

export type GeneratorCategory =
  | "Restaurant"
  | "Grocery"
  | "Cafeteria"
  | "School"
  | "College"
  | "Hospital"
  | "Prison"
  | "FoodService"
  | "Bakery"
  | "FoodManufacturer"
  | "Warehouse"
  | "Lodging"
  | "Other";

export interface Generator {
  id: string;
  name: string;
  stateId: string;
  town: string;
  category: GeneratorCategory;
  tonsPerYear: number;
  predictedTonsPerYear: number;
  residualTons: number;
  lat: number;
  lon: number;
  population: number | null;
  nearestProcessorId: string;
  nearestProcessorName: string;
  nearestProcessorType: string;
  nearestProcessorKm: number;
  nearestProcessorMiles: number;
  banThresholdTonsPerYear: number | null;
  banDistanceMiles: number | null;
  coveredByBan: boolean;
  thresholdStatus: ThresholdStatus;
  /** From composting_effect.csv. null when the Dryad study has no recorded value for this state. */
  compostingEffect: number | null;
  /** From disposal_effect_size2.csv. null when not recorded. */
  disposalEffect: number | null;
  /** tonsPerYear * compostingEffect. null when compostingEffect is null. */
  divertedTonsPerYear: number | null;
  /**
   * Town-level signal from wb_enforcements.csv. Counts MassDEP enforcement
   * actions whose Comment field mentions this generator's town. Not a
   * per-business claim -- SiteName and Municipality are redacted in the
   * dataset.
   */
  townEnforcementActions: number;
  townEnforcementPenaltyUsd: number;
  townEnforcementWithPenalty: number;
  source: string;
}

export interface Processor {
  id: string;
  name: string;
  processorType: string;
  town: string;
  stateId: string;
  lat: number;
  lon: number;
}

export interface Ban {
  stateId: string;
  year: number;
  phase: number;
  material: string;
  thresholdTonsPerYear: number;
  distanceThresholdMiles: number;
}

export interface ModelMetrics {
  rows: number;
  train_rows: number;
  val_rows: number;
  target_cap_tons_per_year: number;
  final_val_mae_tons: number;
  final_val_mape: number;
  final_val_r2: number;
  final_val_r2_log: number;
  best_val_loss: number;
  history: Array<{
    epoch: number;
    train_loss: number;
    val_loss: number;
    val_mae_tons: number;
    val_mae_log: number;
    val_mape: number;
    val_r2: number;
    val_r2_log: number;
  }>;
  categories: string[];
  states: string[];
  feature_columns: string[];
}

export interface PortfolioSummary {
  totalGenerators: number;
  coveredByBan: number;
  aboveThreshold: number;
  nearThreshold: number;
  belowThreshold: number;
  totalTonsPerYear: number;
  predictedTonsPerYear: number;
  divertedTonsPerYearKnown: number;
  generatorsWithDiversionEstimate: number;
  byState: Array<{
    stateId: string;
    generators: number;
    tonsPerYear: number;
    predictedTonsPerYear: number;
    divertedTonsPerYear: number | null;
    coveredByBan: number;
  }>;
  byCategory: Array<{
    category: string;
    generators: number;
    tonsPerYear: number;
    meanTonsPerYear: number;
  }>;
  byStatus: Array<{ status: ThresholdStatus; generators: number }>;
}

export interface GeneratorDetail extends Generator {
  nearestProcessors: Array<{
    id: string;
    name: string;
    processorType: string;
    town: string;
    stateId: string;
    distanceMiles: number;
  }>;
  applicableBan: Ban | null;
}

export interface Insight {
  id: string;
  headline: string;
  stat: string;
  statSub?: string;
  body: string;
  accent: "sage" | "coral" | "gold" | "tomato" | "pink" | "forest";
  /**
   * Optional chart payload. Typed as a discriminated union; the Insights tab
   * knows how to render each variant.
   */
  chart?:
    | { kind: "donut"; slices: Array<{ label: string; value: number; color: string }> }
    | { kind: "sparkline"; points: Array<{ x: number | string; y: number }>; color?: string }
    | { kind: "bars"; data: Array<{ label: string; value: number; accent?: boolean }>; format?: "tons" | "count" | "pct" }
    | { kind: "histogram"; values: number[]; xLabel?: string; fillColor?: string };
}

export interface Enforcement {
  totalActions: number;
  totalPenaltyUsd: number;
  actionsWithPenalty: number;
  yearsCovered: [number, number] | null;
  townsGazetteerSize: number;
  townsMentioned: number;
  byYear: Array<{ year: number; actions: number }>;
  byType: Array<{ type: string; actions: number }>;
  byProgram: Array<{ program: string; actions: number }>;
  byTown: Array<{
    town: string;
    actions: number;
    actionsWithPenalty: number;
    penaltyUsd: number;
  }>;
  records: Array<{
    year: number | null;
    enforcementType: string;
    programCategory: string;
    penaltyUsd: number;
    comment: string;
    mentionedTowns: string[];
  }>;
}

export interface Evidence {
  maEnforcementActions: number;
  stateEffects: Array<{
    stateId: string;
    compostingEffect: number | null;
    disposalEffect: number | null;
  }>;
  stateTonnage: Array<{
    stateId: string;
    generators: number;
    tonsPerYear: number;
    predictedTonsPerYear: number;
    divertedTonsPerYear: number | null;
  }>;
  boulderHistory: Array<{
    year: number;
    landfillTons: number;
    organicsTons: number;
    recycleTons: number;
    diversionRate: number | null;
  }>;
  seattleCompostingAnnual: Array<{
    year: number;
    residentialTons: number;
    commercialTons: number;
    selfHaulTons: number;
  }>;
  banHistory: Array<{
    stateId: string;
    year: number;
    phase: number;
    material: string;
    thresholdTonsPerYear: number;
    distanceThresholdMiles: number;
  }>;
  categoryCounts: Array<{
    category: string;
    generators: number;
  }>;
}
