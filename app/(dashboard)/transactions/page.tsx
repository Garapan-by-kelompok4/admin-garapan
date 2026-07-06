"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { ordersApi } from "@/lib/api/orders";
import { formatCurrency, formatDate, getErrorMessage } from "@/lib/utils";
import { useTransactionsSummaryStats } from "@/hooks/use-transactions-summary-stats";
import { paginatedListPlaceholder } from "@/lib/query/pagination";
import { DataTable } from "@/components/data-table/data-table";
import { TransactionsSummaryCards } from "@/components/transactions/transactions-summary-cards";
import { TransactionsToolbar } from "@/components/transactions/transactions-toolbar";
import { createTransactionsColumns } from "@/components/transactions/transactions-columns";
import { TransactionDetailDialog } from "@/components/transactions/transaction-detail-dialog";
import { TransactionStatusPill } from "@/components/transactions/transaction-status-pill";

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [page, setPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const limit = 10;

  const { data: summaryStats } = useTransactionsSummaryStats();

  const { data, isLoading, error } = useQuery({
    queryKey: ["transactions", page, search, statusFilter],
    queryFn: async () => {
      let apiStatus: string | undefined = undefined;
      if (statusFilter === "Ditahan") apiStatus = "PAID";
      else if (statusFilter === "Dicairkan") apiStatus = "COMPLETED";
      else if (statusFilter === "Refund") apiStatus = "CANCELLED";

      return ordersApi.list({
        page,
        limit,
        status: apiStatus,
        search: search || undefined,
      });
    },
    placeholderData: paginatedListPlaceholder,
  });

  const { data: orderDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["orderDetail", selectedOrderId],
    queryFn: () => ordersApi.getById(selectedOrderId!),
    enabled: !!selectedOrderId,
  });

  const columns = createTransactionsColumns({
    onViewDetail: setSelectedOrderId,
  });

  return (
    <div className="space-y-6">
      <TransactionsSummaryCards stats={summaryStats} />

      <TransactionsToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
          setPage(1);
        }}
      />

      {error ? (
        <div className="p-8 border border-border rounded-xl bg-white text-center">
          <AlertTriangle className="h-8 w-8 text-danger-500 mx-auto" />
          <h3 className="font-heading font-bold text-sm text-ink-900 mt-2">
            Gagal memuat data
          </h3>
          <p className="text-xs text-ink-400 mt-1">
            {getErrorMessage(error)}
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
          mobileCard={(order) => (
            <div className="rounded-lg border border-border bg-white p-4 shadow-sh-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-mono text-[11px] font-bold text-ink-500">
                    {order.id}
                  </div>
                  <div className="mt-2 line-clamp-2 text-sm font-bold text-ink-900">
                    {order.serviceTitle}
                  </div>
                </div>
                <TransactionStatusPill status={order.escrowStatus} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="font-semibold text-ink-400">Klien</div>
                  <div className="mt-1 truncate font-bold text-ink-800">
                    {order.clientName}
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-ink-400">Mahasiswa</div>
                  <div className="mt-1 truncate font-bold text-ink-800">
                    {order.studentName}
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-ink-400">Nominal</div>
                  <div className="mt-1 font-bold text-ink-900">
                    {formatCurrency(order.amount)}
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-ink-400">Tanggal</div>
                  <div className="mt-1 font-bold text-ink-800">
                    {formatDate(order.createdAt)}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderId(order.id)}
                className="mt-4 h-9 w-full rounded-lg border border-border bg-white text-xs font-bold text-ink-700 shadow-sm"
              >
                Lihat Detail Escrow
              </button>
            </div>
          )}
        />
      )}

      <TransactionDetailDialog
        open={!!selectedOrderId}
        onOpenChange={(open) => !open && setSelectedOrderId(null)}
        orderDetail={orderDetail}
        isLoading={isLoadingDetail}
      />
    </div>
  );
}
