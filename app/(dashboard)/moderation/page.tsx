"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contentApi, FlaggedContent } from "@/lib/api/content";
import { DataTable } from "@/components/data-table/data-table";
import { avatarClass, initials } from "@/lib/avatar";
import { ColumnDef } from "@tanstack/react-table";
import {
  AlertTriangle,
  CheckCircle,
  Trash2,
  Search,
  X,
  FileText,
  Tag,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function ModerationPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Ditinjau");
  const [page, setPage] = useState(1);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(
    null,
  );

  const limit = 10;

  // Query flagged contents
  const { data, isLoading, error } = useQuery({
    queryKey: ["content", page, search, statusFilter],
    queryFn: async () => {
      const res = await contentApi.list({
        page,
        limit,
        status: statusFilter === "Semua" ? undefined : statusFilter,
        search: search || undefined,
      });
      return res;
    },
  });

  // Derive stats from real query data (after useQuery)
  const totalItems = data?.total ?? 0;
  const pendingItems =
    data?.data?.filter((c) => c.status === "Ditinjau").length ?? 0;

  // Query content detail
  const { data: contentDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["contentDetail", selectedContentId],
    queryFn: async () => {
      // Find content in data or fallback to API
      const found = data?.data?.find((c) => c.id === selectedContentId);
      if (found) return found;
      // In a real application, we might have GET /admin/content/:id
      // but if the list endpoint returns full detail, we can fallback to list
      return found || null;
    },
    enabled: !!selectedContentId,
  });

  // Mutation to Remove listing (Hapus Jasa)
  const removeMutation = useMutation({
    mutationFn: (id: string) => contentApi.remove(id),
    onSuccess: () => {
      toast.success("Jasa berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["content"] });
      setSelectedContentId(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menghapus jasa");
    },
  });

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

  const renderStatusPill = (status: FlaggedContent["status"]) => {
    switch (status) {
      case "Ditinjau":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-warn-50 text-warn-700">
            <span className="h-1.5 w-1.5 rounded-full bg-warn-500" />
            Ditinjau
          </span>
        );
      case "Aman":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-success-50 text-success-700">
            <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
            Aman
          </span>
        );
      case "Dihapus":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-danger-50 text-danger-700">
            <span className="h-1.5 w-1.5 rounded-full bg-danger-500" />
            Dihapus
          </span>
        );
      case "Disembunyikan":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
            Disembunyikan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const columns: ColumnDef<FlaggedContent>[] = [
    {
      accessorKey: "title",
      header: "Jasa",
      cell: ({ row }) => (
        <div className="flex items-center gap-3 max-w-[260px]">
          <div className="h-11 w-11 rounded-lg bg-surface-2 border border-border flex items-center justify-center flex-shrink-0 select-none">
            <FileText className="h-5 w-5 text-ink-400" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-ink-900 truncate leading-snug">
              {row.original.title}
            </div>
            <div className="text-[11px] text-ink-400 mt-1 font-mono">
              ID: {row.original.id}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "owner",
      header: "Pemilik",
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div
            className={`h-7 w-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${avatarClass(row.original.owner?.fullName)}`}
          >
            {initials(row.original.owner?.fullName)}
          </div>
          <span className="font-medium text-ink-700 text-sm">
            {row.original.owner?.fullName ?? "-"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Kategori",
      cell: ({ getValue }) => (
        <span className="inline-flex px-2 py-0.5 rounded border border-border bg-surface-2 text-[11px] font-semibold text-ink-500">
          {String(getValue() ?? "Lainnya")}
        </span>
      ),
    },
    {
      accessorKey: "reportCount",
      header: "Laporan",
      cell: ({ getValue }) => {
        const count = Number(getValue() ?? 0);
        const isHigh = count >= 5;
        return (
          <span
            className={`inline-flex items-center justify-center h-5 px-2 rounded-full text-[11px] font-bold ${
              isHigh
                ? "bg-danger-50 text-danger-700 border border-danger-100"
                : "bg-warn-50 text-warn-700 border border-warn-100"
            }`}
          >
            {count} Laporan
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => renderStatusPill(getValue() as FlaggedContent["status"]),
    },
    {
      accessorKey: "createdAt",
      header: "Tanggal Posting",
      cell: ({ getValue }) => formatDate(getValue() as string),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Aksi</span>,
      cell: ({ row }) => (
        <div className="text-right">
          <button
            onClick={() => setSelectedContentId(row.original.id)}
            className="px-3 py-1.5 text-xs font-semibold border border-border hover:bg-surface-3 bg-white text-ink-700 rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            Tinjau
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Perlu Ditinjau",
            val: pendingItems,
            icon: AlertTriangle,
            color: "text-warn-500 bg-warn-50 border-warn-100",
          },
          {
            label: "Total Flagged",
            val: totalItems,
            icon: AlertTriangle,
            color: "text-brand-500 bg-brand-50 border-brand-100",
          },
          {
            label: "Ditandai Aman",
            val: data?.data?.filter((c) => c.status === "Aman").length ?? 0,
            icon: CheckCircle,
            color: "text-success-500 bg-success-50 border-success-100",
          },
          {
            label: "Dihapus / Sembunyi",
            val:
              data?.data?.filter(
                (c) => c.status === "Dihapus" || c.status === "Disembunyikan",
              ).length ?? 0,
            icon: Trash2,
            color: "text-danger-500 bg-danger-50 border-danger-100",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-white border border-border rounded-xl p-5 flex items-center gap-4 shadow-sh-1"
          >
            <div
              className={`h-11 w-11 rounded-lg flex items-center justify-center border ${item.color.split(" ")[1]} ${item.color.split(" ")[2]} flex-shrink-0`}
            >
              <item.icon className={`h-5 w-5 ${item.color.split(" ")[0]}`} />
            </div>
            <div>
              <div className="text-xs text-ink-400 font-semibold">
                {item.label}
              </div>
              <div className="text-2xl font-extrabold text-ink-900 mt-1 leading-none tracking-tight">
                {item.val}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Segment & Search */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        {/* Segmented control buttons */}
        <div className="flex bg-surface-3/50 p-1 rounded-lg border border-border/80 self-start select-none">
          {["Semua", "Ditinjau", "Aman", "Dihapus", "Disembunyikan"].map(
            (st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  statusFilter === st
                    ? "bg-white text-ink-900 shadow-sm border border-border/30 font-bold"
                    : "text-ink-500 hover:text-ink-900"
                }`}
              >
                {st}
              </button>
            ),
          )}
        </div>

        {/* Search */}
        <div className="flex max-w-xs relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-[15px] w-[15px] text-ink-400 pointer-events-none" />
          <input
            placeholder="Cari judul jasa atau pemilik..."
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
      </div>

      {/* Flagged listings table */}
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

      {/* Review Modal */}
      <Dialog
        open={!!selectedContentId}
        onOpenChange={(open) => !open && setSelectedContentId(null)}
      >
        <DialogContent className="max-w-[850px] rounded-xl p-0 overflow-hidden border-border bg-white shadow-sh-3">
          {isLoadingDetail ? (
            <div className="p-12 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent mx-auto" />
              <p className="text-xs text-ink-500 mt-2 font-medium">
                Memuat detail konten...
              </p>
            </div>
          ) : contentDetail ? (
            <div className="flex flex-col h-full max-h-[85vh]">
              {/* Modal Header */}
              <div className="p-5 border-b border-border bg-surface-2/40 flex justify-between items-center">
                <div>
                  <h2 className="font-heading font-bold text-base text-ink-900 tracking-tight leading-tight">
                    Review Moderasi Jasa
                  </h2>
                  <p className="text-xs text-ink-400 font-medium mt-1">
                    Verifikasi konten jasa berdasarkan laporan pengguna.
                  </p>
                </div>
                <div>{renderStatusPill(contentDetail.status)}</div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Left Side - Content Preview */}
                <div className="space-y-4 pr-0 md:pr-2">
                  <h3 className="font-heading font-bold text-xs text-ink-400 uppercase tracking-wider">
                    Preview Konten Jasa
                  </h3>
                  <div className="rounded-lg border border-border p-4 bg-white space-y-4">
                    {/* Header */}
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

                    {/* Description */}
                    <div className="space-y-1.5">
                      <span className="text-[11.5px] text-ink-400 font-semibold select-none">
                        Deskripsi Jasa:
                      </span>
                      <p className="text-xs text-ink-700 leading-relaxed font-medium bg-surface-2 p-3 rounded-lg border border-border/60 max-h-[140px] overflow-y-auto">
                        {contentDetail.description ||
                          "Tidak ada deskripsi jasa yang diberikan."}
                      </p>
                    </div>

                    {/* Owner Card */}
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

                {/* Right Side - Reports List */}
                <div className="space-y-4">
                  <h3 className="font-heading font-bold text-xs text-ink-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-warn-500" /> Rincian
                    Laporan ({contentDetail.reportCount})
                  </h3>
                  <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                    {contentDetail.reports &&
                    contentDetail.reports.length > 0 ? (
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

              {/* Modal Footer */}
              <div className="p-4 border-t border-border bg-surface-2/40 flex justify-between items-center">
                <button
                  onClick={() => setSelectedContentId(null)}
                  className="px-4 py-2 text-sm font-semibold border border-border bg-white rounded-lg text-ink-700 hover:bg-surface-3 transition-colors cursor-pointer shadow-sm"
                >
                  Batal
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          "Apakah Anda yakin ingin menghapus jasa ini? Tindakan ini bersifat permanen.",
                        )
                      ) {
                        removeMutation.mutate(contentDetail.id);
                      }
                    }}
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
    </div>
  );
}
