import Link from "next/link";
import { Activity, ArrowRight, Clock } from "lucide-react";

import type { ActivityItem } from "@/lib/api/dashboard";
import { formatDate } from "@/lib/utils";

interface DashboardActivityFeedProps {
  activities: ActivityItem[];
  isLoading: boolean;
}

export function DashboardActivityFeed({
  activities,
  isLoading,
}: DashboardActivityFeedProps) {
  return (
    <div className="lg:col-span-2 min-h-[458px] bg-white border border-border rounded-xl overflow-hidden shadow-sh-1">
      <div className="flex flex-col gap-3 border-b border-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="font-heading font-bold text-sm text-ink-900">
            Aktivitas Audit Log Terbaru
          </h3>
          <p className="mt-0.5 text-[11px] font-medium leading-5 text-ink-400">
            Audit otomatis aktivitas admin dan peristiwa penting di marketplace.
          </p>
        </div>
        <Link
          href="/settings?tab=audit"
          className="inline-flex h-8 w-fit shrink-0 items-center gap-1 rounded-lg border border-brand-100 bg-brand-50 px-2.5 text-xs font-bold whitespace-nowrap text-brand-600 hover:text-brand-700 sm:border-0 sm:bg-transparent sm:px-0"
        >
          Lihat Semua <ArrowRight className="h-3 w-3 shrink-0" />
        </Link>
      </div>

      <div className="divide-y divide-border h-[360px] overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="p-4 flex gap-3 animate-pulse">
              <div className="h-8 w-8 rounded bg-surface-3" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-surface-3 rounded w-1/4" />
                <div className="h-2 bg-surface-3 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : activities.length > 0 ? (
          activities.map((act) => {
            let badgeStyle = "bg-brand-50 border-brand-100 text-brand-600";
            if (act.action === "user")
              badgeStyle =
                "bg-success-50 border-success-100 text-success-600";
            if (act.action === "report")
              badgeStyle = "bg-danger-50 border-danger-100 text-danger-600";

            return (
              <div
                key={act.id}
                className="flex items-start gap-3 p-4 transition-all hover:bg-surface-2 sm:gap-4 sm:px-5"
              >
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center border ${badgeStyle} flex-shrink-0`}
                >
                  <Activity className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium leading-relaxed text-ink-700">
                    <span className="font-bold text-ink-900">
                      {act.actorName}
                    </span>{" "}
                    ({act.actorRole}): {act.message}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1 text-[10px] font-medium text-ink-450">
                    <Clock className="h-3 w-3 shrink-0" />
                    {new Date(act.createdAt).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    <span className="text-ink-200">•</span>
                    {formatDate(act.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-xs text-ink-400 font-medium">
            Belum ada log aktivitas hari ini.
          </div>
        )}
      </div>
    </div>
  );
}
