import * as React from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FieldProps = {
  label?: React.ReactNode;
  htmlFor?: string;
  error?: string;
  hint?: React.ReactNode;
  /** Optional element rendered on the right of the label row (e.g. a link). */
  labelAddon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

/** Label + control + error/hint wrapper for forms (React Hook Form friendly). */
export function Field({
  label,
  htmlFor,
  error,
  hint,
  labelAddon,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {(label || labelAddon) && (
        <div className="flex items-baseline justify-between">
          {label ? <Label htmlFor={htmlFor}>{label}</Label> : <span />}
          {labelAddon}
        </div>
      )}
      {children}
      {error ? (
        <p className="text-xs text-danger-500">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-400">{hint}</p>
      ) : null}
    </div>
  );
}
