"use client";

import { toast } from "sonner";

export function SettingsNotificationsTab() {
  return (
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
            <tr className="bg-surface-2/60">
              <td colSpan={4} className="py-2 px-4 font-bold text-ink-800">
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

            <tr className="bg-surface-2/60">
              <td colSpan={4} className="py-2 px-4 font-bold text-ink-800">
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
  );
}
