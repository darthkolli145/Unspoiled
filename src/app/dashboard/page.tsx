import Link from "next/link";
import { ArrowLeft, Activity } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { FcuShell } from "@/components/fcu/FcuShell";

export default function DashboardPage() {
  return (
    <main className="relative min-h-screen bg-zinc-950 text-zinc-100">
      <div className="relative z-10 mx-auto max-w-7xl space-y-6 p-6">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-900 pb-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white">
              <Activity className="h-4 w-4 text-black" strokeWidth={2.5} />
            </span>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-zinc-50">Seismic</h1>
              <p className="text-xs text-zinc-500">Parametric Insurance Platform · Risk Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-400 md:flex">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Live · polling every 60s
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-100"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to site
            </Link>
          </div>
        </header>

        <Tabs defaultValue="portfolio" className="space-y-6">
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger
              value="portfolio"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-400"
            >
              Portfolio
            </TabsTrigger>
            <TabsTrigger
              value="events"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-400"
            >
              Seismic Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio">
            <DashboardShell />
          </TabsContent>

          <TabsContent value="events">
            <FcuShell />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
