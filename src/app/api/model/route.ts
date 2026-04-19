import { NextResponse } from "next/server";
import { getModelMetrics, getModelScatter } from "@/lib/harvest-data";

export const revalidate = 60;

export async function GET() {
  return NextResponse.json({
    metrics: getModelMetrics(),
    scatter: getModelScatter(),
  });
}
