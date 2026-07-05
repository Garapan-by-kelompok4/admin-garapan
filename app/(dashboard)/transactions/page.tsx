"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { ordersApi } from "@/lib/api/orders";
import { DataTable } from "@/components/data-table/data-table";
import { TransactionsSummaryCards } from "@/components/transactions/transactions-summary-cards";
import { TransactionsToolbar } from "@/components/transactions/transactions-toolbar";
import { createTransactionsColumns } from "@/components/transactions/transactions-columns";
import { TransactionDetailDialog } from "@/components/transactions/transaction-detail-dialog";

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [page, setPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ["transactions", page, search, statusFilter],
    queryFn: async () => {
      let apiStatus: string | undefined = undefined;
      if (statusFilter === "Ditahan") apiStatus = "PAID";
      else if (statusFilter === "Dicairkan") apiStatus = "COMPLETED";
      else if (statusFilter === "Refund") apiStatus = "CANCELLED";

      const res = await ordersApi.list({
        page,
        limit,
        status: apiStatus,
        search: search || undefined,
      });
      return res;
    },
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
      <TransactionsSummaryCards items={data?.data} />

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

      <TransactionDetailDialog
        open={!!selectedOrderId}
        onOpenChange={(open) => !open && setSelectedOrderId(null)}
        orderDetail={orderDetail}
        isLoading={isLoadingDetail}
      />
    </div>
  );
}
