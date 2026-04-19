"use client";

import { useEffect, useState, useCallback } from "react";
import type { SeismicEvent } from "@/lib/types";
import { RefreshCw, Zap, Radio, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

function fmtTime(iso: string) {
  const d = new Date(iso);
  const now = Date.now();
  const diffMs = now - d.getTime();
  const diffH = diffMs / 3_600_000;
  if (diffH < 1) return `${Math.round(diffH * 60)}m ago`;
  if (diffH < 24) return `${Math.round(diffH)}h ago`;
  return `${Math.round(diffH / 24)}d ago`;
}

function MagBadge({ mag }: { mag: number }) {
  const color = mag >= 5 ? "text-red-400 bg-red-500/10 ring-red-500/25"
    : mag >= 4 ? "text-amber-400 bg-amber-500/10 ring-amber-500/25"
    : "text-zinc-400 bg-zinc-500/10 ring-zinc-500/20";
  return (
    <span className={cn("inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold ring-1 ring-inset", color)}>
      {mag.toFixed(1)}
    </span>
  );
}

function StatusPill({ status }: { status: SeismicEvent["status"] }) {
  if (status === "triggered") return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400 ring-1 ring-inset ring-red-500/25">
      <Zap className="h-2.5 w-2.5" /> Triggered
    </span>
  );
  if (status === "monitoring") return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 ring-1 ring-inset ring-amber-500/25">
      <Radio className="h-2.5 w-2.5" /> Monitoring
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-500/10 px-2 py-0.5 text-[10px] font-semibold text-zinc-400 ring-1 ring-inset ring-zinc-500/20">
      <Activity className="h-2.5 w-2.5" /> Cleared
    </span>
  );
}

export function FcuShell() {
  const [events, setEvents] = useState<SeismicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events");
      const data: SeismicEvent[] = await res.json();
      setEvents(data);
      setLastUpdated(new Date());
    } catch {
      // keep stale
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    const id = setInterval(fetchEvents, 60_000);
    return () => clearInterval(id);
  }, [fetchEvents]);

  const triggered  = events.filter((e) => e.status === "triggered");
  const monitoring = events.filter((e) => e.status === "monitoring");
  const totalPayout = triggered.reduce((s, e) => s + (e.payoutUsd ?? 0), 0);

  return (
    <div className="space-y-5">
      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Events (30d)",     value: String(events.length),          tone: "zinc" },
          { label: "Triggered",        value: String(triggered.length),        tone: "red"  },
          { label: "Monitoring",       value: String(monitoring.length),       tone: "amber"},
          { label: "Total payouts",    value: `$${(totalPayout/1_000_000).toFixed(2)}M`, tone: "blue" },
        ].map(({ label, value, tone }) => (
          <div key={label} className={cn(
            "rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3",
          )}>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600">{label}</div>
            <div className={cn(
              "mt-1.5 text-2xl font-light tabular-nums",
              tone === "red" ? "text-red-300" : tone === "amber" ? "text-amber-300" : tone === "blue" ? "text-blue-300" : "text-zinc-100",
            )}>{value}</div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-400">Recent seismic events</h3>
        <div className="flex items-center gap-1.5 text-xs text-zinc-600">
          <RefreshCw className="h-3 w-3" />
          {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : "Loading…"}
        </div>
      </div>

      {/* Event list */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl border border-zinc-800 bg-zinc-900/40 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((e) => (
            <div
              key={e.id}
              className={cn(
                "relative flex items-start gap-4 rounded-xl border bg-zinc-900/40 p-4 transition",
                e.status === "triggered" && "border-red-500/20 bg-red-500/5",
                e.status === "monitoring" && "border-amber-500/20 bg-amber-500/5",
                e.status === "cleared" && "border-zinc-800 hover:border-zinc-700",
              )}
            >
              {e.status === "triggered" && (
                <div className="absolute left-0 inset-y-0 w-0.5 rounded-l-xl bg-red-500" />
              )}

              <MagBadge mag={e.magnitude} />

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-zinc-100 text-sm">{e.location}</span>
                  <StatusPill status={e.status} />
                </div>

                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                  <span>Depth <span className="text-zinc-400">{e.depthKm} km</span></span>
                  <span>PGV <span className={cn("font-mono", e.pgvCms >= 12 ? "text-red-400" : e.pgvCms >= 8 ? "text-amber-400" : "text-zinc-400")}>{e.pgvCms} cm/s</span></span>
                  <span>Distance <span className="text-zinc-400">{e.distanceKm} km</span></span>
                  <span>Buildings affected <span className="text-zinc-400">{e.affectedBuildings}</span></span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs text-zinc-600">{fmtTime(e.timestamp)}</div>
                {e.payoutUsd !== null && (
                  <div className="mt-1 font-mono text-sm text-red-300">
                    −${(e.payoutUsd / 1000).toFixed(0)}K
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
