"use client";

import { processorTitle } from "@/lib/display";
import type { Processor } from "@/lib/types";

export function ProcessorsTable({ items }: { items: Processor[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-un-line bg-white">
      <table className="w-full text-left text-[13px]">
        <thead className="bg-un-cream-100 text-[11px] uppercase tracking-wider text-un-ink-soft">
          <tr>
            <th className="px-3 py-2.5 font-semibold">Permit</th>
            <th className="px-3 py-2.5 font-semibold">Facility</th>
            <th className="px-3 py-2.5 font-semibold">Type</th>
            <th className="px-3 py-2.5 font-semibold">Town</th>
            <th className="px-3 py-2.5 font-semibold">State</th>
            <th className="px-3 py-2.5 text-right font-semibold">Latitude</th>
            <th className="px-3 py-2.5 text-right font-semibold">Longitude</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr
              key={p.id}
              className="border-t border-un-line/70 hover:bg-un-cream-100/80"
            >
              <td className="px-3 py-2 font-mono font-semibold text-un-forest">
                {p.id}
              </td>
              <td className="max-w-[260px] truncate px-3 py-2 text-un-forest">
                {processorTitle(p)}
              </td>
              <td className="px-3 py-2 text-un-ink">{p.processorType}</td>
              <td className="px-3 py-2 text-un-ink">{p.town}</td>
              <td className="px-3 py-2 font-mono text-un-ink-soft">
                {p.stateId}
              </td>
              <td className="px-3 py-2 text-right font-mono text-un-ink-soft">
                {p.lat.toFixed(4)}
              </td>
              <td className="px-3 py-2 text-right font-mono text-un-ink-soft">
                {p.lon.toFixed(4)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
