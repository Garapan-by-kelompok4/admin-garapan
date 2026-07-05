"use client";

import { AlertTriangle, Trash2, FileText, Tag } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FlaggedContent } from "@/lib/api/content";
import { avatarClass, initials } from "@/lib/avatar";
import { formatDate } from "@/lib/utils";
import { ModerationStatusPill } from "./moderation-status-pill";

interface ModerationDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentDetail: FlaggedContent | null | undefined;
  isLoading: boolean;
  onRemove: (contentId: string) => void;
}

export function ModerationDetailDialog({
  open,
  onOpenChange,
  contentDetail,
  isLoading,
  onRemove,
}: ModerationDetailDialogProps) {
  const handleClose = () => onOpenChange(false);

  const handleRemove = () => {
    if (!contentDetail) return;
    if (
      confirm(
        "Apakah Anda yakin ingin menghapus jasa ini? Tindakan ini bersifat permanen.",
      )
    ) {
      onRemove(contentDetail.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[850px] rounded-xl p-0 overflow-hidden border-border bg-white shadow-sh-3">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent mx-auto" />
            <p className="text-xs text-ink-500 mt-2 font-medium">
              Memuat detail konten...
            </p>
          </div>
        ) : contentDetail ? (
          <div className="flex flex-col h-full max-h-[85vh]">
            <div className="p-5 border-b border-border bg-surface-2/40 flex justify-between items-center">
              <div>
                <h2 className="font-heading font-bold text-base text-ink-900 tracking-tight leading-tight">
                  Review Moderasi Jasa
                </h2>
                <p className="text-xs text-ink-400 font-medium mt-1">
                  Verifikasi konten jasa berdasarkan laporan pengguna.
                </p>
              </div>
              <div>
                <ModerationStatusPill status={contentDetail.status} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4 pr-0 md:pr-2">
                <h3 className="font-heading font-bold text-xs text-ink-400 uppercase tracking-wider">
                  Preview Konten Jasa
                </h3>
                <div className="rounded-lg border border-border p-4 bg-white space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-lg bg-surface-2 border border-border flex items-center justify-center flex-shrink-0 select-none">
                      <FileText className="h-6 w-6 text-ink-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-ink-900 text-sm leading-snug line-clamp-2">
                        {contentDetail.title}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-ink-400 font-medium">
                        <Tag className="h-3 w-3" />
                        <span>{contentDetail.category}</span>
                        <span>•</span>
                        <span>ID: {contentDetail.id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11.5px] text-ink-400 font-semibold select-none">
                      Deskripsi Jasa:
                    </span>
                    <p className="text-xs text-ink-700 leading-relaxed font-medium bg-surface-2 p-3 rounded-lg border border-border/60 max-h-[140px] overflow-y-auto">
                      {contentDetail.description ||
                        "Tidak ada deskripsi jasa yang diberikan."}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11.5px] text-ink-400 font-semibold select-none">
                      Pemilik Konten:
                    </span>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border/80 bg-white">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${avatarClass(contentDetail.owner?.fullName)}`}
                      >
                        {initials(contentDetail.owner?.fullName)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-ink-900 leading-tight">
                          {contentDetail.owner?.fullName ?? "-"}
                        </div>
                        <div className="text-[10px] text-ink-400 font-semibold mt-0.5 flex gap-1.5">
                          <span>ID: {contentDetail.owner?.id ?? "-"}</span>
                          <span>•</span>
                          <span>{contentDetail.owner?.email ?? "-"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-heading font-bold text-xs text-ink-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-warn-500" /> Rincian
                  Laporan ({contentDetail.reportCount})
                </h3>
                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                  {contentDetail.reports && contentDetail.reports.length > 0 ? (
                    contentDetail.reports.map((rep) => (
                      <div
                        key={rep.id}
                        className="p-3 border border-border rounded-lg bg-white space-y-2 hover:bg-surface-2 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-6 w-6 rounded-full flex items-center justify-center text-white text-[9.5px] font-bold ${avatarClass(rep.reporterName)}`}
                            >
                              {initials(rep.reporterName)}
                            </div>
                            <span className="text-xs font-semibold text-ink-900">
                              {rep.reporterName}
                            </span>
                          </div>
                          <span className="text-[10px] text-ink-400 font-medium">
                            {formatDate(rep.createdAt)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="inline-flex px-1.5 py-0.5 rounded bg-danger-50 text-[10px] font-bold text-danger-700 border border-danger-100/50">
                            {rep.category}
                          </span>
                        </div>
                        <p className="text-[11.5px] text-ink-600 leading-relaxed font-medium italic border-l-2 border-border pl-2.5 py-0.5">
                          &ldquo;{rep.reason}&rdquo;
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-ink-400 font-medium border border-border rounded-lg bg-white">
                      Laporan detail tidak tersedia untuk item ini.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border bg-surface-2/40 flex justify-between items-center">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-semibold border border-border bg-white rounded-lg text-ink-700 hover:bg-surface-3 transition-colors cursor-pointer shadow-sm"
              >
                Batal
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRemove}
                  className="px-4 py-2 text-sm font-semibold bg-danger-500 hover:bg-danger-600 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Trash2 className="h-4 w-4" /> Hapus Jasa
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
