"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal } from "lucide-react";

export interface PortfolioFilters {
  city: string;
  level: string;
}

interface FilterBarProps {
  filters: PortfolioFilters;
  onChange: (f: PortfolioFilters) => void;
}

const CITIES = ["San Francisco", "Los Angeles", "Seattle"];
const LEVELS = [
  { value: "critical", label: "Critical" },
  { value: "elevated", label: "Elevated" },
  { value: "moderate", label: "Moderate" },
  { value: "low",      label: "Low"      },
];

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const cls = "w-40 rounded-lg border-zinc-800 bg-zinc-900/60 text-zinc-200 hover:bg-zinc-900 focus-visible:border-blue-500/50";
  const content = "border-zinc-800 bg-zinc-950";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-xs font-medium text-zinc-400">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filter
      </div>
      <Select value={filters.city} onValueChange={(v: string | null) => onChange({ ...filters, city: v ?? "all" })}>
        <SelectTrigger className={cls}><SelectValue placeholder="City" /></SelectTrigger>
        <SelectContent className={content}>
          <SelectItem value="all">All cities</SelectItem>
          {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={filters.level} onValueChange={(v: string | null) => onChange({ ...filters, level: v ?? "all" })}>
        <SelectTrigger className={cls}><SelectValue placeholder="Risk level" /></SelectTrigger>
        <SelectContent className={content}>
          <SelectItem value="all">All risk levels</SelectItem>
          {LEVELS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
