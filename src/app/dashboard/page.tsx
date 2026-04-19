import { Suspense } from "react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  getLeads,
  getInsights,
  getModelMetrics,
  getModelScatter,
  getPortfolioSummary,
  getProcessors,
  queryGenerators,
} from "@/lib/harvest-data";

export const revalidate = 60;

export default function DashboardPage() {
  const summary = getPortfolioSummary();
  const { items } = queryGenerators({
    limit: 400,
    sort: "tons",
    order: "desc",
  });
  const processors = getProcessors();
  const model = getModelMetrics();
  const scatter = getModelScatter(600);
  const insights = getInsights();
  const initialLeads = getLeads({ limit: 400, offset: 0 });

  return (
    <Suspense fallback={<div className="min-h-screen bg-un-cream-50" />}>
      <DashboardShell
        summary={summary}
        initialGenerators={items}
        processors={processors}
        model={model}
        insights={insights}
        scatter={scatter}
        initialLeads={initialLeads}
      />
    </Suspense>
  );
}
