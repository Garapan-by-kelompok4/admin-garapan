"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  settingsApi,
  AdminProfile,
  SkillItem,
  KategoriItem,
} from "@/lib/api/settings";
import { dashboardApi, ActivityItem } from "@/lib/api/dashboard";
import { toast } from "sonner";
import {
  SettingsSidebar,
  SettingsTabId,
} from "@/components/settings/settings-sidebar";
import { SettingsProfileTab } from "@/components/settings/settings-profile-tab";
import { SettingsSecurityTab } from "@/components/settings/settings-security-tab";
import { SettingsNotificationsTab } from "@/components/settings/settings-notifications-tab";
import { SettingsMasterTab } from "@/components/settings/settings-master-tab";
import { SettingsAuditTab } from "@/components/settings/settings-audit-tab";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SettingsTabId>("profile");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategoryId, setNewSkillCategoryId] = useState<
    string | undefined
  >(undefined);

  const { data: profile, isLoading: isLoadingProfile } = useQuery<
    AdminProfile,
    Error
  >({
    queryKey: ["adminProfile"],
    queryFn: () => settingsApi.getProfile(),
  });

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (profile) {
      setFullName(profile.fullName);
      setPhone(profile.phone || "");
      setBio(profile.bio || "");
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [profile]);

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
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
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
      setNewSkillName("");
      setNewSkillCategoryId(undefined);
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

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ fullName, phone, bio });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password baru tidak cocok");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password baru minimal 6 karakter");
      return;
    }
    changePasswordMutation.mutate({ oldPassword, newPassword });
  };

  const handleAddSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) {
      toast.error("Nama kompetensi wajib diisi");
      return;
    }
    addSkillMutation.mutate({
      name: newSkillName.trim(),
      kategoriId: newSkillCategoryId,
    });
  };

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

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start select-none">
      <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 w-full bg-white border border-border rounded-xl p-5 md:p-6 shadow-sh-1 min-h-[480px]">
        {activeTab === "profile" && (
          <SettingsProfileTab
            profile={profile}
            isLoadingProfile={isLoadingProfile}
            fullName={fullName}
            onFullNameChange={setFullName}
            phone={phone}
            onPhoneChange={setPhone}
            bio={bio}
            onBioChange={setBio}
            isPending={updateProfileMutation.isPending}
            onSubmit={handleProfileSubmit}
          />
        )}

        {activeTab === "security" && (
          <SettingsSecurityTab
            oldPassword={oldPassword}
            onOldPasswordChange={setOldPassword}
            newPassword={newPassword}
            onNewPasswordChange={setNewPassword}
            confirmPassword={confirmPassword}
            onConfirmPasswordChange={setConfirmPassword}
            is2FAEnabled={is2FAEnabled}
            on2FAToggle={() => setIs2FAEnabled((prev) => !prev)}
            isPending={changePasswordMutation.isPending}
            onSubmit={handlePasswordSubmit}
          />
        )}

        {activeTab === "notifications" && <SettingsNotificationsTab />}

        {activeTab === "master" && (
          <SettingsMasterTab
            skills={skills}
            kategoriList={kategoriList}
            isLoadingSkills={isLoadingSkills}
            isAddSkillOpen={isAddSkillOpen}
            onAddSkillOpenChange={setIsAddSkillOpen}
            newSkillName={newSkillName}
            onNewSkillNameChange={setNewSkillName}
            newSkillCategoryId={newSkillCategoryId}
            onNewSkillCategoryIdChange={setNewSkillCategoryId}
            isAddPending={addSkillMutation.isPending}
            onAddSkillSubmit={handleAddSkillSubmit}
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
