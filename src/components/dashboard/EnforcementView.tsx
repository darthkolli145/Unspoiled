"use client";

import { useMemo, useState } from "react";
import { Gavel, Info } from "lucide-react";

import { BarChart } from "@/components/charts/BarChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { Sparkline } from "@/components/charts/Sparkline";
import type { Enforcement } from "@/lib/types";

function fmtUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}

export function EnforcementView({ data }: { data: Enforcement }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const yearBars = useMemo(
    () =>
      data.byYear.map((r) => ({
        label: String(r.year),
        value: r.actions,
      })),
    [data.byYear],
  );

  const townBars = useMemo(
    () =>
      data.byTown.slice(0, 12).map((r) => ({
        label: r.town,
        value: r.actions,
        accent: r.actionsWithPenalty > 0,
      })),
    [data.byTown],
  );

  const typeDonut = useMemo(() => {
    const palette = ["#c93823", "#e8623d", "#edbd5c", "#7a9154"];
    return data.byType.map((r, i) => ({
      label: r.type,
      value: r.actions,
      color: palette[i % palette.length],
    }));
  }, [data.byType]);

  const yearSpark = useMemo(
    () => data.byYear.map((r) => ({ x: r.year, y: r.actions })),
    [data.byYear],
  );

  const filteredRecords = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return data.records
      .filter((r) => typeFilter === "all" || r.enforcementType === typeFilter)
      .filter((r) => {
        if (!needle) return true;
        return (
          r.comment.toLowerCase().includes(needle) ||
          r.mentionedTowns.some((t) => t.toLowerCase().includes(needle))
        );
      })
      .slice(0, 300);
  }, [data.records, search, typeFilter]);

  const cards = [
    {
      label: "Total actions",
      value: data.totalActions.toLocaleString(),
      hint: data.yearsCovered
        ? `Range ${data.yearsCovered[0]}–${data.yearsCovered[1]}`
        : "",
      bg: "bg-un-gold-200",
    },
    {
      label: "Notices of Non-Compliance",
      value: (
        data.byType.find((t) => t.type === "Notice Of Non-Compliance")?.actions ?? 0
      ).toLocaleString(),
      hint: "Most common action type",
      bg: "bg-un-sage-100",
    },
    {
      label: "Actions with a penalty",
      value: data.actionsWithPenalty.toLocaleString(),
      hint: `${fmtUsd(data.totalPenaltyUsd)} total assessed`,
      bg: "bg-un-pink-200",
    },
    {
      label: "MA towns mentioned",
      value: `${data.townsMentioned}`,
      hint: `Out of ${data.townsGazetteerSize.toLocaleString()} towns in the roster`,
      bg: "bg-un-cream-200",
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl bg-un-forest p-5 text-un-cream-100">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-un-cream-100/70">
          <Info className="h-3.5 w-3.5" />
          Redaction-safe signal
        </div>
        <p className="mt-1 text-[14px] leading-relaxed text-un-cream-100/90">
          <span className="font-mono">wb_enforcements.csv</span> redacts every
          SiteName, Municipality, and DocumentNumber. Everything below is
          strictly a <strong>town-level</strong> rollup: we parse the free-text
          Comment field for MA towns that appear in the MA generator roster,
          then aggregate counts, penalties, years, and types. We never claim a
          specific business received a notice.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`rounded-2xl ${c.bg} p-5 ring-1 ring-un-line`}
          >
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-un-forest/65">
              <Gavel className="h-3 w-3" />
              {c.label}
            </div>
            <div className="mt-2 font-display text-2xl font-bold text-un-forest">
              {c.value}
            </div>
            <div className="mt-1 text-[12px] text-un-forest/75">{c.hint}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.2fr_1fr]">
        <Panel title="Actions per year (2016–2021)">
          <Sparkline
            data={yearSpark}
            color="#e8623d"
            xLabelFirst={String(yearSpark[0]?.x ?? "")}
            xLabelLast={String(yearSpark[yearSpark.length - 1]?.x ?? "")}
          />
          <div className="mt-3">
            <BarChart data={yearBars} />
          </div>
        </Panel>
        <Panel title="Actions by enforcement type">
          <DonutChart data={typeDonut} />
        </Panel>
      </div>

      <Panel title="Top 12 towns by mentioned enforcement actions">
        <BarChart data={townBars} />
        <div className="mt-2 text-[11px] text-un-ink-soft">
          Coral bar = the town has at least one action with a non-zero penalty.
        </div>
      </Panel>

      <div className="rounded-3xl border border-un-line bg-white p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-un-sage-700">
              Enforcement log
            </div>
            <div className="mt-1 text-[13px] text-un-ink-soft">
              Redaction-safe rows from wb_enforcements.csv. Showing up to 300
              most recent matches.
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-full border border-un-line bg-white px-3 py-1.5 text-[13px] text-un-forest focus:border-un-sage-500 focus:outline-none"
            >
              <option value="all">All types</option>
              {data.byType.map((t) => (
                <option key={t.type} value={t.type}>
                  {t.type} ({t.actions})
                </option>
              ))}
            </select>
            <input
              placeholder="Search comment / town"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 rounded-full border border-un-line bg-white px-4 py-1.5 text-[13px] text-un-forest placeholder:text-un-ink-soft focus:border-un-sage-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-un-line">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-un-cream-100 text-[11px] uppercase tracking-wider text-un-ink-soft">
              <tr>
                <th className="px-3 py-2.5 font-semibold">Year</th>
                <th className="px-3 py-2.5 font-semibold">Type</th>
                <th className="px-3 py-2.5 font-semibold">Program</th>
                <th className="px-3 py-2.5 text-right font-semibold">
                  Penalty
                </th>
                <th className="px-3 py-2.5 font-semibold">Mentioned town(s)</th>
                <th className="px-3 py-2.5 font-semibold">Comment</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r, i) => (
                <tr
                  key={i}
                  className="border-t border-un-line/70 hover:bg-un-cream-100/60"
                >
                  <td className="px-3 py-2 font-mono text-un-ink-soft">
                    {r.year ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-un-forest">
                    {r.enforcementType}
                  </td>
                  <td className="px-3 py-2 font-mono text-un-ink-soft">
                    {r.programCategory}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-un-sage-700">
                    {r.penaltyUsd > 0 ? fmtUsd(r.penaltyUsd) : "—"}
                  </td>
                  <td className="px-3 py-2 text-un-ink">
                    {r.mentionedTowns.length > 0
                      ? r.mentionedTowns.join(", ")
                      : <span className="text-un-ink-soft">—</span>}
                  </td>
                  <td className="max-w-[480px] px-3 py-2 text-un-ink-soft">
                    <span className="line-clamp-2">{r.comment || "—"}</span>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-8 text-center text-un-ink-soft"
                  >
                    No enforcement records match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-un-line bg-white p-5">
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-un-sage-700">
        {title}
      </div>
      {children}
    </div>
  );
}
