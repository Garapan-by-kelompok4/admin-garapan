import { apiClient } from "./client";
import { asRecord } from "./normalizers";

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

function mapEscrowStatus(status: string): EscrowStatus {
  if (status === "COMPLETED") return "Dicairkan";
  if (status === "DISPUTED" || status === "CANCELLED") return "Refund";
  return "Ditahan";
}

function normaliseOrder(raw: unknown): OrderTransaction {
  const r = asRecord(raw);
  const klien = asRecord(r.klien);
  const klienUser = asRecord(klien.user);
  const mahasiswa = asRecord(r.mahasiswa);
  const mahasiswaUser = asRecord(mahasiswa.user);
  const jasa = asRecord(r.jasa);
  const project = asRecord(r.project);

  return {
    id: String(r.id ?? ""),
    clientName: String(
      klien.companyName ??
        klienUser.fullName ??
        klienUser.displayName ??
        r.clientName ??
        r.buyerName ??
        r.klienName ??
        "-",
    ),
    clientId: String(klien.id ?? r.clientId ?? r.buyerId ?? r.klienId ?? "-"),
    studentName: String(
      mahasiswaUser.fullName ??
        mahasiswaUser.displayName ??
        mahasiswaUser.email ??
        r.studentName ??
        r.sellerName ??
        r.mahasiswaName ??
        r.freelancerName ??
        "-",
    ),
    studentId: String(
      mahasiswa.id ??
        r.studentId ??
        r.sellerId ??
        r.mahasiswaId ??
        r.freelancerId ??
        "-",
    ),
    serviceTitle: String(
      jasa.title ??
        project.title ??
        r.serviceTitle ??
        r.title ??
        r.jasaTitle ??
        "-",
    ),
    amount: Number(
      r.totalPrice ??
        r.amount ??
        r.totalAmount ??
        r.price ??
        r.total ??
        r.value ??
        0,
    ),
    escrowStatus: (r.escrowStatus ||
      mapEscrowStatus(String(r.status ?? ""))) as EscrowStatus,
    createdAt: String(
      r.createdAt ?? r.date ?? r.createdDate ?? new Date().toISOString(),
    ),
  };
}

function normaliseListResponse(
  raw: unknown,
  page = 1,
  limit = 10,
): ListOrdersResponse {
  if (!raw) return { data: [], total: 0, page, limit };

  const r = asRecord(raw);
  let items: unknown[] = [];
  if (Array.isArray(r.data)) items = r.data;
  else if (Array.isArray(r.items)) items = r.items;
  else if (Array.isArray(raw)) items = raw;

  return {
    data: items.map(normaliseOrder),
    total: Number(r.total ?? r.count ?? items.length),
    page: Number(r.page ?? page),
    limit: Number(r.limit ?? limit),
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
    const raw = await apiClient<unknown>(path);
    return normaliseListResponse(raw, params.page, params.limit);
  },

  getById: async (id: string): Promise<OrderDetail> => {
    const raw = await apiClient<unknown>(`/admin/orders/${id}`);
    return normaliseOrder(raw) as OrderDetail;
  },
};
