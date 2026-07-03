"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi, User } from "@/lib/api/users";
import { DataTable } from "@/components/data-table/data-table";
import { avatarClass, initials } from "@/lib/avatar";
import { ColumnDef } from "@tanstack/react-table";
import {
  Star,
  Eye,
  Ban,
  Search,
  X,
  Unlock,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Mail,
  Phone,
  Building,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"MAHASISWA" | "KLIEN">(
    "MAHASISWA",
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Debounced search could be implemented, but simple state is fine for this dashboard
  const limit = 10;

  // Query users
  const { data, isLoading, error } = useQuery({
    queryKey: ["users", activeTab, page, search, statusFilter],
    queryFn: async () => {
      const res = await usersApi.list({
        page,
        limit,
        search: search || undefined,
        role: activeTab === "MAHASISWA" ? "MAHASISWA" : "KLIEN",
      });

      // Filter by status client-side since API lists by role/search
      if (statusFilter !== "Semua") {
        const filtered = res.data.filter((u) => {
          const isBanned = u.bannedAt !== null;
          const isPending = !u.emailVerified;

          if (statusFilter === "Suspended") return isBanned;
          if (statusFilter === "Pending") return isPending && !isBanned;
          if (statusFilter === "Aktif") return !isBanned && !isPending;
          return true;
        });
        return {
          ...res,
          data: filtered,
          total: filtered.length, // update total for front-end pagination of filtered items
        };
      }

      return res;
    },
  });

  // Query user detail
  const { data: userDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["userDetail", selectedUserId],
    queryFn: () => usersApi.getById(selectedUserId!),
    enabled: !!selectedUserId,
  });

  // Mutation to Ban a User
  const banMutation = useMutation({
    mutationFn: (id: string) => usersApi.ban(id),
    onSuccess: () => {
      toast.success("User berhasil diblokir");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({
        queryKey: ["userDetail", selectedUserId],
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal memblokir user");
    },
  });

  // Mutation to Unban a User
  const unbanMutation = useMutation({
    mutationFn: (id: string) => usersApi.unban(id),
    onSuccess: () => {
      toast.success("Aktivasi user berhasil dipulihkan");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({
        queryKey: ["userDetail", selectedUserId],
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal memulihkan user");
    },
  });

  // Helper to format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Render Status Pill
  const renderStatusPill = (user: User) => {
    if (user.bannedAt !== null) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-danger-50 text-danger-700">
          <span className="h-1.5 w-1.5 rounded-full bg-danger-500" />
          Suspended
        </span>
      );
    }
    if (!user.emailVerified) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-warn-50 text-warn-700">
          <span className="h-1.5 w-1.5 rounded-full bg-warn-500" />
          Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-success-50 text-success-700">
        <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
        Aktif
      </span>
    );
  };

  // Columns definition
  const columns: ColumnDef<User>[] = [
    {
      id: "name",
      header: activeTab === "MAHASISWA" ? "Mahasiswa" : "Klien",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div
            className={`h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${avatarClass(row.original.fullName)}`}
          >
            {initials(row.original.fullName)}
          </div>
          <div>
            <div className="font-semibold text-ink-900 leading-tight">
              {row.original.fullName || "User"}
            </div>
            <div className="text-xs text-ink-400 mt-1 font-medium">
              {row.original.email}
            </div>
          </div>
        </div>
      ),
    },
    ...(activeTab === "KLIEN"
      ? [
          {
            accessorKey: "company",
            header: "Perusahaan",
            cell: ({ getValue }) => getValue() || "-",
          } as ColumnDef<User>,
        ]
      : []),
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => renderStatusPill(row.original),
    },
    ...(activeTab === "MAHASISWA"
      ? [
          {
            accessorKey: "rating",
            header: "Rating",
            cell: ({ row }) => {
              const rating = row.original.rating || 0;
              return (
                <div className="flex items-center gap-1.5 font-semibold text-ink-900">
                  <Star className="h-4 w-4 fill-amber-400 stroke-amber-500 text-amber-500" />
                  <span>{rating.toFixed(1)}</span>
                  <span className="text-[11.5px] text-ink-400 font-medium">
                    ({row.original.jobs || 0})
                  </span>
                </div>
              );
            },
          } as ColumnDef<User>,
        ]
      : [
          {
            accessorKey: "jobs",
            header: "Pesanan",
            cell: ({ getValue }) => (
              <span className="font-semibold text-ink-900">
                {Number(getValue() ?? 0)}
              </span>
            ),
          } as ColumnDef<User>,
        ]),
    {
      accessorKey: "createdAt",
      header: "Tgl. Daftar",
      cell: ({ getValue }) => formatDate(getValue() as string),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Aksi</span>,
      cell: ({ row }) => {
        const isBanned = row.original.bannedAt !== null;
        return (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => setSelectedUserId(row.original.id)}
              className="h-8 w-8 rounded-lg border border-border bg-white flex items-center justify-center text-ink-500 hover:bg-surface-2 hover:text-brand-600 transition-colors shadow-sm cursor-pointer"
              title="Lihat Detail"
            >
              <Eye className="h-4 w-4" />
            </button>
            {isBanned ? (
              <button
                onClick={() => unbanMutation.mutate(row.original.id)}
                className="h-8 w-8 rounded-lg border border-success-200 bg-success-50/50 flex items-center justify-center text-success-600 hover:bg-success-50 hover:text-success-700 transition-colors shadow-sm cursor-pointer"
                title="Pulihkan Akun"
              >
                <Unlock className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  const nameToBan = row.original.fullName || "User";
                  if (
                    confirm(`Apakah Anda yakin ingin memblokir ${nameToBan}?`)
                  ) {
                    banMutation.mutate(row.original.id);
                  }
                }}
                className="h-8 w-8 rounded-lg border border-danger-200 bg-danger-50/50 flex items-center justify-center text-danger-600 hover:bg-danger-55 hover:text-danger-700 transition-colors shadow-sm cursor-pointer"
                title="Blokir Akun"
              >
                <Ban className="h-4 w-4" />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Nav & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-4 gap-4">
        <div className="flex border-b border-transparent">
          <button
            onClick={() => {
              setActiveTab("MAHASISWA");
              setPage(1);
            }}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "MAHASISWA"
                ? "border-brand-500 text-brand-600 font-bold"
                : "border-transparent text-ink-500 hover:text-ink-900"
            }`}
          >
            Mahasiswa
          </button>
          <button
            onClick={() => {
              setActiveTab("KLIEN");
              setPage(1);
            }}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "KLIEN"
                ? "border-brand-500 text-brand-600 font-bold"
                : "border-transparent text-ink-500 hover:text-ink-900"
            }`}
          >
            Klien
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        <div className="flex flex-1 max-w-sm relative">
          <Search className="absolute left-3 top-2.5 h-[15px] w-[15px] text-ink-400 pointer-events-none" />
          <input
            placeholder="Cari nama, email, kampus..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full h-[38px] pl-9 pr-8 bg-white border border-border rounded-lg text-[13.5px] placeholder:text-ink-400 focus:outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-50 transition-all font-medium"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="absolute right-2.5 top-2.5 p-0.5 text-ink-400 hover:text-ink-700 bg-transparent border-0 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-500 font-semibold select-none">
            Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-[38px] px-3 bg-white border border-border rounded-lg text-[13.5px] font-medium text-ink-700 focus:outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-50 transition-all cursor-pointer"
          >
            <option value="Semua">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Suspended">Suspended</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      {error ? (
        <div className="p-8 border border-border rounded-xl bg-white text-center">
          <AlertTriangle className="h-8 w-8 text-danger-500 mx-auto" />
          <h3 className="font-heading font-bold text-sm text-ink-900 mt-2">
            Gagal memuat data
          </h3>
          <p className="text-xs text-ink-400 mt-1">
            {(error as Error).message || "Terjadi kesalahan koneksi"}
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data?.data || []}
          total={data?.total || 0}
          page={page}
          limit={limit}
          isLoading={isLoading}
          onPageChange={setPage}
        />
      )}

      {/* Detail Modal */}
      <Dialog
        open={!!selectedUserId}
        onOpenChange={(open) => !open && setSelectedUserId(null)}
      >
        <DialogContent className="max-w-[820px] rounded-xl p-0 overflow-hidden border-border bg-white shadow-sh-3">
          {isLoadingDetail ? (
            <div className="p-12 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent mx-auto" />
              <p className="text-xs text-ink-500 mt-2 font-medium">
                Memuat detail user...
              </p>
            </div>
          ) : userDetail ? (
            <div className="flex flex-col h-full max-h-[85vh]">
              {/* Modal Header */}
              <div className="p-6 border-b border-border bg-surface-2/40 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`h-16 w-16 rounded-full flex items-center justify-center text-white text-xl font-bold border-2 border-white shadow-sm ${avatarClass(userDetail.fullName)}`}
                  >
                    {initials(userDetail.fullName)}
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-lg text-ink-900 tracking-tight leading-tight">
                      {userDetail.fullName || "User"}
                    </h2>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-xs text-ink-400 font-medium flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {userDetail.email}
                      </span>
                      <span className="text-ink-200">•</span>
                      <span className="text-xs text-ink-400 font-medium select-none">
                        {userDetail.role === "MAHASISWA"
                          ? "Mahasiswa"
                          : "Klien"}
                      </span>
                    </div>
                  </div>
                </div>
                <div>{renderStatusPill(userDetail)}</div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <h3 className="font-heading font-bold text-xs text-ink-400 uppercase tracking-wider">
                      Informasi Profil
                    </h3>
                    <div className="rounded-lg border border-border bg-white p-4 space-y-3">
                      {userDetail.role === "MAHASISWA" && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-ink-400 font-medium">
                            Universitas
                          </span>
                          <span className="font-semibold text-ink-900 text-right">
                            {userDetail.university || "-"}
                          </span>
                        </div>
                      )}
                      {userDetail.role === "KLIEN" && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-ink-400 font-medium flex items-center gap-1.5">
                            <Building className="h-4 w-4 text-ink-400" />{" "}
                            Perusahaan
                          </span>
                          <span className="font-semibold text-ink-900">
                            {userDetail.company || "-"}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-ink-400 font-medium flex items-center gap-1.5">
                          <Phone className="h-4 w-4 text-ink-400" /> No. Telepon
                        </span>
                        <span className="font-semibold text-ink-900">
                          {userDetail.phone || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-ink-400 font-medium flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-ink-400" /> Tanggal
                          Daftar
                        </span>
                        <span className="font-semibold text-ink-900">
                          {formatDate(userDetail.createdAt)}
                        </span>
                      </div>
                      {userDetail.role === "MAHASISWA" && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-ink-400 font-medium flex items-center gap-1.5">
                            <Star className="h-4 w-4 text-ink-400" /> Rating
                            Platform
                          </span>
                          <span className="font-semibold text-ink-900 flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-amber-400 stroke-amber-500 text-amber-500" />
                            {(userDetail.rating || 0).toFixed(1)} (
                            {userDetail.jobs || 0})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-heading font-bold text-xs text-ink-400 uppercase tracking-wider">
                      Bio Singkat
                    </h3>
                    <div className="rounded-lg border border-border bg-white p-4 h-[138px] overflow-y-auto">
                      <p className="text-sm text-ink-700 leading-relaxed font-medium">
                        {userDetail.bio ||
                          "Tidak ada biodata diri yang dicantumkan."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Riwayat Transaksi */}
                <div className="space-y-3">
                  <h3 className="font-heading font-bold text-xs text-ink-400 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-ink-400" /> Riwayat
                    Transaksi Terbaru
                  </h3>
                  <div className="rounded-lg border border-border bg-surface-2 divide-y divide-border overflow-hidden">
                    {userDetail.orderHistory &&
                    userDetail.orderHistory.length > 0 ? (
                      userDetail.orderHistory.map((order) => (
                        <div
                          key={order.id}
                          className="p-3 bg-white flex justify-between items-center hover:bg-surface-2 transition-all"
                        >
                          <div>
                            <div className="text-sm font-semibold text-ink-900">
                              {order.title}
                            </div>
                            <div className="text-[11px] text-ink-400 mt-1 font-medium flex gap-2">
                              <span>ID: {order.id}</span>
                              <span>•</span>
                              <span>{formatDate(order.date)}</span>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <span className="text-sm font-bold text-ink-900">
                              {formatCurrency(order.amount)}
                            </span>
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full select-none ${
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
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-ink-400 font-medium bg-white">
                        Belum ada riwayat transaksi.
                      </div>
                    )}
                  </div>
                </div>

                {/* Riwayat Laporan */}
                <div className="space-y-3">
                  <h3 className="font-heading font-bold text-xs text-ink-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-ink-400" /> Riwayat
                    Laporan
                  </h3>
                  <div className="rounded-lg border border-border bg-surface-2 divide-y divide-border overflow-hidden">
                    {userDetail.reportHistory &&
                    userDetail.reportHistory.length > 0 ? (
                      userDetail.reportHistory.map((rep) => (
                        <div
                          key={rep.id}
                          className="p-3 bg-white flex justify-between items-center hover:bg-surface-2 transition-all"
                        >
                          <div>
                            <div className="text-sm font-semibold text-ink-900">
                              {rep.type}
                            </div>
                            <div className="text-[11px] text-ink-400 mt-1 font-medium flex gap-2">
                              <span>ID: {rep.id}</span>
                              <span>•</span>
                              <span>{formatDate(rep.date)}</span>
                            </div>
                          </div>
                          <div>
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full select-none ${
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
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-ink-400 font-medium bg-white">
                        Bersih, tidak ada laporan yang ditujukan pada user ini.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-border bg-surface-2/40 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedUserId(null)}
                  className="px-4 py-2 text-sm font-semibold border border-border bg-white rounded-lg text-ink-700 hover:bg-surface-3 transition-colors cursor-pointer shadow-sm"
                >
                  Tutup
                </button>
                {userDetail.bannedAt !== null ? (
                  <button
                    onClick={() => {
                      unbanMutation.mutate(userDetail.id);
                    }}
                    className="px-4 py-2 text-sm font-semibold bg-success-500 hover:bg-success-600 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Unlock className="h-4 w-4" /> Pulihkan Akun
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const nameToBan = userDetail.fullName || "User";
                      if (
                        confirm(
                          `Apakah Anda yakin ingin memblokir ${nameToBan}?`,
                        )
                      ) {
                        banMutation.mutate(userDetail.id);
                      }
                    }}
                    className="px-4 py-2 text-sm font-semibold bg-danger-500 hover:bg-danger-600 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Ban className="h-4 w-4" /> Blokir Akun
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
