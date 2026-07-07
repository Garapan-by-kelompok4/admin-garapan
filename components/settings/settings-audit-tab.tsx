"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";
import { ActivityItem } from "@/lib/api/dashboard";
import { formatDateTime } from "@/lib/utils";

export interface SettingsAuditTabProps {
  auditLogs: ActivityItem[];
  isLoadingAudit: boolean;
}

export function SettingsAuditTab({
  auditLogs,
  isLoadingAudit,
}: SettingsAuditTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h3 className="font-heading font-bold text-sm text-ink-900">
            Log Aktivitas Admin
          </h3>
          <p className="text-[11px] text-ink-400 font-medium mt-0.5">
            Audit log terperinci dari seluruh operasi perubahan data dalam
            platform.
          </p>
        </div>
        <button
          onClick={() => {
            if (!auditLogs.length) {
              toast.error("Tidak ada log untuk diekspor");
              return;
            }
            const header = ["waktu", "aktor", "peran", "aksi", "pesan"];
            const rows = auditLogs.map((log) =>
              [
                log.createdAt,
                log.actorName,
                log.actorRole,
                log.action,
                log.message,
              ]
                .map((value) => `"${String(value).replaceAll('"', '""')}"`)
                .join(","),
            );
            const csv = [header.join(","), ...rows].join("\n");
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `garapan-audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
            link.click();
            URL.revokeObjectURL(url);
            toast.success("Log aktivitas berhasil diekspor (CSV)");
          }}
          className="h-9 px-3.5 border border-border bg-white text-[11px] font-bold text-ink-700 rounded-lg hover:bg-surface-3 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Download className="h-4 w-4 text-ink-450" /> Ekspor Log
        </button>
      </div>

      {isLoadingAudit ? (
        <div className="p-8 text-center text-xs text-ink-500 font-medium">
          Memuat log audit...
        </div>
      ) : (
        <div className="relative border-l border-border ml-2.5 pl-6 space-y-5 py-2 select-none">
          {auditLogs.map((log) => {
            let indicatorColor = "bg-brand-500";
            if (log.action === "user") indicatorColor = "bg-success-500";
            if (log.action === "report") indicatorColor = "bg-danger-500";
            return (
              <div key={log.id} className="relative">
                <span
                  className={`absolute -left-[32px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white ${indicatorColor} shadow-sm`}
                />
                <div className="text-xs text-ink-550">
                  <span className="font-bold text-ink-900">{log.actorName}</span>{" "}
                  <span className="text-[9px] bg-surface-3 px-1 rounded text-ink-450 font-bold uppercase tracking-wide">
                    {log.actorRole}
                  </span>
                  <span className="text-ink-200 mx-1.5">•</span>
                  <span className="text-[10px] text-ink-400">
                    {formatDateTime(log.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-ink-700 mt-1 font-semibold">
                  {log.message}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
