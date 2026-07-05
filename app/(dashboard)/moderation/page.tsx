"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { contentApi } from "@/lib/api/content";
import { getErrorMessage } from "@/lib/utils";
import { useModerationSummaryStats } from "@/hooks/use-moderation-summary-stats";
import { paginatedListPlaceholder } from "@/lib/query/pagination";
import { DataTable } from "@/components/data-table/data-table";
import { ModerationSummaryCards } from "@/components/moderation/moderation-summary-cards";
import { ModerationToolbar } from "@/components/moderation/moderation-toolbar";
import { createModerationColumns } from "@/components/moderation/moderation-columns";
import { ModerationDetailDialog } from "@/components/moderation/moderation-detail-dialog";

export default function ModerationPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Ditinjau");
  const [page, setPage] = useState(1);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(
    null,
  );

  const limit = 10;

  const { data: summaryStats } = useModerationSummaryStats();

  const { data, isLoading, error } = useQuery({
    queryKey: ["content", page, search, statusFilter],
    queryFn: () =>
      contentApi.list({
        page,
        limit,
        status: statusFilter === "Semua" ? undefined : statusFilter,
        search: search || undefined,
      }),
    placeholderData: paginatedListPlaceholder,
  });

  const { data: contentDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["contentDetail", selectedContentId],
    queryFn: async () => {
      const found = data?.data?.find((c) => c.id === selectedContentId);
      if (found) return found;
      return found || null;
    },
    enabled: !!selectedContentId,
  });

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

  const columns = createModerationColumns({
    onReview: setSelectedContentId,
  });

  return (
    <div className="space-y-6">
      <ModerationSummaryCards
        pendingCount={summaryStats?.pendingCount ?? 0}
        totalCount={summaryStats?.totalCount ?? 0}
        safeCount={summaryStats?.safeCount ?? 0}
        removedCount={summaryStats?.removedCount ?? 0}
      />

      <ModerationToolbar
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
          setPage(1);
        }}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
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

      <ModerationDetailDialog
        open={!!selectedContentId}
        onOpenChange={(open) => !open && setSelectedContentId(null)}
        contentDetail={contentDetail}
        isLoading={isLoadingDetail}
        onRemove={(id) => removeMutation.mutate(id)}
      />
    </div>
  );
}
