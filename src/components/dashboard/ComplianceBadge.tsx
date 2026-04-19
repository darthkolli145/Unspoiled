import { cn } from "@/lib/utils";
import type { ThresholdStatus } from "@/lib/types";

const CONFIG: Record<
  ThresholdStatus,
  { dot: string; text: string; ring: string; label: string }
> = {
  above: {
    dot: "bg-un-tomato",
    text: "text-un-tomato",
    ring: "bg-un-tomato/10 ring-un-tomato/30",
    label: "Above threshold",
  },
  near: {
    dot: "bg-un-gold-400",
    text: "text-un-sage-700",
    ring: "bg-un-gold-200 ring-un-gold-400/40",
    label: "Near threshold",
  },
  below: {
    dot: "bg-un-sage-500",
    text: "text-un-sage-700",
    ring: "bg-un-sage-100 ring-un-sage-500/25",
    label: "Below threshold",
  },
};

export function ThresholdBadge({ status }: { status: ThresholdStatus }) {
  const c = CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
        c.ring,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
      <span className={c.text}>{c.label}</span>
    </span>
  );
}

export function CoveredBadge({ covered }: { covered: boolean }) {
  return covered ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-un-forest px-2 py-0.5 text-[11px] font-semibold text-un-cream-50">
      <span className="h-1.5 w-1.5 rounded-full bg-un-coral-400" />
      Under ban
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-un-cream-200 px-2 py-0.5 text-[11px] font-semibold text-un-ink-soft ring-1 ring-inset ring-un-line">
      Exempt
    </span>
  );
}
