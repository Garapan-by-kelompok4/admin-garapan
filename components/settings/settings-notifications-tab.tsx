"use client";

import { Bell } from "lucide-react";

/** Deferred per ADR 001 — notification preferences API not in v1 scope. */
export function SettingsNotificationsTab() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-3">
        <h3 className="font-heading font-bold text-sm text-ink-900">
          Notifikasi Sistem
        </h3>
        <p className="text-[11px] text-ink-400 font-medium mt-0.5">
          Preferensi notifikasi admin akan tersedia setelah endpoint backend v2
          siap.
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-border bg-surface-2/50 p-8 text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white border border-border shadow-sm">
          <Bell className="h-5 w-5 text-ink-400" />
        </div>
        <p className="text-sm font-semibold text-ink-800">
          Matriks preferensi notifikasi ditunda (v2)
        </p>
        <p className="text-xs text-ink-400 max-w-md mx-auto">
          Sementara ini, pantau dispute, moderasi, dan chat lewat badge di
          sidebar dan pusat perhatian dashboard.
        </p>
      </div>
    </div>
  );
}
