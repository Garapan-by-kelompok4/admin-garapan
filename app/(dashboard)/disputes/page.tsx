"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  disputesApi,
  Dispute,
  DisputeOutcome,
  DisputePriority,
  DisputeStatus,
  ResolveDisputePayload,
  DisputeDetail,
} from "@/lib/api/disputes";
import { DataTable } from "@/components/data-table/data-table";
import { avatarClass, initials } from "@/lib/avatar";
import { ColumnDef } from "@tanstack/react-table";
import {
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Search,
  ShieldCheck,
  X,
  Flag,
  ArrowRight,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function DisputesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Terbuka");
  const [page, setPage] = useState(1);
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(
    null,
  );

  const limit = 10;

  // Query disputes
  const { data, isLoading, error } = useQuery({
    queryKey: ["disputes", page, search, statusFilter],
    queryFn: async () => {
      const res = await disputesApi.list({
        page,
        limit,
        status: statusFilter === "Semua" ? undefined : statusFilter,
        search: search || undefined,
      });
      return res;
    },
  });

  // Derive counts from real query data (after useQuery)
  const openCount =
    data?.data?.filter((d) => d.status === "Terbuka").length ?? 0;
  const processingCount =
    data?.data?.filter((d) => d.status === "Diproses").length ?? 0;
  const totalCount = data?.total ?? 0;

  // Query dispute detail
  const { data: disputeDetail, isLoading: isLoadingDetail } = useQuery<
    DisputeDetail,
    Error
  >({
    queryKey: ["disputeDetail", selectedDisputeId],
    queryFn: () => disputesApi.getById(selectedDisputeId!),
    enabled: !!selectedDisputeId,
  });

  // Mutation to Resolve dispute
  const resolveMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ResolveDisputePayload;
    }) => disputesApi.resolve(id, payload),
    onSuccess: () => {
      toast.success("Dispute berhasil diselesaikan");
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
      setSelectedDisputeId(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal memproses resolusi");
    },
  });



  const renderPriorityPill = (priority: Dispute["priority"]) => {
    switch (priority) {
      case "Tinggi":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-danger-50 text-danger-700 border border-danger-100/50">
            Tinggi
          </span>
        );
      case "Sedang":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-warn-50 text-warn-700 border border-warn-100/50">
            Sedang
          </span>
        );
      case "Rendah":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200/50">
            Rendah
          </span>
        );
      default:
        return (
          <span className="text-xs font-semibold text-ink-700">{priority}</span>
        );
    }
  };

  const renderStatusPill = (status: Dispute["status"]) => {
    switch (status) {
      case "Terbuka":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-danger-50 text-danger-700">
            <span className="h-1.5 w-1.5 rounded-full bg-danger-500" />
            Terbuka
          </span>
        );
      case "Diproses":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-warn-50 text-warn-700">
            <span className="h-1.5 w-1.5 rounded-full bg-warn-500" />
            Diproses
          </span>
        );
      case "Selesai":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-success-50 text-success-700">
            <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
            Selesai
          </span>
        );
      case "Ditolak":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
            Ditolak
          </span>
        );
      default:
        return <span className="text-xs font-semibold">{status}</span>;
    }
  };

  const columns: ColumnDef<Dispute>[] = [
    {
      accessorKey: "id",
      header: "ID Laporan",
      cell: ({ getValue }) => (
        <span className="font-mono font-bold text-xs text-brand-600 select-all">
          {String(getValue())}
        </span>
      ),
    },
    {
      id: "reporter",
      header: "Pelapor",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div
            className={`h-7 w-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${avatarClass(row.original.reporterName)}`}
          >
            {initials(row.original.reporterName)}
          </div>
          <div>
            <div className="font-semibold text-ink-900 leading-none">
              {row.original.reporterName}
            </div>
            <div className="text-[10px] text-ink-400 mt-0.5 font-medium">
              Klien
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "reported",
      header: "Terlapor",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div
            className={`h-7 w-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${avatarClass(row.original.reportedName)}`}
          >
            {initials(row.original.reportedName)}
          </div>
          <div>
            <div className="font-semibold text-ink-900 leading-none">
              {row.original.reportedName}
            </div>
            <div className="text-[10px] text-ink-400 mt-0.5 font-medium">
              Mahasiswa
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "issueType",
      header: "Jenis Masalah",
      cell: ({ getValue }) => (
        <span className="font-medium text-ink-700 text-sm leading-snug">
          {String(getValue())}
        </span>
      ),
    },
    {
      accessorKey: "priority",
      header: "Prioritas",
      cell: ({ getValue }) => renderPriorityPill(getValue() as DisputePriority),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => renderStatusPill(getValue() as DisputeStatus),
    },
    {
      accessorKey: "createdAt",
      header: "Tanggal",
      cell: ({ getValue }) => formatDate(getValue() as string),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Aksi</span>,
      cell: ({ row }) => (
        <div className="text-right">
          <button
            onClick={() => setSelectedDisputeId(row.original.id)}
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
            label: "Laporan Terbuka",
            val: openCount,
            icon: Flag,
            color: "text-danger-500 bg-danger-50 border-danger-100",
          },
          {
            label: "Sedang Diproses",
            val: processingCount,
            icon: Clock,
            color: "text-warn-500 bg-warn-50 border-warn-100",
          },
          {
            label: "Total Laporan",
            val: totalCount,
            icon: CheckCircle,
            color: "text-success-500 bg-success-50 border-success-100",
          },
          {
            label: "Selesai Diselesaikan",
            val: data?.data?.filter((d) => d.status === "Selesai").length ?? 0,
            icon: AlertTriangle,
            color: "text-brand-500 bg-brand-50 border-brand-100",
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

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="flex flex-1 max-w-sm relative">
          <Search className="absolute left-3 top-2.5 h-[15px] w-[15px] text-ink-400 pointer-events-none" />
          <input
            placeholder="Cari ID laporan, pelapor, terlapor..."
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
            <option value="Semua">Semua Laporan</option>
            <option value="Terbuka">Terbuka</option>
            <option value="Diproses">Diproses</option>
            <option value="Selesai">Selesai</option>
            <option value="Ditolak">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Disputes Data Table */}
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

      {/* Detail Modal & Resolution Flow */}
      <Dialog
        open={!!selectedDisputeId}
        onOpenChange={(open) => !open && setSelectedDisputeId(null)}
      >
        <DialogContent className="max-w-[min(850px,95vw)] rounded-xl p-0 overflow-hidden border-border bg-white shadow-sh-3" showCloseButton={false}>
          {isLoadingDetail ? (
            <div className="flex flex-col h-full max-h-[85vh]">
              {/* Skeleton Header */}
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
              {/* Skeleton Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Reporter & reported cards skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="rounded-lg border border-border bg-white p-4 space-y-3">
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
                {/* Description skeleton */}
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
                {/* Communication history skeleton */}
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
              {/* Skeleton Footer */}
              <div className="px-5 py-3.5 border-t border-border bg-surface-2/40 flex justify-end gap-2.5">
                <div className="h-9 w-20 bg-surface-2 rounded-lg animate-pulse" />
                <div className="h-9 w-28 bg-surface-2 rounded-lg animate-pulse" />
              </div>
            </div>
          ) : disputeDetail ? (
            <div className="flex flex-col h-full max-h-[85vh]">
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-border bg-surface-2/50">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-heading font-bold text-[15px] text-ink-900 tracking-tight leading-tight">
                        Dispute & Laporan
                      </h2>
                      {renderPriorityPill(disputeDetail.priority)}
                      {renderStatusPill(disputeDetail.status)}
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
                      <span>Dilaporkan {formatDate(disputeDetail.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Pelapor & Terlapor Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Pelapor */}
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

                  {/* Terlapor */}
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

                {/* Deskripsi Masalah */}
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

                {/* Riwayat Komunikasi & Laporan */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
                    Riwayat Komunikasi &amp; Laporan
                  </h4>
                  <div className="rounded-lg border border-border bg-white p-4 max-h-[180px] overflow-y-auto">
                    {disputeDetail.communicationHistory &&
                    disputeDetail.communicationHistory.length > 0 ? (
                      <div className="relative border-l border-border ml-2.5 pl-5 space-y-4">
                        {disputeDetail.communicationHistory.map(
                          (item: {
                            id: string;
                            senderName: string;
                            senderRole: string;
                            message: string;
                            createdAt: string;
                          }) => (
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
                          ),
                        )}
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

                <ResolutionForm
                  key={disputeDetail.id}
                  disputeDetail={disputeDetail}
                  onResolve={(params) => resolveMutation.mutate(params)}
                  onClose={() => setSelectedDisputeId(null)}
                  isPending={resolveMutation.isPending}
                />
              </div>

              {/* Read-Only Resolution View (For resolved/rejected disputes) */}
              {/* Footer: close button for resolved/rejected, or action buttons for open */}
              {disputeDetail.status !== "Terbuka" &&
                disputeDetail.status !== "Diproses" && (
                  <div className="px-5 py-3.5 border-t border-border bg-surface-2/40 flex justify-end">
                    <button
                      onClick={() => setSelectedDisputeId(null)}
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
    </div>
  );
}

function ResolutionForm({
  disputeDetail,
  onResolve,
  onClose,
  isPending,
}: {
  disputeDetail: DisputeDetail;
  onResolve: (params: { id: string; payload: ResolveDisputePayload }) => void;
  onClose: () => void;
  isPending: boolean;
}) {
  const [resolutionNote, setResolutionNote] = useState("");
  const [outcome, setOutcome] = useState<DisputeOutcome | "">("");
  const [refundAmount, setRefundAmount] = useState<number | "">("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outcome) {
      toast.error("Silakan pilih resolusi tindakan");
      return;
    }
    if (!resolutionNote.trim()) {
      toast.error("Catatan resolusi wajib diisi");
      return;
    }
    if (outcome === "PARTIAL_REFUND" && (!refundAmount || refundAmount <= 0)) {
      toast.error("Nominal refund parsial wajib diisi dan harus lebih dari 0");
      return;
    }
    if (
      outcome === "PARTIAL_REFUND" &&
      Number(refundAmount) > disputeDetail.orderAmount
    ) {
      toast.error(
        "Nominal refund parsial tidak boleh melebihi nilai transaksi",
      );
      return;
    }

    onResolve({
      id: disputeDetail.id,
      payload: {
        outcome,
        resolutionNote,
        refundAmount:
          outcome === "PARTIAL_REFUND" ? String(refundAmount) : undefined,
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-border pt-5 space-y-4"
    >
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-brand-500" />
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
          Tindak Lanjut &amp; Keputusan Resolusi
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-ink-700">
            Keputusan Dana Escrow
          </label>
          <select
            value={outcome}
            onChange={(e) => {
              setOutcome(e.target.value as DisputeOutcome);
              if (e.target.value !== "PARTIAL_REFUND")
                setRefundAmount("");
            }}
            className="w-full h-[38px] px-3 bg-white border border-border rounded-lg text-sm font-medium text-ink-700 focus:outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-50 transition-all cursor-pointer"
          >
            <option value="">Pilih resolusi...</option>
            <option value="RELEASE">
              Cairkan penuh ke Freelancer (Mahasiswa)
            </option>
            <option value="REFUND">
              Refund penuh ke Client (Klien)
            </option>
            <option value="PARTIAL_REFUND">
              Refund Parsial ke Client &amp; Sisa ke Freelancer
            </option>
            <option value="REJECT">
              Tolak Laporan (Tutup tanpa perubahan dana)
            </option>
          </select>
        </div>

        {outcome === "PARTIAL_REFUND" && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-ink-700">
              Nominal Refund Klien (Maks:{" "}
              {formatCurrency(disputeDetail.orderAmount)})
            </label>
            <input
              type="number"
              placeholder="Contoh: 500000"
              value={refundAmount}
              onChange={(e) =>
                setRefundAmount(
                  e.target.value ? Number(e.target.value) : "",
                )
              }
              className="w-full h-[38px] px-3 bg-white border border-border rounded-lg text-sm placeholder:text-ink-300 focus:outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-50 transition-all font-semibold text-ink-900"
            />
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-ink-700">
          Catatan Resolusi Resmi <span className="text-danger-500">*</span>
        </label>
        <textarea
          rows={3}
          placeholder="Tuliskan keputusan resolusi, misal: 'Pengerjaan tidak lengkap, disetujui refund parsial 50%...'"
          value={resolutionNote}
          onChange={(e) => setResolutionNote(e.target.value)}
          className="w-full p-3 bg-white border border-border rounded-lg text-sm placeholder:text-ink-300 focus:outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-50 transition-all font-medium resize-none"
        />
      </div>

      <div className="flex justify-end gap-2.5 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-semibold border border-border bg-white rounded-lg text-ink-700 hover:bg-surface-3 transition-colors cursor-pointer shadow-sm"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending
            ? "Memproses..."
            : "Selesaikan Dispute"}
          {!isPending && (
            <ArrowRight className="h-4 w-4" />
          )}
        </button>
      </div>
    </form>
  );
}
