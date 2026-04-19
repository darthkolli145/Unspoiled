"use client";

import type { BuildingDetail } from "@/lib/types";
import { Building2, Calendar, Layers, DollarSign } from "lucide-react";

const STRUCTURE_LABELS: Record<string, string> = {
  rc_shear_wall: "RC Shear Wall",
  steel_moment:  "Steel Moment Frame",
  cft:           "CFT",
  masonry:       "Masonry",
};

export function UnitMetaCard({ detail }: { detail: BuildingDetail }) {
  const { building, risk, pricing } = detail;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2 text-zinc-400">
          <Building2 className="h-4 w-4 shrink-0 text-zinc-600" />
          <span>{building.city}, {building.state}</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          <Layers className="h-4 w-4 shrink-0 text-zinc-600" />
          <span>{STRUCTURE_LABELS[building.structureType]}</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          <Calendar className="h-4 w-4 shrink-0 text-zinc-600" />
          <span>Built {building.yearBuilt} · {building.floors}F</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          <DollarSign className="h-4 w-4 shrink-0 text-zinc-600" />
          <span>{building.sqftK}K sqft</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px rounded-xl overflow-hidden border border-white/5 bg-white/5">
        {[
          { label: "Risk Score", value: risk.score.toFixed(2), color: risk.score >= 0.7 ? "text-red-400" : risk.score >= 0.5 ? "text-amber-400" : "text-emerald-400" },
          { label: "Premium/mo", value: `$${(pricing.premiumUsdMonth / 1000).toFixed(1)}K`, color: "text-zinc-100" },
          { label: "Payout Cap", value: `$${(pricing.payoutCapUsd / 1_000_000).toFixed(1)}M`, color: "text-zinc-100" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-zinc-900 px-3 py-3 text-center">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">{label}</div>
            <div className={`mt-1 text-lg font-light tabular-nums ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-lg border border-white/5 bg-zinc-900 px-3 py-2 text-xs text-zinc-500">
        <span>Dominant freq: <span className="font-mono text-zinc-300">{risk.dominantFreqHz} Hz</span></span>
        <span>Peak stress: <span className="font-mono text-zinc-300">Floor {risk.peakStressFloor}</span></span>
        <span>PGV trigger: <span className="font-mono text-zinc-300">{pricing.triggerPgvCms} cm/s</span></span>
      </div>
    </div>
  );
}
