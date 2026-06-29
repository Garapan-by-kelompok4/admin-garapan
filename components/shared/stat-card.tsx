import { ArrowDown, ArrowUp, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Tone = "brand" | "success" | "warn" | "danger";

const TONE: Record<Tone, string> = {
  brand: "bg-brand-500/10 text-brand-500",
  success: "bg-success-500/10 text-success-500",
  warn: "bg-warn-500/10 text-warn-500",
  danger: "bg-danger-500/10 text-danger-500",
};

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  tone?: Tone;
  delta?: { value: string; direction: "up" | "down" };
  deltaLabel?: string;
  sparkline?: React.ReactNode;
  className?: string;
};

export function StatCard({
  icon: Icon,
  label,
  value,
  tone = "brand",
  delta,
  deltaLabel = "vs bulan lalu",
  sparkline,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex min-h-[138px] flex-col rounded-lg border border-border bg-surface p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "grid size-[38px] place-items-center rounded-[9px]",
            TONE[tone],
          )}
        >
          <Icon className="size-[18px]" strokeWidth={1.75} />
        </div>
        {delta && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
              delta.direction === "up"
                ? "bg-success-50 text-success-700"
                : "bg-danger-50 text-danger-700",
            )}
          >
            {delta.direction === "up" ? (
              <ArrowUp className="size-3" />
            ) : (
              <ArrowDown className="size-3" />
            )}
            {delta.value}
          </span>
        )}
      </div>
      <div className="mt-3.5 text-[12.5px] font-medium text-ink-400">{label}</div>
      <div className="mt-0.5 font-display text-[28px] font-extrabold tracking-tight text-ink-900">
        {value}
      </div>
      {delta && deltaLabel && (
        <div className="mt-1 text-xs text-ink-400">{deltaLabel}</div>
      )}
      {sparkline && <div className="mt-auto pt-3">{sparkline}</div>}
    </div>
  );
}
