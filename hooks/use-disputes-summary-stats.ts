"use client";

import { useQuery } from "@tanstack/react-query";

import { disputesApi } from "@/lib/api/disputes";

export interface DisputesSummaryStats {
  openCount: number;
  rejectedCount: number;
  totalCount: number;
  resolvedCount: number;
}

async function fetchDisputesSummaryStats(): Promise<DisputesSummaryStats> {
  const [open, resolved, rejected] = await Promise.all([
    disputesApi.list({ status: "Terbuka", page: 1, limit: 1 }),
    disputesApi.list({ status: "Selesai", page: 1, limit: 1 }),
    disputesApi.list({ status: "Ditolak", page: 1, limit: 1 }),
  ]);

  return {
    openCount: open.total,
    rejectedCount: rejected.total,
    totalCount: open.total + resolved.total + rejected.total,
    resolvedCount: resolved.total,
  };
}

export function useDisputesSummaryStats() {
  return useQuery({
    queryKey: ["disputes", "summary-stats"],
    queryFn: fetchDisputesSummaryStats,
    staleTime: 30_000,
  });
}
