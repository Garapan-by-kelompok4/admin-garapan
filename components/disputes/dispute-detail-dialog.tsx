"use client";

import { MessageSquare, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DisputeDetail,
  ResolveDisputePayload,
} from "@/lib/api/disputes";
import { avatarClass, initials } from "@/lib/avatar";
import { formatDate } from "@/lib/utils";
import {
  DisputePriorityPill,
  DisputeStatusPill,
} from "./dispute-status-pill";
import { DisputeResolutionForm } from "./dispute-resolution-form";

interface DisputeDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disputeDetail: DisputeDetail | undefined;
  isLoading: boolean;
  onResolve: (params: { id: string; payload: ResolveDisputePayload }) => void;
  isResolvePending: boolean;
}

export function DisputeDetailDialog({
  open,
  onOpenChange,
  disputeDetail,
  isLoading,
  onResolve,
  isResolvePending,
}: DisputeDetailDialogProps) {
  const handleClose = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[min(850px,95vw)] rounded-xl p-0 overflow-hidden border-border bg-white shadow-sh-3"
        showCloseButton={false}
      >
        {isLoading ? (
          <div className="flex flex-col h-full max-h-[85vh]">
            <div className="px-5 py-4 border-b border-border bg-surface-2/50">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 bg-surface-2 rounded animate-pulse w-40" />
                  <div className="h-5 bg-surface-2 rounded animate-pulse w-14" />
                  <div className="h-5 bg-surface-2 rounded-full animate-pulse w-20" />
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 bg-surface-2 rounded animate-pulse w-24" />
                  <div className="h-3 bg-surface-2 rounded animate-pulse w-32" />
                  <div className="h-3 bg-surface-2 rounded animate-pulse w-28" />
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border bg-white p-4 space-y-3"
                  >
                    <div className="h-3 bg-surface-2 rounded animate-pulse w-28" />
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-surface-2 animate-pulse" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-surface-2 rounded animate-pulse w-32" />
                        <div className="h-3 bg-surface-2 rounded animate-pulse w-40" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-surface-2 rounded animate-pulse w-40" />
                <div className="rounded-lg border border-border p-4 space-y-3">
                  <div className="h-5 bg-surface-2 rounded animate-pulse w-24" />
                  <div className="space-y-2">
                    <div className="h-3 bg-surface-2 rounded animate-pulse w-full" />
                    <div className="h-3 bg-surface-2 rounded animate-pulse w-3/4" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-surface-2 rounded animate-pulse w-48" />
                <div className="rounded-lg border border-border p-4 space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 bg-surface-2 rounded animate-pulse w-32" />
                      <div className="h-3 bg-surface-2 rounded animate-pulse w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5 py-3.5 border-t border-border bg-surface-2/40 flex justify-end gap-2.5">
              <div className="h-9 w-20 bg-surface-2 rounded-lg animate-pulse" />
              <div className="h-9 w-28 bg-surface-2 rounded-lg animate-pulse" />
            </div>
          </div>
        ) : disputeDetail ? (
          <div className="flex flex-col h-full max-h-[85vh]">
            <div className="px-5 py-4 border-b border-border bg-surface-2/50">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-heading font-bold text-[15px] text-ink-900 tracking-tight leading-tight">
                      Dispute & Laporan
                    </h2>
                    <DisputePriorityPill priority={disputeDetail.priority} />
                    <DisputeStatusPill status={disputeDetail.status} />
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-ink-400 font-medium flex-wrap">
                    <span className="font-mono text-ink-500 bg-surface-3 px-1.5 py-0.5 rounded select-all">
                      {disputeDetail.id.slice(0, 8)}…
                    </span>
                    <span>•</span>
                    <span>Transaksi</span>
                    <span className="font-mono font-bold text-brand-600 select-all">
                      {disputeDetail.orderId?.slice(0, 8)}…
                    </span>
                    <span>•</span>
                    <span>
                      Dilaporkan {formatDate(disputeDetail.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-white p-4 shadow-sh-1 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-500" />
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
                      Pelapor (Klien)
                    </h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold border border-white shadow-sm ${avatarClass(disputeDetail.reporterName)}`}
                    >
                      {initials(disputeDetail.reporterName)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-ink-900 truncate">
                        {disputeDetail.reporterName}
                      </div>
                      <div className="text-[11px] text-ink-400 mt-0.5 truncate">
                        {disputeDetail.reporterEmail}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-white p-4 shadow-sh-1 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-warn-500" />
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
                      Terlapor (Mahasiswa)
                    </h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold border border-white shadow-sm ${avatarClass(disputeDetail.reportedName)}`}
                    >
                      {initials(disputeDetail.reportedName)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-ink-900 truncate">
                        {disputeDetail.reportedName}
                      </div>
                      <div className="text-[11px] text-ink-400 mt-0.5 truncate">
                        {disputeDetail.reportedEmail}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
                  Deskripsi Masalah
                </h4>
                <div className="rounded-lg border border-border border-l-2 border-l-brand-400 bg-white p-4 space-y-2">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                    {disputeDetail.issueType}
                  </span>
                  <p className="text-sm text-ink-700 leading-relaxed font-medium">
                    {disputeDetail.description ||
                      "Tidak ada deskripsi laporan tertulis."}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
                  Riwayat Komunikasi &amp; Laporan
                </h4>
                <div className="rounded-lg border border-border bg-white p-4 max-h-[180px] overflow-y-auto">
                  {disputeDetail.communicationHistory &&
                  disputeDetail.communicationHistory.length > 0 ? (
                    <div className="relative border-l border-border ml-2.5 pl-5 space-y-4">
                      {disputeDetail.communicationHistory.map((item) => (
                        <div key={item.id} className="relative">
                          <span className="absolute -left-[26px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-brand-500 shadow-sm" />
                          <div className="text-[11px] text-ink-500">
                            <span className="font-semibold text-ink-900">
                              {item.senderName}
                            </span>{" "}
                            <span className="text-[10px] bg-surface-3 px-1.5 py-0.5 rounded text-ink-400 font-semibold uppercase">
                              {item.senderRole}
                            </span>
                            <span className="text-ink-300 mx-1">•</span>
                            <span className="text-ink-400">
                              {formatDate(item.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-ink-700 mt-1.5 font-medium bg-surface-2 p-3 rounded-lg border border-border/50">
                            {item.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <MessageSquare className="h-8 w-8 text-ink-300 mx-auto mb-2" />
                      <p className="text-xs text-ink-400 font-medium">
                        Belum ada riwayat percakapan dispute.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <DisputeResolutionForm
                key={disputeDetail.id}
                disputeDetail={disputeDetail}
                onResolve={onResolve}
                onClose={handleClose}
                isPending={isResolvePending}
              />
            </div>

            {disputeDetail.status !== "Terbuka" &&
              disputeDetail.status !== "Diproses" && (
                <div className="px-5 py-3.5 border-t border-border bg-surface-2/40 flex justify-end">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-semibold border border-border bg-white rounded-lg text-ink-700 hover:bg-surface-3 transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    <X className="h-3.5 w-3.5" /> Tutup Detail
                  </button>
                </div>
              )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
