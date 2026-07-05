import { apiClient } from "./client";
import { asRecord, type UnknownRecord } from "./normalizers";

export type UserRole = "ADMIN" | "MAHASISWA" | "KLIEN";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  university?: string;
  company?: string;
  rating?: number;
  jobs?: number;
  bannedAt: string | null;
  emailVerified: boolean;
  createdAt: string;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: "MAHASISWA" | "KLIEN";
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

function normaliseUser(raw: unknown): User {
  const r = asRecord(raw);
  const mahasiswa = asRecord(r.mahasiswa);
  const klien = asRecord(r.klien);
  return {
    id: String(r.id ?? ""),
    fullName: String(
      mahasiswa.fullName ?? klien.companyName ?? r.fullName ?? r.name ?? "",
    ),
    email: String(r.email ?? ""),
    role: String(r.role ?? "MAHASISWA") as UserRole,
    university: mahasiswa.university ? String(mahasiswa.university) : undefined,
    company: klien.companyName ? String(klien.companyName) : undefined,
    rating:
      typeof mahasiswa.rating === "number"
        ? Number(mahasiswa.rating)
        : undefined,
    bannedAt: r.bannedAt ? String(r.bannedAt) : null,
    emailVerified: Boolean(r.emailVerified),
    createdAt: String(r.createdAt ?? ""),
  };
}

function normaliseUserDetail(raw: unknown): UserDetail {
  const r = asRecord(raw);
  const mahasiswa = asRecord(r.mahasiswa);
  const klien = asRecord(r.klien);
  const base = normaliseUser(raw);

  const recentPesanan = (r.recentPesanan ?? []) as UnknownRecord[];
  const orderHistory = recentPesanan.map((p) => {
    const jasa = asRecord(p.jasa);
    const project = asRecord(p.project);
    return {
      id: String(p.id ?? ""),
      title: String(jasa.title ?? project.title ?? ""),
      amount: Number(p.totalPrice ?? 0),
      status: String(p.status ?? ""),
      date: String(p.createdAt ?? ""),
    };
  });

  const laporan = asRecord(r.laporan);
  const recentLaporan = (laporan.recent ?? []) as UnknownRecord[];
  const reportHistory = recentLaporan.map((l) => ({
    id: String(l.id ?? ""),
    type: String(l.reason ?? ""),
    date: String(l.createdAt ?? ""),
    status: String(l.status ?? ""),
  }));

  return {
    ...base,
    phone: r.phoneNumber ? String(r.phoneNumber) : undefined,
    bio: String(mahasiswa.bio ?? klien.bio ?? ""),
    orderHistory,
    reportHistory,
  };
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
    const raw = await apiClient<unknown>(path);
    const record = asRecord(raw);
    const data = (record.data ??
      record.items ??
      (Array.isArray(raw) ? raw : [])) as UnknownRecord[];
    const total = Number(record.total ?? record.count ?? data.length);
    return {
      data: data.map(normaliseUser),
      total,
      page: Number(record.page ?? params.page ?? 1),
      limit: Number(record.limit ?? params.limit ?? 20),
    };
  },

  getById: async (id: string): Promise<UserDetail> => {
    const raw = await apiClient<unknown>(`/admin/users/${id}`);
    return normaliseUserDetail(raw);
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
  },
};
