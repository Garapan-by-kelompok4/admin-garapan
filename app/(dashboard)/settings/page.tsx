"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  settingsApi,
  AdminProfile,
  SkillItem,
  KategoriItem,
} from "@/lib/api/settings";
import { dashboardApi, ActivityItem } from "@/lib/api/dashboard";
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { AddSkillInput, ProfileInput } from "@/lib/validators/settings";

function parseSettingsTab(value: string | null): SettingsTabId | null {
  if (
    value === "profile" ||
    value === "security" ||
    value === "master" ||
    value === "audit"
  ) {
    return value;
  }
  return null;
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab: SettingsTabId =
    parseSettingsTab(searchParams.get("tab")) ?? "profile";
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [deleteSkillTarget, setDeleteSkillTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleTabChange = (tab: SettingsTabId) => {
    router.replace(`/settings?tab=${tab}`, { scroll: false });
  };

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

  const handleAddSkill = (values: AddSkillInput) => {
    addSkillMutation.mutate({
      name: values.name.trim(),
      kategoriId: values.kategoriId || undefined,
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start select-none">
      <SettingsSidebar activeTab={activeTab} onTabChange={handleTabChange} />

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
            onDeleteSkill={(id, name) => setDeleteSkillTarget({ id, name })}
          />
        )}

        {activeTab === "audit" && (
          <SettingsAuditTab
            auditLogs={auditLogs}
            isLoadingAudit={isLoadingAudit}
          />
        )}
      </div>

      <ConfirmDialog
        open={deleteSkillTarget !== null}
        onOpenChange={(open) => !open && setDeleteSkillTarget(null)}
        title={`Hapus kompetensi ${deleteSkillTarget?.name ?? ""}?`}
        description="Kompetensi yang dihapus tidak lagi tersedia saat mahasiswa membuat jasa baru."
        confirmLabel="Hapus Kompetensi"
        isLoading={deleteSkillMutation.isPending}
        onConfirm={() => {
          if (deleteSkillTarget) {
            deleteSkillMutation.mutate(deleteSkillTarget.id);
            setDeleteSkillTarget(null);
          }
        }}
      />
    </div>
  );
}
