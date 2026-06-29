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

export const settingsApi = {
  getProfile: async (): Promise<AdminProfile> => {
    return apiClient<AdminProfile>("/admin/me");
  },

  updateProfile: async (payload: Partial<AdminProfile>): Promise<AdminProfile> => {
    return apiClient<AdminProfile>("/admin/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  changePassword: async (payload: { oldPassword: string; newPassword: string }): Promise<void> => {
    return apiClient<void>("/admin/me/password", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  listSkills: async (): Promise<SkillItem[]> => {
    try {
      return await apiClient<SkillItem[]>("/admin/skills");
    } catch {
      // Fallback fallback skills
      return [
        { id: "s1", name: "Next.js Development", category: "Web Dev", createdAt: new Date().toISOString() },
        { id: "s2", name: "Figma UI/UX Design", category: "UI/UX", createdAt: new Date().toISOString() },
        { id: "s3", name: "React Native Mobile App", category: "Mobile", createdAt: new Date().toISOString() },
        { id: "s4", name: "SEO Optimization", category: "Digital Mkt", createdAt: new Date().toISOString() },
        { id: "s5", name: "PostgreSQL Database Admin", category: "Lainnya", createdAt: new Date().toISOString() }
      ];
    }
  },

  createSkill: async (payload: { name: string; category: string }): Promise<SkillItem> => {
    return apiClient<SkillItem>("/admin/skills", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  deleteSkill: async (id: string): Promise<void> => {
    return apiClient<void>(`/admin/skills/${id}`, {
      method: "DELETE",
    });
  }
};
