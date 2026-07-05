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
    <div className="lg:col-span-2 bg-white border border-border rounded-xl overflow-hidden shadow-sh-1">
      <div className="p-4 bg-white border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-heading font-bold text-sm text-ink-900">
            Aktivitas Audit Log Terbaru
          </h3>
          <p className="text-[11px] text-ink-400 font-medium mt-0.5">
            Audit otomatis aktivitas admin dan peristiwa penting di marketplace.
          </p>
        </div>
        <Link
          href="/settings?tab=audit"
          className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          Lihat Semua <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="divide-y divide-border max-h-[360px] overflow-y-auto">
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
                className="p-3.5 px-5 flex items-start gap-4 hover:bg-surface-2 transition-all"
              >
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center border ${badgeStyle} flex-shrink-0`}
                >
                  <Activity className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-ink-700 font-medium leading-relaxed">
                    <span className="font-bold text-ink-900">
                      {act.actorName}
                    </span>{" "}
                    ({act.actorRole}): {act.message}
                  </div>
                  <div className="text-[10px] text-ink-450 mt-1 font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" />
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
