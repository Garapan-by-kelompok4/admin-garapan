"use client";

import { CheckCircle2, Package, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { OrderDetail } from "@/lib/api/orders";
import { avatarClass, initials } from "@/lib/avatar";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TransactionStatusPill } from "./transaction-status-pill";

interface TransactionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderDetail: OrderDetail | undefined;
  isLoading: boolean;
}

export function TransactionDetailDialog({
  open,
  onOpenChange,
  orderDetail,
  isLoading,
}: TransactionDetailDialogProps) {
  const handleClose = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[min(800px,95vw)] rounded-xl p-0 overflow-hidden border-border bg-white shadow-sh-3"
        showCloseButton={false}
      >
        {isLoading ? (
          <div className="flex flex-col h-full max-h-[85vh]">
            <div className="px-5 py-4 border-b border-border bg-surface-2/50">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 bg-surface-2 rounded animate-pulse w-48" />
                  <div className="h-5 bg-surface-2 rounded-full animate-pulse w-24" />
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 bg-surface-2 rounded animate-pulse w-28" />
                  <div className="h-3 bg-surface-2 rounded animate-pulse w-32" />
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border bg-white p-4 space-y-3"
                  >
                    <div className="h-3 bg-surface-2 rounded animate-pulse w-32" />
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-surface-2 animate-pulse" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-surface-2 rounded animate-pulse w-36" />
                        <div className="h-3 bg-surface-2 rounded animate-pulse w-28" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-border bg-white p-4 space-y-3">
                <div className="h-3 bg-surface-2 rounded animate-pulse w-36" />
                <div className="flex justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-surface-2 rounded animate-pulse w-48" />
                    <div className="h-3 bg-surface-2 rounded animate-pulse w-64" />
                  </div>
                  <div className="h-6 bg-surface-2 rounded animate-pulse w-28" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-surface-2 rounded animate-pulse w-36" />
                <div className="rounded-lg border border-border bg-white p-5 space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-4 w-4 rounded-full bg-surface-2 animate-pulse flex-shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div className="h-3 bg-surface-2 rounded animate-pulse w-32" />
                        <div className="h-3 bg-surface-2 rounded animate-pulse w-48" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5 py-3.5 border-t border-border bg-surface-2/40 flex justify-end">
              <div className="h-9 w-20 bg-surface-2 rounded-lg animate-pulse" />
            </div>
          </div>
        ) : orderDetail ? (
          <div className="flex flex-col h-full max-h-[85vh]">
            <div className="px-5 py-4 border-b border-border bg-surface-2/50">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-heading font-bold text-[15px] text-ink-900 tracking-tight leading-tight">
                      Detail Transaksi Escrow
                    </h2>
                    <TransactionStatusPill status={orderDetail.escrowStatus} />
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-ink-400 font-medium">
                    <span className="font-mono text-ink-500 bg-surface-3 px-1.5 py-0.5 rounded select-all">
                      {orderDetail.id.slice(0, 8)}…
                    </span>
                    <span>•</span>
                    <span>Dibuat {formatDate(orderDetail.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-white p-4 shadow-sh-1 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-500" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
                      Pembayar (Klien)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-xs font-bold border border-white shadow-sm flex-shrink-0 ${avatarClass(orderDetail.clientName)}`}
                    >
                      {initials(orderDetail.clientName)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-ink-900 truncate">
                        {orderDetail.clientName}
                      </div>
                      <div className="text-[11px] text-ink-400 mt-0.5 font-medium font-mono">
                        {orderDetail.clientId}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-white p-4 shadow-sh-1 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-warn-500" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
                      Penerima (Mahasiswa)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-xs font-bold border border-white shadow-sm flex-shrink-0 ${avatarClass(orderDetail.studentName)}`}
                    >
                      {initials(orderDetail.studentName)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-ink-900 truncate">
                        {orderDetail.studentName}
                      </div>
                      <div className="text-[11px] text-ink-400 mt-0.5 font-medium font-mono">
                        {orderDetail.studentId}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-white p-4 shadow-sh-1 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-success-500" />
                  <Package className="h-3.5 w-3.5 text-success-500" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
                    Detail Layanan Jasa
                  </span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-ink-900 leading-tight">
                      {orderDetail.serviceTitle}
                    </h4>
                    <p className="text-xs text-ink-500 font-medium mt-1">
                      Paket:{" "}
                      <span className="font-semibold text-ink-800">
                        {orderDetail.packageName || "Default"}
                      </span>
                      {orderDetail.packageDescription &&
                        ` — ${orderDetail.packageDescription}`}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-lg font-extrabold text-ink-900 tracking-tight">
                      {formatCurrency(orderDetail.amount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
                  Escrow Timeline Tracker
                </span>
                <div className="rounded-lg border border-border bg-white p-5 shadow-sh-1">
                  {orderDetail.timeline && orderDetail.timeline.length > 0 ? (
                    <div className="relative border-l-2 border-border ml-2.5 pl-6 space-y-6">
                      {orderDetail.timeline.map((step, idx) => {
                        const isActive = step.isCompleted;
                        return (
                          <div key={idx} className="relative">
                            <span
                              className={`absolute -left-[33px] top-0.5 h-4 w-4 rounded-full border-2 border-white flex items-center justify-center shadow-sm transition-all ${
                                isActive
                                  ? "bg-success-500 text-white"
                                  : "bg-surface-3 text-ink-300"
                              }`}
                            >
                              {isActive && (
                                <CheckCircle2 className="h-2.5 w-2.5 fill-success-500 text-white" />
                              )}
                            </span>

                            <div>
                              <h5
                                className={`text-xs font-bold ${isActive ? "text-ink-900" : "text-ink-400"}`}
                              >
                                {step.step}
                              </h5>
                              <p className="text-[11.5px] text-ink-400 font-medium mt-0.5">
                                {step.description}
                              </p>
                              {step.completedAt && (
                                <span className="inline-block text-[10px] text-ink-400 font-medium bg-surface-2 px-2 py-0.5 rounded border border-border/40 mt-2">
                                  Selesai {formatDate(step.completedAt)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="relative border-l-2 border-border ml-2.5 pl-6 space-y-6">
                      {[
                        {
                          step: "Pembayaran Escrow Diterima",
                          desc: "Klien telah mentransfer dana ke escrow platform.",
                          completed: true,
                          date: orderDetail.createdAt,
                        },
                        {
                          step: "Pekerjaan Mulai Dikerjakan",
                          desc: "Freelancer menyetujui penugasan dan mulai bekerja.",
                          completed: true,
                          date: orderDetail.createdAt,
                        },
                        {
                          step: "Freelancer Mengirimkan Hasil",
                          desc: "Pekerjaan diserahkan kepada Klien untuk direview.",
                          completed: orderDetail.escrowStatus !== "Ditahan",
                          date:
                            orderDetail.escrowStatus !== "Ditahan"
                              ? orderDetail.createdAt
                              : null,
                        },
                        {
                          step: "Dana Dicairkan / Refund",
                          desc: "Dana ditransfer ke freelancer setelah persetujuan klien atau diselesaikan admin.",
                          completed: orderDetail.escrowStatus !== "Ditahan",
                          date:
                            orderDetail.escrowStatus !== "Ditahan"
                              ? orderDetail.createdAt
                              : null,
                        },
                      ].map((step, idx) => (
                        <div key={idx} className="relative">
                          <span
                            className={`absolute -left-[33px] top-0.5 h-4 w-4 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${
                              step.completed
                                ? "bg-success-500 text-white"
                                : "bg-surface-3 text-ink-300"
                            }`}
                          >
                            {step.completed && (
                              <CheckCircle2 className="h-2.5 w-2.5 fill-success-500 text-white" />
                            )}
                          </span>
                          <div>
                            <h5
                              className={`text-xs font-bold ${step.completed ? "text-ink-900" : "text-ink-400"}`}
                            >
                              {step.step}
                            </h5>
                            <p className="text-[11.5px] text-ink-400 font-medium mt-0.5">
                              {step.desc}
                            </p>
                            {step.date && (
                              <span className="inline-block text-[10px] text-ink-400 font-medium bg-surface-2 px-2 py-0.5 rounded border border-border/40 mt-2">
                                {formatDate(step.date)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-border bg-surface-2/40 flex justify-end">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-semibold border border-border bg-white rounded-lg text-ink-700 hover:bg-surface-3 transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <X className="h-3.5 w-3.5" /> Tutup
              </button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
