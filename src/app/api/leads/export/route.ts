import { NextRequest } from "next/server";
import { getLeads } from "@/lib/harvest-data";

export const revalidate = 60;

const COLUMNS = [
  "id",
  "town",
  "state",
  "category",
  "tonsPerYear",
  "predictedTonsPerYear",
  "nearestProcessorName",
  "nearestProcessorMiles",
  "thresholdStatus",
  "townEnforcementActions",
  "leadScore",
  "leadTier",
] as const;

function csvEscape(value: string | number): string {
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, "\"\"")}"`;
  }
  return text;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const { items } = getLeads({
    state: q.get("state"),
    tier: q.get("tier"),
    limit: 100_000,
    offset: 0,
  });

  const rows = items.map((lead) =>
    [
      lead.id,
      lead.town,
      lead.stateId,
      lead.category,
      lead.tonsPerYear.toFixed(2),
      lead.predictedTonsPerYear.toFixed(2),
      lead.nearestProcessorName,
      lead.nearestProcessorMiles.toFixed(2),
      lead.thresholdStatus,
      lead.townEnforcementActions,
      lead.leadScore.toFixed(1),
      lead.leadTier,
    ]
      .map(csvEscape)
      .join(","),
  );

  const csv = [COLUMNS.join(","), ...rows].join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="unspoiled-leads.csv"',
      "Cache-Control": "public, s-maxage=60",
    },
  });
}
