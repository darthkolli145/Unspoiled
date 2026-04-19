"use client";

import { useMemo } from "react";

interface ScatterPoint {
  x: number;
  y: number;
  color?: string;
}

export function ScatterChart({
  data,
  width = 640,
  height = 360,
  xLabel,
  yLabel,
  logScale = true,
}: {
  data: ScatterPoint[];
  width?: number;
  height?: number;
  xLabel?: string;
  yLabel?: string;
  logScale?: boolean;
}) {
  const padding = { top: 20, right: 20, bottom: 44, left: 54 };

  const { pts, xTicks, yTicks, pathIdentity } = useMemo(() => {
    const transform = (v: number) => (logScale ? Math.log10(Math.max(v, 0.1)) : v);
    const xs = data.map((d) => transform(d.x));
    const ys = data.map((d) => transform(d.y));
    const all = xs.concat(ys);
    const lo = Math.min(...all);
    const hi = Math.max(...all);
    const pad = (hi - lo) * 0.05;
    const min = lo - pad;
    const max = hi + pad;
    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;
    const sx = (v: number) =>
      padding.left + ((transform(v) - min) / (max - min)) * innerW;
    const sy = (v: number) =>
      padding.top +
      innerH -
      ((transform(v) - min) / (max - min)) * innerH;

    const pts = data.map((d) => ({ ...d, cx: sx(d.x), cy: sy(d.y) }));
    const steps = 5;
    const ticks: number[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = min + ((max - min) * i) / steps;
      ticks.push(logScale ? Math.pow(10, t) : t);
    }
    const pathIdentity = (() => {
      const lo2 = logScale ? Math.pow(10, min) : min;
      const hi2 = logScale ? Math.pow(10, max) : max;
      return `M ${sx(lo2)} ${sy(lo2)} L ${sx(hi2)} ${sy(hi2)}`;
    })();
    return {
      pts,
      xTicks: ticks,
      yTicks: ticks,
      pathIdentity,
    };
  }, [
    data,
    width,
    height,
    padding.left,
    padding.right,
    padding.top,
    padding.bottom,
    logScale,
  ]);

  const fmt = (v: number) =>
    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v >= 10 ? v.toFixed(0) : v.toFixed(1);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label={`${yLabel ?? "y"} vs ${xLabel ?? "x"}`}
    >
      <rect
        x={padding.left}
        y={padding.top}
        width={width - padding.left - padding.right}
        height={height - padding.top - padding.bottom}
        fill="#fffdf3"
        stroke="rgba(31,48,24,0.12)"
      />
      {xTicks.map((t, i) => {
        const x =
          padding.left +
          (i / (xTicks.length - 1)) * (width - padding.left - padding.right);
        return (
          <g key={`xt-${i}`}>
            <line
              x1={x}
              x2={x}
              y1={padding.top}
              y2={height - padding.bottom}
              stroke="rgba(31,48,24,0.07)"
            />
            <text
              x={x}
              y={height - padding.bottom + 16}
              textAnchor="middle"
              fontSize="10"
              fill="rgba(31,48,24,0.6)"
            >
              {fmt(t)}
            </text>
          </g>
        );
      })}
      {yTicks.map((t, i) => {
        const y =
          height -
          padding.bottom -
          (i / (yTicks.length - 1)) * (height - padding.top - padding.bottom);
        return (
          <g key={`yt-${i}`}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={y}
              y2={y}
              stroke="rgba(31,48,24,0.07)"
            />
            <text
              x={padding.left - 8}
              y={y + 4}
              textAnchor="end"
              fontSize="10"
              fill="rgba(31,48,24,0.6)"
            >
              {fmt(t)}
            </text>
          </g>
        );
      })}
      <path
        d={pathIdentity}
        stroke="rgba(31,48,24,0.4)"
        strokeDasharray="4 4"
        fill="none"
      />
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p.cx}
          cy={p.cy}
          r={2.5}
          fill={p.color ?? "rgba(122,145,84,0.75)"}
          stroke="rgba(31,48,24,0.25)"
          strokeWidth="0.5"
        />
      ))}
      {xLabel && (
        <text
          x={(width + padding.left - padding.right) / 2}
          y={height - 6}
          textAnchor="middle"
          fontSize="11"
          fill="rgba(31,48,24,0.7)"
        >
          {xLabel}
        </text>
      )}
      {yLabel && (
        <text
          x={14}
          y={(height + padding.top - padding.bottom) / 2}
          textAnchor="middle"
          fontSize="11"
          fill="rgba(31,48,24,0.7)"
          transform={`rotate(-90 14 ${(height + padding.top - padding.bottom) / 2})`}
        >
          {yLabel}
        </text>
      )}
    </svg>
  );
}
