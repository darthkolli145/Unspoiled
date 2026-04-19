"use client";

import { X, MapPin, Truck, ShieldCheck, Recycle, Gavel } from "lucide-react";

import type { GeneratorDetail } from "@/lib/types";
import {
  generatorTitle,
  isRedactedName,
  processorTitle,
} from "@/lib/display";
import { ThresholdBadge, CoveredBadge } from "./ComplianceBadge";

function fmt(n: number | null | undefined, unit = ""): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(2)}M${unit ? " " + unit : ""}`;
  if (n >= 1_000)
    return `${(n / 1_000).toFixed(1)}k${unit ? " " + unit : ""}`;
  return `${n.toFixed(n >= 10 ? 0 : 1)}${unit ? " " + unit : ""}`;
}

export function GeneratorDetailPanel({
  detail,
  loading,
  onClose,
}: {
  detail: GeneratorDetail | null;
  loading: boolean;
  onClose: () => void;
}) {
  if (!detail && !loading) return null;

  return (
    <aside className="fixed inset-y-0 right-0 z-[1200] flex w-full max-w-xl flex-col border-l border-un-line bg-un-cream-50 shadow-[-20px_0_60px_rgba(31,48,24,0.12)]">
      <header className="flex items-start justify-between gap-4 border-b border-un-line bg-un-cream-100 px-6 py-5">
        <div className="min-w-0">
          <div className="font-mono text-[11px] font-semibold uppercase tracking-widest text-un-sage-700">
            {detail ? detail.id : "Loading"}
          </div>
          <h2 className="mt-1 truncate font-display text-xl font-bold text-un-forest">
            {detail ? generatorTitle(detail) : "Loading…"}
          </h2>
          <div className="mt-0.5 truncate text-[13px] text-un-ink-soft">
            {detail ? `${detail.town}, ${detail.stateId}` : ""}
            {detail && isRedactedName(detail.name) ? (
              <span className="ml-2 text-[11px] text-un-muted">
                · business name redacted at source
              </span>
            ) : null}
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="shrink-0 rounded-full p-1.5 text-un-ink-soft transition hover:bg-white hover:text-un-forest"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {loading && !detail && (
          <div className="text-[13px] text-un-ink-soft">Fetching detail…</div>
        )}
        {detail && (
          <div className="flex flex-col gap-6">
            <section className="flex flex-wrap items-center gap-2">
              <CoveredBadge covered={detail.coveredByBan} />
              <ThresholdBadge status={detail.thresholdStatus} />
              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-un-forest ring-1 ring-un-line">
                {detail.category}
              </span>
            </section>

            <section>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-un-sage-700">
                Tonnage
              </div>
              <div className="grid grid-cols-3 gap-3 rounded-2xl border border-un-line bg-white p-4">
                <Stat label="Actual t/yr" value={fmt(detail.tonsPerYear)} />
                <Stat
                  label="Model predicted"
                  value={fmt(detail.predictedTonsPerYear)}
                />
                <Stat
                  label="Residual"
                  value={fmt(detail.residualTons)}
                  tone={detail.residualTons > 0 ? "positive" : "negative"}
                />
              </div>
            </section>

            <section>
              <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-un-sage-700">
                <ShieldCheck className="h-3.5 w-3.5" /> Compliance
              </div>
              <div className="rounded-2xl border border-un-line bg-white p-4 text-[13px] text-un-ink">
                {detail.applicableBan ? (
                  <>
                    <div>
                      <span className="font-mono text-un-ink-soft">
                        {detail.stateId}
                      </span>{" "}
                      ban requires diversion above{" "}
                      <span className="font-semibold text-un-forest">
                        {detail.applicableBan.thresholdTonsPerYear.toLocaleString()}{" "}
                        t/yr
                      </span>
                      {Number.isFinite(
                        detail.applicableBan.distanceThresholdMiles,
                      ) &&
                      detail.applicableBan.distanceThresholdMiles < 1_000_000
                        ? ` within ${detail.applicableBan.distanceThresholdMiles} mi of a processor`
                        : " regardless of processor distance"}
                      . Current tonnage: {fmt(detail.tonsPerYear)} t/yr, nearest
                      processor {detail.nearestProcessorMiles.toFixed(1)} mi.
                    </div>
                    <div className="mt-2 text-un-ink-soft">
                      Phase {detail.applicableBan.phase}, updated{" "}
                      {detail.applicableBan.year} (from
                      bans_thresholds.csv).
                    </div>
                  </>
                ) : (
                  <>
                    No organic-waste ban row for {detail.stateId} in
                    bans_thresholds.csv.
                  </>
                )}
              </div>
            </section>

            <section>
              <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-un-sage-700">
                <Truck className="h-3.5 w-3.5" /> Nearest processors
              </div>
              <ul className="flex flex-col divide-y divide-un-line overflow-hidden rounded-2xl border border-un-line bg-white">
                {detail.nearestProcessors.map((p, i) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 px-4 py-3 text-[13px]"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-un-sage-100 text-[11px] font-semibold text-un-sage-700">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-un-forest">
                        {processorTitle(p)}
                      </div>
                      <div className="truncate font-mono text-[11px] text-un-ink-soft">
                        {p.id} · {p.town}, {p.stateId}
                      </div>
                    </div>
                    <div className="text-right font-mono text-un-ink">
                      {p.distanceMiles.toFixed(1)} mi
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-un-sage-700">
                <Recycle className="h-3.5 w-3.5" /> Dryad study values
              </div>
              <div className="grid grid-cols-3 gap-3 rounded-2xl border border-un-line bg-white p-4">
                <Stat
                  label="Composting effect"
                  value={
                    detail.compostingEffect === null
                      ? "—"
                      : detail.compostingEffect.toFixed(3)
                  }
                />
                <Stat
                  label="Disposal effect"
                  value={
                    detail.disposalEffect === null
                      ? "—"
                      : detail.disposalEffect.toFixed(3)
                  }
                />
                <Stat
                  label="Diverted t/yr"
                  value={fmt(detail.divertedTonsPerYear)}
                />
              </div>
              <div className="mt-2 text-[11px] text-un-muted">
                Values taken directly from composting_effect.csv and
                disposal_effect_size2.csv. Diverted = tons × composting_effect.
                A dash means the Dryad study has no recorded value for this
                state.
              </div>
            </section>

            {detail.stateId === "MA" && (
              <section>
                <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-un-sage-700">
                  <Gavel className="h-3.5 w-3.5" /> Town-level enforcement
                </div>
                <div className="rounded-2xl border border-un-line bg-white p-4 text-[13px] text-un-ink">
                  {detail.townEnforcementActions > 0 ? (
                    <>
                      <div>
                        <span className="font-semibold text-un-forest">
                          {detail.town}
                        </span>{" "}
                        is mentioned in{" "}
                        <span className="font-semibold text-un-forest">
                          {detail.townEnforcementActions.toLocaleString()}
                        </span>{" "}
                        MassDEP waste-ban enforcement record
                        {detail.townEnforcementActions === 1 ? "" : "s"}
                        {detail.townEnforcementWithPenalty > 0 ? (
                          <>
                            , including{" "}
                            <span className="font-semibold text-un-forest">
                              {detail.townEnforcementWithPenalty}
                            </span>{" "}
                            with an assessed penalty totaling{" "}
                            <span className="font-semibold text-un-sage-700">
                              ${detail.townEnforcementPenaltyUsd.toLocaleString()}
                            </span>
                          </>
                        ) : null}
                        .
                      </div>
                      <div className="mt-2 text-[11px] text-un-muted">
                        This is a <strong>town-level</strong> signal parsed
                        from the Comment field of{" "}
                        <span className="font-mono">wb_enforcements.csv</span>.
                        SiteName is redacted in every row — we make no claim
                        that this business received any notice.
                      </div>
                    </>
                  ) : (
                    <>
                      No enforcement records in{" "}
                      <span className="font-mono">wb_enforcements.csv</span>{" "}
                      mention {detail.town}.
                    </>
                  )}
                </div>
              </section>
            )}

            <section className="text-[12px] text-un-ink-soft">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {detail.lat.toFixed(4)}, {detail.lon.toFixed(4)}
              </div>
              <div>Source dataset: {detail.source}</div>
            </section>
          </div>
        )}
      </div>
    </aside>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
}) {
  const toneCls =
    tone === "positive"
      ? "text-un-sage-700"
      : tone === "negative"
        ? "text-un-tomato"
        : "text-un-forest";
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-widest text-un-ink-soft">
        {label}
      </div>
      <div className={`mt-1 font-display text-[17px] font-bold ${toneCls}`}>
        {value}
      </div>
    </div>
  );
}
