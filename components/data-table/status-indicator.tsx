import { cn } from "@/lib/utils";

const bulletSize = "h-1.5 w-1.5 shrink-0";

export function StatusStack({
  className,
  sublabel,
  children,
}: {
  className?: string;
  sublabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {children}
      {sublabel ? (
        <span className="pl-3 text-[11px] font-medium text-ink-400">
          {sublabel}
        </span>
      ) : null}
    </div>
  );
}

export function StatusIndicator({
  label,
  dotClassName,
  labelClassName,
  showDot = true,
}: {
  label: string;
  dotClassName?: string;
  labelClassName?: string;
  showDot?: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-1.5">
      {showDot && dotClassName ? (
        <span className={cn(bulletSize, "rounded-full", dotClassName)} />
      ) : (
        <span className={bulletSize} aria-hidden />
      )}
      <span className={labelClassName}>{label}</span>
    </div>
  );
}
