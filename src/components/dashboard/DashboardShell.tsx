"use client";

import { useEffect, useState, useCallback } from "react";
import type { BuildingSummary } from "@/lib/types";
import { SummaryCards } from "./SummaryCards";
import { FilterBar, type PortfolioFilters } from "./FilterBar";
import { UnitsTable } from "./UnitsTable";
import { BuildingDetailPanel } from "@/components/detail/DetailPanel";
import { RefreshCw } from "lucide-react";

export function DashboardShell() {
  const [all, setAll] = useState<BuildingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filters, setFilters] = useState<PortfolioFilters>({ city: "all", level: "all" });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPortfolio = useCallback(async () => {
    try {
      const params = new URLSearchParams({ city: filters.city, level: filters.level });
      const res = await fetch(`/api/portfolio?${params}`);
      const data: BuildingSummary[] = await res.json();
      setAll(data);
      setLastUpdated(new Date());
    } catch {
      // keep stale data
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPortfolio();
    const id = setInterval(fetchPortfolio, 60_000);
    return () => clearInterval(id);
  }, [fetchPortfolio]);

  const selected = all.find((s) => s.building.id === selectedId) ?? null;

  return (
    <div className="space-y-5">
      <SummaryCards summaries={all} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterBar filters={filters} onChange={setFilters} />
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span className="tabular-nums">{all.length} structures</span>
          <span className="h-3 w-px bg-zinc-800" />
          <span className="inline-flex items-center gap-1.5">
            <RefreshCw className="h-3 w-3" />
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : "Loading…"}
          </span>
        </div>
      </div>

      <UnitsTable
        summaries={all}
        loading={loading}
        selectedId={selectedId}
        onSelect={(id) => setSelectedId(selectedId === id ? null : id)}
      />

      <BuildingDetailPanel
        selected={selected}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
