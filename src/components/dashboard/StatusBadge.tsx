import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/types";

const CONFIG: Record<RiskLevel, { dot: string; text: string; ring: string; label: string }> = {
  critical: { dot: "bg-red-500",     text: "text-red-400",     ring: "bg-red-500/10 ring-red-500/25",     label: "Critical" },
  elevated: { dot: "bg-amber-400",   text: "text-amber-400",   ring: "bg-amber-500/10 ring-amber-500/25", label: "Elevated" },
  moderate: { dot: "bg-yellow-500",  text: "text-yellow-400",  ring: "bg-yellow-500/10 ring-yellow-500/25",label: "Moderate" },
  low:      { dot: "bg-emerald-500", text: "text-emerald-400", ring: "bg-emerald-500/10 ring-emerald-500/25",label: "Low" },
};

export function StatusBadge({ level }: { level: RiskLevel }) {
  const c = CONFIG[level];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset", c.ring)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
      <span className={c.text}>{c.label}</span>
    </span>
  );
}
