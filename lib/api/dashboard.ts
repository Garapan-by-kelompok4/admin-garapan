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

const ACTIVITY_MESSAGES: Record<string, string> = {
  USER_REGISTERED: "Pengguna baru terdaftar",
  USER_LOGGED_IN: "Pengguna masuk",
  ORDER_CREATED: "Pesanan baru dibuat",
  PAYMENT_SUCCEEDED: "Pembayaran berhasil",
  ORDER_DELIVERED: "Pesanan dikirim",
  ORDER_COMPLETED: "Pesanan selesai",
  ORDER_CANCELLED: "Pesanan dibatalkan",
  DISPUTE_OPENED: "Dispute dibuka",
  DISPUTE_RESOLVED: "Dispute diselesaikan",
  PROPOSAL_SUBMITTED: "Proposal diajukan",
  PROPOSAL_WITHDRAWN: "Proposal ditarik",
  PROPOSAL_ACCEPTED: "Proposal diterima",
  PROPOSAL_REJECTED: "Proposal ditolak",
};

function normaliseActivity(raw: unknown, index: number): ActivityItem {
  const record = asRecord(raw);
  const meta = asRecord(record.meta);
  const user = asRecord(record.user);
  const action = String(record.action ?? "activity");
  const userId = String(record.userId ?? user.id ?? "");

  let message = String(
    meta.message ?? meta.description ?? ACTIVITY_MESSAGES[action] ?? action,
  );
  if (action.includes("DISPUTE") && meta.outcome) {
    message = `Dispute diselesaikan: ${meta.outcome}`;
  } else if (action.includes("ORDER") && meta.pesananId) {
    message = `Pesanan ${String(meta.pesananId).slice(0, 8)}… — ${ACTIVITY_MESSAGES[action] ?? action.toLowerCase().replaceAll("_", " ")}`;
  }

  const actorName = String(
    user.displayName ??
      user.fullName ??
      user.email ??
      (userId ? `User ${userId.slice(0, 8)}` : "Sistem"),
  );
  const actorRole = String(user.role ?? (action.includes("DISPUTE_RESOLVED") ? "ADMIN" : "USER"));

  return {
    id: String(record.id ?? record._id ?? `activity-${index}`),
    actorName,
    actorRole,
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
  activeUsersDelta: number | null;
  transactionsCount: number;
  transactionsDelta: number | null;
  revenue: number;
  revenueDelta: number | null;
  pendingReports: number;
  pendingReportsDelta: number | null;
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
    const [statsRaw, analyticsRaw] = await Promise.all([
      apiClient<unknown>("/admin/stats"),
      apiClient<unknown>("/admin/analytics?days=30&includeDeltas=true").catch(
        () => null,
      ),
    ]);
    const r = asRecord(statsRaw);
    const analytics = analyticsRaw ? normaliseAnalytics(analyticsRaw) : null;
    const deltas = analytics?.deltas;

    return {
      activeUsers: Number(r.users ?? 0),
      activeUsersDelta: deltas?.users ?? null,
      transactionsCount: Number(asRecord(r.orders).total ?? 0),
      transactionsDelta: deltas?.orders ?? null,
      revenue: Number(r.revenue ?? 0),
      revenueDelta: deltas?.revenue ?? null,
      pendingReports: Number(r.pendingDisputes ?? 0),
      pendingReportsDelta: null,
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
