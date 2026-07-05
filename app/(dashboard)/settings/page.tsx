"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  settingsApi,
  AdminProfile,
  SkillItem,
  KategoriItem,
} from "@/lib/api/settings";
import { dashboardApi, ActivityItem } from "@/lib/api/dashboard";
import { AddSkillForm } from "@/components/settings/add-skill-form";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { ProfileForm } from "@/components/settings/profile-form";
import { toast } from "sonner";
import {
  SettingsSidebar,
  SettingsTabId,
} from "@/components/settings/settings-sidebar";
import { SettingsMasterTab } from "@/components/settings/settings-master-tab";
import { SettingsAuditTab } from "@/components/settings/settings-audit-tab";
import { SettingsSecurityTab } from "@/components/settings/settings-security-tab";
import type { AddSkillInput, ProfileInput } from "@/lib/validators/settings";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<SettingsTabId>("profile");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);

  useEffect(() => {
    if (
      tabParam === "profile" ||
      tabParam === "security" ||
      tabParam === "master" ||
      tabParam === "audit"
    ) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const { data: profile, isLoading: isLoadingProfile } = useQuery<
    AdminProfile,
    Error
  >({
    queryKey: ["adminProfile"],
    queryFn: () => settingsApi.getProfile(),
  });

  const { data: skills = [], isLoading: isLoadingSkills } = useQuery<
    SkillItem[]
  >({
    queryKey: ["masterSkills"],
    queryFn: () => settingsApi.listSkills(),
    enabled: activeTab === "master",
  });

  const { data: kategoriList = [] } = useQuery<KategoriItem[]>({
    queryKey: ["masterKategori"],
    queryFn: () => settingsApi.listKategori(),
    enabled: activeTab === "master",
  });

  const { data: auditLogs = [], isLoading: isLoadingAudit } = useQuery<
    ActivityItem[]
  >({
    queryKey: ["auditLogs"],
    queryFn: () => dashboardApi.getActivityLog(),
    enabled: activeTab === "audit",
  });

  const updateProfileMutation = useMutation({
    mutationFn: (payload: Partial<AdminProfile>) =>
      settingsApi.updateProfile(payload),
    onSuccess: (updated) => {
      toast.success("Profil berhasil diperbarui");
      queryClient.setQueryData(["adminProfile"], updated);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal memperbarui profil");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (payload: { oldPassword: string; newPassword: string }) =>
      settingsApi.changePassword(payload),
    onSuccess: () => {
      toast.success("Password berhasil diubah");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal mengubah password");
    },
  });

  const addSkillMutation = useMutation({
    mutationFn: (payload: { name: string; kategoriId?: string }) =>
      settingsApi.createSkill(payload),
    onSuccess: () => {
      toast.success("Kompetensi master berhasil ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["masterSkills"] });
      setIsAddSkillOpen(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menambahkan kompetensi");
    },
  });

  const deleteSkillMutation = useMutation({
    mutationFn: (id: string) => settingsApi.deleteSkill(id),
    onSuccess: () => {
      toast.success("Kompetensi master berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["masterSkills"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menghapus kompetensi");
    },
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const handleAddSkill = (values: AddSkillInput) => {
    addSkillMutation.mutate({
      name: values.name.trim(),
      kategoriId: values.kategoriId || undefined,
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start select-none">
      <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 w-full bg-white border border-border rounded-xl p-5 md:p-6 shadow-sh-1 min-h-[480px]">
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="border-b border-border pb-3">
              <h3 className="font-heading font-bold text-sm text-ink-900">
                Profil Admin
              </h3>
              <p className="text-[11px] text-ink-400 font-medium mt-0.5">
                Kelola informasi akun admin yang digunakan untuk mengakses panel.
              </p>
            </div>
            <ProfileForm
              profile={profile}
              isLoading={isLoadingProfile}
              isPending={updateProfileMutation.isPending}
              onSubmit={(values: ProfileInput) =>
                updateProfileMutation.mutate(values)
              }
            />
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-6">
            <SettingsSecurityTab
              is2FAEnabled={is2FAEnabled}
              on2FAToggle={() => setIs2FAEnabled((prev) => !prev)}
            />
            <ChangePasswordForm
              isPending={changePasswordMutation.isPending}
              onSubmit={(values) => changePasswordMutation.mutate(values)}
            />
          </div>
        )}

        {activeTab === "master" && (
          <SettingsMasterTab
            skills={skills}
            kategoriList={kategoriList}
            isLoadingSkills={isLoadingSkills}
            isAddSkillOpen={isAddSkillOpen}
            onAddSkillOpenChange={setIsAddSkillOpen}
            isAddPending={addSkillMutation.isPending}
            onAddSkill={handleAddSkill}
            onDeleteSkill={(id, name) => {
              if (
                confirm(
                  `Apakah Anda yakin ingin menghapus kompetensi ${name}?`,
                )
              ) {
                deleteSkillMutation.mutate(id);
              }
            }}
            formatDate={formatDate}
          />
        )}

        {activeTab === "audit" && (
          <SettingsAuditTab
            auditLogs={auditLogs}
            isLoadingAudit={isLoadingAudit}
            formatDate={formatDate}
          />
        )}
      </div>
    </div>
  );
}
