import { apiClient } from "./client";

export interface SkillItem {
  id: string;
  name: string;
  category: string;
  createdAt: string;
}

export interface KategoriItem {
  id: string;
  name: string;
  icon: string;
}

export interface AdminProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  role: string;
}

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? value as UnknownRecord : {};
}

function valueToText(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (!value) return fallback;
  const record = asRecord(value);
  return valueToText(record.name ?? record.title ?? record.label ?? record.message, fallback);
}

function normaliseProfile(raw: unknown): AdminProfile {
  const record = asRecord(raw);
  return {
    ...record,
    // Backend may return `name` instead of `fullName`
    id: String(record.id ?? ""),
    fullName: valueToText(record.fullName ?? record.name ?? record.displayName, ""),
    email: valueToText(record.email, ""),
    phone: valueToText(record.phone ?? record.phoneNumber ?? record.telp, ""),
    bio: valueToText(record.bio ?? record.description ?? record.about, ""),
    avatarUrl: valueToText(record.avatarUrl, ""),
    role: valueToText(record.role, "ADMIN"),
  };
}

function normaliseSkills(raw: unknown): SkillItem[] {
  if (!raw) return [];
  const record = asRecord(raw);
  const data = asRecord(record.data);
  const items = Array.isArray(raw)
    ? raw
    : (Array.isArray(record.data) ? record.data : (Array.isArray(record.items) ? record.items : (Array.isArray(data.items) ? data.items : [])));
  return items.map((item, index: number) => {
    const s = asRecord(item);
    const kategoriObj = asRecord(s.kategori);
    return {
      id: String(s.id || s._id || `skill-${index}`),
      name: valueToText(s.name || s.skillName || s.title, ""),
      category: valueToText(
        Object.keys(kategoriObj).length > 0
          ? kategoriObj.name
          : s.category || s.kategori || s.type,
        ""
      ),
      createdAt: valueToText(s.createdAt || s.created_at, new Date().toISOString()),
    };
  });
}

export const settingsApi = {
  getProfile: async (): Promise<AdminProfile> => {
    const raw = await apiClient<unknown>("/admin/me");
    return normaliseProfile(raw);
  },

  updateProfile: async (payload: Partial<AdminProfile>): Promise<AdminProfile> => {
    const raw = await apiClient<unknown>("/admin/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return normaliseProfile(raw);
  },

  changePassword: async (payload: { oldPassword: string; newPassword: string }): Promise<void> => {
    return apiClient<void>("/admin/me/password", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  listKategori: async (): Promise<KategoriItem[]> => {
    const raw = await apiClient<unknown>("/admin/kategori");
    if (Array.isArray(raw)) return raw as KategoriItem[];
    const record = asRecord(raw);
    const items = record.data;
    if (Array.isArray(items)) return items as KategoriItem[];
    return [];
  },

  listSkills: async (): Promise<SkillItem[]> => {
    const raw = await apiClient<unknown>("/admin/skills");
    return normaliseSkills(raw);
  },

  createSkill: async (payload: { name: string; kategoriId?: string }): Promise<SkillItem> => {
    const raw = await apiClient<unknown>("/admin/skills", {
      method: "POST",
      body: JSON.stringify({
        name: payload.name,
        kategoriId: payload.kategoriId || undefined,
      }),
    });
    // Backend NestJS returns the skill object directly: { id, name, kategoriId, kategori }
    const item = asRecord(raw);
    const kategoriObj = asRecord(item.kategori);
    return {
      id: String(item.id || ""),
      name: valueToText(item.name, payload.name),
      category: valueToText(
        Object.keys(kategoriObj).length > 0
          ? kategoriObj.name
          : item.category || item.kategori,
        ""
      ),
      createdAt: valueToText(item.createdAt, new Date().toISOString()),
    };
  },

  deleteSkill: async (id: string): Promise<void> => {
    return apiClient<void>(`/admin/skills/${id}`, {
      method: "DELETE",
    });
  },
};
