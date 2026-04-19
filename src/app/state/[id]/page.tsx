import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Cite } from "@/components/marketing/Cite";
import { Provenance } from "@/components/marketing/Provenance";
import {
  getBans,
  getEnforcement,
  getEvidence,
  getPortfolioSummary,
  queryGenerators,
} from "@/lib/harvest-data";

export const revalidate = 300;

const STATE_NAMES: Record<string, string> = {
  MA: "Massachusetts",
  VT: "Vermont",
  CT: "Connecticut",
  CA: "California",
  RI: "Rhode Island",
};

const STATE_LAW_CITE: Record<string, string> = {
  MA: "massdep-waste-ban",
  VT: "vermont-universal-recycling",
  CT: "ct-commercial-organics",
  CA: "calrecycle-organics",
  RI: "ri-food-scrap-ban",
};

function fmtTons(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k t`;
  return `${Math.round(n)} t`;
}

function getStateContext(id: string) {
  const stateId = id.toUpperCase();
  const bans = getBans().filter((b) => b.stateId === stateId);
  if (bans.length === 0) return null;

  const latestBan = bans.reduce((best, current) =>
    current.year > best.year ? current : best,
  );
  const summary = getPortfolioSummary();
  const stateSummary = summary.byState.find((s) => s.stateId === stateId) ?? null;
  const evidence = getEvidence();
  const effects = evidence.stateEffects.find((s) => s.stateId === stateId) ?? null;
  const topGenerators = queryGenerators({
    state: stateId,
    sort: "tons",
    order: "desc",
    limit: 10,
  }).items;

  return {
    stateId,
    stateName: STATE_NAMES[stateId] ?? stateId,
    latestBan,
    stateSummary,
    effects,
    topGenerators,
    enforcement: stateId === "MA" ? getEnforcement().byTown.slice(0, 10) : [],
  };
}

export function generateStaticParams() {
  const stateIds = Array.from(new Set(getBans().map((b) => b.stateId)));
  return stateIds.map((id) => ({ id: id.toLowerCase() }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const ctx = getStateContext(id);
  if (!ctx) return {};

  const generators = ctx.stateSummary?.generators ?? 0;
  return {
    title: `${ctx.stateName} organic-waste ban | Unspoiled`,
    description: `${ctx.stateName} ban threshold, generator coverage, processor routing, and policy effect signals. ${generators.toLocaleString()} generators tracked.`,
  };
}

export default async function StatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = getStateContext(id);
  if (!ctx) notFound();

  return (
    <main className="min-h-screen bg-un-cream-50 px-6 py-12 text-un-ink">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-3xl border border-un-line bg-white p-8">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-un-sage-700">
            State coverage
          </div>
          <h1 className="mt-2 font-display text-5xl font-bold text-un-forest">
            {ctx.stateName}
          </h1>
          <p className="mt-2 max-w-3xl text-[15px] text-un-ink-soft">
            Current threshold:{" "}
            <Provenance source="bans_thresholds.csv" field="thresholdTonsPerYear">
              {ctx.latestBan.thresholdTonsPerYear.toLocaleString()} t/year
            </Provenance>{" "}
            within{" "}
            <Provenance
              source="bans_thresholds.csv"
              field="distanceThresholdMiles"
            >
              {ctx.latestBan.distanceThresholdMiles.toFixed(1)} miles
            </Provenance>
            . <Cite id={STATE_LAW_CITE[ctx.stateId] ?? "usda-2030-goal"} />
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`/dashboard?state=${ctx.stateId}`}
              className="rounded-full bg-un-coral-500 px-5 py-2.5 text-[14px] font-semibold text-white"
            >
              Open dashboard for {ctx.stateId}
            </Link>
            <Link
              href="/"
              className="rounded-full border border-un-line px-5 py-2.5 text-[14px] font-semibold text-un-forest"
            >
              Back to overview
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Metric
            label="Generators on file"
            value={`${ctx.stateSummary?.generators.toLocaleString() ?? "0"}`}
            source="generators.json"
            field="stateId"
          />
          <Metric
            label="Total tons/year"
            value={`${fmtTons(ctx.stateSummary?.tonsPerYear ?? 0)}`}
            source="generators.json"
            field="tonsPerYear"
          />
          <Metric
            label="Covered by ban"
            value={`${ctx.stateSummary?.coveredByBan.toLocaleString() ?? "0"}`}
            source="generators.json"
            field="coveredByBan"
          />
          <Metric
            label="Composting effect"
            value={
              ctx.effects?.compostingEffect === null ||
              ctx.effects?.compostingEffect === undefined
                ? "—"
                : ctx.effects.compostingEffect.toFixed(3)
            }
            source="composting_effect.csv"
            field="composting_effect"
          />
        </section>

        <section className="rounded-3xl border border-un-line bg-white p-6">
          <h2 className="font-display text-3xl font-bold text-un-forest">
            Top generators by tonnage
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-[13px]">
              <thead className="border-b border-un-line text-[11px] uppercase tracking-widest text-un-sage-700">
                <tr>
                  <th className="px-2 py-2">Name</th>
                  <th className="px-2 py-2">Town</th>
                  <th className="px-2 py-2">Category</th>
                  <th className="px-2 py-2">Tons/year</th>
                  <th className="px-2 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {ctx.topGenerators.map((g) => (
                  <tr key={g.id} className="border-b border-un-line/70">
                    <td className="px-2 py-2 text-un-forest">{g.name}</td>
                    <td className="px-2 py-2 text-un-ink-soft">{g.town}</td>
                    <td className="px-2 py-2 text-un-ink-soft">{g.category}</td>
                    <td className="px-2 py-2 text-un-ink-soft">
                      {g.tonsPerYear.toLocaleString()}
                    </td>
                    <td className="px-2 py-2 text-un-ink-soft">{g.thresholdStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {ctx.enforcement.length > 0 && (
          <section className="rounded-3xl border border-un-line bg-white p-6">
            <h2 className="font-display text-3xl font-bold text-un-forest">
              Top MA enforcement towns
            </h2>
            <p className="mt-2 text-[13px] text-un-ink-soft">
              Town-level mention signal from enforcement comments, not per-business
              attribution.
            </p>
            <ul className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
              {ctx.enforcement.map((town) => (
                <li
                  key={town.town}
                  className="flex items-center justify-between rounded-xl bg-un-cream-50 px-3 py-2 text-[13px]"
                >
                  <span className="text-un-forest">{town.town}</span>
                  <span className="text-un-ink-soft">
                    {town.actions.toLocaleString()} actions
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  source,
  field,
}: {
  label: string;
  value: string;
  source: string;
  field: string;
}) {
  return (
    <div className="rounded-2xl border border-un-line bg-white p-4">
      <div className="font-display text-2xl font-bold text-un-forest">
        <Provenance source={source} field={field}>
          {value}
        </Provenance>
      </div>
      <div className="text-[11px] font-semibold uppercase tracking-widest text-un-sage-700">
        {label}
      </div>
    </div>
  );
}
