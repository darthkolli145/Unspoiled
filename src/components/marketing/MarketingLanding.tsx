import Link from "next/link";
import { ArrowUpRight, Sprout } from "lucide-react";

import { Cite } from "./Cite";
import { CitationsList } from "./CitationsList";
import {
  Broccoli,
  Carrot,
  Leaf,
  Lemon,
  PeaPod,
  ProduceScatter,
  Sprig,
  Strawberry,
  Tomato,
} from "./ProduceDecor";
import { Provenance } from "./Provenance";
import { SiteNav } from "./SiteNav";
import {
  getBans,
  getEnforcement,
  getEvidence,
  getModelMetrics,
  getPortfolioSummary,
  getProcessors,
} from "@/lib/harvest-data";
import { marketClaims } from "@/lib/research";

const CITATION_IDS = [
  "refed-138m-tons",
  "refed-382b-value",
  "epa-landfill-share",
  "usda-2030-goal",
  "massdep-waste-ban",
  "vermont-universal-recycling",
  "calrecycle-organics",
  "ct-commercial-organics",
  "ri-food-scrap-ban",
];

// Rotating pastel palette for "sticker" cards. Mirrors the Misfits aesthetic
// where each card gets its own soft background color.
const STICKER_BG = [
  "bg-un-gold-200",
  "bg-un-sage-100",
  "bg-un-pink-200",
  "bg-un-cream-200",
];

function fmtTons(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M t`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k t`;
  return `${Math.round(n)} t`;
}

export function MarketingLanding() {
  const summary = getPortfolioSummary();
  const model = getModelMetrics();
  const processors = getProcessors();
  const bans = getBans();
  const evidence = getEvidence();
  const enforcement = getEnforcement();
  const topTown = enforcement.byTown[0];

  return (
    <div className="min-h-screen bg-un-cream-50 text-un-ink">
      <SiteNav />

      {/* --------------------------- HERO -------------------------------- */}
      <section className="relative overflow-hidden pt-36 pb-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] bg-gradient-to-b from-un-cream-100 via-un-cream-50 to-transparent"
        />
        <ProduceScatter className="-z-10" opacity={0.55} />

        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <h1 className="font-display text-[44px] font-bold leading-[1.05] tracking-tight text-un-forest sm:text-[56px] md:text-[60px]">
              Every generator. Every threshold.{" "}
              <span className="italic">Every nearest processor.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-un-ink-soft">
              Unspoiled turns public regulator datasets into one live operating
              view for haulers, regulators, and portfolio operators — sourced
              for substance, not spreadsheets.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 rounded-full bg-un-coral-500 px-6 py-3 text-[15px] font-semibold text-white shadow-[0_12px_30px_rgba(214,78,42,0.3)] transition hover:-translate-y-px hover:bg-un-coral-600"
              >
                Open dashboard
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="#solution"
                className="inline-flex items-center gap-1 rounded-full border border-un-forest/25 bg-white px-6 py-3 text-[15px] font-semibold text-un-forest transition hover:border-un-forest hover:bg-un-forest hover:text-white"
              >
                See how it works
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-3 text-[13px] sm:grid-cols-4">
              <StatChip
                label="Generators modeled"
                value={summary.totalGenerators.toLocaleString()}
                source="generators.json"
                field="id"
                accent={STICKER_BG[0]}
              />
              <StatChip
                label="Tonnage scored"
                value={fmtTons(summary.totalTonsPerYear)}
                source="generators.json"
                field="tonsPerYear"
                accent={STICKER_BG[1]}
              />
              <StatChip
                label="Processors routed"
                value={processors.length.toLocaleString()}
                source="processors.json"
                field="id"
                accent={STICKER_BG[2]}
              />
              <StatChip
                label="Model R² (log)"
                value={model.final_val_r2_log.toFixed(3)}
                source="model_metrics.json"
                field="final_val_r2_log"
                accent={STICKER_BG[3]}
              />
            </div>
          </div>
          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-6 -z-10 rounded-[36px] bg-un-sage-100/60 blur-xl"
            />
            <HeroMedallion
              totalGenerators={summary.totalGenerators}
              aboveThreshold={summary.aboveThreshold}
              processors={processors.length}
              actions={enforcement.totalActions}
            />
          </div>
        </div>
      </section>

      {/* ------------------------ PROBLEM -------------------------------- */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-un-coral-500">
                Problem
              </span>
              <h2 className="mt-2 font-display text-4xl font-bold leading-tight text-un-forest sm:text-5xl">
                The market is large, regulated, and{" "}
                <span className="italic">fragmented</span>.
              </h2>
              <p className="mt-4 text-[16px] text-un-ink-soft">
                Food-waste operations are compliance-critical, but most teams
                still run routing and enforcement decisions from disconnected
                spreadsheets. Three structural gaps compound:
              </p>
              <ul className="mt-4 flex flex-col gap-2 text-[14px] text-un-ink-soft">
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-un-coral-500" />
                  <span>
                    <strong className="text-un-forest">No shared roster.</strong>{" "}
                    Each state publishes its own generator file in its own
                    format. Nothing joins across state lines.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-un-coral-500" />
                  <span>
                    <strong className="text-un-forest">Thresholds move.</strong>{" "}
                    MA halved its threshold (52 → 26 t/yr), VT took theirs to
                    zero. Today&rsquo;s exempt generator is tomorrow&rsquo;s
                    covered one.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-un-coral-500" />
                  <span>
                    <strong className="text-un-forest">Routing is tribal.</strong>{" "}
                    Haulers route from memory; regulators have no independent
                    view of processor capacity vs. demand.
                  </span>
                </li>
              </ul>
            </div>
            <Tomato size={120} className="hidden lg:block un-float" />
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {marketClaims.map((claim, idx) => {
              const Icon = [PeaPod, Carrot, Strawberry][idx % 3];
              return (
                <div
                  key={claim.id}
                  className={`relative flex flex-col gap-3 overflow-hidden rounded-3xl ${STICKER_BG[idx % STICKER_BG.length]} p-7 ring-1 ring-un-line/60 transition hover:-translate-y-1 hover:shadow-[0_22px_40px_rgba(31,48,24,0.1)]`}
                >
                  <Icon
                    size={84}
                    className="absolute -right-4 -top-4 opacity-80"
                    style={{ transform: "rotate(12deg)" }}
                  />
                  <div className="relative z-10 font-display text-4xl font-bold text-un-forest">
                    {claim.value}
                    <Cite id={claim.citationId} />
                  </div>
                  <p className="relative z-10 max-w-xs text-[14px] leading-snug text-un-forest/75">
                    {claim.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------ CASE STUDY ----------------------------- */}
      <section id="case-study" className="bg-un-cream-100 py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="relative">
            <div className="relative overflow-hidden rounded-[36px] bg-white p-8 ring-1 ring-un-line">
              <Sprig
                size={100}
                className="absolute -left-4 -top-4"
                style={{ transform: "rotate(-20deg)" }}
              />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-un-coral-500">
                Case study
              </span>
              <h2 className="mt-2 font-display text-4xl font-bold leading-tight text-un-forest sm:text-5xl">
                {topTown?.town ?? "Peabody"},{" "}
                <span className="italic">Massachusetts</span>.
              </h2>
              <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-un-ink-soft">
                The #1 town in MassDEP&rsquo;s enforcement log. Three clicks
                in the dashboard turn this into a routable workflow.
              </p>
              <ol className="mt-6 flex flex-col gap-3 text-[14px]">
                {[
                  "Filter Enforcement by town",
                  "Switch to Map and inspect town clusters",
                  "Select generators and route to processor network",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-un-forest text-[12px] font-semibold text-white">
                      {i + 1}
                    </span>
                    <span className="text-un-ink">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <Tomato
              size={100}
              aria-hidden
              className="absolute -right-6 -bottom-6 hidden md:block"
              style={{ transform: "rotate(18deg)" }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              label="Town mentions"
              value={`${topTown?.actions.toLocaleString() ?? "—"}`}
              source="enforcement.json"
              field="byTown[].actions"
              accent={STICKER_BG[0]}
            />
            <MetricCard
              label="Mentions with penalty"
              value={`${topTown?.actionsWithPenalty.toLocaleString() ?? "—"}`}
              source="enforcement.json"
              field="byTown[].actionsWithPenalty"
              accent={STICKER_BG[1]}
            />
            <MetricCard
              label="Penalty assessed"
              value={`$${topTown?.penaltyUsd.toLocaleString() ?? "0"}`}
              source="enforcement.json"
              field="byTown[].penaltyUsd"
              accent={STICKER_BG[2]}
            />
            <MetricCard
              label="MA actions parsed"
              value={enforcement.totalActions.toLocaleString()}
              source="wb_enforcements.csv"
              field="row_count"
              accent={STICKER_BG[3]}
            />
            <div className="col-span-2 rounded-3xl bg-un-forest p-6 text-un-cream-100">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-un-cream-100/70">
                Signal
              </div>
              <p className="mt-2 text-[14px] leading-relaxed text-un-cream-100/90">
                {topTown
                  ? `${topTown.actions} actions mention ${topTown.town} but only ${topTown.actionsWithPenalty} carry a penalty — concentrated warnings without escalation, prime for enforcement targeting.`
                  : "Concentrated enforcement warnings without escalation — prime for targeting."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------ SOLUTION ------------------------------- */}
      <section id="solution" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-un-sage-700">
              Solution
            </span>
            <h2 className="mt-2 font-display text-4xl font-bold leading-tight text-un-forest sm:text-5xl">
              One system from raw data to{" "}
              <span className="italic">action</span>.
            </h2>
            <p className="mt-4 text-[16px] text-un-ink-soft">
              Four layered surfaces, one dashboard. Each is a real
              transformation of a specific CSV — not a pretty wrapper around
              someone else&rsquo;s API. Every number exports to JSON for your
              own stack.
            </p>
          </div>

          {/* ---------- 4 deep solution cards ---------- */}
          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
            <SolutionCard
              Icon={PeaPod}
              accent={STICKER_BG[0]}
              title="Tonnage model"
              italic="calibrated"
              pain="Generator self-reports are sparse, inconsistent, and skew by 2–3 orders of magnitude between a café and a distribution center."
              how={`A PyTorch MLP with category + state embeddings and four numeric features (population, lat, lon, nearest-processor km). log1p target, Smooth-L1 loss, Adam + cosine over 300 epochs.`}
              output={`${model.rows.toLocaleString()} rows trained · val MAE ${model.final_val_mae_tons.toFixed(0)} t/yr · val R² (log) ${model.final_val_r2_log.toFixed(2)} · per-generator predicted tons exposed in generators.json.`}
            />
            <SolutionCard
              Icon={Carrot}
              accent={STICKER_BG[1]}
              title="Ban engine"
              italic="live"
              pain="Each state has its own tonnage + distance threshold, revised on an annual schedule. Nobody keeps a clean, joinable view."
              how="Every generator is joined to its state's row in bans_thresholds.csv. A simple rule flags Above, Near (≥50% of threshold), or Below — no invented heuristics."
              output={`${summary.aboveThreshold.toLocaleString()} above · ${summary.nearThreshold.toLocaleString()} near · ${summary.belowThreshold.toLocaleString()} below, refreshed whenever thresholds tighten.`}
            />
            <SolutionCard
              Icon={Leaf}
              accent={STICKER_BG[2]}
              title="Routing graph"
              italic="spatial"
              pain="Hauling decisions get made from memory or from a hauler's own narrow book. Regulators have no independent picture of capacity."
              how="Haversine distance from every generator to every permitted food-scrap processor (composters, AD, animal-feed, transfer stations). Stored as nearestProcessorId + nearestProcessorMiles."
              output={`${processors.length.toLocaleString()} processors across MA + VT, each reachable inside the 20-mile ban distance for most generators — surfaced on the Map tab.`}
            />
            <SolutionCard
              Icon={Lemon}
              accent={STICKER_BG[3]}
              title="Evidence panel"
              italic="cited"
              pain="ESG teams and regulators can't defend a number without provenance. Everyone's scared of the &lsquo;where did this come from&rsquo; question."
              how="Every stat on the dashboard is attributed to the CSV column it came from. Where the Dryad study has no value (e.g. MA composting_effect), we render a dash instead of making one up."
              output={`${evidence.stateEffects.length} states of causal effects, ${evidence.boulderHistory.length + evidence.seattleCompostingAnnual.length} years of city-history benchmarks, and ${enforcement.totalActions.toLocaleString()} parsed enforcement actions — all clickable to source.`}
            />
          </div>

          {/* ---------- Pipeline strip ---------- */}
          <div className="mt-10 rounded-3xl bg-un-forest px-6 py-8 text-un-cream-100">
            <div className="mx-auto max-w-5xl">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-un-cream-100/70">
                <Sprout className="h-3.5 w-3.5" /> End-to-end pipeline
              </div>
              <h3 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">
                Messy public CSVs → a priced, routable decision.
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-4">
                <PipelineStep
                  n="01"
                  title="Raw CSVs"
                  body="15 Dryad + MassDEP files: food generators, processors, bans, effect sizes, enforcement, city history."
                />
                <PipelineStep
                  n="02"
                  title="Harmonize"
                  body="MA annual tons ∪ VT weekly tons → unified schema. Gazetteer-matched enforcement. Census-joined population."
                />
                <PipelineStep
                  n="03"
                  title="Model"
                  body={`PyTorch MLP + threshold engine + routing graph + effect-size join, retrain runs in <${Math.max(1, Math.round(model.rows / 2000))} min on CPU.`}
                />
                <PipelineStep
                  n="04"
                  title="Actioned"
                  body="Dashboard surfaces, JSON API, and state briefings all live from the same in-memory cache."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------ MARKET --------------------------------- */}
      <section id="market" className="bg-un-sage-100/70 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-un-coral-500">
              Market
            </span>
            <h2 className="mt-2 font-display text-4xl font-bold leading-tight text-un-forest sm:text-5xl">
              Flexible, commitment-free access for three buyers.
            </h2>
            <p className="mt-4 text-[16px] text-un-ink-soft">
              Pricing figures below are illustrative — the dashboard itself
              ships with no invented business constants.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
            <BizPanel
              title="Commercial haulers"
              body="Need route expansion targets and a compliance-driven demand signal."
              price="$2–5 per generator / month"
              featured={false}
              Icon={Carrot}
            />
            <BizPanel
              title="Regulators"
              body="Need inspection prioritization and enforcement visibility across towns."
              price="$1.5k–4k per seat / year"
              featured
              Icon={Tomato}
            />
            <BizPanel
              title="REIT & ESG teams"
              body="Need credible compliance and diversion reporting from public records."
              price="$12k–40k per portfolio / year"
              featured={false}
              Icon={Strawberry}
            />
          </div>
        </div>
      </section>

      {/* ------------------------ WHY NOW -------------------------------- */}
      <section id="ecosystem" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-un-sage-700">
                Why now
              </span>
              <h2 className="mt-2 font-display text-4xl font-bold leading-tight text-un-forest sm:text-5xl">
                Regulation is already <span className="italic">live</span>.
              </h2>
              <p className="mt-4 max-w-xl text-[16px] text-un-ink-soft">
                Five states already have food-waste bans on the books. Each
                one keeps tightening its threshold — that&rsquo;s the
                compounding demand signal.
              </p>
            </div>
            <Sprig size={110} className="hidden lg:block" />
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-5">
            <StateLawCard
              state="MA"
              note="MassDEP food material disposal ban"
              citation="massdep-waste-ban"
              accent={STICKER_BG[0]}
              trajectory={stateTrajectory(evidence.banHistory, "MA")}
            />
            <StateLawCard
              state="VT"
              note="Universal recycling law (Act 148)"
              citation="vermont-universal-recycling"
              accent={STICKER_BG[1]}
              trajectory={stateTrajectory(evidence.banHistory, "VT")}
            />
            <StateLawCard
              state="CA"
              note="SB 1383 organics diversion"
              citation="calrecycle-organics"
              accent={STICKER_BG[2]}
              trajectory={stateTrajectory(evidence.banHistory, "CA")}
            />
            <StateLawCard
              state="CT"
              note="Commercial organics recycling"
              citation="ct-commercial-organics"
              accent={STICKER_BG[3]}
              trajectory={stateTrajectory(evidence.banHistory, "CT")}
            />
            <StateLawCard
              state="RI"
              note="Food scrap diversion program"
              citation="ri-food-scrap-ban"
              accent={STICKER_BG[0]}
              trajectory={stateTrajectory(evidence.banHistory, "RI")}
            />
          </div>
          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-un-cream-100 p-4 text-[13px] text-un-ink-soft ring-1 ring-un-line">
            <Sprig size={40} aria-hidden />
            <div>
              <strong className="text-un-forest">
                Every state has cut its threshold at least once.
              </strong>{" "}
              Each tightening pulls thousands of new generators into coverage
              — the compounding demand curve for anyone operating in these
              markets. Source:{" "}
              <span className="font-mono text-un-forest">
                bans_thresholds.csv
              </span>
              .
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------ TRACTION ------------------------------- */}
      <section id="traction" className="bg-un-cream-100 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-un-coral-500">
                Traction
              </span>
              <h2 className="mt-2 font-display text-4xl font-bold leading-tight text-un-forest sm:text-5xl">
                Eight milestones, all{" "}
                <span className="italic">on disk</span>.
              </h2>
              <p className="mt-4 max-w-xl text-[16px] text-un-ink-soft">
                We don&rsquo;t show MRR — no customers yet. We show dataset
                depth, model validation, and coverage.
              </p>
            </div>
            <Broccoli size={110} className="hidden lg:block un-float" />
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
            <MetricCard
              label="Ban states indexed"
              value={bans.length.toLocaleString()}
              source="bans.json"
              field="stateId"
              accent={STICKER_BG[0]}
            />
            <MetricCard
              label="Generators"
              value={summary.totalGenerators.toLocaleString()}
              source="generators.json"
              field="id"
              accent={STICKER_BG[1]}
            />
            <MetricCard
              label="Processors"
              value={processors.length.toLocaleString()}
              source="processors.json"
              field="id"
              accent={STICKER_BG[2]}
            />
            <MetricCard
              label="Actions parsed"
              value={enforcement.totalActions.toLocaleString()}
              source="enforcement.json"
              field="totalActions"
              accent={STICKER_BG[3]}
            />
            <MetricCard
              label="MAE"
              value={`${model.final_val_mae_tons.toFixed(0)} t/year`}
              source="model_metrics.json"
              field="final_val_mae_tons"
              accent={STICKER_BG[1]}
            />
            <MetricCard
              label="R² (log)"
              value={model.final_val_r2_log.toFixed(3)}
              source="model_metrics.json"
              field="final_val_r2_log"
              accent={STICKER_BG[0]}
            />
            <MetricCard
              label="Boulder years"
              value={evidence.boulderHistory.length.toLocaleString()}
              source="boulder_waste.csv"
              field="year"
              accent={STICKER_BG[3]}
            />
            <MetricCard
              label="Seattle years"
              value={evidence.seattleCompostingAnnual.length.toLocaleString()}
              source="seattle_composting.csv"
              field="year"
              accent={STICKER_BG[2]}
            />
          </div>
          <div className="mt-8 rounded-3xl bg-white p-7 ring-1 ring-un-line">
            <h3 className="font-display text-2xl font-bold text-un-forest">
              Pipeline lineage
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <PipelineCell
                title="Compliance"
                items={[
                  "bans_thresholds.csv",
                  "composting_effect.csv",
                  "disposal_effect_size2.csv",
                ]}
              />
              <PipelineCell
                title="Routing"
                items={[
                  "food_generators_MA.csv",
                  "food_generators_VT.csv",
                  "food_processors_list_*.csv",
                ]}
              />
              <PipelineCell
                title="Evidence"
                items={[
                  "wb_enforcements.csv",
                  "boulder_waste.csv",
                  "seattle_composting.csv",
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------ CTA ------------------------------------ */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="relative overflow-hidden rounded-[44px] bg-un-coral-500 px-8 py-14 text-center text-white shadow-[0_30px_70px_rgba(214,78,42,0.35)]">
            <Strawberry
              size={140}
              aria-hidden
              className="absolute -left-6 -top-8 opacity-25"
              style={{ transform: "rotate(-18deg)" }}
            />
            <PeaPod
              size={180}
              aria-hidden
              className="absolute -right-10 -bottom-12 opacity-25"
              style={{ transform: "rotate(14deg)" }}
            />
            <h2 className="relative z-10 mx-auto max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl">
              Live prototype, <span className="italic">live data</span>.
            </h2>
            <p className="relative z-10 mx-auto mt-4 max-w-2xl text-[15px] text-white/90">
              Every surface you see is backed by a CSV on disk or a model
              output. Step into the dashboard and see it routed, scored,
              and ready.
            </p>
            <div className="relative z-10 mt-7 flex justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-un-forest transition hover:-translate-y-px"
              >
                Open dashboard
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="mt-10">
            <CitationsList ids={CITATION_IDS} />
          </div>
        </div>
      </section>

      {/* ------------------------ FAQ ------------------------------------ */}
      <section id="faq" className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex items-center gap-3">
            <Tomato size={52} />
            <h2 className="font-display text-4xl font-bold text-un-forest sm:text-5xl">
              Frequently <span className="italic">Asked</span>.
            </h2>
          </div>
          <div className="mt-8 divide-y divide-un-line rounded-3xl bg-white ring-1 ring-un-line">
            <FaqItem
              question="Are all dashboard numbers data-backed?"
              answer="Yes. Operational metrics are sourced from dataset columns or model outputs. Market sizing and pricing assumptions are cited as external research."
            />
            <FaqItem
              question="Who is the initial customer?"
              answer="Commercial haulers, regulators, and REIT/portfolio ESG teams dealing with organic-waste compliance and routing."
            />
            <FaqItem
              question="How fast can this scale to new states?"
              answer="The architecture is state-additive. New rosters can be ingested and retrained without redesigning the UI."
            />
            <FaqItem
              question="Where did the data come from?"
              answer="The Dryad organic-waste-ban dataset (bzkh189h4). Every CSV file is listed on the dashboard's pipeline panel."
            />
          </div>
        </div>
      </section>

      {/* ------------------------ FOOTER --------------------------------- */}
      <footer className="relative overflow-hidden bg-un-forest py-12 text-un-cream-100">
        <Sprig
          size={220}
          aria-hidden
          className="absolute -left-12 -top-6 opacity-15"
        />
        <Leaf
          size={220}
          aria-hidden
          className="absolute -right-12 -bottom-6 opacity-15"
          style={{ transform: "rotate(30deg)" }}
        />
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col justify-between gap-4 px-6 text-[13px] md:flex-row">
          <div>
            <div className="flex items-center gap-2.5 font-display text-xl font-bold text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-un-sage-300 text-un-forest">
                <Sprout className="h-4 w-4" strokeWidth={2.5} />
              </span>
              Unspoiled
            </div>
            <div className="mt-2 max-w-sm text-un-cream-100/75">
              Food-waste routing and compliance intelligence. Sourced for
              substance, not spreadsheets.
            </div>
          </div>
          <div className="flex gap-5 text-un-cream-100/85">
            <Link href="/dashboard" className="transition hover:text-white">
              Dashboard
            </Link>
            <Link href="/state" className="transition hover:text-white">
              States
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatChip({
  label,
  value,
  source,
  field,
  accent = "bg-white",
}: {
  label: string;
  value: string;
  source: string;
  field: string;
  accent?: string;
}) {
  return (
    <div className={`rounded-2xl ${accent} p-4 ring-1 ring-un-line/60`}>
      <div className="font-display text-xl font-bold text-un-forest">
        <Provenance source={source} field={field}>
          {value}
        </Provenance>
      </div>
      <div className="mt-0.5 text-[10.5px] font-semibold uppercase tracking-widest text-un-forest/65">
        {label}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  source,
  field,
  accent = "bg-white",
}: {
  label: string;
  value: string;
  source: string;
  field: string;
  accent?: string;
}) {
  return (
    <div className={`rounded-2xl ${accent} p-5 ring-1 ring-un-line/60`}>
      <div className="font-display text-2xl font-bold text-un-forest">
        <Provenance source={source} field={field}>
          {value}
        </Provenance>
      </div>
      <div className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-un-forest/65">
        {label}
      </div>
    </div>
  );
}

function BizPanel({
  title,
  body,
  price,
  featured,
  Icon,
}: {
  title: string;
  body: string;
  price: string;
  featured: boolean;
  Icon: typeof Tomato;
}) {
  return (
    <div
      className={`relative flex flex-col gap-5 overflow-hidden rounded-3xl p-7 ring-1 ${
        featured
          ? "bg-un-forest text-un-cream-50 shadow-[0_30px_60px_-20px_rgba(31,48,24,0.45)] ring-transparent"
          : "bg-white ring-un-line"
      }`}
    >
      <Icon
        size={96}
        aria-hidden
        className="absolute -right-6 -top-6 opacity-80"
        style={{ transform: "rotate(14deg)" }}
      />
      {featured && (
        <span className="absolute right-5 top-5 rounded-full bg-un-coral-500 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-widest text-white">
          Flagship buyer
        </span>
      )}
      <div className="relative z-10">
        <h3
          className={`font-display text-[26px] font-bold ${featured ? "text-white" : "text-un-forest"}`}
        >
          {title}
        </h3>
        <p
          className={`mt-2 text-[14px] ${featured ? "text-un-cream-100/90" : "text-un-ink-soft"}`}
        >
          {body}
        </p>
      </div>
      <p
        className={`relative z-10 font-display text-[20px] font-semibold italic ${
          featured ? "text-un-coral-400" : "text-un-coral-500"
        }`}
      >
        {price}
      </p>
      <p
        className={`relative z-10 text-[11px] ${featured ? "text-un-cream-100/60" : "text-un-ink-soft"}`}
      >
        Illustrative pricing — walks us through three buyer motions.
      </p>
    </div>
  );
}

function StateLawCard({
  state,
  note,
  citation,
  accent = "bg-white",
  trajectory,
}: {
  state: string;
  note: string;
  citation: string;
  accent?: string;
  trajectory?: StateTrajectory | null;
}) {
  return (
    <div className={`flex flex-col gap-2 rounded-2xl ${accent} p-5 ring-1 ring-un-line/60`}>
      <div className="flex items-baseline justify-between">
        <div className="font-display text-3xl font-bold text-un-forest">
          {state}
        </div>
        {trajectory ? (
          <div className="font-mono text-[10px] uppercase tracking-widest text-un-forest/65">
            {trajectory.firstYear} → {trajectory.lastYear}
          </div>
        ) : null}
      </div>
      <div className="text-[12px] leading-snug text-un-forest/75">
        {note}
        <Cite id={citation} />
      </div>
      {trajectory ? (
        <div className="mt-auto rounded-xl bg-white/70 px-3 py-2 ring-1 ring-un-line/50">
          <div className="flex items-baseline gap-1.5 text-[11px] font-semibold text-un-forest">
            <span className="font-mono text-un-forest/60">
              {trajectory.firstThreshold}
            </span>
            <span className="text-un-coral-600">→</span>
            <span className="font-mono">{trajectory.lastThreshold}</span>
            <span className="text-un-forest/60">t/yr</span>
          </div>
          <div className="mt-0.5 text-[10.5px] text-un-forest/70">
            {trajectory.tightened
              ? `cut ${trajectory.cutPct}% · phase ${trajectory.lastPhase}`
              : `phase ${trajectory.lastPhase}`}
          </div>
        </div>
      ) : null}
    </div>
  );
}

interface StateTrajectory {
  firstYear: number;
  lastYear: number;
  firstThreshold: number;
  lastThreshold: number;
  lastPhase: number;
  tightened: boolean;
  cutPct: number;
}

function stateTrajectory(
  banHistory: ReturnType<typeof getEvidence>["banHistory"],
  stateId: string,
): StateTrajectory | null {
  const rows = banHistory.filter((h) => h.stateId === stateId);
  if (rows.length === 0) return null;
  const sorted = [...rows].sort((a, b) => a.year - b.year);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const cutPct =
    first.thresholdTonsPerYear > 0
      ? Math.round(
          ((first.thresholdTonsPerYear - last.thresholdTonsPerYear) /
            first.thresholdTonsPerYear) *
            100,
        )
      : 100;
  return {
    firstYear: first.year,
    lastYear: last.year,
    firstThreshold: first.thresholdTonsPerYear,
    lastThreshold: last.thresholdTonsPerYear,
    lastPhase: last.phase,
    tightened: last.thresholdTonsPerYear < first.thresholdTonsPerYear,
    cutPct: Math.max(0, cutPct),
  };
}

function SolutionCard({
  title,
  italic,
  pain,
  how,
  output,
  accent,
  Icon,
}: {
  title: string;
  italic: string;
  pain: string;
  how: string;
  output: string;
  accent: string;
  Icon: typeof Tomato;
}) {
  return (
    <div
      className={`group relative flex flex-col gap-4 overflow-hidden rounded-3xl ${accent} p-7 text-un-forest ring-1 ring-un-line/60 transition hover:-translate-y-1 hover:shadow-[0_26px_46px_rgba(31,48,24,0.12)]`}
    >
      <Icon
        size={130}
        aria-hidden
        className="absolute -right-6 -top-8 opacity-80"
        style={{ transform: "rotate(16deg)" }}
      />
      <div className="relative z-10">
        <h3 className="font-display text-[26px] font-bold leading-tight">
          {title} <span className="italic text-un-forest/80">{italic}</span>.
        </h3>
      </div>
      <dl className="relative z-10 flex flex-col gap-3 text-[13.5px] leading-relaxed">
        <SolutionRow label="What it solves" body={pain} tint="coral" />
        <SolutionRow label="How it works" body={how} tint="sage" />
        <SolutionRow label="What you see" body={output} tint="forest" />
      </dl>
    </div>
  );
}

function SolutionRow({
  label,
  body,
  tint,
}: {
  label: string;
  body: string;
  tint: "coral" | "sage" | "forest";
}) {
  const tintCls =
    tint === "coral"
      ? "text-un-coral-600"
      : tint === "sage"
        ? "text-un-sage-700"
        : "text-un-forest";
  return (
    <div className="rounded-xl bg-white/75 px-4 py-3 ring-1 ring-un-line/50 backdrop-blur-sm">
      <dt
        className={`text-[10.5px] font-semibold uppercase tracking-widest ${tintCls}`}
      >
        {label}
      </dt>
      <dd className="mt-1 text-un-forest/80">{body}</dd>
    </div>
  );
}

function PipelineStep({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <div className="relative rounded-2xl bg-un-cream-100/10 p-4 ring-1 ring-un-cream-100/20">
      <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-widest text-un-coral-400">
        {n}
      </div>
      <div className="mt-1 font-display text-[17px] font-bold text-white">
        {title}
      </div>
      <p className="mt-1 text-[12.5px] leading-relaxed text-un-cream-100/85">
        {body}
      </p>
    </div>
  );
}

function PipelineCell({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl bg-un-cream-50 p-5 ring-1 ring-un-line">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-un-sage-700">
        {title}
      </div>
      <ul className="mt-3 flex flex-col gap-1.5 text-[13px] text-un-ink-soft">
        {items.map((item) => (
          <li key={item} className="font-mono text-[12px] text-un-forest">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function HeroMedallion({
  totalGenerators,
  aboveThreshold,
  processors,
  actions,
}: {
  totalGenerators: number;
  aboveThreshold: number;
  processors: number;
  actions: number;
}) {
  return (
    <div className="relative aspect-square w-full">
      {/* Background halo circles */}
      <div className="absolute inset-0 rounded-full bg-un-cream-100 ring-1 ring-un-line" />
      <div className="absolute inset-6 rounded-full bg-un-sage-100/80" />
      <div className="absolute inset-12 rounded-full bg-white ring-1 ring-un-line/60" />

      {/* Produce decorations rotating around the medallion */}
      <Tomato
        size={110}
        aria-hidden
        className="absolute -top-4 right-6 un-float"
        style={{ transform: "rotate(-12deg)", animationDelay: "0s" }}
      />
      <PeaPod
        size={120}
        aria-hidden
        className="absolute -bottom-2 left-0 un-float"
        style={{ transform: "rotate(8deg)", animationDelay: "0.6s" }}
      />
      <Strawberry
        size={90}
        aria-hidden
        className="absolute bottom-10 -right-2 un-float"
        style={{ transform: "rotate(-14deg)", animationDelay: "1.1s" }}
      />
      <Carrot
        size={86}
        aria-hidden
        className="absolute top-14 -left-4 un-float"
        style={{ transform: "rotate(18deg)", animationDelay: "0.3s" }}
      />
      <Leaf
        size={64}
        aria-hidden
        className="absolute top-6 left-20"
        style={{ transform: "rotate(-30deg)" }}
      />

      {/* Centered stat rotor */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-un-sage-700">
          Live dataset
        </div>
        <div className="mt-2 font-display text-[52px] font-bold leading-none text-un-forest">
          {totalGenerators.toLocaleString()}
        </div>
        <div className="text-[12px] text-un-ink-soft">generators modeled</div>

        <div className="mt-6 grid w-full grid-cols-3 gap-3 text-center">
          <div>
            <div className="font-display text-lg font-bold text-un-coral-600">
              {aboveThreshold.toLocaleString()}
            </div>
            <div className="text-[9.5px] font-semibold uppercase tracking-widest text-un-ink-soft">
              above ban
            </div>
          </div>
          <div>
            <div className="font-display text-lg font-bold text-un-sage-700">
              {processors.toLocaleString()}
            </div>
            <div className="text-[9.5px] font-semibold uppercase tracking-widest text-un-ink-soft">
              processors
            </div>
          </div>
          <div>
            <div className="font-display text-lg font-bold text-un-forest">
              {actions.toLocaleString()}
            </div>
            <div className="text-[9.5px] font-semibold uppercase tracking-widest text-un-ink-soft">
              actions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group px-6 py-5 [&[open]>summary>span.plus]:rotate-45">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-[18px] font-semibold text-un-forest [&::-webkit-details-marker]:hidden">
        {question}
        <span className="plus flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-un-sage-100 text-un-sage-700 transition">
          +
        </span>
      </summary>
      <p className="mt-3 text-[14.5px] leading-relaxed text-un-ink-soft">
        {answer}
      </p>
    </details>
  );
}
