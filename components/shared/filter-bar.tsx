import { cn } from "@/lib/utils";

type FilterBarProps = {
  children: React.ReactNode;
  /** Right-aligned content, e.g. a result count. */
  trailing?: React.ReactNode;
  className?: string;
};

export function FilterBar({ children, trailing, className }: FilterBarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2.5", className)}>
      <div className="flex flex-wrap items-center gap-2.5">{children}</div>
      {trailing && (
        <div className="ml-auto text-[13px] text-ink-400">{trailing}</div>
      )}
    </div>
  );
}
