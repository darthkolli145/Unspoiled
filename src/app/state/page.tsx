import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, Sprout } from "lucide-react";

import { Cite } from "@/components/marketing/Cite";
import { SiteNav } from "@/components/marketing/SiteNav";
import {
  Carrot,
  Leaf,
  Lemon,
  PeaPod,
  Strawberry,
  Tomato,
} from "@/components/marketing/ProduceDecor";
import {
  getEnforcement,
  getEvidence,
  getPortfolioSummary,
} from "@/lib/harvest-data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "States · Unspoiled",
  description:
    "Per-state ban trajectories, roster coverage, and policy effect sizes across the 5 states with active organic-waste bans.",
};

const ORDER = ["MA", "VT", "CA", "CT", "RI"] as const;

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

const STATE_SHORT_LABEL: Record<string, string> = {
  MA: "MassDEP food material disposal ban",
  VT: "Universal recycling law (Act 148)",
  CT: "Commercial organics recycling",
  CA: "SB 1383 organics diversion",
  RI: "Food scrap diversion program",
};

const STICKER_BG = [
  "bg-un-gold-200",
  "bg-un-sage-100",
  "bg-un-pink-200",
  "bg-un-cream-200",
];

const DECORS = [Tomato, PeaPod, Carrot, Strawberry, Lemon] as const;

function fmtTons(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k t`;
  return `${Math.round(n)} t`;
}

export default function StateIndexPage() {
  const summary = getPortfolioSummary();
  const evidence = getEvidence();
  const enforcement = getEnforcement();

  const cards = ORDER.map((stateId, idx) => {
    const bans = evidence.banHistory
      .filter((b) => b.stateId === stateId)
      .sort((a, b) => a.year - b.year);
    const first = bans[0];
    const last = bans[bans.length - 1];
    const stateSummary = summary.byState.find((s) => s.stateId === stateId) ?? null;
    const effects = evidence.stateEffects.find((s) => s.stateId === stateId) ?? null;

    const cutPct =
      first && first.thresholdTonsPerYear > 0
        ? Math.round(
            ((first.thresholdTonsPerYear - last.thresholdTonsPerYear) /
              first.thresholdTonsPerYear) *
              100,
          )
        : 0;

    const hasRoster = stateSummary !== null;

    const enforcementMentions = stateId === "MA" ? enforcement.totalActions : 0;

    const DecorIcon = DECORS[idx % DECORS.length];

    return {
      stateId,
      stateName: STATE_NAMES[stateId],
      lawLabel: STATE_SHORT_LABEL[stateId],
      citation: STATE_LAW_CITE[stateId],
      accent: STICKER_BG[idx % STICKER_BG.length],
      Icon: DecorIcon,
      first,
      last,
      cutPct,
      stateSummary,
      effects,
      hasRoster,
      enforcementMentions,
    };
  });

  const live = cards.filter((c) => c.hasRoster).length;
  const pending = cards.length - live;

  return (
    <div className="min-h-screen bg-un-cream-50 text-un-ink">
      <SiteNav />

      <section className="relative overflow-hidden pt-36 pb-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-gradient-to-b from-un-cream-100 via-un-cream-50 to-transparent"
        />
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-un-sage-300/50 bg-un-sage-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-un-sage-700">
                <Sprout className="h-3.5 w-3.5" />
                States
              </span>
              <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] tracking-tight text-un-forest sm:text-6xl">
                Five states, one{" "}
                <span className="italic">tightening</span> trajectory.
              </h1>
              <p className="mt-5 text-[16px] leading-relaxed text-un-ink-soft">
                All five U.S. states with an active organic-waste ban are
                indexed here for threshold trajectories and policy effect sizes.
                Full generator rosters are currently live for MA + VT, with
                other states marked as roster pending. Click any card for the
                full briefing.
              </p>
            </div>
            <Leaf size={120} aria-hidden className="hidden lg:block un-float" />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            <SummaryChip
              label="States indexed"
              value={cards.length.toString()}
              bg={STICKER_BG[0]}
            />
            <SummaryChip
              label="Full roster live"
              value={`${live} live`}
              bg={STICKER_BG[1]}
            />
            <SummaryChip
              label="Roster pending"
              value={`${pending} pending`}
              bg={STICKER_BG[2]}
            />
            <SummaryChip
              label="MA enforcement actions"
              value={enforcement.totalActions.toLocaleString()}
              bg={STICKER_BG[3]}
            />
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => (
              <article
                key={c.stateId}
                className={`group relative flex flex-col gap-4 overflow-hidden rounded-3xl ${c.accent} p-7 ring-1 ring-un-line/60 transition hover:-translate-y-1 hover:shadow-[0_26px_46px_rgba(31,48,24,0.12)]`}
              >
                <c.Icon
                  size={130}
                  aria-hidden
                  className="absolute -right-6 -top-8 opacity-80"
                  style={{ transform: "rotate(16deg)" }}
                />

                <div className="relative z-10 flex items-baseline justify-between gap-3">
                  <div>
                    <div className="font-display text-[44px] font-bold leading-none text-un-forest">
                      {c.stateId}
                    </div>
                    <div className="mt-1 text-[13px] font-semibold text-un-forest/80">
                      {c.stateName}
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ${
                      c.hasRoster
                        ? "bg-un-forest text-un-cream-50"
                        : "bg-white text-un-sage-700 ring-1 ring-un-line"
                    }`}
                  >
                    {c.hasRoster ? "Roster live" : "Roster pending"}
                  </span>
                </div>

                <p className="relative z-10 text-[12.5px] leading-snug text-un-forest/75">
                  {c.lawLabel}
                  <Cite id={c.citation} />
                </p>

                {c.first && c.last ? (
                  <div className="relative z-10 rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-un-line/50">
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-un-sage-700">
                      Threshold trajectory
                    </div>
                    <div className="mt-1 flex items-baseline gap-1.5 font-mono text-[13px] text-un-forest">
                      <span className="text-un-forest/60">{c.first.year}</span>
                      <span>{c.first.thresholdTonsPerYear} t/yr</span>
                      <span className="text-un-coral-600">→</span>
                      <span className="text-un-forest/60">{c.last.year}</span>
                      <span className="font-semibold">
                        {c.last.thresholdTonsPerYear} t/yr
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-un-forest/65">
                      {c.cutPct > 0
                        ? `cut ${c.cutPct}% · phase ${c.last.phase}`
                        : `phase ${c.last.phase}`}
                    </div>
                  </div>
                ) : null}

                <div className="relative z-10 grid grid-cols-2 gap-2">
                  <InfoCell
                    label="Generators"
                    value={
                      c.stateSummary
                        ? c.stateSummary.generators.toLocaleString()
                        : "—"
                    }
                  />
                  <InfoCell
                    label="Tonnage"
                    value={
                      c.stateSummary
                        ? fmtTons(c.stateSummary.tonsPerYear)
                        : "—"
                    }
                  />
                  <InfoCell
                    label="Composting effect"
                    value={
                      c.effects?.compostingEffect != null
                        ? c.effects.compostingEffect.toFixed(2)
                        : "—"
                    }
                  />
                  <InfoCell
                    label="Disposal effect"
                    value={
                      c.effects?.disposalEffect != null
                        ? c.effects.disposalEffect.toFixed(3)
                        : "—"
                    }
                  />
                </div>

                {c.enforcementMentions > 0 ? (
                  <div className="relative z-10 rounded-xl bg-un-forest px-4 py-2.5 text-[12px] text-un-cream-100">
                    <span className="font-semibold">
                      {c.enforcementMentions.toLocaleString()}
                    </span>{" "}
                    enforcement actions parsed (MA only)
                  </div>
                ) : null}

                <div className="relative z-10 mt-auto flex flex-wrap gap-2">
                  <Link
                    href={`/state/${c.stateId.toLowerCase()}`}
                    className="inline-flex items-center gap-1 rounded-full bg-un-forest px-4 py-2 text-[12.5px] font-semibold text-white transition hover:bg-un-sage-900"
                  >
                    Open briefing
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href={`/dashboard?state=${c.stateId}`}
                    className="inline-flex items-center gap-1 rounded-full border border-un-forest/25 bg-white px-4 py-2 text-[12.5px] font-semibold text-un-forest transition hover:border-un-forest hover:bg-un-forest hover:text-white"
                  >
                    Filter dashboard
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 rounded-3xl bg-un-cream-100 p-6 text-[14px] text-un-ink-soft ring-1 ring-un-line">
            <strong className="text-un-forest">
              Every state has cut its threshold at least once.
            </strong>{" "}
            Each tightening pulls thousands of new generators into coverage —
            the compounding demand curve for anyone operating in these
            markets. Source:{" "}
            <span className="font-mono text-un-forest">
              bans_thresholds.csv
            </span>
            .
          </div>
        </div>
      </section>

      <footer className="bg-un-forest py-12 text-un-cream-100">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 px-6 text-[13px] md:flex-row">
          <div>
            <div className="flex items-center gap-2.5 font-display text-xl font-bold text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-un-sage-300 text-un-forest">
                <Sprout className="h-4 w-4" strokeWidth={2.5} />
              </span>
              Unspoiled
            </div>
            <div className="mt-2 max-w-sm text-un-cream-100/75">
              Food-waste routing and compliance intelligence, per state.
            </div>
          </div>
          <div className="flex gap-5 text-un-cream-100/85">
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <Link href="/dashboard" className="transition hover:text-white">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SummaryChip({
  label,
  value,
  bg,
}: {
  label: string;
  value: string;
  bg: string;
}) {
  return (
    <div className={`rounded-2xl ${bg} p-4 ring-1 ring-un-line/60`}>
      <div className="font-display text-xl font-bold text-un-forest">
        {value}
      </div>
      <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-un-forest/65">
        {label}
      </div>
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/80 px-3 py-2 ring-1 ring-un-line/50">
      <div className="text-[9.5px] font-semibold uppercase tracking-widest text-un-forest/65">
        {label}
      </div>
      <div className="mt-0.5 font-mono text-[13px] font-semibold text-un-forest">
        {value}
      </div>
    </div>
  );
}
