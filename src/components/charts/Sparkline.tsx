"use client";

export interface SparklinePoint {
  x: number | string;
  y: number;
}

export function Sparkline({
  data,
  width = 320,
  height = 90,
  color = "#e8623d",
  showDots = true,
  showArea = true,
  xLabelFirst,
  xLabelLast,
}: {
  data: SparklinePoint[];
  width?: number;
  height?: number;
  color?: string;
  showDots?: boolean;
  showArea?: boolean;
  xLabelFirst?: string;
  xLabelLast?: string;
}) {
  if (data.length === 0) {
    return <div className="text-[12px] text-un-ink-soft">No data</div>;
  }
  const pad = 8;
  const ys = data.map((d) => d.y);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const range = Math.max(max - min, 1e-6);

  const points = data.map((d, i) => ({
    x: pad + (i / (data.length - 1 || 1)) * (width - 2 * pad),
    y: height - pad - ((d.y - min) / range) * (height - 2 * pad),
    raw: d,
  }));

  const line = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath = `M ${points[0].x},${height - pad} L ${points
    .map((p) => `${p.x},${p.y}`)
    .join(" L ")} L ${points[points.length - 1].x},${height - pad} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="#fffdf3"
          stroke="rgba(31,48,24,0.08)"
        />
        {showArea && (
          <path d={areaPath} fill={color} fillOpacity={0.12} />
        )}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth={1.75}
          points={line}
        />
        {showDots &&
          points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={3}
                fill="#fff"
                stroke={color}
                strokeWidth={1.5}
              />
              <text
                x={p.x}
                y={p.y - 6}
                textAnchor="middle"
                fontSize="9"
                fill="#1f3018"
              >
                {p.raw.y.toLocaleString()}
              </text>
            </g>
          ))}
      </svg>
      {(xLabelFirst || xLabelLast) && (
        <div className="flex justify-between px-1 text-[10px] text-un-ink-soft">
          <span>{xLabelFirst ?? String(data[0].x)}</span>
          <span>{xLabelLast ?? String(data[data.length - 1].x)}</span>
        </div>
      )}
    </div>
  );
}
