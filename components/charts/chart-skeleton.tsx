import { Skeleton } from "@/components/ui/skeleton";

interface ChartSkeletonProps {
  className?: string;
}

export function ChartSkeleton({ className }: ChartSkeletonProps) {
  return (
    <div
      className={`rounded-xl border border-border bg-white p-5 shadow-sh-1 ${className ?? ""}`}
    >
      <Skeleton className="mb-4 h-4 w-32" />
      <Skeleton className="h-[220px] w-full rounded-lg" />
    </div>
  );
}
