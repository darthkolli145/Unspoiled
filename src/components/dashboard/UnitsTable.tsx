"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, TrendingDown, TrendingUp, Minus, Zap } from "lucide-react";
import type { BuildingSummary } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";

const STRUCTURE_LABELS: Record<string, string> = {
  rc_shear_wall: "RC Shear",
  steel_moment:  "Steel Moment",
  cft:           "CFT",
  masonry:       "Masonry",
};

function TrendIcon({ trend }: { trend: BuildingSummary["trend"] }) {
  if (trend === "rising")  return <span className="inline-flex items-center gap-1 text-red-400"><TrendingUp className="h-3.5 w-3.5" /><span className="text-xs">rising</span></span>;
  if (trend === "falling") return <span className="inline-flex items-center gap-1 text-emerald-400"><TrendingDown className="h-3.5 w-3.5" /><span className="text-xs">falling</span></span>;
  return <span className="inline-flex items-center gap-1 text-zinc-500"><Minus className="h-3.5 w-3.5" /><span className="text-xs">stable</span></span>;
}

function fmtPremium(n: number) {
  return `$${n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n}/mo`;
}
function fmtPayout(n: number) {
  return `$${n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : `${(n / 1000).toFixed(0)}K`}`;
}

interface Props {
  summaries: BuildingSummary[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function UnitsTable({ summaries, loading, selectedId, onSelect }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/50 backdrop-blur">
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-800 hover:bg-transparent">
            <TableHead className="w-1" />
            <TableHead className="text-xs font-medium uppercase tracking-wider text-zinc-500">Address</TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wider text-zinc-500">City</TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wider text-zinc-500">Structure</TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wider text-zinc-500">Floors</TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wider text-zinc-500">Risk Score</TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wider text-zinc-500">Premium</TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wider text-zinc-500">Payout Cap</TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wider text-zinc-500">Trend</TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wider text-zinc-500">Status</TableHead>
            <TableHead className="w-8" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i} className="border-zinc-800">
                  <TableCell colSpan={11}><Skeleton className="h-6 w-full bg-zinc-800" /></TableCell>
                </TableRow>
              ))
            : summaries.map((s) => {
                const { building, risk, pricing, trend, payoutTriggered } = s;
                const isSelected = selectedId === building.id;
                const stripe = risk.level === "critical" ? "bg-red-500"
                  : risk.level === "elevated" ? "bg-amber-400"
                  : "bg-transparent";
                return (
                  <TableRow
                    key={building.id}
                    onClick={() => onSelect(building.id)}
                    className={cn(
                      "relative cursor-pointer border-zinc-800 transition-colors",
                      risk.level === "critical" && "hover:bg-red-500/5",
                      risk.level === "elevated" && "hover:bg-amber-500/5",
                      (risk.level === "moderate" || risk.level === "low") && "hover:bg-zinc-900/60",
                      isSelected && "bg-blue-500/8 hover:bg-blue-500/12",
                    )}
                  >
                    <TableCell className="relative p-0">
                      <span className={cn("absolute inset-y-0 left-0 w-0.5", stripe)} />
                      <div className="flex items-center justify-center pl-2">
                        {risk.level === "critical" && (
                          <span className="relative inline-flex h-2 w-2">
                            <span className="absolute inset-0 animate-ping rounded-full bg-red-500 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                          </span>
                        )}
                        {payoutTriggered && risk.level !== "critical" && (
                          <Zap className="h-3 w-3 text-amber-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-zinc-100 max-w-[160px] truncate">{building.address}</TableCell>
                    <TableCell className="text-zinc-400 text-sm">{building.city}</TableCell>
                    <TableCell className="text-zinc-500 text-xs">{STRUCTURE_LABELS[building.structureType]}</TableCell>
                    <TableCell className="font-mono text-sm tabular-nums text-zinc-400">{building.floors}F</TableCell>
                    <TableCell>
                      <span className={cn(
                        "font-mono text-sm font-semibold tabular-nums",
                        risk.level === "critical" ? "text-red-400"
                        : risk.level === "elevated" ? "text-amber-400"
                        : risk.level === "moderate" ? "text-yellow-400"
                        : "text-emerald-400",
                      )}>
                        {risk.score.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-sm tabular-nums text-zinc-300">{fmtPremium(pricing.premiumUsdMonth)}</TableCell>
                    <TableCell className="font-mono text-sm tabular-nums text-zinc-400">{fmtPayout(pricing.payoutCapUsd)}</TableCell>
                    <TableCell><TrendIcon trend={trend} /></TableCell>
                    <TableCell><StatusBadge level={risk.level} /></TableCell>
                    <TableCell className="text-right">
                      <ChevronRight className={cn("h-4 w-4 text-zinc-600 transition", isSelected && "translate-x-0.5 text-blue-400")} />
                    </TableCell>
                  </TableRow>
                );
              })}
        </TableBody>
      </Table>
    </div>
  );
}
