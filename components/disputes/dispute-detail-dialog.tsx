"use client";

import type { ReactNode } from "react";
import {
  AlertTriangle,
  CalendarDays,
  ClipboardList,
  FileText,
  MessageSquare,
  ReceiptText,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DisputeDetail,
  ResolveDisputePayload,
} from "@/lib/api/disputes";
import { avatarClass, initials } from "@/lib/avatar";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  DisputePriorityPill,
  DisputeStatusPill,
} from "./dispute-status-pill";
import { ResolutionForm } from "./resolution-form";

interface DisputeDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disputeDetail: DisputeDetail | undefined;
  isLoading: boolean;
  onResolve: (params: { id: string; payload: ResolveDisputePayload }) => void;
  isResolvePending: boolean;
}

function MetadataItem({
  icon,
  label,
  value,
  mono,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2 shadow-sh-1">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-400">
        {icon}
        {label}
      </div>
      <div
        className={`mt-1 truncate text-sm font-semibold text-ink-900 ${mono ? "font-mono" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}

function PersonCard({
  label,
  toneClassName,
  name,
  email,
  id,
}: {
  label: string;
  toneClassName: string;
  name: string;
  email: string;
  id: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-white p-4 shadow-sh-1">
      <div className="flex items-center gap-2">
        <span className={`inline-block h-1.5 w-1.5 rounded-full ${toneClassName}`} />
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
          {label}
        </h4>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white text-sm font-bold text-white shadow-sm ${avatarClass(name)}`}
        >
          {initials(name)}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-ink-900">
            {name}
          </div>
          <div className="mt-0.5 truncate text-[11px] text-ink-400">
            {email}
          </div>
          {id && (
            <div className="mt-1 font-mono text-[10px] font-semibold text-ink-400">
              {id.slice(0, 8)}…
            </div>
          )}
        </div>
      </div>
    </div>
  );
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
        className="!w-[min(1180px,96vw)] !max-w-none sm:!max-w-none rounded-xl p-0 overflow-hidden border-border bg-white shadow-sh-3"
        showCloseButton={false}
      >
        {isLoading ? (
          <div className="flex flex-col h-full max-h-[85vh]">
            <div className="border-b border-border bg-surface-2/50 px-6 py-5">
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
            <div className="grid flex-1 grid-cols-1 gap-5 overflow-y-auto bg-surface-2/40 p-6 lg:grid-cols-[1fr_360px]">
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
                <div className="rounded-lg border border-border bg-white p-4 space-y-3">
                  <div className="h-3 bg-surface-2 rounded animate-pulse w-40" />
                  <div className="h-5 bg-surface-2 rounded animate-pulse w-24" />
                  <div className="space-y-2">
                    <div className="h-3 bg-surface-2 rounded animate-pulse w-full" />
                    <div className="h-3 bg-surface-2 rounded animate-pulse w-3/4" />
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-white p-4 space-y-4">
                <div className="h-3 bg-surface-2 rounded animate-pulse w-44" />
                <div className="h-9 bg-surface-2 rounded animate-pulse w-full" />
                <div className="h-28 bg-surface-2 rounded animate-pulse w-full" />
                <div className="flex gap-2">
                  <div className="h-9 bg-surface-2 rounded-lg animate-pulse flex-1" />
                  <div className="h-9 bg-surface-2 rounded-lg animate-pulse flex-1" />
                </div>
              </div>
            </div>
          </div>
        ) : disputeDetail ? (
          <div className="flex flex-col h-full max-h-[85vh]">
            <div className="border-b border-border bg-white px-6 py-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-heading text-xl font-bold tracking-tight text-ink-900">
                      Dispute & Laporan
                    </h2>
                    <DisputePriorityPill priority={disputeDetail.priority} />
                    <DisputeStatusPill status={disputeDetail.status} />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-ink-400">
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
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleClose}
                  aria-label="Tutup detail dispute"
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid flex-1 grid-cols-1 gap-5 overflow-y-auto bg-surface-2/50 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <main className="min-w-0 space-y-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <MetadataItem
                    icon={<ReceiptText className="h-3.5 w-3.5" />}
                    label="ID Laporan"
                    value={`${disputeDetail.id.slice(0, 8)}...`}
                    mono
                  />
                  <MetadataItem
                    icon={<ClipboardList className="h-3.5 w-3.5" />}
                    label="Transaksi"
                    value={disputeDetail.orderId ? `${disputeDetail.orderId.slice(0, 8)}...` : "-"}
                    mono
                  />
                  <MetadataItem
                    icon={<CalendarDays className="h-3.5 w-3.5" />}
                    label="Dilaporkan"
                    value={formatDate(disputeDetail.createdAt)}
                  />
                  <MetadataItem
                    icon={<FileText className="h-3.5 w-3.5" />}
                    label="Nilai Pesanan"
                    value={formatCurrency(disputeDetail.orderAmount)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <PersonCard
                    label="Pelapor (Klien)"
                    toneClassName="bg-brand-500"
                    name={disputeDetail.reporterName}
                    email={disputeDetail.reporterEmail}
                    id={disputeDetail.reporterId}
                  />
                  <PersonCard
                    label="Terlapor (Mahasiswa)"
                    toneClassName="bg-warn-500"
                    name={disputeDetail.reportedName}
                    email={disputeDetail.reportedEmail}
                    id={disputeDetail.reportedId}
                  />
                </div>

                <section className="rounded-lg border border-border bg-white p-5 shadow-sh-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-brand-500" />
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
                      Deskripsi Masalah
                    </h4>
                  </div>
                  <div className="mt-4 rounded-lg border border-border border-l-2 border-l-brand-400 bg-white p-4">
                    <span className="inline-block rounded bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-600">
                      {disputeDetail.issueType}
                    </span>
                    <p className="mt-3 text-sm font-medium leading-relaxed text-ink-700">
                      {disputeDetail.description ||
                        "Tidak ada deskripsi laporan tertulis."}
                    </p>
                  </div>
                </section>

                <section className="rounded-lg border border-border bg-white p-5 shadow-sh-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-brand-500" />
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
                        Riwayat Komunikasi &amp; Laporan
                      </h4>
                    </div>
                    <span className="text-[11px] font-semibold text-ink-400">
                      {disputeDetail.communicationHistory?.length ?? 0} entri
                    </span>
                  </div>
                  <div className="mt-4">
                    {disputeDetail.communicationHistory &&
                    disputeDetail.communicationHistory.length > 0 ? (
                      <div className="relative ml-2.5 space-y-4 border-l border-border pl-5">
                        {disputeDetail.communicationHistory.map((item) => (
                          <div key={item.id} className="relative">
                            <span className="absolute -left-[26px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-brand-500 shadow-sm" />
                            <div className="text-[11px] text-ink-500">
                              <span className="font-semibold text-ink-900">
                                {item.senderName}
                              </span>{" "}
                              <span className="rounded bg-surface-3 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-ink-400">
                                {item.senderRole}
                              </span>
                              <span className="mx-1 text-ink-300">•</span>
                              <span className="text-ink-400">
                                {formatDate(item.createdAt)}
                              </span>
                            </div>
                            <p className="mt-1.5 rounded-lg border border-border/50 bg-surface-2 p-3 text-xs font-medium text-ink-700">
                              {item.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-border bg-surface-2 px-5 py-10 text-center">
                        <MessageSquare className="mx-auto mb-2 h-8 w-8 text-ink-300" />
                        <p className="text-xs font-medium text-ink-400">
                          Belum ada riwayat percakapan dispute.
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              </main>

              <aside className="min-w-0 lg:sticky lg:top-0 lg:self-start">
                <div className="rounded-lg border border-border bg-white p-5 shadow-sh-2">
                  <div className="flex items-start gap-3 border-b border-border pb-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <ReceiptText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-ink-900">
                        Keputusan Resolusi
                      </h3>
                      <p className="mt-1 text-xs font-medium leading-relaxed text-ink-500">
                        Pilih keputusan escrow dan catat alasan resmi untuk
                        audit internal.
                      </p>
                    </div>
                  </div>

                  <ResolutionForm
                    key={disputeDetail.id}
                    disputeDetail={disputeDetail}
                    onResolve={onResolve}
                    onClose={handleClose}
                    isPending={isResolvePending}
                    className="pt-4"
                  />

                  {disputeDetail.status !== "Terbuka" &&
                    disputeDetail.status !== "Diproses" && (
                      <div className="pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleClose}
                          className="w-full text-sm font-semibold"
                        >
                          <X className="h-3.5 w-3.5" /> Tutup Detail
                        </Button>
                      </div>
                    )}
                </div>
              </aside>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
