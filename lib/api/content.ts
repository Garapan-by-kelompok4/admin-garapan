import { apiClient } from "./client";

export interface FlaggedContent {
  id: string; // e.g., "JS-001"
  title: string;
  description: string;
  category: string;
  reportCount: number;
  status: "Ditinjau" | "Aman" | "Dihapus" | "Disembunyikan";
  createdAt: string;
  owner: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  reports?: Array<{
    id: string;
    reporterName: string;
    reporterEmail: string;
    reason: string;
    category: string;
    createdAt: string;
  }>;
}

export interface ListContentParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface ListContentResponse {
  data: FlaggedContent[];
  total: number;
  page: number;
  limit: number;
}

export const contentApi = {
  list: async (params: ListContentParams = {}): Promise<ListContentResponse> => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.status) query.set("status", params.status);
    if (params.search) query.set("search", params.search);

    const queryString = query.toString();
    const path = `/admin/content${queryString ? `?${queryString}` : ""}`;
    return apiClient<ListContentResponse>(path);
  },

  remove: async (id: string): Promise<void> => {
    return apiClient<void>(`/admin/content/${id}/remove`, {
      method: "PATCH",
    });
  },

  markSafe: async (id: string): Promise<void> => {
    return apiClient<void>(`/admin/content/${id}/safe`, {
      method: "PATCH",
    });
  }
};
