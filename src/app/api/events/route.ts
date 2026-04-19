import { NextResponse } from "next/server";
import { getSeismicEvents } from "@/lib/seismic-data";

export const revalidate = 60;

export async function GET() {
  return NextResponse.json(getSeismicEvents());
}
