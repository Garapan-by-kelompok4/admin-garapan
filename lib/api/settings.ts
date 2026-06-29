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
    return apiClient<SkillItem[]>("/admin/skills");
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
