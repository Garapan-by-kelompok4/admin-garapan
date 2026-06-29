"use client";

import { cn } from "@/lib/utils";

type Option = { label: string; value: string };

type SegmentedControlProps = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function SegmentedControl({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border border-border bg-surface-2 p-1",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
              active
                ? "bg-surface text-ink-900 shadow-sm"
                : "text-ink-500 hover:text-ink-700",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
