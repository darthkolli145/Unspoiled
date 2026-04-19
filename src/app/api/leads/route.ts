import { NextRequest, NextResponse } from "next/server";
import { getLeads } from "@/lib/harvest-data";

export const revalidate = 60;

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const res = getLeads({
    state: q.get("state"),
    tier: q.get("tier"),
    limit: q.get("limit") ? Number(q.get("limit")) : 200,
    offset: q.get("offset") ? Number(q.get("offset")) : 0,
  });
  return NextResponse.json(res);
}
