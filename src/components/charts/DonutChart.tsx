"use client";

import { useMemo } from "react";

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({
  data,
  size = 160,
  thickness = 20,
  centerTop,
  centerBottom,
}: {
  data: DonutSlice[];
  size?: number;
  thickness?: number;
  centerTop?: string;
  centerBottom?: string;
}) {
  const { slices, total } = useMemo(() => {
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    const r = (size - thickness) / 2;
    const cx = size / 2;
    const cy = size / 2;
    const cumulative: number[] = [];
    let running = 0;
    for (const d of data) {
      cumulative.push(running);
      running += d.value;
    }
    const slices = data.map((d, i) => {
      const startFrac = cumulative[i] / total;
      const endFrac = (cumulative[i] + d.value) / total;
      const start = startFrac * Math.PI * 2 - Math.PI / 2;
      const end = endFrac * Math.PI * 2 - Math.PI / 2;
      const x1 = cx + r * Math.cos(start);
      const y1 = cy + r * Math.sin(start);
      const x2 = cx + r * Math.cos(end);
      const y2 = cy + r * Math.sin(end);
      const largeArc = endFrac - startFrac > 0.5 ? 1 : 0;
      return {
        ...d,
        path: `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
        pct: (d.value / total) * 100,
      };
    });
    return { slices, total };
  }, [data, size, thickness]);

  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} className="shrink-0">
        {slices.map((s, i) => (
          <path
            key={i}
            d={s.path}
            fill="none"
            stroke={s.color}
            strokeWidth={thickness}
            strokeLinecap="butt"
          />
        ))}
        <text
          x={size / 2}
          y={size / 2 - 6}
          textAnchor="middle"
          className="font-display"
          fontSize="18"
          fontWeight="700"
          fill="#1f3018"
        >
          {centerTop ?? total.toLocaleString()}
        </text>
        {centerBottom && (
          <text
            x={size / 2}
            y={size / 2 + 14}
            textAnchor="middle"
            fontSize="10"
            fill="#7a776d"
          >
            {centerBottom}
          </text>
        )}
      </svg>
      <ul className="flex flex-col gap-1.5 text-[12px]">
        {slices.map((s, i) => (
          <li key={i} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: s.color }}
            />
            <span className="min-w-[120px] truncate text-un-ink">
              {s.label}
            </span>
            <span className="font-mono text-[11px] text-un-ink-soft">
              {s.pct.toFixed(1)}%
            </span>
            <span className="ml-auto font-mono text-[11px] text-un-forest">
              {s.value.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
