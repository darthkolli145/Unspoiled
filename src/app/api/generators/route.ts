import { NextRequest, NextResponse } from "next/server";
import { queryGenerators } from "@/lib/harvest-data";

export const revalidate = 60;

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const res = queryGenerators({
    state: q.get("state"),
    category: q.get("category"),
    status: q.get("status"),
    coveredOnly: q.get("covered") === "true",
    search: q.get("q"),
    limit: q.get("limit") ? Number(q.get("limit")) : 200,
    offset: q.get("offset") ? Number(q.get("offset")) : 0,
    sort:
      (q.get("sort") as
        | "tons"
        | "predicted"
        | "residual"
        | "distance"
        | null) ?? "tons",
    order: (q.get("order") as "asc" | "desc" | null) ?? "desc",
  });
  return NextResponse.json(res);
}
