"use client";

import { useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  DisputeDetail,
  DisputeOutcome,
  ResolveDisputePayload,
} from "@/lib/api/disputes";
import { formatCurrency } from "@/lib/utils";

interface DisputeResolutionFormProps {
  disputeDetail: DisputeDetail;
  onResolve: (params: { id: string; payload: ResolveDisputePayload }) => void;
  onClose: () => void;
  isPending: boolean;
}

export function DisputeResolutionForm({
  disputeDetail,
  onResolve,
  onClose,
  isPending,
}: DisputeResolutionFormProps) {
  const [resolutionNote, setResolutionNote] = useState("");
  const [outcome, setOutcome] = useState<DisputeOutcome | "">("");
  const [refundAmount, setRefundAmount] = useState<number | "">("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outcome) {
      toast.error("Silakan pilih resolusi tindakan");
      return;
    }
    if (!resolutionNote.trim()) {
      toast.error("Catatan resolusi wajib diisi");
      return;
    }
    if (outcome === "PARTIAL_REFUND" && (!refundAmount || refundAmount <= 0)) {
      toast.error("Nominal refund parsial wajib diisi dan harus lebih dari 0");
      return;
    }
    if (
      outcome === "PARTIAL_REFUND" &&
      Number(refundAmount) > disputeDetail.orderAmount
    ) {
      toast.error(
        "Nominal refund parsial tidak boleh melebihi nilai transaksi",
      );
      return;
    }

    onResolve({
      id: disputeDetail.id,
      payload: {
        outcome,
        resolutionNote,
        refundAmount:
          outcome === "PARTIAL_REFUND" ? String(refundAmount) : undefined,
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-border pt-5 space-y-4"
    >
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-brand-500" />
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
          Tindak Lanjut &amp; Keputusan Resolusi
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-ink-700">
            Keputusan Dana Escrow
          </label>
          <select
            value={outcome}
            onChange={(e) => {
              setOutcome(e.target.value as DisputeOutcome);
              if (e.target.value !== "PARTIAL_REFUND") setRefundAmount("");
            }}
            className="w-full h-[38px] px-3 bg-white border border-border rounded-lg text-sm font-medium text-ink-700 focus:outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-50 transition-all cursor-pointer"
          >
            <option value="">Pilih resolusi...</option>
            <option value="RELEASE">
              Cairkan penuh ke Freelancer (Mahasiswa)
            </option>
            <option value="REFUND">Refund penuh ke Client (Klien)</option>
            <option value="PARTIAL_REFUND">
              Refund Parsial ke Client &amp; Sisa ke Freelancer
            </option>
            <option value="REJECT">
              Tolak Laporan (Tutup tanpa perubahan dana)
            </option>
          </select>
        </div>

        {outcome === "PARTIAL_REFUND" && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-ink-700">
              Nominal Refund Klien (Maks:{" "}
              {formatCurrency(disputeDetail.orderAmount)})
            </label>
            <input
              type="number"
              placeholder="Contoh: 500000"
              value={refundAmount}
              onChange={(e) =>
                setRefundAmount(e.target.value ? Number(e.target.value) : "")
              }
              className="w-full h-[38px] px-3 bg-white border border-border rounded-lg text-sm placeholder:text-ink-300 focus:outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-50 transition-all font-semibold text-ink-900"
            />
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-ink-700">
          Catatan Resolusi Resmi <span className="text-danger-500">*</span>
        </label>
        <textarea
          rows={3}
          placeholder="Tuliskan keputusan resolusi, misal: 'Pengerjaan tidak lengkap, disetujui refund parsial 50%...'"
          value={resolutionNote}
          onChange={(e) => setResolutionNote(e.target.value)}
          className="w-full p-3 bg-white border border-border rounded-lg text-sm placeholder:text-ink-300 focus:outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-50 transition-all font-medium resize-none"
        />
      </div>

      <div className="flex justify-end gap-2.5 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-semibold border border-border bg-white rounded-lg text-ink-700 hover:bg-surface-3 transition-colors cursor-pointer shadow-sm"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Memproses..." : "Selesaikan Dispute"}
          {!isPending && <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    </form>
  );
}
