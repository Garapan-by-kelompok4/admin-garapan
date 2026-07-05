"use client";

import { useQuery } from "@tanstack/react-query";

import { contentApi } from "@/lib/api/content";

export interface ModerationSummaryStats {
  pendingCount: number;
  totalCount: number;
  safeCount: number;
  removedCount: number;
}

async function fetchModerationSummaryStats(): Promise<ModerationSummaryStats> {
  const [pending, all, safe, removed, hidden] = await Promise.all([
    contentApi.list({ status: "Ditinjau", page: 1, limit: 1 }),
    contentApi.list({ page: 1, limit: 1 }),
    contentApi.list({ status: "Aman", page: 1, limit: 1 }),
    contentApi.list({ status: "Dihapus", page: 1, limit: 1 }),
    contentApi.list({ status: "Disembunyikan", page: 1, limit: 1 }),
  ]);

  return {
    pendingCount: pending.total,
    totalCount: all.total,
    safeCount: safe.total,
    removedCount: removed.total + hidden.total,
  };
}

export function useModerationSummaryStats() {
  return useQuery({
    queryKey: ["content", "summary-stats"],
    queryFn: fetchModerationSummaryStats,
    staleTime: 30_000,
  });
}
