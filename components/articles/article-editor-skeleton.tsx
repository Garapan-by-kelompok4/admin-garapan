import { Skeleton } from "@/components/ui/skeleton";

export function ArticleEditorSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-28" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-5 rounded-xl border border-border bg-white p-5 shadow-sh-1 lg:col-span-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[180px] w-full rounded-lg" />
          <Skeleton className="h-[320px] w-full rounded-lg" />
        </div>
        <Skeleton className="h-[420px] w-full rounded-xl" />
      </div>
    </div>
  );
}
