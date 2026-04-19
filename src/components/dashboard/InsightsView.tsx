"use client";

import type { Insight } from "@/lib/types";
import { DonutChart } from "@/components/charts/DonutChart";
import { Histogram } from "@/components/charts/Histogram";
import { Sparkline } from "@/components/charts/Sparkline";
import { BarChart } from "@/components/charts/BarChart";

const ACCENT_BG: Record<Insight["accent"], string> = {
  sage: "bg-un-sage-100",
  coral: "bg-un-pink-200",
  gold: "bg-un-gold-200",
  tomato: "bg-un-pink-200",
  pink: "bg-un-pink-200",
  forest: "bg-un-cream-200",
};

const ACCENT_STAT: Record<Insight["accent"], string> = {
  sage: "text-un-sage-700",
  coral: "text-un-coral-600",
  gold: "text-un-sage-700",
  tomato: "text-un-tomato",
  pink: "text-un-coral-600",
  forest: "text-un-forest",
};

function fmtTons(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M t`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k t`;
  return `${Math.round(v)} t`;
}

function fmt(v: number, kind: "tons" | "count" | "pct" | undefined): string {
  if (kind === "tons") return fmtTons(v);
  if (kind === "pct") return `${v.toFixed(1)}%`;
  return v.toLocaleString();
}

export function InsightsView({ insights }: { insights: Insight[] }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-3xl bg-un-forest p-6 text-un-cream-100">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-un-cream-100/70">
          Data story
        </div>
        <h2 className="mt-1 font-display text-2xl font-bold text-white">
          Eleven findings the Dryad dataset actually supports.
        </h2>
        <p className="mt-2 max-w-3xl text-[13.5px] text-un-cream-100/85">
          Each card below is derived from a column in{" "}
          <span className="font-mono">data/raw/*.csv</span> or a direct output
          of the trained PyTorch model. No editorializing — the stat, the
          chart, and the interpretation all trace back to a value that exists
          in the files on disk.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {insights.map((i) => (
          <InsightCard key={i.id} insight={i} />
        ))}
      </div>
    </div>
  );
}

function BarsRender({
  data,
  fmtKind,
}: {
  data: Array<{ label: string; value: number; accent?: boolean }>;
  fmtKind: "tons" | "count" | "pct" | undefined;
}) {
  return <BarChart data={data} format={(v) => fmt(v, fmtKind)} />;
}

function InsightCard({ insight }: { insight: Insight }) {
  return (
    <div
      className={`flex flex-col gap-4 rounded-3xl ${ACCENT_BG[insight.accent]} p-6 ring-1 ring-un-line/70`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="font-display text-[20px] font-bold leading-tight text-un-forest">
            {insight.headline}
          </div>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-un-forest/80">
            {insight.body}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <div
            className={`font-display text-3xl font-bold leading-none ${ACCENT_STAT[insight.accent]}`}
          >
            {insight.stat}
          </div>
          {insight.statSub && (
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-un-ink-soft">
              {insight.statSub}
            </div>
          )}
        </div>
      </div>

      {insight.chart && (
        <div className="rounded-2xl bg-white/90 p-4 ring-1 ring-un-line/60">
          {insight.chart.kind === "donut" && (
            <DonutChart data={insight.chart.slices} />
          )}
          {insight.chart.kind === "sparkline" && (
            <Sparkline
              data={insight.chart.points}
              color={insight.chart.color}
              xLabelFirst={String(insight.chart.points[0]?.x ?? "")}
              xLabelLast={String(
                insight.chart.points[insight.chart.points.length - 1]?.x ?? "",
              )}
            />
          )}
          {insight.chart.kind === "bars" && (
            <BarsRender data={insight.chart.data} fmtKind={insight.chart.format} />
          )}
          {insight.chart.kind === "histogram" && (
            <Histogram
              values={insight.chart.values}
              xLabel={insight.chart.xLabel}
              fillColor={insight.chart.fillColor}
            />
          )}
        </div>
      )}
    </div>
  );
}
