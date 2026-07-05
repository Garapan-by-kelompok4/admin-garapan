"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export interface SettingsSecurityTabProps {
  oldPassword: string;
  onOldPasswordChange: (value: string) => void;
  newPassword: string;
  onNewPasswordChange: (value: string) => void;
  confirmPassword: string;
  onConfirmPasswordChange: (value: string) => void;
  is2FAEnabled: boolean;
  on2FAToggle: () => void;
  isPending: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function SettingsSecurityTab({
  oldPassword,
  onOldPasswordChange,
  newPassword,
  onNewPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  is2FAEnabled,
  on2FAToggle,
  isPending,
  onSubmit,
}: SettingsSecurityTabProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-3">
        <h3 className="font-heading font-bold text-sm text-ink-900">
          Keamanan & Akses
        </h3>
        <p className="text-[11px] text-ink-400 font-medium mt-0.5">
          Konfigurasi kata sandi akun dan otentikasi keamanan ganda.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 max-w-lg">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-ink-700">Password Lama</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => onOldPasswordChange(e.target.value)}
            className="w-full h-10 px-3 bg-white border border-border rounded-lg text-xs placeholder:text-ink-350 focus:outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-50 transition-all font-medium"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-ink-700">Password Baru</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => onNewPasswordChange(e.target.value)}
            className="w-full h-10 px-3 bg-white border border-border rounded-lg text-xs placeholder:text-ink-350 focus:outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-50 transition-all font-medium"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-ink-700">
            Konfirmasi Password Baru
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            className="w-full h-10 px-3 bg-white border border-border rounded-lg text-xs placeholder:text-ink-350 focus:outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-50 transition-all font-medium"
            required
          />
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            disabled={isPending}
            className="h-10 px-5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-bold text-xs flex items-center justify-center shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Memproses..." : "Ganti Password"}
          </button>
        </div>
      </form>

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
              on2FAToggle();
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
  );
}
