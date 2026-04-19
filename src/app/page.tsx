import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  ChevronRight,
  Clock,
  Database,
  FileText,
  Globe,
  Lock,
  Shield,
  Terminal,
  Zap,
} from "lucide-react";
import { SiteNav } from "@/components/marketing/SiteNav";
import ShaderBackground from "@/components/ui/shader-background";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <SiteNav />
      <Hero />
      <LogoStrip />
      <ProductGrid />
      <TechnicalSection />
      <CapabilitiesSplit />
      <PillarsSection />
      <DeveloperSection />
      <TestimonialSection />
      <EnterpriseSection />
      <FinalCTA />
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section
      className="relative isolate overflow-hidden pt-28 pb-24 md:pt-36 md:pb-32"
      style={{
        background:
          "radial-gradient(ellipse 100% 60% at 70% -5%, rgba(59,130,246,0.12) 0%, transparent 55%), #000",
      }}
    >
      <ShaderBackground />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid gap-16 md:grid-cols-12 md:items-center">
          <div className="md:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/8 px-3 py-1 text-xs font-medium text-blue-300 backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-400" />
              </span>
              Now processing USGS ShakeMaps in real time
            </div>

            <h1 className="mt-6 text-[52px] font-light leading-[0.96] tracking-[-0.025em] text-white md:text-[76px]">
              Insurance priced
              <br />
              to the physics
              <br />
              of every building
            </h1>

            <p className="mt-8 max-w-lg text-lg font-light text-zinc-500 md:text-xl">
              Seismic is a parametric insurance API for REITs and commercial
              carriers. We model building-specific structural resonance and
              trigger automated payouts — without a single claims adjuster.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                href="#contact"
                className="group inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-[0_0_20px_rgba(59,130,246,0.35)] transition hover:bg-blue-500"
              >
                Request API access
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#docs"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/12 px-6 py-3 text-sm font-medium text-white/60 transition hover:border-white/25 hover:text-white"
              >
                View docs
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap gap-8 border-t border-white/5 pt-10">
              {[
                { value: "$4.2B", label: "Portfolio value modeled" },
                { value: "< 4 min", label: "Avg. payout trigger time" },
                { value: "96%", label: "Model accuracy vs. post-event surveys" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div className="text-2xl font-light tracking-tight text-white">{value}</div>
                  <div className="mt-0.5 text-xs font-medium text-zinc-600">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-6">
            <RiskCard />
          </div>
        </div>
      </div>
    </section>
  );
}

function RiskCard() {
  const wavePoints = [50,52,49,55,53,60,68,74,65,58,72,85,92,78,62,88,96,82,70,75,68,60,55,58,52,50,54,51];
  const max = Math.max(...wavePoints);
  const w = 280; const h = 80;
  const points = wavePoints.map((v, i) => `${(i / (wavePoints.length - 1)) * w},${h - (v / max) * h * 0.85}`).join(" ");

  return (
    <div className="relative mx-auto w-full max-w-[480px] ps-float">
      <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-zinc-950 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)]">

        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-white/60">Seismic · Risk Assessment</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/35">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Live feed
          </div>
        </div>

        <div className="px-5 pt-5">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-zinc-600">Target address</div>
          <div className="mt-1 text-base font-medium text-white">350 Mission St, San Francisco, CA</div>
          <div className="mt-0.5 text-xs text-zinc-600">48-floor · RC shear wall · Built 2017</div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-px bg-white/5 border-y border-white/5">
          {[
            { label: "Risk Score", value: "0.73", sub: "High", color: "text-red-400" },
            { label: "Est. Premium", value: "$1,240", sub: "/ month", color: "text-white" },
            { label: "Payout Cap", value: "$8.4M", sub: "parametric", color: "text-white" },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="bg-zinc-950 px-4 py-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">{label}</div>
              <div className={`mt-1 text-xl font-light ${color}`}>{value}</div>
              <div className="text-[10px] text-zinc-600">{sub}</div>
            </div>
          ))}
        </div>

        <div className="px-5 pt-5">
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            <span>Resonance profile · 0.1–2.0 Hz</span>
            <span className="font-mono text-zinc-700">alpa(ti) decay</span>
          </div>
          <div className="mt-3 overflow-hidden rounded-xl bg-zinc-900 p-4">
            <svg viewBox={`0 0 ${w} ${h}`} className="h-20 w-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="wave-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon points={`0,${h} ${points} ${w},${h}`} fill="url(#wave-fill)" />
              <polyline points={points} fill="none" stroke="#60a5fa" strokeWidth="1.5"
                strokeOpacity="0.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div className="mt-4 space-y-1.5 px-5 pb-5">
          {[
            { zone: "Floors 40–48", stress: "Critical", pct: 88, color: "bg-red-500" },
            { zone: "Floors 20–39", stress: "Moderate", pct: 45, color: "bg-amber-400" },
            { zone: "Floors 1–19",  stress: "Low",      pct: 22, color: "bg-emerald-500" },
          ].map(({ zone, stress, pct, color }) => (
            <div key={zone} className="flex items-center gap-3 rounded-lg border border-white/5 bg-zinc-900 px-3 py-2.5">
              <div className="w-28 text-xs text-zinc-500">{zone}</div>
              <div className="flex-1">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%`, opacity: 0.65 }} />
                </div>
              </div>
              <div className="w-16 text-right text-xs text-zinc-500">{stress}</div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 px-5 py-4">
          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white shadow-[0_4px_14px_rgba(59,130,246,0.3)] transition hover:bg-blue-500">
            Generate full report <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function LogoStrip() {
  const names = [
    "Blackstone RE","Prologis","Vornado","SL Green",
    "Cushman & Wakefield","CBRE","JLL","Brookfield",
    "Mack-Cali","Equinix","Kilroy Realty","Hudson Pacific",
  ];
  const doubled = [...names, ...names];
  return (
    <section className="relative overflow-hidden border-y border-white/5 bg-zinc-950 py-9">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-zinc-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-zinc-950 to-transparent" />
      <div className="mb-4 text-center text-[11px] font-semibold uppercase tracking-widest text-zinc-700">
        Trusted by leading REITs and commercial carriers
      </div>
      <div className="flex w-max ps-marquee gap-14 px-6 text-zinc-600">
        {doubled.map((n, i) => (
          <span key={i} className="shrink-0 text-[15px] font-light tracking-tight">{n}</span>
        ))}
      </div>
    </section>
  );
}

function ProductGrid() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:py-32">
      <div className="grid gap-10 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-6">
          <h2 className="text-[40px] font-light leading-[1.05] tracking-[-0.02em] text-white md:text-[52px]">
            Physics-driven risk modeling at building scale
          </h2>
        </div>
        <div className="md:col-span-6 md:pt-3">
          <p className="text-lg font-light text-zinc-500">
            Traditional underwriting uses regional hazard maps. Seismic uses
            high-resolution Scripps synthetic seismograms matched to USGS 3D
            building geometries — down to individual floor plates and foundation mass.
          </p>
          <Link href="#" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-400 transition hover:text-white">
            Explore the platform <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {[
          { eyebrow: "Resonance modeling", title: "Building-specific structural stress from first principles.", bullets: ["Scripps seismograms","USGS geometries","PyTorch backend","alpa(ti) decay"], art: <ResonanceArt /> },
          { eyebrow: "Parametric pricing", title: "Premiums that reflect the real physics of your portfolio.", bullets: ["Per-floor risk scoring","Foundation mass analysis","Frequency matching","Live recalibration"], art: <PricingArt /> },
          { eyebrow: "Instant payouts", title: "Automated liquidity triggered the moment ground motion is detected.", bullets: ["Sub-4-minute triggers","No claims adjusters","Blockchain audit trail","SWIFT / ACH"], art: <PayoutArt /> },
        ].map(({ eyebrow, title, bullets, art }) => (
          <article key={eyebrow} className="group rounded-3xl border border-white/5 bg-zinc-900 p-5 transition duration-300 hover:-translate-y-1 hover:border-white/10">
            <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-zinc-800 flex items-center justify-center">
              {art}
              <div className="absolute left-4 top-4">
                <span className="inline-flex items-center rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/50 backdrop-blur-sm">
                  {eyebrow}
                </span>
              </div>
            </div>
            <h3 className="mt-6 text-[20px] font-normal leading-[1.2] tracking-[-0.01em] text-white">{title}</h3>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {bullets.map((b) => (
                <li key={b} className="rounded-full border border-white/8 bg-white/4 px-2.5 py-1 text-[11px] font-medium text-zinc-500">{b}</li>
              ))}
            </ul>
            <Link href="#" className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-zinc-400 transition hover:text-white group-hover:gap-2">
              Learn more <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

function ResonanceArt() {
  const freqs = [0.3,0.5,0.4,0.8,1.1,0.9,0.6,1.4,1.8,1.6,1.2,0.9,0.7,0.5,0.4];
  const w = 220; const h = 90;
  const pts = freqs.map((v, i) => `${(i/(freqs.length-1))*w},${h/2+Math.sin(i*1.3)*v*28}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full opacity-60" preserveAspectRatio="xMidYMid meet">
      <polyline points={pts} fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {freqs.map((v, i) => (
        <circle key={i} cx={(i/(freqs.length-1))*w} cy={h/2+Math.sin(i*1.3)*v*28}
          r="2.5" fill="#93c5fd" opacity={0.3 + Math.abs(v)*0.35} />
      ))}
    </svg>
  );
}

function PricingArt() {
  const bars = [35,52,41,68,55,80,62,91,74,85];
  return (
    <svg viewBox="0 0 220 90" className="h-full w-full opacity-50">
      {bars.map((h, i) => (
        <rect key={i} x={8+i*21} y={90-h} width="14" height={h} rx="3" fill="white" opacity={0.15 + (i/bars.length)*0.45} />
      ))}
      <polyline points={bars.map((h,i)=>`${15+i*21},${90-h}`).join(" ")}
        fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PayoutArt() {
  return (
    <svg viewBox="0 0 220 90" className="h-full w-full opacity-50">
      <circle cx="110" cy="45" r="32" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.2" />
      <circle cx="110" cy="45" r="22" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.35" />
      <circle cx="110" cy="45" r="12" fill="white" fillOpacity="0.7" />
      <path d="M110 13 L110 3 M110 87 L110 77 M142 45 L152 45 M78 45 L68 45" stroke="white" strokeWidth="1" strokeOpacity="0.25" strokeLinecap="round" />
      <path d="M40 45 L62 45 M158 45 L180 45" stroke="white" strokeWidth="1" strokeOpacity="0.2" strokeLinecap="round" strokeDasharray="4 3" />
      <text x="110" y="49" textAnchor="middle" fontSize="8" fill="black" fontWeight="700">PAID</text>
    </svg>
  );
}

function TechnicalSection() {
  return (
    <section className="border-t border-white/5 bg-zinc-950 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <div className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-zinc-600">The model</div>
        <h2 className="text-[44px] font-light leading-[1.03] tracking-[-0.02em] text-white md:text-[68px]">
          From seismogram
          <br />
          to payout in minutes
        </h2>
        <p className="mx-auto mt-8 max-w-2xl text-lg font-light text-zinc-500">
          Our PyTorch-accelerated backend processes localized structural stress using the algorithmic decay variable{" "}
          <span className="font-mono text-blue-400">alpa_(ti)</span> to model low-frequency wave impact on large-mass foundations.
        </p>

        <div className="mt-20 grid gap-1 md:grid-cols-4">
          {[
            { step: "01", label: "Scripps seismogram ingestion", desc: "High-resolution synthetic ground motion data for the target site" },
            { step: "02", label: "USGS 3D geometry matching", desc: "Building-specific structural model from Microsoft and USGS datasets" },
            { step: "03", label: "PyTorch stress simulation", desc: "alpa(ti) decay applied to calculate per-floor resonance and stress" },
            { step: "04", label: "Parametric trigger issued", desc: "Policy priced and payout authorized — fully automated" },
          ].map(({ step, label, desc }, i) => (
            <div key={step} className="relative border border-white/5 bg-zinc-900 p-7 text-left first:rounded-l-2xl last:rounded-r-2xl">
              {i < 3 && (
                <div className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 translate-x-1/2 md:block">
                  <ArrowRight className="h-4 w-4 text-zinc-700" />
                </div>
              )}
              <div className="font-mono text-[13px] font-bold text-blue-500">{step}</div>
              <div className="mt-3 text-[15px] font-medium leading-snug text-white">{label}</div>
              <p className="mt-2 text-[13px] font-light leading-relaxed text-zinc-600">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CapabilitiesSplit() {
  return (
    <section className="border-t border-white/5 bg-black py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-16 md:grid-cols-12 md:items-center">
          <div className="order-2 md:order-1 md:col-span-6">
            <CityscapeIllustration />
          </div>
          <div className="order-1 md:order-2 md:col-span-6">
            <div className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-zinc-600">
              Building intelligence
            </div>
            <h2 className="text-[38px] font-light leading-[1.05] tracking-[-0.02em] text-white md:text-[50px]">
              Every floor plate modeled. Every foundation mass accounted for.
            </h2>
            <p className="mt-6 text-lg font-light text-zinc-500">
              Seismic ingests USGS 3D structural geometries and matches them against Scripps synthetic seismograms at the site level. Underwriters get per-floor stress profiles — not regional averages — in seconds.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "Microsoft + USGS 3D geometry database, 280K+ structures",
                "Low-frequency (0.1–2.0 Hz) wave modeling for high-rise mass",
                "alpa(ti) decay variable calibrated on 40 years of USGS records",
                "Live recalibration on new ShakeMap event data",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/12">
                    <Check className="h-3 w-3 text-white/60" />
                  </div>
                  <span className="text-zinc-400">{item}</span>
                </li>
              ))}
            </ul>
            <Link href="/dashboard" className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-400 transition hover:text-white">
              Explore the dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CityscapeIllustration() {
  const PIXEL = 8;
  const GAP = 2;
  const UNIT = PIXEL + GAP;
  const SVG_W = 560;
  const SVG_H = 360;

  const hash = (a: number, b: number, c: number) => (a * 31 + b * 17 + c * 13) % 100;

  type BuildingDef = {
    x: number; cols: number; rows: number;
    type: "safe" | "critical" | "stripes" | "mixed";
    label?: string;
  };

  const buildings: BuildingDef[] = [
    { x: 8,   cols: 5,  rows: 16, type: "safe",     label: "SAFE STRUCTURE" },
    { x: 74,  cols: 7,  rows: 22, type: "safe" },
    { x: 162, cols: 14, rows: 33, type: "critical",  label: "CRITICAL HAZARD" },
    { x: 332, cols: 9,  rows: 23, type: "stripes" },
    { x: 442, cols: 8,  rows: 20, type: "safe",     label: "SAFE STRUCTURE" },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-950">
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          Portfolio risk map · 5 assets · San Francisco CBD
        </span>
        <div className="flex items-center gap-3 text-[10px] text-zinc-600">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-red-700" /> Critical
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-emerald-800" /> Safe
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full" preserveAspectRatio="xMidYMax meet">
        {/* ground line */}
        <line x1="0" y1={SVG_H - 2} x2={SVG_W} y2={SVG_H - 2} stroke="white" strokeOpacity="0.04" strokeWidth="1" />

        {buildings.map((b, bi) => {
          const bw = b.cols * UNIT - GAP;
          const bh = b.rows * UNIT - GAP;
          const topY = SVG_H - bh - 2;
          const cx = b.x + bw / 2;

          const pixels: React.ReactNode[] = [];
          for (let r = 0; r < b.rows; r++) {
            for (let c = 0; c < b.cols; c++) {
              if (hash(bi, r, c) < 10) continue; // ~10% gap for mosaic texture
              const floorRatio = (b.rows - 1 - r) / (b.rows - 1); // 0=top row, 1=bottom
              const heightFrac = 1 - floorRatio; // 1=top, 0=bottom

              let fill: string;
              if (b.type === "critical") {
                fill = heightFrac > 0.55 ? "#7a1a1a" : "#8f2424";
              } else if (b.type === "safe") {
                fill = heightFrac > 0.5 ? "#1a4a2a" : "#215c34";
              } else if (b.type === "stripes") {
                fill = r % 2 === 0 ? "#1a4a2a" : "#7a1a1a";
              } else {
                fill = heightFrac > 0.5 ? "#7a1a1a" : "#1a4a2a";
              }

              const opacity = 0.75 + (hash(r, c, bi * 3) % 25) / 100;
              pixels.push(
                <rect
                  key={`${bi}-${r}-${c}`}
                  x={b.x + c * UNIT} y={topY + r * UNIT}
                  width={PIXEL} height={PIXEL}
                  rx={1} fill={fill} opacity={opacity}
                />
              );
            }
          }

          return (
            <g key={bi}>
              {pixels}
              {b.label && (
                <text
                  x={cx} y={topY + bh / 2 + 3}
                  textAnchor="middle"
                  fontSize="5.5"
                  fill="white"
                  fillOpacity="0.35"
                  fontFamily="monospace"
                  fontWeight="700"
                  letterSpacing="0.8"
                >
                  {b.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function PillarsSection() {
  const pillars = [
    { icon: Database, title: "Scripps + USGS data", desc: "High-resolution synthetic seismograms and 3D building geometries updated continuously from authoritative sources." },
    { icon: BarChart3, title: "Resonance engine", desc: "PyTorch-accelerated structural simulation with the alpa(ti) decay variable tuned for large-mass foundations." },
    { icon: Zap, title: "Parametric triggers", desc: "Policy payouts fire automatically on ground motion exceedance — no adjuster, no delay, no dispute." },
    { icon: Globe, title: "Portfolio API", desc: "Batch-assess entire REIT portfolios in a single API call. Risk scores, premiums, and payout caps in one response." },
  ];
  return (
    <section className="border-t border-white/5 bg-zinc-950 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-zinc-600">A unified platform</div>
          <h2 className="text-[40px] font-light leading-[1.05] tracking-[-0.02em] text-white md:text-[52px]">
            Everything underwriters need in one API
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-light text-zinc-500">
            From a single high-rise to a 300-asset portfolio, Seismic gives commercial
            carriers and REITs the data they need to price, bind, and pay — instantly.
          </p>
        </div>
        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {pillars.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group rounded-2xl border border-white/5 bg-zinc-900 p-6 transition hover:-translate-y-0.5 hover:border-white/10">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/8 bg-zinc-800 transition group-hover:bg-zinc-700">
                <Icon className="h-5 w-5 text-white/50" />
              </div>
              <h3 className="mt-5 text-[17px] font-medium tracking-tight text-white">{title}</h3>
              <p className="mt-2 text-[13px] font-light leading-relaxed text-zinc-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DeveloperSection() {
  return (
    <section className="border-t border-white/5 bg-black py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-14 md:grid-cols-12 md:items-center">
          <div className="md:col-span-5">
            <div className="mb-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-600">
              <Terminal className="h-4 w-4" />
              Built for builders
            </div>
            <h2 className="text-[38px] font-light leading-[1.05] tracking-[-0.02em] text-white md:text-[50px]">
              One API call. Full risk profile.
            </h2>
            <p className="mt-6 text-lg font-light text-zinc-500">
              POST an address and building specs. Get back a structured risk assessment, premium recommendation, and payout trigger thresholds.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#docs" className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-[0_0_18px_rgba(59,130,246,0.3)] hover:bg-blue-500">
                Read docs <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full border border-white/12 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/5">
                Try the dashboard
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-white/5 pt-8">
              {[
                { icon: Clock, label: "< 400ms p99" },
                { icon: FileText, label: "REST + webhooks" },
                { icon: Shield, label: "SOC 2 Type II" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-zinc-600">
                  <Icon className="h-4 w-4 text-zinc-500" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-7">
            <ApiCard />
          </div>
        </div>
      </div>
    </section>
  );
}

function ApiCard() {
  const request = [
    { code: "curl https://api.seismic.io/v1/assess \\" },
    { code: "  -H 'Authorization: Bearer sk_live_***' \\", tone: "flag" },
    { code: "  -H 'Content-Type: application/json' \\", tone: "flag" },
    { code: "  -d '{", tone: "value" },
    { code: '    "address": "350 Mission St, SF, CA",', tone: "value" },
    { code: '    "floors": 48,', tone: "value" },
    { code: '    "structure": "rc_shear_wall"', tone: "value" },
    { code: "  }'", tone: "value" },
  ];
  const response = [
    { code: "{", tone: "value" },
    { code: '  "risk_score": 0.73,', tone: "value" },
    { code: '  "status": "high",', tone: "danger" },
    { code: '  "premium_usd": 1240,', tone: "value" },
    { code: '  "payout_cap_usd": 8400000,', tone: "value" },
    { code: '  "trigger_pgv_cms": 12.4,', tone: "value" },
    { code: '  "peak_stress_floor": 46,', tone: "danger" },
    { code: '  "model": "scripps-v3 + alpa_decay"', tone: "comment" },
    { code: "}", tone: "value" },
  ];
  const toneClass = (t?: string) =>
    t === "comment" ? "text-emerald-500/60"
    : t === "flag"  ? "text-amber-400/70"
    : t === "danger"? "text-red-400/70"
    : t === "value" ? "text-zinc-400"
    : "text-zinc-200";

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {[{ title: "Request", lines: request }, { title: "Response", lines: response }].map(({ title, lines }) => (
        <div key={title} className="overflow-hidden rounded-2xl border border-white/8 bg-zinc-950">
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/50" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
            </div>
            <span className="font-mono text-[10px] text-zinc-600">{title}</span>
          </div>
          <div className="p-4 font-mono text-[11px] leading-6">
            {lines.map(({ code, tone }, i) => (
              <div key={i} className="flex gap-3">
                <span className="w-4 shrink-0 select-none text-zinc-700">{i+1}</span>
                <code className={`whitespace-pre ${toneClass(tone)}`}>{code}</code>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TestimonialSection() {
  return (
    <section className="border-t border-white/5 bg-zinc-950 py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="rounded-3xl border border-white/8 bg-zinc-900 p-10 md:p-16">
          <div className="mb-6 text-[11px] font-semibold uppercase tracking-widest text-zinc-600">
            Customer story
          </div>
          <blockquote className="text-[26px] font-light leading-[1.3] tracking-tight text-white md:text-[34px]">
            "Seismic repriced our entire West Coast portfolio in 40 minutes. The
            per-floor stress profiles caught a risk concentration in two towers
            our legacy carrier had rated as standard for a decade."
          </blockquote>
          <div className="mt-8 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-zinc-800">
              <Building2 className="h-4 w-4 text-white/40" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Marcus Chen</div>
              <div className="text-xs font-light text-zinc-600">
                Chief Risk Officer · Northgate REIT · 48-asset West Coast portfolio
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function EnterpriseSection() {
  const rows = [
    { icon: Lock, title: "Enterprise security", desc: "SOC 2 Type II certified. All seismogram data and building geometries encrypted at rest and in transit with tenant-level isolation." },
    { icon: Clock, title: "Real-time seismic feeds", desc: "Continuous ingestion of USGS ShakeMaps and Scripps updates. Risk profiles recalibrate automatically on new event data." },
    { icon: FileText, title: "Full audit trail", desc: "Every pricing decision, trigger event, and payout transaction is logged immutably — audit-ready for regulators and carriers." },
  ];
  return (
    <section className="border-t border-white/5 bg-black py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-[40px] font-light leading-[1.05] tracking-[-0.02em] text-white md:text-[52px]">
            Built for the scrutiny of institutional underwriting
          </h2>
        </div>
        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {rows.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-white/5 bg-zinc-900 p-8 transition hover:border-white/10">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/8 bg-zinc-800">
                <Icon className="h-5 w-5 text-white/50" />
              </div>
              <h3 className="mt-6 text-[19px] font-medium tracking-tight text-white">{title}</h3>
              <p className="mt-3 font-light text-zinc-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section id="contact" className="relative overflow-hidden border-t border-white/5 bg-zinc-950 py-28 md:py-36">
      <div className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 100%, rgba(59,130,246,0.08) 0%, transparent 60%)" }} />
      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <h2 className="text-[50px] font-light leading-[1.03] tracking-[-0.025em] text-white md:text-[76px]">
          Ready to price your
          <br />
          portfolio to physics?
        </h2>
        <p className="mx-auto mt-8 max-w-xl text-lg font-light text-zinc-500">
          Get API access and a complimentary risk assessment of up to 10 buildings.
          No commitment. Results in under 24 hours.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 text-sm font-medium text-white shadow-[0_0_24px_rgba(59,130,246,0.35)] hover:bg-blue-500">
            Request API access <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="mailto:hello@seismic.io" className="inline-flex items-center gap-2 rounded-full border border-white/12 px-7 py-3.5 text-sm font-medium text-white hover:bg-white/5">
            Talk to sales
          </Link>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  const cols: { title: string; links: { label: string; href: string }[] }[] = [
    { title: "Platform", links: [
      { label: "Resonance modeling", href: "#" },
      { label: "Parametric pricing", href: "#" },
      { label: "Automated payouts", href: "#" },
      { label: "Portfolio API", href: "#" },
      { label: "Dashboard", href: "/dashboard" },
    ]},
    { title: "Data sources", links: [
      { label: "Scripps seismograms", href: "#" },
      { label: "USGS 3D geometries", href: "#" },
      { label: "ShakeMap feeds", href: "#" },
      { label: "Microsoft building data", href: "#" },
    ]},
    { title: "Developers", links: [
      { label: "API reference", href: "#" },
      { label: "Documentation", href: "#" },
      { label: "Changelog", href: "#" },
      { label: "System status", href: "#" },
      { label: "SDKs", href: "#" },
    ]},
    { title: "Company", links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Research", href: "#" },
      { label: "Contact", href: "#contact" },
      { label: "Security", href: "#" },
    ]},
  ];
  return (
    <footer className="border-t border-white/5 bg-black py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 text-[17px] font-semibold tracking-tight text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600">
                <Activity className="h-4 w-4 text-white" strokeWidth={2.5} />
              </span>
              Seismic
            </div>
            <p className="mt-4 text-sm font-light text-zinc-700">
              Physics-driven parametric insurance for commercial real estate.
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <div className="text-sm font-semibold text-zinc-400">{col.title}</div>
              <ul className="mt-4 space-y-3 text-sm font-light text-zinc-600">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="transition hover:text-white">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-8 text-sm text-zinc-700">
          <div>© {new Date().getFullYear()} Seismic Technologies, Inc.</div>
          <div className="flex flex-wrap gap-6">
            {["Privacy","Terms","Security","Sitemap"].map((l) => (
              <Link key={l} href="#" className="hover:text-white">{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
