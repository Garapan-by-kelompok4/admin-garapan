"use client";

import React from "react";
import { AdminProfile } from "@/lib/api/settings";
import { avatarClass, initials } from "@/lib/avatar";

export interface SettingsProfileTabProps {
  profile: AdminProfile | undefined;
  isLoadingProfile: boolean;
  fullName: string;
  onFullNameChange: (value: string) => void;
  phone: string;
  onPhoneChange: (value: string) => void;
  bio: string;
  onBioChange: (value: string) => void;
  isPending: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function SettingsProfileTab({
  profile,
  isLoadingProfile,
  fullName,
  onFullNameChange,
  phone,
  onPhoneChange,
  bio,
  onBioChange,
  isPending,
  onSubmit,
}: SettingsProfileTabProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-3">
        <h3 className="font-heading font-bold text-sm text-ink-900">
          Informasi Profil
        </h3>
        <p className="text-[11px] text-ink-400 font-medium mt-0.5">
          Kelola data diri administrasi Anda di platform GARAPAN.
        </p>
      </div>

      {isLoadingProfile ? (
        <div className="p-8 text-center text-xs text-ink-500 font-medium">
          Memuat detail profil...
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="flex items-center gap-4 border-b border-border/50 pb-5">
            <div
              className={`h-16 w-16 rounded-full flex items-center justify-center text-white text-xl font-bold border border-border shadow-sm ${avatarClass(fullName || "AD")}`}
            >
              {initials(fullName || "AD")}
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-ink-900">
                Foto Profil
              </h4>
              <p className="text-[10px] text-ink-400 font-semibold mt-0.5">
                Initials avatar otomatis dibuat berdasarkan nama lengkap Anda.
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  disabled
                  className="px-2.5 py-1.5 border border-border bg-white text-[10px] font-bold text-ink-400 rounded cursor-not-allowed opacity-50"
                  title="Upload dinonaktifkan"
                >
                  Ganti Foto
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink-700">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => onFullNameChange(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-border rounded-lg text-xs placeholder:text-ink-350 focus:outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-50 transition-all font-medium"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink-700">
                Alamat Email (Akun)
              </label>
              <input
                type="email"
                value={profile?.email || ""}
                className="w-full h-10 px-3 bg-surface-2 border border-border rounded-lg text-xs text-ink-450 font-medium cursor-not-allowed"
                disabled
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink-700">
                Nomor Telepon
              </label>
              <input
                type="text"
                placeholder="Contoh: 081234567890"
                value={phone}
                onChange={(e) => onPhoneChange(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-border rounded-lg text-xs placeholder:text-ink-350 focus:outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-50 transition-all font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink-700">
                Peran Akses (Role)
              </label>
              <span className="w-full h-10 px-3 bg-surface-2 border border-border rounded-lg text-xs text-ink-450 flex items-center font-bold capitalize select-none cursor-not-allowed">
                {profile?.role?.toLowerCase() || "admin"}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-ink-700">
              Biografi Diri
            </label>
            <textarea
              rows={4}
              placeholder="Tuliskan biografi singkat mengenai diri Anda..."
              value={bio}
              onChange={(e) => onBioChange(e.target.value)}
              className="w-full p-3 bg-white border border-border rounded-lg text-xs placeholder:text-ink-350 focus:outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-50 transition-all font-medium resize-none"
            />
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={isPending}
              className="h-10 px-5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-bold text-xs flex items-center justify-center shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
