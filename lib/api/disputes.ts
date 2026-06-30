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

function normaliseDispute(raw: any): Dispute {
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

  // Bidirectional Mapping: Incoming English Prisma enums to Indonesian UI strings
  let status: DisputeStatus = "Terbuka";
  if (raw.status === "RESOLVED") {
    status = "Selesai";
  } else if (raw.status === "REJECTED") {
    status = "Ditolak";
  } else if (raw.status === "PENDING") {
    status = "Terbuka";
  } else if (raw.status) {
    status = raw.status as DisputeStatus;
  }

  return {
    ...raw,
    status,
    priority: raw.priority || "Sedang",
    reporterName: raw.reporterName || raw.reporter?.name || raw.reporter?.displayName || "-",
    reporterEmail: raw.reporterEmail || raw.reporter?.email || "-",
    reportedName: raw.reportedName || raw.reported?.name || raw.reported?.displayName || "-",
    reportedEmail: raw.reportedEmail || raw.reported?.email || "-",
    orderAmount: raw.orderAmount ?? raw.order?.amount ?? raw.order?.totalAmount ?? 0,
    createdAt: raw.createdAt || raw.createdDate || new Date().toISOString(),
  } as Dispute;
}

function normaliseListResponse(raw: any, page = 1, limit = 10): ListDisputesResponse {
  if (!raw) return { data: [], total: 0, page, limit };
  
  let items: any[] = [];
  if (Array.isArray(raw.data)) {
    items = raw.data;
  } else if (Array.isArray(raw.items)) {
    items = raw.items;
  } else if (Array.isArray(raw)) {
    items = raw;
  }

  return {
    data: items.map(normaliseDispute),
    total: raw.total ?? raw.count ?? items.length,
    page: raw.page ?? page,
    limit: raw.limit ?? limit,
  };
}

export const disputesApi = {
  list: async (params: ListDisputesParams = {}): Promise<ListDisputesResponse> => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    
    // Outgoing Request Mapping: Translate UI dropdown values to English Prisma enums
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
    
    if (params.search) query.set("search", params.search);

    const queryString = query.toString();
    const path = `/admin/disputes${queryString ? `?${queryString}` : ""}`;
    const raw = await apiClient<any>(path);
    return normaliseListResponse(raw, params.page, params.limit);
  },

  getById: async (id: string): Promise<DisputeDetail> => {
    const raw = await apiClient<any>(`/admin/disputes/${id}`);
    return {
      ...raw,
      ...normaliseDispute(raw),
    } as DisputeDetail;
  },

  resolve: async (id: string, payload: ResolveDisputePayload): Promise<void> => {
    return apiClient<void>(`/admin/disputes/${id}/resolve`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};
