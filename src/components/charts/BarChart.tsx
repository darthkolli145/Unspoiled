"use client";

interface BarDatum {
  label: string;
  value: number;
  accent?: boolean;
}

export function BarChart({
  data,
  height = 200,
  format = (v) => v.toLocaleString(),
}: {
  data: BarDatum[];
  height?: number;
  format?: (v: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex flex-col gap-1.5">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3 text-[12px]">
          <div className="w-32 shrink-0 truncate text-un-ink-soft">
            {d.label}
          </div>
          <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-un-cream-200">
            <div
              className={`absolute inset-y-0 left-0 rounded-full ${
                d.accent ? "bg-un-coral-500" : "bg-un-sage-500"
              }`}
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
          <div className="w-24 shrink-0 text-right font-mono text-[11px] text-un-forest">
            {format(d.value)}
          </div>
        </div>
      ))}
      <div className="sr-only" style={{ height }} />
    </div>
  );
}
