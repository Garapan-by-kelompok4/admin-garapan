import { apiClient } from "./client";
import { asRecord, recordList } from "./normalizers";

export type DisputePriority = "Tinggi" | "Sedang" | "Rendah";
export type DisputeStatus = "Terbuka" | "Diproses" | "Selesai" | "Ditolak";
export type DisputeOutcome = "RELEASE" | "REFUND" | "PARTIAL_REFUND" | "REJECT";

export interface Dispute {
  id: string;
  orderId: string;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  reportedId: string;
  reportedName: string;
  reportedEmail: string;
  issueType: string;
  description: string;
  priority: DisputePriority;
  status: DisputeStatus;
  createdAt: string;
  orderAmount: number;
}

export interface DisputeDetail extends Dispute {
  evidenceUrls?: string[];
}

export interface ListDisputesParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface ListDisputesResponse {
  data: Dispute[];
  total: number;
  page: number;
  limit: number;
}

export interface ResolveDisputePayload {
  outcome: DisputeOutcome;
  resolutionNote: string;
  refundAmount?: string;
}

function normaliseDispute(raw: unknown): Dispute {
  if (!raw) {
    return {
      id: "",
      orderId: "",
      reporterId: "",
      reporterName: "-",
      reporterEmail: "-",
      reportedId: "",
      reportedName: "-",
      reportedEmail: "-",
      issueType: "-",
      description: "",
      priority: "Sedang",
      status: "Terbuka",
      createdAt: new Date().toISOString(),
      orderAmount: 0,
    };
  }

  const r = asRecord(raw);
  const reporter = asRecord(r.reporter);
  const target = asRecord(r.target);
  const pesanan = asRecord(r.pesanan);

  let status: DisputeStatus = "Terbuka";
  if (r.status === "RESOLVED") status = "Selesai";
  else if (r.status === "REJECTED") status = "Ditolak";
  else if (r.status === "PENDING") status = "Terbuka";

  return {
    id: String(r.id ?? ""),
    orderId: String(r.pesananId ?? pesanan.id ?? ""),
    reporterId: String(reporter.id ?? r.reporterId ?? ""),
    reporterName: String(
      reporter.fullName ?? reporter.displayName ?? reporter.email ?? "-",
    ),
    reporterEmail: String(reporter.email ?? "-"),
    reportedId: String(target.id ?? r.targetId ?? ""),
    reportedName: String(
      target.fullName ?? target.displayName ?? target.email ?? "-",
    ),
    reportedEmail: String(target.email ?? "-"),
    issueType: String(r.reason ?? "-"),
    description: String(r.reason ?? ""),
    priority: "Sedang",
    status,
    createdAt: String(r.createdAt ?? new Date().toISOString()),
    orderAmount: Number(pesanan.totalPrice ?? 0),
  };
}

function normaliseListResponse(
  raw: unknown,
  page = 1,
  limit = 10,
): ListDisputesResponse {
  if (!raw) return { data: [], total: 0, page, limit };

  const r = asRecord(raw);
  const items = recordList(
    Array.isArray(r.data)
      ? r.data
      : Array.isArray(r.items)
        ? r.items
        : Array.isArray(raw)
          ? raw
          : [],
  );

  return {
    data: items.map(normaliseDispute),
    total: Number(r.total ?? r.count ?? items.length),
    page: Number(r.page ?? page),
    limit: Number(r.limit ?? limit),
  };
}

export const disputesApi = {
  list: async (
    params: ListDisputesParams = {},
  ): Promise<ListDisputesResponse> => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));

    if (params.status) {
      let backendStatus = params.status;
      if (params.status === "Terbuka" || params.status === "Diproses") {
        backendStatus = "PENDING";
      } else if (params.status === "Selesai") {
        backendStatus = "RESOLVED";
      } else if (params.status === "Ditolak") {
        backendStatus = "REJECTED";
      }
      query.set("status", backendStatus);
    }

    const queryString = query.toString();
    const path = `/admin/disputes${queryString ? `?${queryString}` : ""}`;
    const raw = await apiClient<unknown>(path);
    return normaliseListResponse(raw, params.page, params.limit);
  },

  getById: async (id: string): Promise<DisputeDetail> => {
    const raw = await apiClient<unknown>(`/admin/disputes/${id}`);
    const dispute = normaliseDispute(raw);
    const record = asRecord(raw);
    const resolutionNote = String(record.resolutionNote ?? "");
    return {
      ...dispute,
      description: resolutionNote || dispute.description,
    };
  },

  resolve: async (
    id: string,
    payload: ResolveDisputePayload,
  ): Promise<void> => {
    return apiClient<void>(`/admin/disputes/${id}/resolve`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};
