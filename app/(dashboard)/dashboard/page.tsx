"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { ChartSkeleton } from "@/components/charts/chart-skeleton";
import type { ChartPeriod } from "@/components/charts/types";
import { DashboardActivityFeed } from "@/components/dashboard/dashboard-activity-feed";
import { DashboardAttentionPanel } from "@/components/dashboard/dashboard-attention-panel";
import { DashboardStatCards } from "@/components/dashboard/dashboard-stat-cards";
import { useOpsBadgeCounts } from "@/hooks/use-ops-badge-counts";
import {
  dashboardApi,
  type ActivityItem,
  type AnalyticsResponse,
  type DashboardStats,
} from "@/lib/api/dashboard";

const TransactionAreaChart = dynamic(
  () =>
    import("@/components/charts/transaction-area-chart").then(
      (m) => m.TransactionAreaChart,
    ),
  { loading: () => <ChartSkeleton className="lg:col-span-2" /> },
);

const CategoryDonutChart = dynamic(
  () =>
    import("@/components/charts/category-donut-chart").then(
      (m) => m.CategoryDonutChart,
    ),
  { loading: () => <ChartSkeleton /> },
);

export default function DashboardPage() {
  const [period, setPeriod] = useState<ChartPeriod>("30H");
  const opsCounts = useOpsBadgeCounts();

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: () => dashboardApi.getStats(),
    staleTime: 60_000,
  });

  const { data: analytics, isLoading: isLoadingCharts } =
    useQuery<AnalyticsResponse>({
      queryKey: ["dashboardAnalytics", period],
      queryFn: () => dashboardApi.getChartData(period),
      staleTime: 60_000,
    });

  const { data: activities = [], isLoading: isLoadingActivities } = useQuery<
    ActivityItem[]
  >({
    queryKey: ["dashboardActivities"],
    queryFn: () => dashboardApi.getActivityLog(),
    staleTime: 30_000,
  });

  return (
    <div className="space-y-6">
      <DashboardStatCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TransactionAreaChart
          period={period}
          onPeriodChange={setPeriod}
          analytics={analytics}
          isLoading={isLoadingCharts}
        />
        <CategoryDonutChart
          analytics={analytics}
          isLoading={isLoadingCharts}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DashboardActivityFeed
          activities={activities}
          isLoading={isLoadingActivities}
        />
        <DashboardAttentionPanel counts={opsCounts} />
      </div>
    </div>
  );
}
