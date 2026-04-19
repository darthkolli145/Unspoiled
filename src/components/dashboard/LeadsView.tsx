"use client";

import { useMemo } from "react";
import { Download } from "lucide-react";

import { ThresholdBadge } from "./ComplianceBadge";
import { generatorTitle, isRedactedName } from "@/lib/display";
import type { Lead, LeadTier } from "@/lib/types";

const STATE_OPTIONS = ["all", "MA", "VT"] as const;
const TIER_OPTIONS: Array<{ value: "all" | LeadTier; label: string }> = [
  { value: "all", label: "All tiers" },
  { value: "A", label: "Tier A" },
  { value: "B", label: "Tier B" },
  { value: "C", label: "Tier C" },
];

interface Props {
  items: Lead[];
  total: number;
  loading: boolean;
  stateFilter: string;
  tierFilter: "all" | LeadTier;
  onStateChange: (value: string) => void;
  onTierChange: (value: "all" | LeadTier) => void;
}

function tierClass(tier: LeadTier): string {
  if (tier === "A") return "bg-un-forest text-white";
  if (tier === "B") return "bg-un-gold-200 text-un-forest ring-1 ring-un-gold-400/40";
  return "bg-un-cream-200 text-un-ink-soft ring-1 ring-un-line";
}

export function LeadsView(props: Props) {
  const aCount = useMemo(
    () => props.items.filter((lead) => lead.leadTier === "A").length,
    [props.items],
  );
  const bCount = useMemo(
    () => props.items.filter((lead) => lead.leadTier === "B").length,
    [props.items],
  );
  const cCount = useMemo(
    () => props.items.filter((lead) => lead.leadTier === "C").length,
    [props.items],
  );
  const maEnforcementHeavy = useMemo(
    () =>
      props.items.filter(
        (lead) => lead.stateId === "MA" && lead.townEnforcementActions >= 10,
      ).length,
    [props.items],
  );

  const exportHref = useMemo(() => {
    const params = new URLSearchParams();
    if (props.stateFilter !== "all") params.set("state", props.stateFilter);
    if (props.tierFilter !== "all") params.set("tier", props.tierFilter);
    return `/api/leads/export?${params.toString()}`;
  }, [props.stateFilter, props.tierFilter]);

  const processorLabel = (lead: Lead) =>
    isRedactedName(lead.nearestProcessorName)
      ? `${lead.nearestProcessorType} · ${lead.stateId}`
      : lead.nearestProcessorName;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-3xl border border-un-line bg-white p-5">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-un-sage-700">
          How scoring works
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-un-ink-soft">
          `+40 covered_by_ban`, `+20 near_threshold`, `+min(log10(tons+1)*10,
          30)`, `-min(nearest_processor_miles, 20)`, and in MA `+min(town
          enforcement actions, 10)*1.5`. Scores are clamped to 0-100 and tiered
          as A (70+), B (50-69.9), C (&lt;50).
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <LeadStat label="A tier count" value={aCount.toLocaleString()} />
        <LeadStat label="B tier count" value={bCount.toLocaleString()} />
        <LeadStat label="C tier count" value={cCount.toLocaleString()} />
        <LeadStat
          label="MA enforcement-heavy"
          value={maEnforcementHeavy.toLocaleString()}
        />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <FilterSelect
          label="State"
          value={props.stateFilter}
          onChange={props.onStateChange}
          options={STATE_OPTIONS.map((s) => ({
            value: s,
            label: s === "all" ? "All states" : s,
          }))}
        />
        <FilterSelect
          label="Tier"
          value={props.tierFilter}
          onChange={(value) => props.onTierChange(value as "all" | LeadTier)}
          options={TIER_OPTIONS}
        />
        <div className="flex-1" />
        <a
          href={exportHref}
          className="inline-flex items-center gap-1 rounded-full bg-un-forest px-4 py-2 text-[13px] font-semibold text-white transition hover:-translate-y-px"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </a>
      </div>

      <div className="text-[12px] text-un-ink-soft">
        {props.total.toLocaleString()} leads in current filter
        {props.loading ? " · updating…" : ""}
      </div>

      <div className="overflow-x-auto rounded-3xl border border-un-line bg-white">
        <table className="min-w-full border-collapse text-left text-[13px]">
          <thead className="bg-un-cream-100/70 text-[11px] uppercase tracking-widest text-un-sage-700">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Generator</th>
              <th className="px-4 py-3">Town</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Tons / yr</th>
              <th className="px-4 py-3">Nearest processor</th>
              <th className="px-4 py-3">Threshold</th>
              <th className="px-4 py-3">Enforcement</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Tier</th>
            </tr>
          </thead>
          <tbody>
            {props.items.map((lead, idx) => (
              <tr key={lead.id} className="border-t border-un-line/80 align-top">
                <td className="px-4 py-3 font-mono text-[12px] text-un-ink-soft">
                  {idx + 1}
                </td>
                <td className="px-4 py-3 font-medium text-un-forest">
                  {generatorTitle(lead)}
                </td>
                <td className="px-4 py-3 text-un-ink-soft">
                  {lead.town}, {lead.stateId}
                </td>
                <td className="px-4 py-3 text-un-ink-soft">{lead.category}</td>
                <td className="px-4 py-3 text-un-ink-soft">
                  {lead.tonsPerYear.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-un-ink-soft">
                  <div>{processorLabel(lead)}</div>
                  <div className="text-[11px]">
                    {lead.nearestProcessorMiles.toFixed(1)} mi
                  </div>
                </td>
                <td className="px-4 py-3">
                  <ThresholdBadge status={lead.thresholdStatus} />
                </td>
                <td className="px-4 py-3 text-un-ink-soft">
                  {lead.townEnforcementActions.toLocaleString()}
                </td>
                <td className="px-4 py-3 font-semibold text-un-forest">
                  {lead.leadScore.toFixed(1)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${tierClass(lead.leadTier)}`}
                  >
                    Tier {lead.leadTier}
                  </span>
                </td>
              </tr>
            ))}
            {props.items.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-un-ink-soft">
                  No leads match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LeadStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-un-line bg-white px-4 py-3">
      <div className="font-display text-2xl font-bold text-un-forest">{value}</div>
      <div className="text-[11px] font-semibold uppercase tracking-widest text-un-sage-700">
        {label}
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-widest text-un-sage-700">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-full border border-un-line bg-white px-3 py-1.5 text-[13px] font-normal normal-case tracking-normal text-un-forest focus:border-un-sage-500 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
