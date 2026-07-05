"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { disputesApi, DisputeDetail, ResolveDisputePayload } from "@/lib/api/disputes";
import { getErrorMessage } from "@/lib/utils";
import { useDisputesSummaryStats } from "@/hooks/use-disputes-summary-stats";
import { paginatedListPlaceholder } from "@/lib/query/pagination";
import { DataTable } from "@/components/data-table/data-table";
import { DisputesSummaryCards } from "@/components/disputes/disputes-summary-cards";
import { DisputesToolbar } from "@/components/disputes/disputes-toolbar";
import { createDisputesColumns } from "@/components/disputes/disputes-columns";
import { DisputeDetailDialog } from "@/components/disputes/dispute-detail-dialog";

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
