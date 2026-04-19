"use client";

import { useMemo } from "react";

export function Histogram({
  values,
  bins = 18,
  width = 560,
  height = 180,
  logScale = true,
  xLabel,
  fillColor = "#7a9154",
}: {
  values: number[];
  bins?: number;
  width?: number;
  height?: number;
  logScale?: boolean;
  xLabel?: string;
  fillColor?: string;
}) {
  const pad = { top: 12, right: 12, bottom: 36, left: 40 };

  const { edges, counts, max, min } = useMemo(() => {
    const transformed = values
      .filter((v) => Number.isFinite(v) && v > 0)
      .map((v) => (logScale ? Math.log10(v) : v));
    const min = transformed.length ? Math.min(...transformed) : 0;
    const max = transformed.length ? Math.max(...transformed) : 1;
    const step = (max - min) / bins || 1;
    const edges = Array.from({ length: bins + 1 }, (_, i) => min + i * step);
    const counts = new Array(bins).fill(0);
    for (const v of transformed) {
      let idx = Math.floor((v - min) / step);
      if (idx === bins) idx = bins - 1;
      if (idx < 0) idx = 0;
      counts[idx]++;
    }
    return { edges, counts, max, min };
  }, [values, bins, logScale]);

  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const maxCount = Math.max(...counts, 1);
  const barW = innerW / bins;

  const axisFmt = (v: number): string => {
    const real = logScale ? Math.pow(10, v) : v;
    if (real >= 1000) return `${(real / 1000).toFixed(0)}k`;
    if (real >= 10) return real.toFixed(0);
    return real.toFixed(1);
  };

  const tickCount = 5;
  const xTicks = Array.from({ length: tickCount + 1 }, (_, i) => ({
    pos: pad.left + (i / tickCount) * innerW,
    label: axisFmt(min + ((max - min) * i) / tickCount),
  }));
  const yTicks = Array.from({ length: 4 }, (_, i) => {
    const v = ((i + 1) / 4) * maxCount;
    return {
      pos: pad.top + innerH - (v / maxCount) * innerH,
      label: Math.round(v).toLocaleString(),
    };
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
      <rect
        x={pad.left}
        y={pad.top}
        width={innerW}
        height={innerH}
        fill="#fffdf3"
        stroke="rgba(31,48,24,0.1)"
      />
      {yTicks.map((t, i) => (
        <g key={`y-${i}`}>
          <line
            x1={pad.left}
            x2={pad.left + innerW}
            y1={t.pos}
            y2={t.pos}
            stroke="rgba(31,48,24,0.07)"
          />
          <text
            x={pad.left - 6}
            y={t.pos + 3}
            textAnchor="end"
            fontSize="10"
            fill="rgba(31,48,24,0.65)"
          >
            {t.label}
          </text>
        </g>
      ))}
      {counts.map((c, i) => {
        const h = (c / maxCount) * innerH;
        const x = pad.left + i * barW + 1;
        const y = pad.top + innerH - h;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barW - 2}
            height={h}
            fill={fillColor}
            fillOpacity={0.85}
          />
        );
      })}
      {xTicks.map((t, i) => (
        <g key={`x-${i}`}>
          <line
            x1={t.pos}
            x2={t.pos}
            y1={pad.top + innerH}
            y2={pad.top + innerH + 4}
            stroke="rgba(31,48,24,0.45)"
          />
          <text
            x={t.pos}
            y={pad.top + innerH + 16}
            textAnchor="middle"
            fontSize="10"
            fill="rgba(31,48,24,0.65)"
          >
            {t.label}
          </text>
        </g>
      ))}
      {xLabel && (
        <text
          x={pad.left + innerW / 2}
          y={height - 6}
          textAnchor="middle"
          fontSize="10"
          fill="rgba(31,48,24,0.6)"
        >
          {xLabel}
        </text>
      )}
      <text
        x={pad.left + innerW - 4}
        y={pad.top + 14}
        textAnchor="end"
        fontSize="10"
        fill="rgba(31,48,24,0.6)"
      >
        {edges.length
          ? `n=${counts.reduce((s, c) => s + c, 0).toLocaleString()}`
          : ""}
      </text>
    </svg>
  );
}
