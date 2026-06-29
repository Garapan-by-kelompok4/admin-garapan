import { apiClient } from "./client";

export interface SkillItem {
  id: string;
  name: string;
  category: string;
  createdAt: string;
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

function normaliseProfile(raw: any): AdminProfile {
  return {
    ...raw,
    // Backend may return `name` instead of `fullName`
    fullName: raw.fullName || raw.name || raw.displayName || "",
    email: raw.email || "",
    phone: raw.phone || raw.phoneNumber || raw.telp || "",
    bio: raw.bio || raw.description || raw.about || "",
    role: raw.role || "ADMIN",
  };
}

function normaliseSkills(raw: any): SkillItem[] {
  if (!raw) return [];
  const items = Array.isArray(raw) ? raw : (Array.isArray(raw.data) ? raw.data : (Array.isArray(raw.items) ? raw.items : []));
  return items.map((s: any) => ({
    id: s.id || s._id || String(Math.random()),
    name: s.name || s.skillName || s.title || "",
    category: s.category || s.kategori || s.type || "",
    createdAt: s.createdAt || s.created_at || new Date().toISOString(),
  }));
}

export const settingsApi = {
  getProfile: async (): Promise<AdminProfile> => {
    const raw = await apiClient<any>("/admin/me");
    return normaliseProfile(raw);
  },

  updateProfile: async (payload: Partial<AdminProfile>): Promise<AdminProfile> => {
    const raw = await apiClient<any>("/admin/me", {
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

  listSkills: async (): Promise<SkillItem[]> => {
    const raw = await apiClient<any>("/admin/skills");
    return normaliseSkills(raw);
  },

  createSkill: async (payload: { name: string; category: string }): Promise<SkillItem> => {
    const raw = await apiClient<any>("/admin/skills", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return {
      id: raw?.id || raw?._id || String(Math.random()),
      name: raw?.name || payload.name,
      category: raw?.category || payload.category,
      createdAt: raw?.createdAt || new Date().toISOString(),
    };
  },

  deleteSkill: async (id: string): Promise<void> => {
    return apiClient<void>(`/admin/skills/${id}`, {
      method: "DELETE",
    });
  },
};
