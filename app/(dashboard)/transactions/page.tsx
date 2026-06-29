"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ordersApi, OrderTransaction, EscrowStatus } from "@/lib/api/orders";
import { DataTable } from "@/components/data-table/data-table";
import { avatarClass, initials } from "@/lib/avatar";
import { ColumnDef } from "@tanstack/react-table";
import { 
  AlertTriangle, 
  Search, 
  X,
  FileText,
  Calendar,
  User,
  Eye,
  Wallet,
  CheckCircle2,
  DollarSign,
  Undo2,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [page, setPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const limit = 10;

  // Query transactions list
  const { data, isLoading, error } = useQuery({
    queryKey: ["transactions", page, search, statusFilter],
    queryFn: async () => {
      const res = await ordersApi.list({
        page,
        limit,
        status: statusFilter === "Semua" ? undefined : statusFilter,
        search: search || undefined
      });
      return res;
    }
  });

  // Derive stats from real query data (after useQuery)
  const totalVolume = data?.data.reduce((sum, t) => sum + (t.amount ?? 0), 0) ?? 0;
  const totalCount = data?.total ?? 0;

  // Query transaction detail
  const { data: orderDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["orderDetail", selectedOrderId],
    queryFn: () => ordersApi.getById(selectedOrderId!),
    enabled: !!selectedOrderId,
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderStatusPill = (status: EscrowStatus) => {
    switch (status) {
      case "Ditahan":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-warn-50 text-warn-700">
            <span className="h-1.5 w-1.5 rounded-full bg-warn-500 animate-pulse" />
            Ditahan
          </span>
        );
      case "Dicairkan":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-success-50 text-success-700">
            <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
            Dicairkan
          </span>
        );
      case "Refund":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-danger-50 text-danger-700">
            <span className="h-1.5 w-1.5 rounded-full bg-danger-500" />
            Refund
          </span>
        );
      default:
        return <span className="text-xs font-semibold">{status}</span>;
    }
  };

  const columns: ColumnDef<OrderTransaction>[] = [
    {
      accessorKey: "id",
      header: "ID Transaksi",
      cell: ({ getValue }: any) => (
        <span className="font-mono font-bold text-xs text-ink-900 select-all">
          {getValue()}
        </span>
      ),
    },
    {
      id: "client",
      header: "Klien",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className={`h-7 w-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${avatarClass(row.original.clientName)}`}>
            {initials(row.original.clientName)}
          </div>
          <div>
            <div className="font-semibold text-ink-900 leading-none">{row.original.clientName}</div>
            <div className="text-[10px] text-ink-400 mt-0.5 font-medium">ID: {row.original.clientId}</div>
          </div>
        </div>
      ),
    },
    {
      id: "student",
      header: "Mahasiswa",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className={`h-7 w-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${avatarClass(row.original.studentName)}`}>
            {initials(row.original.studentName)}
          </div>
          <div>
            <div className="font-semibold text-ink-900 leading-none">{row.original.studentName}</div>
            <div className="text-[10px] text-ink-400 mt-0.5 font-medium">ID: {row.original.studentId}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "serviceTitle",
      header: "Jasa",
      cell: ({ getValue }: any) => (
        <span className="font-semibold text-ink-700 text-sm leading-snug truncate max-w-[200px] block">
          {getValue()}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: "Nominal",
      cell: ({ getValue }: any) => (
        <span className="font-extrabold text-ink-900 text-sm">
          {formatCurrency(getValue())}
        </span>
      ),
    },
    {
      accessorKey: "escrowStatus",
      header: "Status Escrow",
      cell: ({ getValue }: any) => renderStatusPill(getValue()),
    },
    {
      accessorKey: "createdAt",
      header: "Tanggal Transaksi",
      cell: ({ getValue }: any) => formatDate(getValue()),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Aksi</span>,
      cell: ({ row }) => (
        <div className="text-right">
          <button
            onClick={() => setSelectedOrderId(row.original.id)}
            className="h-8 w-8 rounded-lg border border-border bg-white flex items-center justify-center text-ink-500 hover:bg-surface-2 hover:text-brand-600 transition-colors shadow-sm cursor-pointer"
            title="Lihat Detail Escrow"
          >
            <Eye className="h-4 w-4" />
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
          { label: "Volume Transaksi (GTV)", val: formatCurrency(totalVolume), icon: TrendingUp, color: "text-success-500 bg-success-50 border-success-100" },
          { label: "Escrow Ditahan", val: formatCurrency(data?.data.filter((t) => t.escrowStatus === "Ditahan").reduce((s, t) => s + t.amount, 0) ?? 0), icon: Wallet, color: "text-warn-500 bg-warn-50 border-warn-100" },
          { label: "Dana Dicairkan", val: formatCurrency(data?.data.filter((t) => t.escrowStatus === "Dicairkan").reduce((s, t) => s + t.amount, 0) ?? 0), icon: DollarSign, color: "text-brand-500 bg-brand-50 border-brand-100" },
          { label: "Total Pengembalian (Refund)", val: formatCurrency(data?.data.filter((t) => t.escrowStatus === "Refund").reduce((s, t) => s + t.amount, 0) ?? 0), icon: Undo2, color: "text-danger-500 bg-danger-50 border-danger-100" }
        ].map((item, idx) => (
          <div key={idx} className="bg-white border border-border rounded-xl p-5 flex items-center gap-4 shadow-sh-1">
            <div className={`h-11 w-11 rounded-lg flex items-center justify-center border ${item.color.split(" ")[1]} ${item.color.split(" ")[2]} flex-shrink-0`}>
              <item.icon className={`h-5 w-5 ${item.color.split(" ")[0]}`} />
            </div>
            <div>
              <div className="text-xs text-ink-400 font-semibold">{item.label}</div>
              <div className="text-xl font-extrabold text-ink-900 mt-1 leading-none tracking-tight">{item.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="flex flex-1 max-w-sm relative">
          <Search className="absolute left-3 top-2.5 h-[15px] w-[15px] text-ink-400 pointer-events-none" />
          <input
            placeholder="Cari ID transaksi, klien, freelancer..."
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
          <span className="text-xs text-ink-500 font-semibold select-none">Status Escrow:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-[38px] px-3 bg-white border border-border rounded-lg text-[13.5px] font-medium text-ink-700 focus:outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-50 transition-all cursor-pointer"
          >
            <option value="Semua">Semua Status</option>
            <option value="Ditahan">Ditahan</option>
            <option value="Dicairkan">Dicairkan</option>
            <option value="Refund">Refund</option>
          </select>
        </div>
      </div>

      {/* Escrow Table */}
      {error ? (
        <div className="p-8 border border-border rounded-xl bg-white text-center">
          <AlertTriangle className="h-8 w-8 text-danger-500 mx-auto" />
          <h3 className="font-heading font-bold text-sm text-ink-900 mt-2">Gagal memuat data</h3>
          <p className="text-xs text-ink-400 mt-1">{(error as any).message || "Terjadi kesalahan koneksi"}</p>
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

      {/* Detail Modal / Timeline Tracker */}
      <Dialog open={!!selectedOrderId} onOpenChange={(open) => !open && setSelectedOrderId(null)}>
        <DialogContent className="max-w-[800px] rounded-xl p-0 overflow-hidden border-border bg-white shadow-sh-3">
          {isLoadingDetail ? (
            <div className="p-12 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent mx-auto" />
              <p className="text-xs text-ink-500 mt-2 font-medium">Memuat detail transaksi...</p>
            </div>
          ) : orderDetail ? (
            <div className="flex flex-col h-full max-h-[85vh]">
              {/* Modal Header */}
              <div className="p-5 border-b border-border bg-surface-2/40 flex justify-between items-center">
                <div>
                  <h2 className="font-heading font-bold text-base text-ink-900 tracking-tight leading-tight">
                    Detail Transaksi Escrow: {orderDetail.id}
                  </h2>
                  <p className="text-xs text-ink-400 font-medium mt-1">
                    Transaksi dibuat pada {formatDate(orderDetail.createdAt)}
                  </p>
                </div>
                <div>{renderStatusPill(orderDetail.escrowStatus)}</div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Client & Student Side-by-Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Client Card */}
                  <div className="rounded-lg border border-border p-4 bg-surface-2/30 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Pembayar (Klien)</span>
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold border border-white shadow-sm ${avatarClass(orderDetail.clientName)}`}>
                        {initials(orderDetail.clientName)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-ink-900 leading-tight">{orderDetail.clientName}</div>
                        <div className="text-[10.5px] text-ink-400 mt-0.5 font-medium">ID: {orderDetail.clientId}</div>
                      </div>
                    </div>
                  </div>

                  {/* Student Card */}
                  <div className="rounded-lg border border-border p-4 bg-surface-2/30 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Penerima (Mahasiswa)</span>
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold border border-white shadow-sm ${avatarClass(orderDetail.studentName)}`}>
                        {initials(orderDetail.studentName)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-ink-900 leading-tight">{orderDetail.studentName}</div>
                        <div className="text-[10.5px] text-ink-400 mt-0.5 font-medium">ID: {orderDetail.studentId}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Package & Service details */}
                <div className="rounded-lg border border-border p-4 bg-white space-y-3">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-ink-400">Detail Layanan Jasa</span>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-ink-900 leading-tight">{orderDetail.serviceTitle}</h4>
                      <p className="text-xs text-ink-500 font-medium mt-1">
                        Paket: <span className="font-semibold text-ink-850">{orderDetail.packageName || "Default"}</span>{" "}
                        {orderDetail.packageDescription && `— ${orderDetail.packageDescription}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-ink-900">
                        {formatCurrency(orderDetail.amount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Interactive Escrow Timeline */}
                <div className="space-y-3">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-ink-400">Escrow Timeline Tracker</span>
                  <div className="rounded-lg border border-border bg-white p-5 space-y-5">
                    {orderDetail.timeline && orderDetail.timeline.length > 0 ? (
                      <div className="relative border-l-2 border-border ml-2.5 pl-6 space-y-5">
                        {orderDetail.timeline.map((step, idx) => {
                          const isActive = step.isCompleted;
                          return (
                            <div key={idx} className="relative">
                              <span className={`absolute -left-[32px] top-0.5 h-4.5 w-4.5 rounded-full border-2 border-white flex items-center justify-center shadow-sm transition-all ${
                                isActive 
                                  ? "bg-success-500 text-white" 
                                  : "bg-surface-3 text-ink-300"
                              }`}>
                                {isActive && <CheckCircle2 className="h-3 w-3 fill-success-500 text-white" />}
                              </span>
                              
                              <div>
                                <h5 className={`text-xs font-bold ${isActive ? "text-ink-900" : "text-ink-400"}`}>
                                  {step.step}
                                </h5>
                                <p className="text-[11.5px] text-ink-400 font-medium mt-0.5">
                                  {step.description}
                                </p>
                                {step.completedAt && (
                                  <span className="inline-block text-[10px] text-ink-400 font-medium bg-surface-2 px-1.5 py-0.5 rounded border border-border/40 mt-1.5">
                                    Selesai pada {formatDate(step.completedAt)}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="relative border-l-2 border-border ml-2.5 pl-6 space-y-5">
                        {[
                          { step: "Pembayaran Escrow Diterima", desc: "Klien telah mentransfer dana ke escrow platform.", completed: true, date: orderDetail.createdAt },
                          { step: "Pekerjaan Mulai Dikerjakan", desc: "Freelancer menyetujui penugasan dan mulai bekerja.", completed: true, date: orderDetail.createdAt },
                          { step: "Freelancer Mengirimkan Hasil", desc: "Pekerjaan diserahkan kepada Klien untuk direview.", completed: orderDetail.escrowStatus !== "Ditahan", date: orderDetail.escrowStatus !== "Ditahan" ? orderDetail.createdAt : null },
                          { step: "Dana Dicairkan / Refund", desc: "Dana ditransfer ke freelancer setelah persetujuan klien atau diselesaikan admin.", completed: orderDetail.escrowStatus !== "Ditahan", date: orderDetail.escrowStatus !== "Ditahan" ? orderDetail.createdAt : null }
                        ].map((step, idx) => (
                          <div key={idx} className="relative">
                            <span className={`absolute -left-[32px] top-0.5 h-4.5 w-4.5 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${
                              step.completed 
                                ? "bg-success-500 text-white" 
                                : "bg-surface-3 text-ink-300"
                            }`}>
                              {step.completed && <CheckCircle2 className="h-3 w-3 fill-success-500 text-white" />}
                            </span>
                            <div>
                              <h5 className={`text-xs font-bold ${step.completed ? "text-ink-900" : "text-ink-400"}`}>
                                {step.step}
                              </h5>
                              <p className="text-[11.5px] text-ink-400 font-medium mt-0.5">
                                {step.desc}
                              </p>
                              {step.date && (
                                <span className="inline-block text-[10px] text-ink-400 font-medium bg-surface-2 px-1.5 py-0.5 rounded border border-border/40 mt-1.5">
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

              {/* Modal Footer */}
              <div className="p-4 border-t border-border bg-surface-2/40 flex justify-end">
                <button
                  onClick={() => setSelectedOrderId(null)}
                  className="px-4 py-2 text-sm font-semibold border border-border bg-white rounded-lg text-ink-700 hover:bg-surface-3 transition-colors cursor-pointer shadow-sm"
                >
                  Tutup
                </button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
