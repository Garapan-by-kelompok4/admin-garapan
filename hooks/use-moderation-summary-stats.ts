"use client";

import { useQuery } from "@tanstack/react-query";

import { contentApi, type ContentModerationStats } from "@/lib/api/content";

export type ModerationSummaryStats = ContentModerationStats;

export function useModerationSummaryStats() {
  return useQuery({
    queryKey: ["content", "summary-stats"],
    queryFn: () => contentApi.stats(),
    staleTime: 30_000,
  });
}
