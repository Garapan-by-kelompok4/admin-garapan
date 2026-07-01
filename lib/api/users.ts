import { apiClient } from "./client";

export type UserRole = "ADMIN" | "MAHASISWA" | "KLIEN";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  university?: string; // Only for MAHASISWA
  company?: string;    // Only for KLIEN
  rating?: number;
  jobs?: number;       // Number of jobs/orders
  bannedAt: string | null;
  emailVerified: boolean;
  createdAt: string;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: "MAHASISWA" | "KLIEN" | "CLIENT";
}

export interface ListUsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

export interface UserDetail extends User {
  phone?: string;
  bio?: string;
  orderHistory?: Array<{
    id: string;
    title: string;
    amount: number;
    status: string;
    date: string;
  }>;
  reportHistory?: Array<{
    id: string;
    type: string;
    date: string;
    status: string;
  }>;
}

export const usersApi = {
  list: async (params: ListUsersParams = {}): Promise<ListUsersResponse> => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.search) query.set("search", params.search);
    if (params.role) query.set("role", params.role);

    const queryString = query.toString();
    const path = `/admin/users${queryString ? `?${queryString}` : ""}`;
    return apiClient<ListUsersResponse>(path);
  },

  getById: async (id: string): Promise<UserDetail> => {
    return apiClient<UserDetail>(`/admin/users/${id}`);
  },

  ban: async (id: string): Promise<void> => {
    return apiClient<void>(`/admin/users/${id}/ban`, {
      method: "PATCH",
      body: JSON.stringify({ banned: true }),
    });
  },

  unban: async (id: string): Promise<void> => {
    return apiClient<void>(`/admin/users/${id}/ban`, {
      method: "PATCH",
      body: JSON.stringify({ banned: false }),
    });
  }
};
