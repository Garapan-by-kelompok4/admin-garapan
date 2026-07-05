"use client";

import { ShieldCheck } from "lucide-react";

export interface SettingsSecurityTabProps {
  is2FAEnabled: boolean;
  on2FAToggle: () => void;
}

export function SettingsSecurityTab({
  is2FAEnabled,
  on2FAToggle,
}: SettingsSecurityTabProps) {
  return (
    <>
      <div className="border-b border-border pb-3">
        <h3 className="font-heading font-bold text-sm text-ink-900">
          Keamanan & Akses
        </h3>
        <p className="text-[11px] text-ink-400 font-medium mt-0.5">
          Konfigurasi kata sandi akun dan otentikasi keamanan ganda.
        </p>
      </div>

      <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-surface-2/40 max-w-lg">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
            <ShieldCheck className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-ink-900">
              Autentikasi Dua Faktor (2FA)
            </h4>
            <p className="text-[10px] text-ink-400 font-medium mt-0.5">
              Fitur 2FA akan tersedia pada versi mendatang.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={on2FAToggle}
          disabled
          className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-not-allowed rounded-full border-2 border-transparent opacity-50 transition-colors duration-200 ease-in-out ${
            is2FAEnabled ? "bg-brand-500" : "bg-ink-200"
          }`}
          title="2FA belum tersedia"
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              is2FAEnabled ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </>
  );
}
