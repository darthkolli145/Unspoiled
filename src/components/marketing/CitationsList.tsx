import { getCitation } from "@/lib/research";

export function CitationsList({ ids }: { ids: string[] }) {
  const uniqueIds = Array.from(new Set(ids));
  return (
    <section className="rounded-3xl border border-un-line bg-white p-6">
      <h3 className="font-display text-2xl font-bold text-un-forest">
        Sources
      </h3>
      <ol className="mt-4 flex list-decimal flex-col gap-3 pl-5 text-[13px] text-un-ink-soft">
        {uniqueIds.map((id) => {
          const citation = getCitation(id);
          return (
            <li key={id}>
              <span className="font-semibold text-un-forest">{citation.source}</span>{" "}
              ({citation.year}). {citation.title}.{" "}
              <a
                href={citation.url}
                target="_blank"
                rel="noreferrer"
                className="text-un-coral-600 underline decoration-dotted underline-offset-2"
              >
                {citation.url}
              </a>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
