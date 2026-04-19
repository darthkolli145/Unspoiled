import Link from "next/link";

import { CitationsList } from "@/components/marketing/CitationsList";
import { Cite } from "@/components/marketing/Cite";
import {
  getEnforcement,
  getModelMetrics,
  getPortfolioSummary,
  getProcessors,
} from "@/lib/harvest-data";
import { marketClaims } from "@/lib/research";

export const revalidate = 300;

const CITATION_IDS = [
  "refed-138m-tons",
  "refed-382b-value",
  "epa-landfill-share",
  "usda-2030-goal",
  "rubicon-site",
  "compology-site",
  "recyclist-site",
];

function fmtTons(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k t`;
  return `${Math.round(n)} t`;
}

export default function PitchPage() {
  const summary = getPortfolioSummary();
  const model = getModelMetrics();
  const enforcement = getEnforcement();
  const processors = getProcessors();

  return (
    <div className="min-h-screen bg-un-cream-50 text-un-ink print:bg-white">
      <div className="mx-auto max-w-6xl space-y-6 px-6 py-10 print:max-w-none print:space-y-0 print:px-0 print:py-0">
        <Slide title="1. Cover" subtitle="Unspoiled">
          <h1 className="font-display text-5xl font-bold leading-tight text-un-forest">
            Food-waste routing and compliance intelligence.
          </h1>
          <p className="mt-4 max-w-2xl text-[16px] text-un-ink-soft">
            A data-native operating layer for haulers, regulators, and
            portfolios.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Kpi label="Generators" value={summary.totalGenerators.toLocaleString()} />
            <Kpi label="Tonnage" value={fmtTons(summary.totalTonsPerYear)} />
            <Kpi label="Processors" value={processors.length.toLocaleString()} />
            <Kpi label="Model R² (log)" value={model.final_val_r2_log.toFixed(3)} />
          </div>
        </Slide>

        <Slide title="2. Problem" subtitle="Market pain">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {marketClaims.map((claim) => (
              <div
                key={claim.id}
                className="rounded-2xl border border-un-line bg-white p-5"
              >
                <div className="font-display text-3xl font-bold text-un-forest">
                  {claim.value}
                  <Cite id={claim.citationId} />
                </div>
                <div className="mt-2 text-[13px] text-un-ink-soft">{claim.label}</div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[14px] text-un-ink-soft">
            Existing workflows break at the exact point where compliance,
            routing, and volume forecasting intersect.
          </p>
        </Slide>

        <Slide title="3. Solution" subtitle="Functional prototype">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1fr]">
            <div className="rounded-2xl border border-un-line bg-white p-5">
              <h3 className="font-display text-2xl font-bold text-un-forest">
                What the product does today
              </h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-[14px] text-un-ink-soft">
                <li>Predicts per-generator annual tons.</li>
                <li>Scores above / near / below ban thresholds.</li>
                <li>Routes each generator to nearest permitted processor.</li>
                <li>Surfaces town-level enforcement signal for prioritization.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-un-line bg-white p-5">
              <h3 className="font-display text-2xl font-bold text-un-forest">
                Where to go next
              </h3>
              <p className="mt-3 text-[14px] text-un-ink-soft">
                Switch to the live dashboard during the presentation — this
                pitch view is the read-along, the dashboard is the artifact.
              </p>
              <ul className="mt-4 flex flex-col gap-1.5 text-[13.5px] text-un-ink-soft">
                <li>• <span className="font-mono text-un-forest">/dashboard</span> — operator console</li>
                <li>• <span className="font-mono text-un-forest">/state/ma</span> — per-state briefing</li>
                <li>• <span className="font-mono text-un-forest">/api/*</span> — JSON for every surface</li>
              </ul>
            </div>
          </div>
        </Slide>

        <Slide title="4. How it works" subtitle="Data lineage">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <PipelineCard
              title="Compliance layer"
              lines={[
                "bans_thresholds.csv",
                "composting_effect.csv",
                "disposal_effect_size2.csv",
              ]}
            />
            <PipelineCard
              title="Routing layer"
              lines={[
                "food_generators_MA.csv",
                "food_generators_VT.csv",
                "food_processors_list_*.csv",
              ]}
            />
            <PipelineCard
              title="Evidence layer"
              lines={[
                "wb_enforcements.csv",
                "boulder_waste.csv",
                "seattle_composting.csv",
              ]}
            />
          </div>
        </Slide>

        <Slide title="5. Market" subtitle="TAM / SAM / SOM">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <MarketCard
              label="TAM (illustrative)"
              value="$1.5B+ annual software spend proxy"
              note="Derived from U.S. food-waste scale and compliance operations"
              cite="refed-382b-value"
            />
            <MarketCard
              label="SAM (near-term)"
              value="States with active organics policy"
              note="Focus on states where generator-level enforcement pressure is real"
              cite="usda-2030-goal"
            />
            <MarketCard
              label="SOM (initial)"
              value="MA + VT haulers, regulators, REIT portfolios"
              note="Immediate wedge from current data coverage"
              cite="massdep-waste-ban"
            />
          </div>
        </Slide>

        <Slide title="6. Business model" subtitle="Pricing hypothesis">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <BizCard
              segment="Haulers"
              price="$2-5 / generator / month"
              detail="Route expansion and compliance demand signal."
            />
            <BizCard
              segment="Regulators"
              price="$1.5-4k / seat / year"
              detail="Inspection triage and policy monitoring."
            />
            <BizCard
              segment="Portfolios"
              price="$12-40k / portfolio / year"
              detail="ESG compliance reporting and risk heatmaps."
            />
          </div>
          <p className="mt-3 text-[12px] text-un-ink-soft">
            Illustrative pricing for pitch narrative only; to be validated with
            customer interviews and pilots.
          </p>
        </Slide>

        <Slide title="7. Competition" subtitle="Positioning">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <CompetitorCard
              name="Unspoiled"
              score="Policy depth + routing + evidence"
              accent
            />
            <CompetitorCard name="Rubicon" score="Enterprise waste ops" cite="rubicon-site" />
            <CompetitorCard
              name="Compology"
              score="Container monitoring"
              cite="compology-site"
            />
            <CompetitorCard
              name="Recyclist"
              score="Recycling workflows"
              cite="recyclist-site"
            />
          </div>
        </Slide>

        <Slide title="8. Traction" subtitle="What is live now">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Kpi label="Ban states indexed" value={String(summary.byState.length + 3)} />
            <Kpi label="Rows in model" value={model.rows.toLocaleString()} />
            <Kpi label="Actions parsed" value={enforcement.totalActions.toLocaleString()} />
            <Kpi
              label="Diversion estimate"
              value={`${summary.generatorsWithDiversionEstimate.toLocaleString()} generators`}
            />
          </div>
        </Slide>

        <Slide title="9. Roadmap" subtitle="12-month execution">
          <ol className="grid grid-cols-1 gap-3 text-[14px] md:grid-cols-2">
            <RoadmapItem quarter="Q1" text="Onboard CA generator rosters and state page launch." />
            <RoadmapItem quarter="Q2" text="Add CT and RI roster ingestion and model retraining." />
            <RoadmapItem
              quarter="Q3"
              text="Use enforcement logs as weak supervision for non-compliance ranking."
            />
            <RoadmapItem
              quarter="Q4"
              text="Run REIT and hauler pilots with recurring reporting exports."
            />
          </ol>
        </Slide>

        <Slide title="10. Team + ask" subtitle="Go-to-market">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-un-line bg-white p-5">
              <h3 className="font-display text-2xl font-bold text-un-forest">Ask</h3>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-[14px] text-un-ink-soft">
                <li>3 pilot partners (hauler, regulator, portfolio operator).</li>
                <li>Advisor intros for municipal procurement and waste policy.</li>
                <li>Feedback on pricing validation approach.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-un-line bg-white p-5">
              <h3 className="font-display text-2xl font-bold text-un-forest">
                Next actions
              </h3>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="rounded-full bg-un-coral-500 px-4 py-2 text-[13px] font-semibold text-white"
                >
                  Open dashboard
                </Link>
                <Link
                  href="/"
                  className="rounded-full border border-un-line px-4 py-2 text-[13px] font-semibold text-un-forest"
                >
                  Back to landing
                </Link>
              </div>
            </div>
          </div>
        </Slide>

        <div className="print:hidden">
          <CitationsList ids={CITATION_IDS} />
        </div>
      </div>
    </div>
  );
}

function Slide({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="pitch-slide rounded-3xl border border-un-line bg-un-cream-100 p-8">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-un-sage-700">
        {title}
      </div>
      <h2 className="mt-1 font-display text-3xl font-bold text-un-forest">{subtitle}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-un-line bg-white p-4">
      <div className="font-display text-2xl font-bold text-un-forest">{value}</div>
      <div className="text-[11px] uppercase tracking-widest text-un-ink-soft">{label}</div>
    </div>
  );
}

function PipelineCard({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-2xl border border-un-line bg-white p-5">
      <h3 className="font-display text-xl font-bold text-un-forest">{title}</h3>
      <ul className="mt-3 flex flex-col gap-1 font-mono text-[12px] text-un-ink-soft">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

function MarketCard({
  label,
  value,
  note,
  cite,
}: {
  label: string;
  value: string;
  note: string;
  cite: string;
}) {
  return (
    <div className="rounded-2xl border border-un-line bg-white p-5">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-un-sage-700">
        {label}
      </div>
      <div className="mt-1 font-display text-2xl font-bold text-un-forest">
        {value}
        <Cite id={cite} />
      </div>
      <p className="mt-2 text-[13px] text-un-ink-soft">{note}</p>
    </div>
  );
}

function BizCard({
  segment,
  price,
  detail,
}: {
  segment: string;
  price: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-un-line bg-white p-5">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-un-sage-700">
        {segment}
      </div>
      <div className="mt-1 font-display text-2xl font-bold text-un-forest">{price}</div>
      <p className="mt-2 text-[13px] text-un-ink-soft">{detail}</p>
    </div>
  );
}

function CompetitorCard({
  name,
  score,
  cite,
  accent,
}: {
  name: string;
  score: string;
  cite?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        accent
          ? "border-un-coral-500 bg-un-coral-500 text-white"
          : "border-un-line bg-white text-un-ink"
      }`}
    >
      <div className="font-display text-2xl font-bold">
        {name}
        {cite ? <Cite id={cite} /> : null}
      </div>
      <p className={`mt-2 text-[13px] ${accent ? "text-white/90" : "text-un-ink-soft"}`}>
        {score}
      </p>
    </div>
  );
}

function RoadmapItem({ quarter, text }: { quarter: string; text: string }) {
  return (
    <li className="rounded-2xl border border-un-line bg-white p-5">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-un-sage-700">
        {quarter}
      </div>
      <p className="mt-1 text-[14px] text-un-ink-soft">{text}</p>
    </li>
  );
}
