import { NextRequest, NextResponse } from "next/server";
import { getBuildingSummaries } from "@/lib/seismic-data";

export const revalidate = 60;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const cityFilter  = searchParams.get("city");
  const levelFilter = searchParams.get("level");

  let summaries = getBuildingSummaries();

  if (cityFilter && cityFilter !== "all") {
    summaries = summaries.filter((s) => s.building.city === cityFilter);
  }
  if (levelFilter && levelFilter !== "all") {
    summaries = summaries.filter((s) => s.risk.level === levelFilter);
  }

  const order = { critical: 0, elevated: 1, moderate: 2, low: 3 };
  summaries.sort((a, b) => order[a.risk.level] - order[b.risk.level]);

  return NextResponse.json(summaries);
}
