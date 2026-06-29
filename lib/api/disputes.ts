import { apiClient } from "./client";

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
  communicationHistory?: Array<{
    id: string;
    senderName: string;
    senderRole: string;
    message: string;
    createdAt: string;
  }>;
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
  refundAmount?: number;
}

function normaliseListResponse<T>(raw: any, page = 1, limit = 10): { data: T[]; total: number; page: number; limit: number } {
  if (!raw) return { data: [], total: 0, page, limit };
  if (Array.isArray(raw.data)) {
    return { data: raw.data as T[], total: raw.total ?? raw.count ?? raw.data.length, page: raw.page ?? page, limit: raw.limit ?? limit };
  }
  if (Array.isArray(raw.items)) {
    return { data: raw.items as T[], total: raw.total ?? raw.count ?? raw.items.length, page: raw.page ?? page, limit: raw.limit ?? limit };
  }
  if (Array.isArray(raw)) {
    return { data: raw as T[], total: raw.length, page, limit };
  }
  return { data: [], total: 0, page, limit };
}

export const disputesApi = {
  list: async (params: ListDisputesParams = {}): Promise<ListDisputesResponse> => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.status) query.set("status", params.status);
    if (params.search) query.set("search", params.search);

    const queryString = query.toString();
    const path = `/admin/disputes${queryString ? `?${queryString}` : ""}`;
    const raw = await apiClient<any>(path);
    return normaliseListResponse<Dispute>(raw, params.page, params.limit);
  },

  getById: async (id: string): Promise<DisputeDetail> => {
    return apiClient<DisputeDetail>(`/admin/disputes/${id}`);
  },

  resolve: async (id: string, payload: ResolveDisputePayload): Promise<void> => {
    return apiClient<void>(`/admin/disputes/${id}/resolve`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};
