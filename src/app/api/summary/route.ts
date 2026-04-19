import { NextResponse } from "next/server";
import { getPortfolioSummary } from "@/lib/harvest-data";

export const revalidate = 60;

export async function GET() {
  return NextResponse.json(getPortfolioSummary());
}
