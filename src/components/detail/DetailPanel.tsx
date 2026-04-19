"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import type { BuildingSummary, BuildingDetail } from "@/lib/types";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { UnitMetaCard } from "./UnitMetaCard";
import { HourlyTrendChart } from "./HourlyTrendChart";
import { AnomalyScoreChart } from "./AnomalyScoreChart";

interface Props {
  selected: BuildingSummary | null;
  onClose: () => void;
}

export function BuildingDetailPanel({ selected, onClose }: Props) {
  const [detail, setDetail] = useState<BuildingDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selected) { setDetail(null); return; }
    setLoading(true);
    fetch(`/api/portfolio/${selected.building.id}`)
      .then((r) => r.json())
      .then((d) => setDetail(d))
      .finally(() => setLoading(false));
  }, [selected?.building.id]);

  return (
    <Sheet open={!!selected} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg bg-zinc-950 border-zinc-800 text-zinc-100 overflow-y-auto"
      >
        {selected && (
          <>
            <SheetHeader className="mb-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <SheetTitle className="text-zinc-100 text-base leading-snug">{selected.building.address}</SheetTitle>
                  <p className="mt-0.5 text-xs text-zinc-500">{selected.building.city}, {selected.building.state} · {selected.building.floors}F</p>
                </div>
                <StatusBadge level={selected.risk.level} />
              </div>
            </SheetHeader>

            {loading || !detail ? (
              <div className="space-y-4">
                <Skeleton className="h-28 w-full bg-zinc-800" />
                <Skeleton className="h-36 w-full bg-zinc-800" />
                <Skeleton className="h-40 w-full bg-zinc-800" />
              </div>
            ) : (
              <div className="space-y-6">
                <UnitMetaCard detail={detail} />

                <Separator className="bg-zinc-800" />

                <div>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Resonance Profile · 0.05–3.0 Hz
                  </h3>
                  <HourlyTrendChart detail={detail} />
                </div>

                <Separator className="bg-zinc-800" />

                <div>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Per-Floor Structural Stress
                  </h3>
                  <AnomalyScoreChart detail={detail} />
                  <p className="mt-3 text-[10px] text-zinc-600">
                    Stress modeled via alpa_(ti) decay · USGS 3D geometry · Scripps v3 seismograms
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
