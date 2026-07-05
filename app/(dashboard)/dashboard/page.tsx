"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { CategoryDonutChart } from "@/components/charts/category-donut-chart";
import {
  TransactionAreaChart,
  type ChartPeriod,
} from "@/components/charts/transaction-area-chart";
import { DashboardActivityFeed } from "@/components/dashboard/dashboard-activity-feed";
import { DashboardAttentionPanel } from "@/components/dashboard/dashboard-attention-panel";
import { DashboardStatCards } from "@/components/dashboard/dashboard-stat-cards";
import {
  dashboardApi,
  type ActivityItem,
  type AnalyticsResponse,
  type DashboardStats,
} from "@/lib/api/dashboard";

export default function DashboardPage() {
  const [period, setPeriod] = useState<ChartPeriod>("30H");

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: () => dashboardApi.getStats(),
  });

  const { data: analytics, isLoading: isLoadingCharts } =
    useQuery<AnalyticsResponse>({
      queryKey: ["dashboardAnalytics", period],
      queryFn: () => dashboardApi.getChartData(period),
    });

  const { data: activities = [], isLoading: isLoadingActivities } = useQuery<
    ActivityItem[]
  >({
    queryKey: ["dashboardActivities"],
    queryFn: () => dashboardApi.getActivityLog(),
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
        <DashboardAttentionPanel />
      </div>
    </div>
  );
}
