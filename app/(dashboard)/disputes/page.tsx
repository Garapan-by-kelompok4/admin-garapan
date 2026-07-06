"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { disputesApi, DisputeDetail, ResolveDisputePayload } from "@/lib/api/disputes";
import { formatCurrency, formatDate, getErrorMessage } from "@/lib/utils";
import { useDisputesSummaryStats } from "@/hooks/use-disputes-summary-stats";
import { paginatedListPlaceholder } from "@/lib/query/pagination";
import { DataTable } from "@/components/data-table/data-table";
import { DisputesSummaryCards } from "@/components/disputes/disputes-summary-cards";
import { DisputesToolbar } from "@/components/disputes/disputes-toolbar";
import { createDisputesColumns } from "@/components/disputes/disputes-columns";
import { DisputeDetailDialog } from "@/components/disputes/dispute-detail-dialog";
import { DisputeStatusPill } from "@/components/disputes/dispute-status-pill";

export default function DisputesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Terbuka");
  const [page, setPage] = useState(1);
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(
    null,
  );

  const limit = 10;

  const { data: summaryStats } = useDisputesSummaryStats();

  const { data, isLoading, error } = useQuery({
    queryKey: ["disputes", page, statusFilter],
    queryFn: () =>
      disputesApi.list({
        page,
        limit,
        status: statusFilter === "Semua" ? undefined : statusFilter,
      }),
    placeholderData: paginatedListPlaceholder,
  });

  const { data: disputeDetail, isLoading: isLoadingDetail } = useQuery<
    DisputeDetail,
    Error
  >({
    queryKey: ["disputeDetail", selectedDisputeId],
    queryFn: () => disputesApi.getById(selectedDisputeId!),
    enabled: !!selectedDisputeId,
  });

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

  const columns = createDisputesColumns({
    onReview: setSelectedDisputeId,
  });

  return (
    <div className="space-y-6">
      <DisputesSummaryCards
        openCount={summaryStats?.openCount ?? 0}
        processingCount={summaryStats?.processingCount ?? 0}
        totalCount={summaryStats?.totalCount ?? 0}
        resolvedCount={summaryStats?.resolvedCount ?? 0}
      />

      <DisputesToolbar
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
          mobileCard={(dispute) => (
            <div className="rounded-lg border border-border bg-white p-4 shadow-sh-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-mono text-[11px] font-bold text-brand-600">
                    {dispute.id}
                  </div>
                  <div className="mt-2 line-clamp-2 text-sm font-bold text-ink-900">
                    {dispute.issueType}
                  </div>
                </div>
                <DisputeStatusPill status={dispute.status} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="font-semibold text-ink-400">Pelapor</div>
                  <div className="mt-1 truncate font-bold text-ink-800">
                    {dispute.reporterName}
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-ink-400">Nominal</div>
                  <div className="mt-1 font-bold text-ink-800">
                    {formatCurrency(dispute.orderAmount)}
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-ink-400">Prioritas</div>
                  <div className="mt-1 font-bold text-ink-800">
                    {dispute.priority}
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-ink-400">Tanggal</div>
                  <div className="mt-1 font-bold text-ink-800">
                    {formatDate(dispute.createdAt)}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDisputeId(dispute.id)}
                className="mt-4 h-9 w-full rounded-lg border border-border bg-white text-xs font-bold text-ink-700 shadow-sm"
              >
                Tinjau Laporan
              </button>
            </div>
          )}
        />
      )}

      <DisputeDetailDialog
        open={!!selectedDisputeId}
        onOpenChange={(open) => !open && setSelectedDisputeId(null)}
        disputeDetail={disputeDetail}
        isLoading={isLoadingDetail}
        onResolve={(params) => resolveMutation.mutate(params)}
        isResolvePending={resolveMutation.isPending}
      />
    </div>
  );
}
