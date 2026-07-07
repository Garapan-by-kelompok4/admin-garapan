import type { DisputeOutcome, DisputeStatus } from "@/lib/api/disputes";

const OUTCOME_LABELS: Record<DisputeOutcome, string> = {
  RELEASE: "Cairkan penuh ke Freelancer (Mahasiswa)",
  REFUND: "Refund penuh ke Client (Klien)",
  PARTIAL_REFUND: "Refund Parsial ke Client & Sisa ke Freelancer",
  REJECT: "Tolak Laporan (Tutup tanpa perubahan dana)",
};

export function getDisputeOutcomeLabel(outcome: DisputeOutcome): string {
  return OUTCOME_LABELS[outcome];
}

export function inferResolvedOutcome(params: {
  status: DisputeStatus;
  refundAmount: number | null;
  orderStatus?: string | null;
}): DisputeOutcome | null {
  const { status, refundAmount, orderStatus } = params;

  if (status === "Ditolak") return "REJECT";
  if (status !== "Selesai") return null;

  if (refundAmount != null && refundAmount > 0) {
    return "PARTIAL_REFUND";
  }

  if (orderStatus === "CANCELLED") return "REFUND";
  if (orderStatus === "COMPLETED") return "RELEASE";

  return null;
}
