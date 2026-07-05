"use client";

import { useState, type ReactNode } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FlaggedContent } from "@/lib/api/content";
import { moderationContentLabels } from "@/lib/moderation/content-labels";
import { avatarClass, initials } from "@/lib/avatar";
import { formatDate } from "@/lib/utils";
import { ModerationStatusPill } from "./moderation-status-pill";
import { ModerationTypePill } from "./moderation-type-pill";

interface ModerationDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentDetail: FlaggedContent | null | undefined;
  isLoading: boolean;
  onRemove: (contentId: string) => void;
  onMarkSafe: (contentId: string) => void;
  isRemovePending?: boolean;
  isMarkSafePending?: boolean;
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

export function ModerationDetailDialog({
  open,
  onOpenChange,
  contentDetail,
  isLoading,
  onRemove,
  onMarkSafe,
  isRemovePending = false,
  isMarkSafePending = false,
}: ModerationDetailDialogProps) {
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showMarkSafeConfirm, setShowMarkSafeConfirm] = useState(false);
  const handleClose = () => onOpenChange(false);

  const labels = moderationContentLabels(contentDetail?.contentType ?? "jasa");
  const isActionPending = isRemovePending || isMarkSafePending;

  const handleRemove = () => {
    if (!contentDetail) return;
    setShowRemoveConfirm(true);
  };

  const handleConfirmRemove = () => {
    if (!contentDetail) return;
    onRemove(contentDetail.id);
    setShowRemoveConfirm(false);
  };

  const handleMarkSafe = () => {
    if (!contentDetail) return;
    setShowMarkSafeConfirm(true);
  };

  const handleConfirmMarkSafe = () => {
    if (!contentDetail) return;
    onMarkSafe(contentDetail.id);
    setShowMarkSafeConfirm(false);
  };

  return (
    <>
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
                    <div className="h-5 bg-surface-2 rounded-full animate-pulse w-20" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 bg-surface-2 rounded animate-pulse w-24" />
                    <div className="h-3 bg-surface-2 rounded animate-pulse w-32" />
                  </div>
                </div>
              </div>
              <div className="grid flex-1 grid-cols-1 gap-5 overflow-y-auto bg-surface-2/40 p-6 lg:grid-cols-[1fr_360px]">
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-border bg-white px-3 py-2 space-y-2"
                      >
                        <div className="h-3 bg-surface-2 rounded animate-pulse w-20" />
                        <div className="h-4 bg-surface-2 rounded animate-pulse w-28" />
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border border-border bg-white p-4 space-y-3">
                    <div className="h-3 bg-surface-2 rounded animate-pulse w-32" />
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-surface-2 animate-pulse" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-surface-2 rounded animate-pulse w-36" />
                        <div className="h-3 bg-surface-2 rounded animate-pulse w-40" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-white p-4 space-y-4">
                  <div className="h-3 bg-surface-2 rounded animate-pulse w-36" />
                  <div className="h-9 bg-surface-2 rounded animate-pulse w-full" />
                </div>
              </div>
            </div>
          ) : contentDetail ? (
            <div className="flex flex-col h-full max-h-[85vh]">
              <div className="border-b border-border bg-white px-6 py-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-heading text-xl font-bold tracking-tight text-ink-900">
                        {labels.detailTitle}
                      </h2>
                      <ModerationTypePill contentType={contentDetail.contentType} />
                      <ModerationStatusPill status={contentDetail.status} />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-ink-400">
                      <span className="font-mono text-ink-500 bg-surface-3 px-1.5 py-0.5 rounded select-all">
                        {contentDetail.id.slice(0, 8)}…
                      </span>
                      <span>•</span>
                      <span>
                        Diposting {formatDate(contentDetail.createdAt)}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleClose}
                    aria-label="Tutup detail moderasi"
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
                      icon={<ClipboardList className="h-3.5 w-3.5" />}
                      label={labels.idLabel}
                      value={`${contentDetail.id.slice(0, 8)}...`}
                      mono
                    />
                    <MetadataItem
                      icon={<Tag className="h-3.5 w-3.5" />}
                      label="Kategori"
                      value={contentDetail.category || "—"}
                    />
                    <MetadataItem
                      icon={<CalendarDays className="h-3.5 w-3.5" />}
                      label="Tanggal Posting"
                      value={formatDate(contentDetail.createdAt)}
                    />
                    <MetadataItem
                      icon={<AlertTriangle className="h-3.5 w-3.5" />}
                      label="Jumlah Laporan"
                      value={
                        contentDetail.reportCount != null
                          ? String(contentDetail.reportCount)
                          : "—"
                      }
                    />
                  </div>

                  <PersonCard
                    label={labels.ownerRole}
                    toneClassName="bg-brand-500"
                    name={contentDetail.owner?.fullName ?? "-"}
                    email={contentDetail.owner?.email ?? "-"}
                    id={contentDetail.owner?.id ?? ""}
                  />

                  <section className="rounded-lg border border-border bg-white p-5 shadow-sh-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-brand-500" />
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
                        {labels.previewTitle}
                      </h4>
                    </div>
                    <div className="mt-4 rounded-lg border border-border border-l-2 border-l-brand-400 bg-white p-4">
                      <h4 className="text-sm font-semibold text-ink-900 leading-snug">
                        {contentDetail.title}
                      </h4>
                      <p className="mt-3 text-sm font-medium leading-relaxed text-ink-700">
                        {contentDetail.description ||
                          "Tidak ada deskripsi jasa yang diberikan."}
                      </p>
                    </div>
                  </section>

                  <section className="rounded-lg border border-border bg-white p-5 shadow-sh-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-warn-500" />
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
                          Rincian Laporan
                        </h4>
                      </div>
                      <span className="text-[11px] font-semibold text-ink-400">
                        {contentDetail.reports?.length ?? 0} entri
                      </span>
                    </div>
                    <div className="mt-4">
                      {contentDetail.reports &&
                      contentDetail.reports.length > 0 ? (
                        <div className="relative ml-2.5 space-y-4 border-l border-border pl-5">
                          {contentDetail.reports.map((rep) => (
                            <div key={rep.id} className="relative">
                              <span className="absolute -left-[26px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-warn-500 shadow-sm" />
                              <div className="text-[11px] text-ink-500">
                                <span className="font-semibold text-ink-900">
                                  {rep.reporterName}
                                </span>
                                <span className="mx-1 text-ink-300">•</span>
                                <span className="rounded bg-surface-3 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-ink-400">
                                  {rep.category}
                                </span>
                                <span className="mx-1 text-ink-300">•</span>
                                <span className="text-ink-400">
                                  {formatDate(rep.createdAt)}
                                </span>
                              </div>
                              <p className="mt-1.5 rounded-lg border border-border/50 bg-surface-2 p-3 text-xs font-medium text-ink-700 italic">
                                &ldquo;{rep.reason}&rdquo;
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed border-border bg-surface-2 px-5 py-10 text-center">
                          <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-ink-300" />
                          <p className="text-xs font-medium text-ink-400">
                            Laporan detail tidak tersedia untuk item ini.
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
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-ink-900">
                          Tindakan Moderasi
                        </h3>
                        <p className="mt-1 text-xs font-medium leading-relaxed text-ink-500">
                          {labels.moderationBlurb}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4">
                      {contentDetail.status !== "Dihapus" && (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleMarkSafe}
                            disabled={isActionPending}
                            className="w-full text-sm font-semibold border-success-200 text-success-700 hover:bg-success-50"
                          >
                            <CheckCircle2 className="h-4 w-4" />{" "}
                            {labels.markSafeAction}
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={handleRemove}
                            disabled={isActionPending}
                            className="w-full text-sm font-semibold"
                          >
                            <Trash2 className="h-4 w-4" /> {labels.removeAction}
                          </Button>
                        </>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isActionPending}
                        className="w-full text-sm font-semibold"
                      >
                        <X className="h-3.5 w-3.5" /> Tutup Detail
                      </Button>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showRemoveConfirm}
        onOpenChange={setShowRemoveConfirm}
        title={labels.removeTitle}
        description={labels.removeDescription}
        confirmLabel={labels.removeAction}
        onConfirm={handleConfirmRemove}
      />

      <ConfirmDialog
        open={showMarkSafeConfirm}
        onOpenChange={setShowMarkSafeConfirm}
        title={labels.markSafeTitle}
        description={labels.markSafeDescription}
        confirmLabel={labels.markSafeAction}
        onConfirm={handleConfirmMarkSafe}
      />
    </>
  );
}
