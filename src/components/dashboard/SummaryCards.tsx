"use client";

import { Activity, AlertTriangle, DollarSign, Zap } from "lucide-react";
import type { BuildingSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SummaryCards({ summaries }: { summaries: BuildingSummary[] }) {
  const critical  = summaries.filter((s) => s.risk.level === "critical").length;
  const elevated  = summaries.filter((s) => s.risk.level === "elevated").length;
  const triggered = summaries.filter((s) => s.payoutTriggered).length;
  const totalPremium = summaries.reduce((sum, s) => sum + s.pricing.premiumUsdMonth, 0);

  const cards = [
    { label: "Portfolio",      value: String(summaries.length), hint: "Monitored structures",      icon: Activity,      tone: "blue"    as const },
    { label: "Critical risk",  value: String(critical),         hint: `+${elevated} elevated`,     icon: AlertTriangle, tone: "red"     as const },
    { label: "Payouts active", value: String(triggered),        hint: "Triggered this period",     icon: Zap,           tone: "amber"   as const },
    { label: "Monthly GWP",    value: `$${(totalPremium/1000).toFixed(0)}K`, hint: "Gross written premium", icon: DollarSign, tone: "emerald" as const },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {cards.map((c) => <MetricCard key={c.label} {...c} />)}
    </div>
  );
}

type Tone = "blue" | "red" | "amber" | "emerald";

function MetricCard({ label, value, hint, icon: Icon, tone }: {
  label: string; value: string; hint: string;
  icon: typeof Activity; tone: Tone;
}) {
  const glowMap: Record<Tone, string> = {
    blue:    "from-blue-500/15 to-blue-500/0",
    red:     "from-red-500/15 to-red-500/0",
    amber:   "from-amber-500/15 to-amber-500/0",
    emerald: "from-emerald-500/15 to-emerald-500/0",
  };
  const iconMap: Record<Tone, string> = {
    blue:    "text-blue-400 bg-blue-500/10 ring-blue-500/20",
    red:     "text-red-400 bg-red-500/10 ring-red-500/20",
    amber:   "text-amber-400 bg-amber-500/10 ring-amber-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 ring-emerald-500/20",
  };
  const valueMap: Record<Tone, string> = {
    blue: "text-zinc-100", red: "text-red-300", amber: "text-amber-300", emerald: "text-emerald-300",
  };
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-5 transition hover:border-zinc-700">
      <div className={cn("pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br opacity-60 blur-2xl", glowMap[tone])} />
      <div className="relative flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{label}</span>
        <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg ring-1 ring-inset", iconMap[tone])}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className={cn("relative mt-4 text-3xl font-semibold tracking-tight tabular-nums", valueMap[tone])}>{value}</div>
      <div className="relative mt-1 text-xs text-zinc-500">{hint}</div>
    </div>
  );
}
