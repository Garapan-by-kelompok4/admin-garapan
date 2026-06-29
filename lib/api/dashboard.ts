import { apiClient } from "./client";

export interface ActivityItem {
  id: string;
  actorName: string;
  actorRole: string;
  action: "order" | "user" | "report" | string;
  message: string;
  createdAt: string;
}

export interface DashboardStats {
  activeUsers: number;
  activeUsersDelta: number;
  transactionsCount: number;
  transactionsDelta: number;
  revenue: number;
  revenueDelta: number;
  pendingReports: number;
  pendingReportsDelta: number;
}

export interface OrderChartPoint {
  name: string;
  orders: number;
  value: number;
  average: number;
}

export interface CategoryDonutPoint {
  name: string;
  value: number;
  percentage: number;
}

export interface AnalyticsResponse {
  ordersLine: OrderChartPoint[];
  categoriesDonut: CategoryDonutPoint[];
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    return apiClient<DashboardStats>("/admin/stats");
  },

  getChartData: async (): Promise<AnalyticsResponse> => {
    return apiClient<AnalyticsResponse>("/admin/analytics");
  },

  getActivityLog: async (): Promise<ActivityItem[]> => {
    return apiClient<ActivityItem[]>("/admin/activity");
  }
};
