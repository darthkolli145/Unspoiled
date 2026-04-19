"use client";

import { ScatterChart } from "@/components/charts/ScatterChart";
import type { ModelMetrics } from "@/lib/types";

const STATE_COLOR: Record<string, string> = {
  MA: "rgba(92,117,64,0.85)",
  VT: "rgba(232,98,61,0.85)",
  CA: "rgba(237,189,92,0.85)",
  CT: "rgba(239,159,128,0.85)",
  RI: "rgba(164,182,122,0.85)",
};

export function ModelPerformance({
  metrics,
  scatter,
}: {
  metrics: ModelMetrics;
  scatter: Array<{
    id: string;
    actual: number;
    predicted: number;
    stateId: string;
    category: string;
  }>;
}) {
  const points = scatter.map((p) => ({
    x: p.actual,
    y: p.predicted,
    color: STATE_COLOR[p.stateId] ?? "rgba(122,119,109,0.7)",
  }));
  const metricCards = [
    {
      label: "Val MAE (tons/yr)",
      value: metrics.final_val_mae_tons.toFixed(1),
      bg: "bg-un-gold-200",
    },
    {
      label: "Val R² (log)",
      value: metrics.final_val_r2_log.toFixed(3),
      bg: "bg-un-sage-100",
    },
    {
      label: "Val R² (raw)",
      value: metrics.final_val_r2.toFixed(3),
      bg: "bg-un-pink-200",
    },
    {
      label: "Val MAPE",
      value: `${(metrics.final_val_mape * 100).toFixed(1)}%`,
      bg: "bg-un-cream-200",
    },
  ];
  const lastHistory = metrics.history;
  const lossMin = Math.min(...lastHistory.map((h) => h.val_loss));
  const lossMax = Math.max(...lastHistory.map((h) => h.val_loss));

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {metricCards.map((m) => (
          <div
            key={m.label}
            className={`rounded-2xl ${m.bg} p-4 ring-1 ring-un-line`}
          >
            <div className="text-[11px] font-semibold uppercase tracking-widest text-un-forest/65">
              {m.label}
            </div>
            <div className="mt-1.5 font-display text-xl font-bold text-un-forest">
              {m.value}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-un-line bg-white p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-un-sage-700">
              Predicted vs actual tonnage
            </div>
            <div className="mt-1 text-[13px] text-un-ink-soft">
              Log–log scatter across{" "}
              {scatter.length.toLocaleString()} held-out generators. Dashed
              line is y = x.
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-un-ink-soft">
            {Object.entries(STATE_COLOR).map(([s, c]) => (
              <span key={s} className="inline-flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: c }}
                />
                {s}
              </span>
            ))}
          </div>
        </div>
        <ScatterChart
          data={points}
          xLabel="Actual tons/yr"
          yLabel="Predicted tons/yr"
          logScale
        />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-3xl border border-un-line bg-white p-5">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-un-sage-700">
            Training configuration
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
            <dt className="text-un-ink-soft">Architecture</dt>
            <dd className="text-un-forest">MLP · 12/4-d → 128 → 128 → 64 → 1</dd>
            <dt className="text-un-ink-soft">Rows</dt>
            <dd className="font-mono text-un-forest">
              {metrics.rows.toLocaleString()}
            </dd>
            <dt className="text-un-ink-soft">Train / val split</dt>
            <dd className="font-mono text-un-forest">
              {metrics.train_rows.toLocaleString()} /{" "}
              {metrics.val_rows.toLocaleString()}
            </dd>
            <dt className="text-un-ink-soft">Target cap (p99.5)</dt>
            <dd className="font-mono text-un-forest">
              {metrics.target_cap_tons_per_year.toFixed(0)} t/yr
            </dd>
            <dt className="text-un-ink-soft">Features</dt>
            <dd className="font-mono text-un-forest">
              category, state, population, lat, lon, processor-km
            </dd>
            <dt className="text-un-ink-soft">Target</dt>
            <dd className="font-mono text-un-forest">log1p(tons/yr)</dd>
          </dl>
        </div>

        <div className="rounded-3xl border border-un-line bg-white p-5">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-un-sage-700">
            Validation loss (last {lastHistory.length} epochs)
          </div>
          <svg viewBox="0 0 320 140" className="mt-3 h-auto w-full">
            <rect
              x={0}
              y={0}
              width={320}
              height={140}
              fill="#fffdf3"
              stroke="rgba(31,48,24,0.1)"
            />
            <polyline
              fill="none"
              stroke="var(--un-coral-500)"
              strokeWidth={1.75}
              points={lastHistory
                .map((h, i) => {
                  const x = (i / (lastHistory.length - 1)) * 312 + 4;
                  const y =
                    8 +
                    (1 -
                      (h.val_loss - lossMin) /
                        Math.max(lossMax - lossMin, 1e-6)) *
                      124;
                  return `${x},${y}`;
                })
                .join(" ")}
            />
          </svg>
          <div className="mt-2 flex justify-between text-[11px] text-un-ink-soft">
            <span>epoch {lastHistory[0]?.epoch ?? 1}</span>
            <span>
              epoch {lastHistory[lastHistory.length - 1]?.epoch ?? 1}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
