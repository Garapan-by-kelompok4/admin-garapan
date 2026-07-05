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
import { avatarClass, initials } from "@/lib/avatar";
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
        className="max-w-[min(1120px,95vw)] sm:max-w-[min(1120px,95vw)] rounded-xl p-0 overflow-hidden border-border bg-white shadow-sh-3"
        showCloseButton={false}
      >
        {isLoading ? (
          <div className="flex flex-col h-full max-h-[85vh]">
            <div className="px-5 py-4 border-b border-border bg-surface-2/50">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-full bg-surface-2 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-2 rounded animate-pulse w-48" />
                  <div className="h-3 bg-surface-2 rounded animate-pulse w-64" />
                </div>
                <div className="h-6 w-16 bg-surface-2 rounded-full animate-pulse flex-shrink-0" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="rounded-xl border border-border bg-white p-6 space-y-5">
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
            <div className="px-5 py-3.5 border-t border-border bg-surface-2/40 flex justify-end gap-2.5">
              <div className="h-9 w-20 bg-surface-2 rounded-lg animate-pulse" />
              <div className="h-9 w-28 bg-surface-2 rounded-lg animate-pulse" />
            </div>
          </div>
        ) : userDetail ? (
          <div className="flex flex-col h-full max-h-[85vh]">
            <div className="px-5 py-4 border-b border-border bg-surface-2/50">
              <div className="flex items-center gap-4">
                <div
                  className={`h-12 w-12 rounded-full flex items-center justify-center text-white text-base font-bold border-2 border-white shadow-sm flex-shrink-0 ${avatarClass(userDetail.fullName)}`}
                >
                  {initials(userDetail.fullName)}
                </div>

                <div className="flex-1 min-w-0">
                  <h2
                    className="font-heading font-bold text-[15px] text-ink-900 tracking-tight leading-tight min-w-0"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {userDetail.fullName || "User"}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-ink-400 font-medium">
                    <Mail className="h-3 w-3 flex-shrink-0" />
                    <span className="min-w-0 truncate">{userDetail.email}</span>
                    <span className="flex-shrink-0">•</span>
                    <span className="select-none flex-shrink-0 whitespace-nowrap">
                      {userDetail.role === "MAHASISWA" ? "Mahasiswa" : "Klien"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <UserStatusPill user={userDetail} />
                  <button
                    onClick={handleClose}
                    aria-label="Tutup dialog"
                    className="h-8 w-8 rounded-lg border border-border bg-white flex items-center justify-center text-ink-500 hover:bg-surface-2 hover:text-ink-900 transition-colors cursor-pointer shadow-sm flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6"
            >
              <div className="rounded-xl border border-border bg-white p-6 shadow-sh-1">
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
                  <div className="mt-2 max-h-[160px] overflow-y-auto">
                    <p className="text-sm text-ink-700 leading-relaxed">
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
                        <div className="flex justify-between items-start gap-3">
                          <div className="min-w-0 flex-1">
                            <div
                              className="text-sm font-semibold text-ink-900 min-w-0"
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {order.title}
                            </div>
                            <div className="text-xs text-ink-400 mt-1.5 flex gap-2">
                              <span className="font-mono">
                                {order.id.slice(0, 8)}…
                              </span>
                              <span>•</span>
                              <span>{formatDate(order.date)}</span>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-1.5 flex-shrink-0">
                            <span className="text-base font-bold text-ink-900">
                              {formatCurrency(order.amount)}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full select-none ${
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
                        <div className="flex justify-between items-start gap-3">
                          <div className="min-w-0 flex-1">
                            <div
                              className="text-sm font-semibold text-ink-900"
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {rep.type}
                            </div>
                            <div className="text-xs text-ink-400 mt-1.5 flex gap-2">
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

            <div className="px-5 py-3.5 border-t border-border bg-surface-2/40 flex justify-end gap-2.5">
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
