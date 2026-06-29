import { apiClient } from "./client";

export type EscrowStatus = "Ditahan" | "Dicairkan" | "Refund";

export interface OrderTransaction {
  id: string; // e.g., "TRX-001" or "PESANAN-12"
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

export const ordersApi = {
  list: async (params: ListOrdersParams = {}): Promise<ListOrdersResponse> => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.status) query.set("status", params.status);
    if (params.search) query.set("search", params.search);

    const queryString = query.toString();
    const path = `/admin/orders${queryString ? `?${queryString}` : ""}`;
    return apiClient<ListOrdersResponse>(path);
  },

  getById: async (id: string): Promise<OrderDetail> => {
    return apiClient<OrderDetail>(`/admin/orders/${id}`);
  }
};
