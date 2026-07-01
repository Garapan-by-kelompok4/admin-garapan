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
  return value && typeof value === "object" ? value as UnknownRecord : {};
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

function textFromValue(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (!value) return fallback;
  const record = asRecord(value);
  return textFromValue(record.message ?? record.name ?? record.title ?? record.label, fallback);
}

function normaliseActivity(raw: unknown, index: number): ActivityItem {
  const record = asRecord(raw);
  const actor = asRecord(record.actor ?? record.admin ?? record.user);
  return {
    id: String(record.id ?? record._id ?? `activity-${index}`),
    actorName: textFromValue(record.actorName ?? actor.name ?? actor.fullName, "Admin"),
    actorRole: textFromValue(record.actorRole ?? actor.role, "ADMIN"),
    action: textFromValue(record.action ?? record.type, "activity"),
    message: textFromValue(record.message ?? record.description ?? record.activity, "Aktivitas admin"),
    createdAt: String(record.createdAt ?? record.created_at ?? record.timestamp ?? new Date().toISOString()),
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
  ordersLine: OrderChartPoint[];
  categoriesDonut: CategoryDonutPoint[];
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    return apiClient<DashboardStats>("/admin/stats");
  },

  getChartData: async (period?: string): Promise<AnalyticsResponse> => {
    const daysMap: Record<string, number> = { "7H": 7, "30H": 30, "90H": 90, "1T": 365 };
    const days = period ? daysMap[period] ?? 30 : 30;
    return apiClient<AnalyticsResponse>(`/admin/analytics?days=${days}`);
  },

  getActivityLog: async (): Promise<ActivityItem[]> => {
    const raw = await apiClient<unknown>("/admin/activity");
    return listFromResponse(raw, ["activities", "activity", "logs", "auditLogs"]).map(normaliseActivity);
  }
};
