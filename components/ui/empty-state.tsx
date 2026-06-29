import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  hint?: string;
  action?: React.ReactNode;
  className?: string;
};

/** Centered icon + title + hint, used for empty tables and placeholder pages. */
export function EmptyState({
  icon: Icon,
  title,
  hint,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[280px] flex-col items-center justify-center gap-3 text-center",
        className,
      )}
    >
      {Icon && (
        <div className="grid size-14 place-items-center rounded-xl bg-brand-50 text-brand-500">
          <Icon className="size-7" strokeWidth={1.75} />
        </div>
      )}
      <h3 className="font-display text-lg font-bold text-ink-900">{title}</h3>
      {hint && <p className="max-w-sm text-sm text-ink-400">{hint}</p>}
      {action}
    </div>
  );
}
