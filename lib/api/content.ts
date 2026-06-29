import { apiClient } from "./client";

export interface FlaggedContent {
  id: string;
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

/** Normalise any list response shape into {data, total, page, limit} */
function normaliseListResponse<T>(raw: any, page = 1, limit = 10): { data: T[]; total: number; page: number; limit: number } {
  if (!raw) return { data: [], total: 0, page, limit };

  // Already correct shape
  if (Array.isArray(raw.data)) {
    return {
      data: raw.data as T[],
      total: raw.total ?? raw.count ?? raw.data.length,
      page: raw.page ?? page,
      limit: raw.limit ?? limit,
    };
  }

  // Backend uses `items` key
  if (Array.isArray(raw.items)) {
    return {
      data: raw.items as T[],
      total: raw.total ?? raw.count ?? raw.items.length,
      page: raw.page ?? page,
      limit: raw.limit ?? limit,
    };
  }

  // Backend returns plain array
  if (Array.isArray(raw)) {
    return { data: raw as T[], total: raw.length, page, limit };
  }

  return { data: [], total: 0, page, limit };
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
    const raw = await apiClient<any>(path);
    return normaliseListResponse<FlaggedContent>(raw, params.page, params.limit);
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
  },
};
