"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { contentApi } from "@/lib/api/content";
import { moderationContentLabels } from "@/lib/moderation/content-labels";
import { invalidateModerationQueries } from "@/lib/moderation/invalidate-queries";
import { MODERATION_PAGE_DESCRIPTION } from "@/lib/moderation/page-meta";
import { formatDate, getErrorMessage } from "@/lib/utils";
import { useModerationSummaryStats } from "@/hooks/use-moderation-summary-stats";
import { paginatedListPlaceholder } from "@/lib/query/pagination";
import { DataTable } from "@/components/data-table/data-table";
import { ModerationSummaryCards } from "@/components/moderation/moderation-summary-cards";
import { ModerationToolbar } from "@/components/moderation/moderation-toolbar";
import type { ModerationTypeFilter } from "@/components/moderation/moderation-toolbar";
import { createModerationColumns } from "@/components/moderation/moderation-columns";
import { ModerationDetailDialog } from "@/components/moderation/moderation-detail-dialog";
import { ModerationTypePill } from "@/components/moderation/moderation-type-pill";
import { ModerationStatusPill } from "@/components/moderation/moderation-status-pill";

export default function ModerationPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ModerationTypeFilter>("Semua");
  const [page, setPage] = useState(1);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(
    null,
  );

  const limit = 10;

  const { data: summaryStats } = useModerationSummaryStats();

  const { data, isLoading, error } = useQuery({
    queryKey: ["content", page, search, typeFilter],
    queryFn: () =>
      contentApi.list({
        page,
        limit,
        search: search || undefined,
        contentType: typeFilter === "Semua" ? undefined : typeFilter,
      }),
    placeholderData: paginatedListPlaceholder,
  });

  const { data: contentDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["contentDetail", selectedContentId, data?.data],
    queryFn: async () => {
      const found = data?.data?.find((c) => c.id === selectedContentId);
      return found ?? null;
    },
    enabled: !!selectedContentId,
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => contentApi.remove(id),
    onSuccess: (_data, id) => {
      const item = data?.data?.find((entry) => entry.id === id);
      const labels = moderationContentLabels(item?.contentType ?? "jasa");
      toast.success(labels.removeSuccess);
      invalidateModerationQueries(queryClient);
      setSelectedContentId(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menghapus konten");
    },
  });

  const markSafeMutation = useMutation({
    mutationFn: (id: string) => contentApi.markSafe(id),
    onSuccess: (_data, id) => {
      const item = data?.data?.find((entry) => entry.id === id);
      const labels = moderationContentLabels(item?.contentType ?? "jasa");
      toast.success(labels.markSafeSuccess);
      invalidateModerationQueries(queryClient);
      setSelectedContentId(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menandai konten sebagai aman");
    },
  });

  const columns = createModerationColumns({
    onReview: setSelectedContentId,
  });

  return (
    <div className="space-y-6">
      <p className="text-sm font-medium text-ink-500 -mt-1">
        {MODERATION_PAGE_DESCRIPTION}
      </p>

      <ModerationSummaryCards stats={summaryStats} />

      <ModerationToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        typeFilter={typeFilter}
        onTypeFilterChange={(value) => {
          setTypeFilter(value);
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
          mobileCard={(content) => (
            <div className="rounded-lg border border-border bg-white p-4 shadow-sh-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <ModerationTypePill contentType={content.contentType} />
                    <span className="font-mono text-[10px] font-bold text-brand-600">
                      {content.id.slice(0, 8)}
                    </span>
                  </div>
                  <div className="mt-2 line-clamp-2 text-sm font-bold text-ink-900">
                    {content.title}
                  </div>
                </div>
                <ModerationStatusPill status={content.status} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="font-semibold text-ink-400">Pemilik</div>
                  <div className="mt-1 truncate font-bold text-ink-800">
                    {content.owner.fullName}
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-ink-400">Tanggal</div>
                  <div className="mt-1 font-bold text-ink-800">
                    {formatDate(content.createdAt)}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedContentId(content.id)}
                className="mt-4 h-9 w-full rounded-lg border border-border bg-white text-xs font-bold text-ink-700 shadow-sm"
              >
                Tinjau Konten
              </button>
            </div>
          )}
        />
      )}

      <ModerationDetailDialog
        open={!!selectedContentId}
        onOpenChange={(open) => !open && setSelectedContentId(null)}
        contentDetail={contentDetail}
        isLoading={isLoadingDetail}
        onRemove={(id) => removeMutation.mutate(id)}
        onMarkSafe={(id) => markSafeMutation.mutate(id)}
        isRemovePending={removeMutation.isPending}
        isMarkSafePending={markSafeMutation.isPending}
      />
    </div>
  );
}
