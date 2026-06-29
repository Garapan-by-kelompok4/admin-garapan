import { apiClient } from "./client";

export type EscrowStatus = "Ditahan" | "Dicairkan" | "Refund";

export interface OrderTransaction {
  id: string;
  clientName: string;
  clientId: string;
  studentName: string;
  studentId: string;
  serviceTitle: string;
  amount: number;
  escrowStatus: EscrowStatus;
  createdAt: string;
}

export interface OrderDetail extends OrderTransaction {
  packageName?: string;
  packageDescription?: string;
  timeline?: Array<{
    step: string;
    description: string;
    completedAt: string | null;
    isCompleted: boolean;
  }>;
  paymentReceipts?: string[];
}

export interface ListOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface ListOrdersResponse {
  data: OrderTransaction[];
  total: number;
  page: number;
  limit: number;
}

/** Normalise an order/transaction item — maps possible backend field names */
function normaliseOrder(raw: any): OrderTransaction {
  return {
    ...raw,
    // Map alternative field names for client/student names
    clientName: raw.clientName || raw.client?.name || raw.buyerName || raw.klienName || "-",
    clientId: raw.clientId || raw.client?.id || raw.buyerId || raw.klienId || "-",
    studentName: raw.studentName || raw.student?.name || raw.sellerName || raw.mahasiswaName || raw.freelancerName || "-",
    studentId: raw.studentId || raw.student?.id || raw.sellerId || raw.mahasiswaId || raw.freelancerId || "-",
    serviceTitle: raw.serviceTitle || raw.service?.title || raw.title || raw.jasaTitle || "-",
    // Map alternative field names for amount
    amount: raw.amount ?? raw.totalAmount ?? raw.price ?? raw.total ?? raw.value ?? 0,
    // Map alternative field names for escrow status
    escrowStatus: raw.escrowStatus || raw.status || "Ditahan",
    createdAt: raw.createdAt || raw.date || raw.createdDate || new Date().toISOString(),
  } as OrderTransaction;
}

function normaliseListResponse(raw: any, page = 1, limit = 10): ListOrdersResponse {
  if (!raw) return { data: [], total: 0, page, limit };

  let items: any[] = [];
  if (Array.isArray(raw.data)) items = raw.data;
  else if (Array.isArray(raw.items)) items = raw.items;
  else if (Array.isArray(raw)) items = raw;

  return {
    data: items.map(normaliseOrder),
    total: raw.total ?? raw.count ?? items.length,
    page: raw.page ?? page,
    limit: raw.limit ?? limit,
  };
}

export const ordersApi = {
  list: async (params: ListOrdersParams = {}): Promise<ListOrdersResponse> => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.status) query.set("status", params.status);
    if (params.search) query.set("search", params.search);

    const queryString = query.toString();
    const path = `/admin/orders${queryString ? `?${queryString}` : ""}`;
    const raw = await apiClient<any>(path);
    return normaliseListResponse(raw, params.page, params.limit);
  },

  getById: async (id: string): Promise<OrderDetail> => {
    const raw = await apiClient<any>(`/admin/orders/${id}`);
    return normaliseOrder(raw) as OrderDetail;
  },
};
