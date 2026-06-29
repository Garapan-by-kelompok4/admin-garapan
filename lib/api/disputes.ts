import { apiClient } from "./client";

export type DisputePriority = "Tinggi" | "Sedang" | "Rendah";
export type DisputeStatus = "Terbuka" | "Diproses" | "Selesai" | "Ditolak";
export type DisputeOutcome = "RELEASE" | "REFUND" | "PARTIAL_REFUND" | "REJECT";

export interface Dispute {
  id: string; // e.g., "LP-001"
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

export const disputesApi = {
  list: async (params: ListDisputesParams = {}): Promise<ListDisputesResponse> => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.status) query.set("status", params.status);
    if (params.search) query.set("search", params.search);

    const queryString = query.toString();
    const path = `/admin/disputes${queryString ? `?${queryString}` : ""}`;
    return apiClient<ListDisputesResponse>(path);
  },

  getById: async (id: string): Promise<DisputeDetail> => {
    return apiClient<DisputeDetail>(`/admin/disputes/${id}`);
  },

  resolve: async (id: string, payload: ResolveDisputePayload): Promise<void> => {
    return apiClient<void>(`/admin/disputes/${id}/resolve`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }
};
