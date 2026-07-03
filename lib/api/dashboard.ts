import { apiClient } from "./client";

export interface ActivityItem {
  id: string;
  actorName: string;
  actorRole: string;
  action: "order" | "user" | "report" | string;
  message: string;
  createdAt: string;
}

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function listFromResponse(raw: unknown, keys: string[] = []): unknown[] {
  const record = asRecord(raw);
  const data = asRecord(record.data);

  if (Array.isArray(raw)) return raw;

  for (const key of keys) {
    if (Array.isArray(record[key])) return record[key];
    if (Array.isArray(data[key])) return data[key];
  }

  if (Array.isArray(record.data)) return record.data;
  if (Array.isArray(record.items)) return record.items;
  if (Array.isArray(data.items)) return data.items;
  return [];
}

function normaliseActivity(raw: unknown, index: number): ActivityItem {
  const record = asRecord(raw);
  const meta = asRecord(record.meta);
  const action = String(record.action ?? "activity");

  let message = String(meta.message ?? meta.description ?? action);
  if (action.includes("DISPUTE") && meta.outcome) {
    message = `Dispute diselesaikan: ${meta.outcome}`;
  } else if (action.includes("ORDER") && meta.pesananId) {
    message = `Pesanan ${String(meta.pesananId).slice(0, 8)}... ${action.toLowerCase().replace("_", " ")}`;
  } else if (action.includes("USER") && meta.userId) {
    message = `User ${action.toLowerCase().replace("_", " ")}`;
  }

  return {
    id: String(record.id ?? record._id ?? `activity-${index}`),
    actorName: "Admin",
    actorRole: "ADMIN",
    action,
    message,
    createdAt: String(
      record.createdAt ??
        record.created_at ??
        record.timestamp ??
        new Date().toISOString(),
    ),
  };
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
  period: { days: number; start: string; end: string };
  timeSeries: Array<{ date: string; orderCount: number; revenue: number }>;
  categoryBreakdown: Array<{
    kategoriId: string;
    name: string;
    count: number;
    revenue: number;
  }>;
  deltas?: {
    orders: number | null;
    revenue: number | null;
    users: number | null;
  };
  ordersLine: OrderChartPoint[];
  categoriesDonut: CategoryDonutPoint[];
}

function normaliseAnalytics(raw: unknown): AnalyticsResponse {
  const r = asRecord(raw);
  const timeSeries = (r.timeSeries ?? []) as UnknownRecord[];
  const categoryBreakdown = (r.categoryBreakdown ?? []) as UnknownRecord[];

  const totalOrders = timeSeries.reduce(
    (sum, p) => sum + Number(p.orderCount ?? 0),
    0,
  );

  const ordersLine: OrderChartPoint[] = timeSeries.map((p) => ({
    name: String(p.date ?? ""),
    orders: Number(p.orderCount ?? 0),
    value: Number(p.revenue ?? 0),
    average:
      timeSeries.length > 0 ? Math.round(totalOrders / timeSeries.length) : 0,
  }));

  const categoriesDonut: CategoryDonutPoint[] = categoryBreakdown.map((c) => ({
    name: String(c.name ?? ""),
    value: Number(c.count ?? 0),
    percentage:
      totalOrders > 0
        ? Math.round((Number(c.count ?? 0) / totalOrders) * 100)
        : 0,
  }));

  return {
    period: asRecord(r.period) as AnalyticsResponse["period"],
    timeSeries: timeSeries.map((p) => ({
      date: String(p.date ?? ""),
      orderCount: Number(p.orderCount ?? 0),
      revenue: Number(p.revenue ?? 0),
    })),
    categoryBreakdown: categoryBreakdown.map((c) => ({
      kategoriId: String(c.kategoriId ?? ""),
      name: String(c.name ?? ""),
      count: Number(c.count ?? 0),
      revenue: Number(c.revenue ?? 0),
    })),
    deltas: r.deltas as AnalyticsResponse["deltas"],
    ordersLine,
    categoriesDonut,
  };
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const raw = await apiClient<unknown>("/admin/stats");
    const r = asRecord(raw);
    return {
      activeUsers: Number(r.users ?? 0),
      activeUsersDelta: 0,
      transactionsCount: Number(asRecord(r.orders).total ?? 0),
      transactionsDelta: 0,
      revenue: Number(r.revenue ?? 0),
      revenueDelta: 0,
      pendingReports: Number(r.pendingDisputes ?? 0),
      pendingReportsDelta: 0,
    };
  },

  getChartData: async (period?: string): Promise<AnalyticsResponse> => {
    const daysMap: Record<string, number> = {
      "7H": 7,
      "30H": 30,
      "90H": 90,
      "1T": 365,
    };
    const days = period ? (daysMap[period] ?? 30) : 30;
    const raw = await apiClient<unknown>(
      `/admin/analytics?days=${days}&includeDeltas=true`,
    );
    return normaliseAnalytics(raw);
  },

  getActivityLog: async (): Promise<ActivityItem[]> => {
    const raw = await apiClient<unknown>("/admin/activity");
    return listFromResponse(raw, [
      "activities",
      "activity",
      "logs",
      "auditLogs",
    ]).map(normaliseActivity);
  },
};
