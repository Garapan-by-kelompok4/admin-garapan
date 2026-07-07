"use client";

import { useRef, useEffect } from "react";
import {
  Star,
  X,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Mail,
  Phone,
  Building,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { UserDetail } from "@/lib/api/users";
import { UserAvatar } from "@/components/user-avatar";
import {
  mobileSheetBodyPaddingClass,
  mobileSheetDialogClass,
  mobileSheetHandleClass,
  mobileSheetScrollClass,
  mobileSheetShellClass,
} from "@/lib/mobile-sheet";
import { formatCurrency, formatDate } from "@/lib/utils";
import { UserStatusPill } from "./user-status-pill";

interface UserDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userDetail: UserDetail | undefined;
  isLoading: boolean;
}

export function UserDetailDialog({
  open,
  onOpenChange,
  userDetail,
  isLoading,
}: UserDetailDialogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [userDetail?.id]);

  const handleClose = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${mobileSheetDialogClass} sm:!w-[min(1120px,95vw)]`}
        showCloseButton={false}
      >
        {isLoading ? (
          <div className={mobileSheetShellClass}>
            <div className={mobileSheetHandleClass} aria-hidden>
              <div className="h-1 w-10 rounded-full bg-border" />
            </div>
            <div className="shrink-0 px-4 py-3.5 border-b border-border bg-surface-2/50 sm:px-5 sm:py-4">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-full bg-surface-2 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-2 rounded animate-pulse w-48" />
                  <div className="h-3 bg-surface-2 rounded animate-pulse w-64" />
                </div>
                <div className="h-6 w-16 bg-surface-2 rounded-full animate-pulse flex-shrink-0" />
              </div>
            </div>
            <div
              className={`${mobileSheetScrollClass} ${mobileSheetBodyPaddingClass} space-y-5`}
            >
              <div className="rounded-xl border border-border bg-white p-4 space-y-5 sm:p-6">
                <div className="h-3 bg-surface-2 rounded animate-pulse w-32" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 bg-surface-2 rounded animate-pulse w-24" />
                      <div className="h-4 bg-surface-2 rounded animate-pulse w-40" />
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-4">
                  <div className="h-3 bg-surface-2 rounded animate-pulse w-12 mb-3" />
                  <div className="space-y-2">
                    <div className="h-3 bg-surface-2 rounded animate-pulse w-full" />
                    <div className="h-3 bg-surface-2 rounded animate-pulse w-3/4" />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-3 bg-surface-2 rounded animate-pulse w-40" />
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="border border-border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between">
                      <div className="h-4 bg-surface-2 rounded animate-pulse w-48" />
                      <div className="h-5 bg-surface-2 rounded animate-pulse w-28" />
                    </div>
                    <div className="flex justify-between">
                      <div className="h-3 bg-surface-2 rounded animate-pulse w-32" />
                      <div className="h-4 bg-surface-2 rounded animate-pulse w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : userDetail ? (
          <div className={mobileSheetShellClass}>
            <div className={mobileSheetHandleClass} aria-hidden>
              <div className="h-1 w-10 rounded-full bg-border" />
            </div>
            <div className="shrink-0 border-b border-border bg-surface-2/50 px-4 py-3.5 sm:px-5 sm:py-4">
              <div className="flex items-start gap-3">
                <UserAvatar
                  name={userDetail.fullName}
                  avatarUrl={userDetail.avatarUrl}
                  className="size-11 shrink-0 border-2 border-white sm:size-12"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-heading text-[15px] font-bold leading-tight tracking-tight text-ink-900">
                      {userDetail.fullName || "User"}
                    </h2>
                    <button
                      onClick={handleClose}
                      aria-label="Tutup dialog"
                      className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-white text-ink-500 shadow-sm transition-colors hover:bg-surface-2 hover:text-ink-900"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-ink-400">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="min-w-0 break-all">{userDetail.email}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="select-none text-[11px] font-medium text-ink-500">
                      {userDetail.role === "MAHASISWA" ? "Mahasiswa" : "Klien"}
                    </span>
                    <UserStatusPill user={userDetail} />
                  </div>
                </div>
              </div>
            </div>

            <div
              ref={scrollRef}
              className={`${mobileSheetScrollClass} ${mobileSheetBodyPaddingClass} space-y-5`}
            >
              <div className="rounded-xl border border-border bg-white p-4 shadow-sh-1 sm:p-6">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-ink-400 mb-5">
                  Ringkasan User
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                  {userDetail.role === "MAHASISWA" && (
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400 flex items-center gap-1.5">
                        <GraduationCap className="h-3.5 w-3.5" /> Universitas
                      </span>
                      <span className="text-sm text-ink-900 mt-1 block break-words">
                        {userDetail.university || "-"}
                      </span>
                    </div>
                  )}
                  {userDetail.role === "KLIEN" && (
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400 flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5" /> Perusahaan
                      </span>
                      <span className="text-sm text-ink-900 mt-1 block break-words">
                        {userDetail.company || "-"}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400 flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" /> No. Telepon
                    </span>
                    <span className="text-sm text-ink-900 mt-1 block">
                      {userDetail.phone || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> Tanggal Daftar
                    </span>
                    <span className="text-sm text-ink-900 mt-1 block">
                      {formatDate(userDetail.createdAt)}
                    </span>
                  </div>
                  {userDetail.role === "MAHASISWA" && (
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400 flex items-center gap-1.5">
                        <Star className="h-3.5 w-3.5" /> Rating
                      </span>
                      <span className="text-sm text-ink-900 flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 fill-amber-400 stroke-amber-500 text-amber-500" />
                        {(userDetail.rating || 0).toFixed(1)} (
                        {userDetail.jobs || 0})
                      </span>
                    </div>
                  )}
                  {userDetail.role === "KLIEN" && (
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400 flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5" /> Total Pesanan
                      </span>
                      <span className="text-sm text-ink-900 mt-1 block">
                        {userDetail.jobs || 0} pesanan
                      </span>
                    </div>
                  )}
                </div>
                <Separator className="my-5" />
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
                    Bio
                  </span>
                  <div className="mt-2">
                    <p className="text-sm leading-relaxed text-ink-700">
                      {userDetail.bio ||
                        "Tidak ada biodata diri yang dicantumkan."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-ink-400 flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" /> Riwayat Transaksi
                </h3>
                {userDetail.orderHistory &&
                userDetail.orderHistory.length > 0 ? (
                  <div className="space-y-3">
                    {userDetail.orderHistory.map((order) => (
                      <div
                        key={order.id}
                        className="border border-border rounded-lg p-4 hover:bg-surface-2/30 transition-colors"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold leading-snug text-ink-900">
                              {order.title}
                            </div>
                            <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-1 text-xs text-ink-400">
                              <span className="font-mono">
                                {order.id.slice(0, 8)}…
                              </span>
                              <span>•</span>
                              <span>{formatDate(order.date)}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-end">
                            <span className="text-base font-bold text-ink-900">
                              {formatCurrency(order.amount)}
                            </span>
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold select-none ${
                                order.status === "Selesai" ||
                                order.status === "COMPLETED"
                                  ? "bg-success-50 text-success-700"
                                  : order.status === "Dibatalkan" ||
                                      order.status === "CANCELLED"
                                    ? "bg-danger-50 text-danger-700"
                                    : "bg-warn-50 text-warn-700"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border border-border rounded-lg bg-white">
                    <TrendingUp className="h-12 w-12 text-ink-200 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-ink-700">
                      Belum ada riwayat transaksi
                    </p>
                    <p className="text-xs text-ink-400 mt-1">
                      User ini belum memiliki transaksi tercatat di platform.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-ink-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" /> Riwayat Laporan
                </h3>
                {userDetail.reportHistory &&
                userDetail.reportHistory.length > 0 ? (
                  <div className="space-y-3">
                    {userDetail.reportHistory.map((rep) => (
                      <div
                        key={rep.id}
                        className="border border-border rounded-lg p-4 hover:bg-surface-2/30 transition-colors"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-ink-900">
                              {rep.type}
                            </div>
                            <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-1 text-xs text-ink-400">
                              <span className="font-mono">
                                {rep.id.slice(0, 8)}…
                              </span>
                              <span>•</span>
                              <span>{formatDate(rep.date)}</span>
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full select-none flex-shrink-0 ${
                              rep.status === "Selesai"
                                ? "bg-success-50 text-success-700"
                                : rep.status === "Ditolak"
                                  ? "bg-danger-50 text-danger-700"
                                  : "bg-warn-50 text-warn-700"
                            }`}
                          >
                            {rep.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border border-border rounded-lg bg-white">
                    <ShieldCheck className="h-12 w-12 text-ink-200 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-ink-700">
                      Tidak ada laporan
                    </p>
                    <p className="text-xs text-ink-400 mt-1">
                      User ini belum pernah dilaporkan oleh pengguna lain.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
