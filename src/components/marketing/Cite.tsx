import { getCitation } from "@/lib/research";

export function Cite({ id }: { id: string }) {
  const citation = getCitation(id);
  return (
    <details className="group relative inline-block align-super">
      <summary className="ml-1 inline-flex h-4 min-w-4 cursor-pointer list-none items-center justify-center rounded-full bg-un-sage-100 px-1 text-[10px] font-semibold text-un-sage-700 [&::-webkit-details-marker]:hidden">
        {citation.year.slice(-2)}
      </summary>
      <div className="absolute left-0 top-6 z-20 w-80 rounded-xl border border-un-line bg-white p-3 text-left text-[12px] text-un-ink shadow-lg">
        <div className="font-semibold text-un-forest">{citation.source}</div>
        <div className="text-[11px] text-un-ink-soft">{citation.title}</div>
        <p className="mt-2 leading-relaxed text-un-ink-soft">{citation.quote}</p>
        <a
          href={citation.url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-[11px] font-medium text-un-coral-600 underline decoration-dotted underline-offset-2"
        >
          Open source
        </a>
      </div>
    </details>
  );
}
