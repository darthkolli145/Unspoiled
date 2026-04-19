"use client";

import type { BuildingDetail } from "@/lib/types";

// Resonance profile: amplitude vs frequency
export function HourlyTrendChart({ detail }: { detail: BuildingDetail }) {
  const pts = detail.resonance;
  if (!pts.length) return null;

  const W = 320;
  const H = 100;
  const maxF = pts[pts.length - 1].freqHz;
  const maxA = Math.max(...pts.map((p) => p.amplitude), 0.01);

  const toX = (f: number) => (f / maxF) * W;
  const toY = (a: number) => H - (a / maxA) * H * 0.9;

  const polyline = pts.map((p) => `${toX(p.freqHz)},${toY(p.amplitude)}`).join(" ");
  const area = `0,${H} ${polyline} ${W},${H}`;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[10px] text-zinc-600">
        <span>0.05 Hz</span>
        <span className="text-zinc-500">Resonance profile (alpa_ti)</span>
        <span>3.0 Hz</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-28 w-full overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id="res-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#res-fill)" />
        <polyline points={polyline} fill="none" stroke="#60a5fa" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round" />
        {/* dominant freq marker */}
        {(() => {
          const peak = pts.reduce((a, b) => (a.amplitude > b.amplitude ? a : b));
          const px = toX(peak.freqHz);
          const py = toY(peak.amplitude);
          return (
            <g>
              <line x1={px} y1={py} x2={px} y2={H} stroke="#60a5fa" strokeWidth="0.75" strokeOpacity="0.4" strokeDasharray="3 2" />
              <circle cx={px} cy={py} r="3" fill="#60a5fa" />
              <text x={px + 4} y={py - 4} fontSize="7" fill="#93c5fd" fontFamily="monospace">
                {peak.freqHz} Hz
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
