import type { PortfolioSummary } from "@/lib/types";

function fmtTons(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M t`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k t`;
  return `${Math.round(n)} t`;
}

export function SummaryCards({ summary }: { summary: PortfolioSummary }) {
  const cards = [
    {
      label: "Generators tracked",
      value: summary.totalGenerators.toLocaleString(),
      hint: `${summary.coveredByBan.toLocaleString()} above ban threshold`,
      bg: "bg-un-gold-200",
    },
    {
      label: "Actual tons / year",
      value: fmtTons(summary.totalTonsPerYear),
      hint: `Model predicts ${fmtTons(summary.predictedTonsPerYear)}`,
      bg: "bg-un-sage-100",
    },
    {
      label: "Near the line",
      value: summary.nearThreshold.toLocaleString(),
      hint: `Within 50% of state threshold`,
      bg: "bg-un-pink-200",
    },
    {
      label: "Diversion estimate",
      value:
        summary.generatorsWithDiversionEstimate > 0
          ? fmtTons(summary.divertedTonsPerYearKnown)
          : "—",
      hint:
        summary.generatorsWithDiversionEstimate > 0
          ? `${summary.generatorsWithDiversionEstimate.toLocaleString()} generators with recorded composting_effect`
          : "Only states with a Dryad composting_effect value",
      bg: "bg-un-cream-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`rounded-2xl ${c.bg} p-5 ring-1 ring-un-line`}
        >
          <div className="text-[11px] font-semibold uppercase tracking-widest text-un-forest/65">
            {c.label}
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-un-forest">
            {c.value}
          </div>
          <div className="mt-1 text-[12px] text-un-forest/75">{c.hint}</div>
        </div>
      ))}
    </div>
  );
}
