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
        <div className="flex items-center justify-between gap-4">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-un-sage-700">
            How scoring works
          </div>
          <div className="hidden font-mono text-[10.5px] text-un-ink-soft md:block">
            clamp(0, 100)
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-stretch gap-2 text-[12.5px]">
          <EqChip variant="label">Score</EqChip>
          <EqOp>=</EqOp>
          <EqTerm
            sign="+"
            formula="40"
            note="if covered_by_ban"
            body="bg-un-forest text-white"
            signCls="bg-un-sage-300 text-un-forest"
          />
          <EqTerm
            sign="+"
            formula="20"
            note="if near_threshold"
            body="bg-un-sage-100 text-un-forest"
            signCls="bg-un-sage-300 text-un-forest"
          />
          <EqTerm
            sign="+"
            formula={
              <>
                min<span className="text-un-forest/70">(</span>log
                <sub className="font-mono text-[9px]">10</sub>(tons + 1) × 10,
                30<span className="text-un-forest/70">)</span>
              </>
            }
            note="tonnage signal"
            body="bg-un-gold-200 text-un-forest"
            signCls="bg-un-gold-400 text-un-forest"
          />
          <EqTerm
            sign="−"
            formula={
              <>
                min<span className="text-white/80">(</span>miles, 20
                <span className="text-white/80">)</span>
              </>
            }
            note="routing penalty"
            body="bg-un-coral-500 text-white"
            signCls="bg-un-coral-600 text-white"
          />
          <EqTerm
            sign="+"
            formula={
              <>
                min<span className="text-un-forest/70">(</span>actions, 10
                <span className="text-un-forest/70">)</span> × 1.5
              </>
            }
            note="enforcement urgency"
            body="bg-un-pink-200 text-un-forest"
            signCls="bg-un-pink-300 text-un-forest"
            badge="MA only"
          />
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-[10.5px] font-semibold uppercase tracking-widest text-un-sage-700">
            <span>Clamp 0 → 100</span>
            <span>Tier cutoffs</span>
          </div>
          <div className="mt-2 flex h-7 overflow-hidden rounded-full border border-un-line">
            <div className="flex w-[70%] items-center justify-center bg-un-cream-200 text-[11px] font-semibold text-un-ink-soft">
              Tier C
            </div>
            <div className="flex w-[5%] items-center justify-center bg-un-gold-200 text-[11px] font-semibold text-un-forest">
              B
            </div>
            <div className="flex w-[25%] items-center justify-center bg-un-forest text-[11px] font-semibold text-white">
              Tier A
            </div>
          </div>
          <div className="mt-1.5 grid grid-cols-[70fr_5fr_25fr] font-mono text-[10px] text-un-ink-soft">
            <div className="flex items-center justify-between pr-1">
              <span>0</span>
              <span>&lt; 70</span>
            </div>
            <div className="text-center">70–74.9</div>
            <div className="flex items-center justify-between pl-1">
              <span>≥ 75</span>
              <span>100</span>
            </div>
          </div>
        </div>
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

function EqChip({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "label";
}) {
  const base =
    "inline-flex items-center rounded-2xl px-3 py-2 font-display font-bold";
  if (variant === "label") {
    return (
      <span className={`${base} bg-un-forest text-white shadow-sm`}>
        {children}
      </span>
    );
  }
  return (
    <span className={`${base} bg-un-cream-100 text-un-forest ring-1 ring-un-line`}>
      {children}
    </span>
  );
}

function EqOp({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center justify-center self-center text-[18px] font-bold text-un-ink-soft">
      {children}
    </span>
  );
}

function EqTerm({
  sign,
  formula,
  note,
  body,
  signCls,
  badge,
}: {
  sign: "+" | "−";
  formula: React.ReactNode;
  note: string;
  body: string;
  signCls: string;
  badge?: string;
}) {
  return (
    <span
      className={`relative inline-flex items-stretch overflow-hidden rounded-2xl ring-1 ring-un-line/60 ${body}`}
    >
      <span
        className={`flex w-8 items-center justify-center font-display text-[18px] font-bold ${signCls}`}
        aria-hidden
      >
        {sign}
      </span>
      <span className="flex flex-col px-3 py-1.5">
        <span className="font-mono text-[12.5px] leading-tight">{formula}</span>
        <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest opacity-80">
          {note}
        </span>
      </span>
      {badge ? (
        <span className="absolute -right-1 -top-1 rounded-full bg-un-coral-500 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-widest text-white shadow-sm">
          {badge}
        </span>
      ) : null}
    </span>
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
