import { NextResponse } from "next/server";
import { getBans, getEvidence } from "@/lib/harvest-data";

export const revalidate = 60;

export async function GET() {
  const evidence = getEvidence();
  return NextResponse.json({
    bans: getBans(),
    stateEffects: evidence.stateEffects,
    banHistory: evidence.banHistory,
  });
}
