/**
 * Display helpers for the Dryad dataset. Every `name` column in
 * food_generators_*.csv and food_processors_list_*.csv was redacted by the
 * researchers before publication. Rather than show the literal string
 * "redacted" in the UI, we synthesize a readable label from columns that DO
 * have real values (category, town, state, id). The underlying `name` field
 * on the data object is left untouched so anything that wants to show the
 * raw value (e.g. a transparency note) still can.
 */

const REDACTED = new Set([
  "",
  "redacted",
  "redacted generator",
  "redacted processor",
]);

export function isRedactedName(name: string | null | undefined): boolean {
  if (!name) return true;
  return REDACTED.has(name.trim().toLowerCase());
}

export interface GeneratorDisplayFields {
  id: string;
  name: string;
  category: string;
  town: string;
  stateId: string;
}

export function generatorTitle(g: GeneratorDisplayFields): string {
  if (isRedactedName(g.name)) {
    const town = g.town?.trim() || "Unknown town";
    return `${g.category} · ${town}`;
  }
  return g.name;
}

export function generatorSubtitle(g: GeneratorDisplayFields): string {
  const town = g.town?.trim() || "Unknown town";
  return `${g.id} · ${town}, ${g.stateId}`;
}

export interface ProcessorDisplayFields {
  id: string;
  name: string;
  processorType: string;
  town: string;
  stateId: string;
}

export function processorTitle(p: ProcessorDisplayFields): string {
  if (isRedactedName(p.name)) {
    const town = p.town?.trim() || "Unknown town";
    const type = p.processorType?.trim() || "Processor";
    return `${type} · ${town}`;
  }
  return p.name;
}

export function processorSubtitle(p: ProcessorDisplayFields): string {
  const town = p.town?.trim() || "";
  return town ? `${p.id} · ${town}, ${p.stateId}` : `${p.id} · ${p.stateId}`;
}
