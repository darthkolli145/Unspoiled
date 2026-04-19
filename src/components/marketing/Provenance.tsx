import type { ReactNode } from "react";

interface ProvenanceProps {
  source: string;
  field?: string;
  note?: string;
  children: ReactNode;
}

export function Provenance({ source, field, note, children }: ProvenanceProps) {
  return (
    <details className="group relative inline-block">
      <summary className="inline cursor-pointer list-none decoration-dotted underline-offset-3 [&::-webkit-details-marker]:hidden">
        <span className="border-b border-dotted border-un-sage-700/60">{children}</span>
      </summary>
      <div className="absolute left-0 top-7 z-20 w-72 rounded-xl border border-un-line bg-white p-3 text-[12px] text-un-ink shadow-lg">
        <div className="font-semibold text-un-forest">Dataset provenance</div>
        <div className="mt-1 font-mono text-[11px] text-un-sage-700">{source}</div>
        {field ? <div className="text-[11px] text-un-ink-soft">Field: {field}</div> : null}
        {note ? <p className="mt-1 text-un-ink-soft">{note}</p> : null}
      </div>
    </details>
  );
}
