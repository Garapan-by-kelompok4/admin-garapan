import { apiClient } from "./client";
import { asRecord, enumValue, recordList } from "./normalizers";

export type UserRole = "ADMIN" | "MAHASISWA" | "KLIEN";

const USER_ROLES = ["ADMIN", "MAHASISWA", "KLIEN"] as const satisfies readonly UserRole[];

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

export type UserStatusFilter = "Semua" | "Aktif" | "Suspended" | "Pending";

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: "MAHASISWA" | "KLIEN";
  banned?: boolean;
  emailVerified?: boolean;
}

export interface ListUsersWithStatusParams extends ListUsersParams {
  statusFilter?: UserStatusFilter;
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
    role: enumValue(r.role, USER_ROLES, "MAHASISWA"),
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

  const recentPesanan = recordList(r.recentPesanan);
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
  const recentLaporan = recordList(laporan.recent);
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
    if (params.banned !== undefined) {
      query.set("banned", String(params.banned));
    }
    if (params.emailVerified !== undefined) {
      query.set("emailVerified", String(params.emailVerified));
    }

    const queryString = query.toString();
    const path = `/admin/users${queryString ? `?${queryString}` : ""}`;
    const raw = await apiClient<unknown>(path);
    const record = asRecord(raw);
    const data = recordList(
      record.data ?? record.items ?? (Array.isArray(raw) ? raw : []),
    );
    const total = Number(record.total ?? record.count ?? data.length);
    return {
      data: data.map(normaliseUser),
      total,
      page: Number(record.page ?? params.page ?? 1),
      limit: Number(record.limit ?? params.limit ?? 20),
    };
  },

  listWithStatusFilter: async (
    params: ListUsersWithStatusParams = {},
  ): Promise<ListUsersResponse> => {
    const {
      statusFilter = "Semua",
      page = 1,
      limit = 10,
      ...rest
    } = params;

    if (statusFilter === "Suspended") {
      return usersApi.list({ ...rest, page, limit, banned: true });
    }

    if (statusFilter === "Semua") {
      return usersApi.list({ ...rest, page, limit });
    }

    if (statusFilter === "Aktif") {
      return usersApi.list({
        ...rest,
        page,
        limit,
        banned: false,
        emailVerified: true,
      });
    }

    return usersApi.list({
      ...rest,
      page,
      limit,
      banned: false,
      emailVerified: false,
    });
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
