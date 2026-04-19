"use client";

import { ThresholdBadge, CoveredBadge } from "./ComplianceBadge";
import type { Generator } from "@/lib/types";

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toFixed(n >= 10 ? 0 : 1);
}

function fmtOptional(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return fmt(n);
}

export function GeneratorsTable({
  items,
  onSelect,
  selectedId,
}: {
  items: Generator[];
  onSelect: (id: string) => void;
  selectedId: string | null;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-un-line bg-white">
      <table className="w-full text-left text-[13px]">
        <thead className="bg-un-cream-100 text-[11px] uppercase tracking-wider text-un-ink-soft">
          <tr>
            <th className="px-3 py-2.5 font-semibold">Registration</th>
            <th className="px-3 py-2.5 font-semibold">Town</th>
            <th className="px-3 py-2.5 font-semibold">State</th>
            <th className="px-3 py-2.5 font-semibold">Category</th>
            <th className="px-3 py-2.5 text-right font-semibold">Actual t/yr</th>
            <th className="px-3 py-2.5 text-right font-semibold">Predicted</th>
            <th className="px-3 py-2.5 text-right font-semibold">Diverted*</th>
            <th className="px-3 py-2.5 text-right font-semibold">Processor</th>
            <th className="px-3 py-2.5 font-semibold">Ban</th>
            <th className="px-3 py-2.5 font-semibold">Threshold</th>
          </tr>
        </thead>
        <tbody>
          {items.map((g) => {
            const selected = selectedId === g.id;
            return (
              <tr
                key={g.id}
                onClick={() => onSelect(g.id)}
                className={`cursor-pointer border-t border-un-line/70 transition-colors ${
                  selected ? "bg-un-sage-100" : "hover:bg-un-cream-100/80"
                }`}
              >
                <td className="max-w-[180px] truncate px-3 py-2 font-mono font-semibold text-un-forest">
                  {g.id}
                </td>
                <td className="px-3 py-2 text-un-ink">{g.town}</td>
                <td className="px-3 py-2 font-mono text-un-ink-soft">
                  {g.stateId}
                </td>
                <td className="px-3 py-2 text-un-ink">{g.category}</td>
                <td className="px-3 py-2 text-right font-mono text-un-forest">
                  {fmt(g.tonsPerYear)}
                </td>
                <td className="px-3 py-2 text-right font-mono text-un-ink-soft">
                  {fmt(g.predictedTonsPerYear)}
                </td>
                <td className="px-3 py-2 text-right font-mono text-un-sage-700">
                  {fmtOptional(g.divertedTonsPerYear)}
                </td>
                <td className="px-3 py-2 text-right font-mono text-un-ink-soft">
                  {g.nearestProcessorMiles.toFixed(1)} mi
                </td>
                <td className="px-3 py-2">
                  <CoveredBadge covered={g.coveredByBan} />
                </td>
                <td className="px-3 py-2">
                  <ThresholdBadge status={g.thresholdStatus} />
                </td>
              </tr>
            );
          })}
          {items.length === 0 && (
            <tr>
              <td
                colSpan={10}
                className="px-3 py-8 text-center text-un-ink-soft"
              >
                No generators match the current filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="border-t border-un-line bg-un-cream-50 px-4 py-2 text-[11px] text-un-ink-soft">
        * Diverted tons = tons × composting_effect from the Dryad study. Blank
        when the study records no composting_effect for that state (MA, CA, RI).
      </div>
    </div>
  );
}
