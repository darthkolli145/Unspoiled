"use client";

import type { BuildingDetail } from "@/lib/types";
import { cn } from "@/lib/utils";

const LEVEL_COLOR: Record<string, string> = {
  critical: "bg-red-500",
  elevated: "bg-amber-400",
  moderate: "bg-yellow-500",
  low:      "bg-emerald-500",
};
const LEVEL_TEXT: Record<string, string> = {
  critical: "text-red-400",
  elevated: "text-amber-400",
  moderate: "text-yellow-400",
  low:      "text-emerald-400",
};

export function AnomalyScoreChart({ detail }: { detail: BuildingDetail }) {
  const floors = [...detail.floorStress].reverse();
  return (
    <div className="space-y-1.5">
      {floors.map((f) => (
        <div key={f.floor} className="flex items-center gap-2">
          <span className="w-20 shrink-0 text-right text-[10px] text-zinc-600">{f.label}</span>
          <div className="flex-1 h-3 overflow-hidden rounded-sm bg-zinc-800">
            <div
              className={cn("h-full rounded-sm transition-all", LEVEL_COLOR[f.level])}
              style={{ width: `${f.stress * 100}%`, opacity: 0.55 + f.stress * 0.35 }}
            />
          </div>
          <span className={cn("w-14 shrink-0 text-right text-[10px] font-medium tabular-nums", LEVEL_TEXT[f.level])}>
            {(f.stress * 100).toFixed(0)}%
          </span>
        </div>
      ))}
    </div>
  );
}
