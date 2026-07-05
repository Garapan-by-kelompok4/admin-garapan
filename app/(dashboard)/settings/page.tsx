"use client";

import { useState } from "react";
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
import {
  User,
  Lock,
  Bell,
  Database,
  Activity,
  ShieldCheck,
  Plus,
  Trash2,
  Download,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { AddSkillInput, ProfileInput } from "@/lib/validators/settings";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "notifications" | "master" | "audit"
  >("profile");

  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);

  // 1. Fetch current profile
  const { data: profile, isLoading: isLoadingProfile } = useQuery<
    AdminProfile,
    Error
  >({
    queryKey: ["adminProfile"],
    queryFn: () => settingsApi.getProfile(),
  });

  // 2. Fetch master data skills
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

  // 3. Fetch audit logs
  const { data: auditLogs = [], isLoading: isLoadingAudit } = useQuery<
    ActivityItem[]
  >({
    queryKey: ["auditLogs"],
    queryFn: () => dashboardApi.getActivityLog(),
    enabled: activeTab === "audit",
  });

  // Profile Mutation
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

  // Password Mutation
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

  // Add Skill Mutation
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

  // Delete Skill Mutation
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

  const handleProfileSubmit = (values: ProfileInput) => {
    updateProfileMutation.mutate(values);
  };

  const handleAddSkillSubmit = (values: AddSkillInput) => {
    addSkillMutation.mutate({
      name: values.name,
      kategoriId: values.kategoriId,
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

  const sidebarItems = [
    { id: "profile", label: "Informasi Profil", icon: User },
    { id: "security", label: "Keamanan & Akses", icon: Lock },
    { id: "notifications", label: "Notifikasi Sistem", icon: Bell },
    { id: "master", label: "Master Data Kompetensi", icon: Database },
    { id: "audit", label: "Log Aktivitas", icon: Activity },
  ] as const;

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start select-none">
      {/* 1. Left Panel: Settings Sidebar Menu (240px) */}
      <div className="w-full md:w-[240px] bg-white border border-border rounded-xl p-2.5 flex-shrink-0 shadow-sh-1">
        <nav className="flex flex-col gap-0.5">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-brand-50 text-brand-600 font-extrabold"
                    : "text-ink-700 hover:bg-surface-3 hover:text-ink-900"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${isActive ? "text-brand-500" : "text-ink-400"}`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 2. Right Panel: Active Sub-tab Workspace Content */}
      <div className="flex-1 w-full bg-white border border-border rounded-xl p-5 md:p-6 shadow-sh-1 min-h-[480px]">
        {/* --- SUB-TAB: INFORMASI PROFIL --- */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="border-b border-border pb-3">
              <h3 className="font-heading font-bold text-sm text-ink-900">
                Informasi Profil
              </h3>
              <p className="text-[11px] text-ink-400 font-medium mt-0.5">
                Kelola data diri administrasi Anda di platform GARAPAN.
              </p>
            </div>

            <ProfileForm
              profile={profile}
              isLoading={isLoadingProfile}
              isPending={updateProfileMutation.isPending}
              onSubmit={handleProfileSubmit}
            />
          </div>
        )}

        {/* --- SUB-TAB: KEAMANAN & PASSWORD --- */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <div className="border-b border-border pb-3">
              <h3 className="font-heading font-bold text-sm text-ink-900">
                Keamanan & Akses
              </h3>
              <p className="text-[11px] text-ink-400 font-medium mt-0.5">
                Konfigurasi kata sandi akun dan otentikasi keamanan ganda.
              </p>
            </div>

            <ChangePasswordForm
              isPending={changePasswordMutation.isPending}
              onSubmit={(values) => changePasswordMutation.mutate(values)}
            />

            {/* 2FA Card */}
            <div className="border border-border rounded-lg p-4 bg-surface-2 flex items-center justify-between mt-6 select-none">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-white flex items-center justify-center text-brand-500 border border-border/80 shadow-sm flex-shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-ink-900 leading-tight">
                    Otentikasi Dua Faktor (2FA)
                  </h4>
                  <p className="text-[10px] text-ink-400 font-semibold mt-0.5">
                    Tingkatkan keamanan panel dengan verifikasi OTP tambahan.
                  </p>
                </div>
              </div>
              <div>
                <button
                  onClick={() => {
                    setIs2FAEnabled((prev) => !prev);
                    toast.success(
                      !is2FAEnabled
                        ? "2FA berhasil diaktifkan"
                        : "2FA dinonaktifkan",
                    );
                  }}
                  className={`px-3 py-1.5 text-[10.5px] font-bold rounded border transition-all cursor-pointer ${
                    is2FAEnabled
                      ? "bg-brand-50 border-brand-200 text-brand-600"
                      : "bg-white border-border text-ink-700 hover:bg-surface-3"
                  }`}
                >
                  {is2FAEnabled ? "Aktif" : "Nonaktif"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- SUB-TAB: PREFERENSI NOTIFIKASI --- */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <div className="border-b border-border pb-3">
              <h3 className="font-heading font-bold text-sm text-ink-900">
                Notifikasi Sistem
              </h3>
              <p className="text-[11px] text-ink-400 font-medium mt-0.5">
                Pilih notifikasi otomatis yang ingin Anda terima sebagai
                administrator.
              </p>
            </div>

            <div className="border border-border rounded-lg bg-white overflow-hidden shadow-sh-1 select-none">
              <table className="w-full border-collapse text-left text-xs font-medium">
                <thead>
                  <tr className="bg-surface-2 border-b border-border">
                    <th className="py-2.5 px-4 text-ink-400 font-bold uppercase tracking-wider">
                      Peristiwa / Event
                    </th>
                    <th className="py-2.5 px-4 text-ink-400 font-bold uppercase tracking-wider text-center">
                      Email
                    </th>
                    <th className="py-2.5 px-4 text-ink-400 font-bold uppercase tracking-wider text-center">
                      Push
                    </th>
                    <th className="py-2.5 px-4 text-ink-400 font-bold uppercase tracking-wider text-center">
                      SMS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {/* Category 1 */}
                  <tr className="bg-surface-2/60">
                    <td
                      colSpan={4}
                      className="py-2 px-4 font-bold text-ink-800"
                    >
                      Laporan & Dispute
                    </td>
                  </tr>
                  {[
                    "Laporan baru dari pengguna",
                    "Dispute naik banding",
                    "Penyelesaian sengketa escrow",
                  ].map((evt, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-surface-2/40 transition-colors"
                    >
                      <td className="py-2.5 px-4 text-ink-700">{evt}</td>
                      <td className="text-center py-2.5 px-4">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 accent-brand-500 cursor-pointer"
                        />
                      </td>
                      <td className="text-center py-2.5 px-4">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 accent-brand-500 cursor-pointer"
                        />
                      </td>
                      <td className="text-center py-2.5 px-4">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-brand-500 cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))}

                  {/* Category 2 */}
                  <tr className="bg-surface-2/60">
                    <td
                      colSpan={4}
                      className="py-2 px-4 font-bold text-ink-800"
                    >
                      Transaksi Keuangan
                    </td>
                  </tr>
                  {[
                    "Pembayaran escrow masuk",
                    "Pencairan dana order selesai",
                    "Refund dana ke klien disetujui",
                  ].map((evt, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-surface-2/40 transition-colors"
                    >
                      <td className="py-2.5 px-4 text-ink-700">{evt}</td>
                      <td className="text-center py-2.5 px-4">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 accent-brand-500 cursor-pointer"
                        />
                      </td>
                      <td className="text-center py-2.5 px-4">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-brand-500 cursor-pointer"
                        />
                      </td>
                      <td className="text-center py-2.5 px-4">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 accent-brand-500 cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() =>
                  toast.success("Preferensi notifikasi berhasil disimpan")
                }
                className="h-10 px-5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-bold text-xs shadow-sm transition-colors cursor-pointer"
              >
                Simpan Preferensi
              </button>
            </div>
          </div>
        )}

        {/* --- SUB-TAB: MASTER DATA SKILLS CRUD --- */}
        {activeTab === "master" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-3 gap-4">
              <div>
                <h3 className="font-heading font-bold text-sm text-ink-900">
                  Master Data Kompetensi
                </h3>
                <p className="text-[11px] text-ink-400 font-medium mt-0.5">
                  Daftar skill keahlian mahasiswa yang dapat ditawarkan sebagai
                  jasa.
                </p>
              </div>
              <button
                onClick={() => setIsAddSkillOpen(true)}
                className="h-9 px-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Tambah Kompetensi
              </button>
            </div>

            {/* List skills */}
            {isLoadingSkills ? (
              <div className="p-8 text-center text-xs text-ink-500 font-medium">
                Memuat kompetensi...
              </div>
            ) : (
              <div className="border border-border rounded-lg bg-white overflow-hidden shadow-sh-1 select-none">
                <table className="w-full border-collapse text-left text-xs font-medium">
                  <thead>
                    <tr className="bg-surface-2 border-b border-border">
                      <th className="py-2.5 px-4 text-ink-400 font-bold uppercase tracking-wider">
                        Nama Kompetensi
                      </th>
                      <th className="py-2.5 px-4 text-ink-400 font-bold uppercase tracking-wider">
                        Kategori Jasa
                      </th>
                      <th className="py-2.5 px-4 text-ink-400 font-bold uppercase tracking-wider">
                        Tgl. Dibuat
                      </th>
                      <th className="py-2.5 px-4 text-ink-400 font-bold uppercase tracking-wider text-right">
                        <span className="sr-only">Aksi</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {skills.map((skill) => (
                      <tr
                        key={skill.id}
                        className="hover:bg-[#F7F8FB] transition-colors"
                      >
                        <td className="py-3 px-4 font-semibold text-ink-900">
                          {skill.name}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex px-2 py-0.5 rounded border border-border bg-surface-2 text-[10.5px] font-bold text-ink-500">
                            {skill.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-ink-400">
                          {formatDate(skill.createdAt).split(" ")[0]}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  `Apakah Anda yakin ingin menghapus kompetensi ${skill.name}?`,
                                )
                              ) {
                                deleteSkillMutation.mutate(skill.id);
                              }
                            }}
                            className="h-7 w-7 rounded border border-danger-200 bg-danger-50/50 hover:bg-danger-55 hover:text-danger-700 text-danger-600 flex items-center justify-center transition-colors cursor-pointer shadow-sm ml-auto"
                            title="Hapus Kompetensi"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Modal Tambah Kompetensi */}
            <Dialog
              open={isAddSkillOpen}
              onOpenChange={setIsAddSkillOpen}
            >
              <DialogContent className="max-w-[400px] rounded-xl p-5 border-border bg-white shadow-sh-3">
                <DialogHeader className="border-b border-border pb-3">
                  <DialogTitle className="font-heading font-bold text-base text-ink-900">
                    Tambah Kompetensi Master
                  </DialogTitle>
                </DialogHeader>
                <AddSkillForm
                  kategoriList={kategoriList}
                  isPending={addSkillMutation.isPending}
                  onSubmit={handleAddSkillSubmit}
                  onCancel={() => setIsAddSkillOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* --- SUB-TAB: LOG AKTIVITAS (AUDIT LOG) --- */}
        {activeTab === "audit" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-3 gap-4">
              <div>
                <h3 className="font-heading font-bold text-sm text-ink-900">
                  Log Aktivitas Admin
                </h3>
                <p className="text-[11px] text-ink-400 font-medium mt-0.5">
                  Audit log terperinci dari seluruh operasi perubahan data dalam
                  platform.
                </p>
              </div>
              <button
                onClick={() => {
                  toast.success("Log aktivitas berhasil diekspor (CSV)");
                }}
                className="h-9 px-3.5 border border-border bg-white text-[11px] font-bold text-ink-700 rounded-lg hover:bg-surface-3 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Download className="h-4 w-4 text-ink-450" /> Ekspor Log
              </button>
            </div>

            {isLoadingAudit ? (
              <div className="p-8 text-center text-xs text-ink-500 font-medium">
                Memuat log audit...
              </div>
            ) : (
              <div className="relative border-l border-border ml-2.5 pl-6 space-y-5 py-2 select-none">
                {auditLogs.map((log) => {
                  let indicatorColor = "bg-brand-500";
                  if (log.action === "user") indicatorColor = "bg-success-500";
                  if (log.action === "report") indicatorColor = "bg-danger-500";
                  return (
                    <div key={log.id} className="relative">
                      <span
                        className={`absolute -left-[32px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white ${indicatorColor} shadow-sm`}
                      />
                      <div className="text-xs text-ink-550">
                        <span className="font-bold text-ink-900">
                          {log.actorName}
                        </span>{" "}
                        <span className="text-[9px] bg-surface-3 px-1 rounded text-ink-450 font-bold uppercase tracking-wide">
                          {log.actorRole}
                        </span>
                        <span className="text-ink-200 mx-1.5">•</span>
                        <span className="text-[10px] text-ink-400">
                          {formatDate(log.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-ink-700 mt-1 font-semibold">
                        {log.message}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
