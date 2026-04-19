import { NextRequest, NextResponse } from "next/server";
import {
  getEnforcement,
  getEnforcementSummary,
} from "@/lib/harvest-data";

export const revalidate = 60;

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  // The full records list is ~933 rows -- cheap, but gate it behind ?full=1
  // so the dashboard can fetch a lightweight summary by default.
  if (q.get("full") === "1") {
    return NextResponse.json(getEnforcement());
  }
  return NextResponse.json(getEnforcementSummary());
}
