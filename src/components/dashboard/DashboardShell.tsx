"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Sprout } from "lucide-react";
import { useSearchParams } from "next/navigation";

import dynamic from "next/dynamic";

import { SummaryCards } from "./SummaryCards";
import { GeneratorsTable } from "./GeneratorsTable";
import { ProcessorsTable } from "./ProcessorsTable";
import { GeneratorDetailPanel } from "./GeneratorDetailPanel";
import { ModelPerformance } from "./ModelPerformance";
import { EnforcementView } from "./EnforcementView";
import { InsightsView } from "./InsightsView";
import { LeadsView } from "./LeadsView";
import { BarChart } from "@/components/charts/BarChart";
import { Histogram } from "@/components/charts/Histogram";

import type { GeneratorPoint } from "@/lib/harvest-data";
import type { Enforcement, Insight, Lead, LeadTier } from "@/lib/types";

const GeneratorsMap = dynamic(
  () =>
    import("./GeneratorsMap").then(
      (m) => m.GeneratorsMap as React.ComponentType<GeneratorsMapProps>,
    ),
  { ssr: false },
);

interface GeneratorsMapProps {
  points: GeneratorPoint[];
  processors: Processor[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

import type {
  Generator,
  GeneratorDetail,
  ModelMetrics,
  PortfolioSummary,
  Processor,
  ThresholdStatus,
} from "@/lib/types";

const STATE_OPTIONS = ["all", "MA", "VT"];
const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "all", label: "All threshold statuses" },
  { value: "above", label: "Above threshold" },
  { value: "near", label: "Near threshold" },
  { value: "below", label: "Below threshold" },
];

const CATEGORY_OPTIONS = [
  "all",
  "Restaurant",
  "Grocery",
  "Cafeteria",
  "School",
  "College",
  "Hospital",
  "Prison",
  "FoodService",
  "Bakery",
  "FoodManufacturer",
  "Warehouse",
  "Lodging",
  "Other",
];

type Tab =
  | "leads"
  | "insights"
  | "generators"
  | "map"
  | "processors"
  | "enforcement"
  | "model";

interface Props {
  summary: PortfolioSummary;
  initialGenerators: Generator[];
  processors: Processor[];
  model: ModelMetrics;
  insights: Insight[];
  scatter: Array<{
    id: string;
    actual: number;
    predicted: number;
    stateId: string;
    category: string;
  }>;
  initialLeads: {
    total: number;
    items: Lead[];
  };
}

export function DashboardShell(props: Props) {
  const searchParams = useSearchParams();
  const queryState = searchParams.get("state")?.toUpperCase() ?? "all";
  const initialStateFilter = STATE_OPTIONS.includes(queryState) ? queryState : "all";

  const [tab, setTab] = useState<Tab>("leads");
  const [stateFilter, setStateFilter] = useState(initialStateFilter);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [leadStateFilter, setLeadStateFilter] = useState("all");
  const [leadTierFilter, setLeadTierFilter] = useState<"all" | LeadTier>("all");
  const [coveredOnly, setCoveredOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<GeneratorDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [rows, setRows] = useState(() =>
    initialStateFilter === "all"
      ? props.initialGenerators
      : props.initialGenerators.filter((g) => g.stateId === initialStateFilter),
  );
  const [rowsLoading, setRowsLoading] = useState(false);
  const [mapPoints, setMapPoints] = useState<GeneratorPoint[] | null>(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>(props.initialLeads.items);
  const [leadsTotal, setLeadsTotal] = useState(props.initialLeads.total);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [enforcement, setEnforcement] = useState<Enforcement | null>(null);
  const [enforcementLoading, setEnforcementLoading] = useState(false);

  async function ensureMapPoints() {
    if (mapPoints || mapLoading) return;
    setMapLoading(true);
    try {
      const res = await fetch("/api/generators/points");
      if (res.ok) {
        const data = (await res.json()) as GeneratorPoint[];
        setMapPoints(data);
      }
    } finally {
      setMapLoading(false);
    }
  }

  async function ensureEnforcement() {
    if (enforcement || enforcementLoading) return;
    setEnforcementLoading(true);
    try {
      const res = await fetch("/api/enforcement?full=1");
      if (res.ok) {
        const data = (await res.json()) as Enforcement;
        setEnforcement(data);
      }
    } finally {
      setEnforcementLoading(false);
    }
  }

  async function refreshLeads(next: {
    state?: string;
    tier?: "all" | LeadTier;
  }) {
    setLeadsLoading(true);
    const params = new URLSearchParams();
    const state = next.state ?? leadStateFilter;
    const tier = next.tier ?? leadTierFilter;
    if (state !== "all") params.set("state", state);
    if (tier !== "all") params.set("tier", tier);
    params.set("limit", "400");
    const res = await fetch(`/api/leads?${params.toString()}`);
    if (res.ok) {
      const data = (await res.json()) as { total: number; items: Lead[] };
      setLeads(data.items);
      setLeadsTotal(data.total);
    }
    setLeadsLoading(false);
  }

  function switchTab(next: Tab) {
    setTab(next);
    if (next === "map") void ensureMapPoints();
    if (next === "enforcement") void ensureEnforcement();
  }

  const hasCustomFilter =
    stateFilter !== "all" ||
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    coveredOnly ||
    search.length > 0;

  async function refreshRows(next: {
    state?: string;
    status?: string;
    category?: string;
    covered?: boolean;
    q?: string;
  }) {
    setRowsLoading(true);
    const params = new URLSearchParams();
    const s = next.state ?? stateFilter;
    const st = next.status ?? statusFilter;
    const c = next.category ?? categoryFilter;
    const cov = next.covered ?? coveredOnly;
    const q = next.q ?? search;
    if (s !== "all") params.set("state", s);
    if (st !== "all") params.set("status", st);
    if (c !== "all") params.set("category", c);
    if (cov) params.set("covered", "true");
    if (q) params.set("q", q);
    params.set("limit", "400");
    const res = await fetch(`/api/generators?${params.toString()}`);
    const data = (await res.json()) as { items: Generator[] };
    setRows(data.items);
    setRowsLoading(false);
  }

  async function openDetail(id: string) {
    setSelected(id);
    setDetailLoading(true);
    const res = await fetch(`/api/generators/${id}`);
    if (res.ok) {
      const data = (await res.json()) as GeneratorDetail;
      setDetail(data);
    } else {
      setDetail(null);
    }
    setDetailLoading(false);
  }

  function closeDetail() {
    setSelected(null);
    setDetail(null);
  }

  const stateBars = useMemo(
    () =>
      props.summary.byState.map((s) => ({
        label: s.stateId,
        value: s.tonsPerYear,
      })),
    [props.summary.byState],
  );
  const categoryBars = useMemo(
    () =>
      props.summary.byCategory.slice(0, 8).map((c) => ({
        label: c.category,
        value: c.tonsPerYear,
      })),
    [props.summary.byCategory],
  );
  const statusBars = useMemo(
    () =>
      props.summary.byStatus.map((t) => ({
        label: labelForStatus(t.status),
        value: t.generators,
        accent: t.status === "above" || t.status === "near",
      })),
    [props.summary.byStatus],
  );

  return (
    <div className="relative min-h-screen bg-un-cream-50 text-un-ink">
      <header className="border-b border-un-line bg-un-cream-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-display text-[19px] font-bold text-un-forest"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-un-sage-600">
              <Sprout className="h-4 w-4 text-white" strokeWidth={2.5} />
            </span>
            Unspoiled
            <span className="ml-3 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-un-sage-700 ring-1 ring-un-line">
              Operator console
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 rounded-full border border-un-line bg-white px-3 py-1.5 text-[12px] text-un-forest md:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-un-sage-500" />
              Model trained · val R² (log) ={" "}
              {props.model.final_val_r2_log.toFixed(3)}
            </span>
            <Link
              href="/"
              className="rounded-full border border-un-line bg-white px-4 py-1.5 text-[13px] font-semibold text-un-forest transition hover:border-un-forest"
            >
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-7">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-un-forest">
            Commercial Food-Waste Portfolio
          </h1>
          <p className="mt-1 text-[14px] text-un-ink-soft">
            {props.summary.totalGenerators.toLocaleString()} generators across{" "}
            {props.summary.byState.length} states (MA + VT in this dataset). Ban
            coverage, tonnage prediction, and processor routing in one view.
          </p>
        </div>

        <SummaryCards summary={props.summary} />

        <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-3">
          <Panel title="Tonnage by state">
            <BarChart
              data={stateBars}
              format={(v) =>
                v >= 1000 ? `${(v / 1000).toFixed(1)}k t` : `${Math.round(v)} t`
              }
            />
          </Panel>
          <Panel title="Top categories by tonnage">
            <BarChart
              data={categoryBars}
              format={(v) =>
                v >= 1000 ? `${(v / 1000).toFixed(1)}k t` : `${Math.round(v)} t`
              }
            />
          </Panel>
          <Panel title="Threshold status distribution">
            <BarChart data={statusBars} />
          </Panel>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-1 border-b border-un-line">
          <TabButton
            active={tab === "insights"}
            onClick={() => switchTab("insights")}
          >
            Insights
          </TabButton>
          <TabButton active={tab === "leads"} onClick={() => switchTab("leads")}>
            Leads
          </TabButton>
          <TabButton
            active={tab === "generators"}
            onClick={() => switchTab("generators")}
          >
            Generators
          </TabButton>
          <TabButton active={tab === "map"} onClick={() => switchTab("map")}>
            Map
          </TabButton>
          <TabButton
            active={tab === "processors"}
            onClick={() => switchTab("processors")}
          >
            Processor Network
          </TabButton>
          <TabButton
            active={tab === "enforcement"}
            onClick={() => switchTab("enforcement")}
          >
            Enforcement
          </TabButton>
          <TabButton
            active={tab === "model"}
            onClick={() => switchTab("model")}
          >
            Model
          </TabButton>
        </div>

        <div className="mt-5">
          {tab === "leads" && (
            <LeadsView
              items={leads}
              total={leadsTotal}
              loading={leadsLoading}
              stateFilter={leadStateFilter}
              tierFilter={leadTierFilter}
              onStateChange={(value) => {
                setLeadStateFilter(value);
                refreshLeads({ state: value });
              }}
              onTierChange={(value) => {
                setLeadTierFilter(value);
                refreshLeads({ tier: value });
              }}
            />
          )}

          {tab === "insights" && <InsightsView insights={props.insights} />}

          {tab === "generators" && (
            <div className="flex flex-col gap-4">
              <div className="rounded-3xl border border-un-line bg-white p-5">
                <div className="mb-3 flex items-baseline justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-widest text-un-sage-700">
                      Tonnage distribution
                    </div>
                    <div className="mt-1 text-[13px] text-un-ink-soft">
                      Heavy right tail: a handful of distribution centers
                      dwarf the median restaurant. We winsorize at p99.5
                      before training so the tail doesn&rsquo;t dominate MSE.
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-xl font-bold text-un-forest">
                      {(props.summary.totalTonsPerYear / 1000).toFixed(0)}k t
                    </div>
                    <div className="text-[11px] text-un-ink-soft">
                      total across {props.summary.totalGenerators.toLocaleString()} generators
                    </div>
                  </div>
                </div>
                <Histogram
                  values={rows.map((r) => r.tonsPerYear)}
                  xLabel="tons / year (log scale)"
                  fillColor="#7a9154"
                />
                <div className="mt-2 text-[11px] text-un-ink-soft">
                  Histogram is computed over the {rows.length.toLocaleString()} rows
                  currently shown in the table — change the filters to see
                  how the distribution shifts by state, category, or threshold.
                </div>
              </div>

              <div className="flex flex-wrap items-end gap-3">
                <FilterSelect
                  label="State"
                  value={stateFilter}
                  onChange={(v) => {
                    setStateFilter(v);
                    refreshRows({ state: v });
                  }}
                  options={STATE_OPTIONS.map((s) => ({
                    value: s,
                    label: s === "all" ? "All states" : s,
                  }))}
                />
                <FilterSelect
                  label="Threshold"
                  value={statusFilter}
                  onChange={(v) => {
                    setStatusFilter(v);
                    refreshRows({ status: v });
                  }}
                  options={STATUS_OPTIONS}
                />
                <FilterSelect
                  label="Category"
                  value={categoryFilter}
                  onChange={(v) => {
                    setCategoryFilter(v);
                    refreshRows({ category: v });
                  }}
                  options={CATEGORY_OPTIONS.map((c) => ({
                    value: c,
                    label: c === "all" ? "All categories" : c,
                  }))}
                />
                <label className="flex items-center gap-2 text-[12px] font-medium text-un-ink">
                  <input
                    type="checkbox"
                    checked={coveredOnly}
                    onChange={(e) => {
                      setCoveredOnly(e.target.checked);
                      refreshRows({ covered: e.target.checked });
                    }}
                    className="h-3.5 w-3.5 rounded border-un-line bg-white accent-un-sage-600"
                  />
                  Under active ban only
                </label>
                <div className="flex-1" />
                <input
                  placeholder="Search by town, name, or category…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      refreshRows({ q: e.currentTarget.value });
                  }}
                  onBlur={() => refreshRows({ q: search })}
                  className="w-72 rounded-full border border-un-line bg-white px-4 py-1.5 text-[13px] text-un-forest placeholder:text-un-ink-soft focus:border-un-sage-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 text-[12px] text-un-ink-soft">
                <span>
                  {rows.length.toLocaleString()} of{" "}
                  {props.summary.totalGenerators.toLocaleString()} generators
                  shown
                  {hasCustomFilter ? " (filtered)" : ""}
                </span>
                {rowsLoading && <span>· updating…</span>}
              </div>

              <GeneratorsTable
                items={rows}
                onSelect={openDetail}
                selectedId={selected}
              />
            </div>
          )}

          {tab === "map" && (
            <div className="flex flex-col gap-3">
              {mapLoading && !mapPoints && (
                <div className="rounded-2xl border border-un-line bg-white p-8 text-center text-[13px] text-un-ink-soft">
                  Loading{" "}
                  {props.summary.totalGenerators.toLocaleString()} generator
                  locations…
                </div>
              )}
              {mapPoints && (
                <GeneratorsMap
                  points={mapPoints}
                  processors={props.processors}
                  selectedId={selected}
                  onSelect={openDetail}
                />
              )}
            </div>
          )}

          {tab === "processors" && (
            <div className="flex flex-col gap-4">
              <div className="text-[13px] text-un-ink-soft">
                {props.processors.length.toLocaleString()} qualified food-scrap
                processors (MA + VT): composters, anaerobic digesters, animal
                feed operations, and transfer stations accepting food scraps.
              </div>
              <ProcessorsTable items={props.processors} />
            </div>
          )}

          {tab === "enforcement" && (
            <div className="flex flex-col gap-4">
              {enforcementLoading && !enforcement && (
                <div className="rounded-2xl border border-un-line bg-white p-8 text-center text-[13px] text-un-ink-soft">
                  Loading enforcement log…
                </div>
              )}
              {enforcement && <EnforcementView data={enforcement} />}
            </div>
          )}

          {tab === "model" && (
            <ModelPerformance metrics={props.model} scatter={props.scatter} />
          )}
        </div>
      </main>

      {(selected || detail) && (
        <GeneratorDetailPanel
          detail={detail}
          loading={detailLoading}
          onClose={closeDetail}
        />
      )}
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

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px border-b-2 px-4 py-2 text-[13px] font-semibold transition ${
        active
          ? "border-un-coral-500 text-un-forest"
          : "border-transparent text-un-ink-soft hover:text-un-forest"
      }`}
    >
      {children}
    </button>
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
          <option
            key={o.value}
            value={o.value}
            className="bg-white text-un-forest"
          >
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function labelForStatus(s: ThresholdStatus): string {
  if (s === "above") return "Above";
  if (s === "near") return "Near";
  return "Below";
}
