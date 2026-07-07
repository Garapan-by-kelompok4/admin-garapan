import { CheckCircle2 } from "lucide-react";

import type { DisputeDetail } from "@/lib/api/disputes";
import {
  getDisputeOutcomeLabel,
  inferResolvedOutcome,
} from "@/lib/disputes/outcome";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

interface ResolutionSummaryProps {
  disputeDetail: DisputeDetail;
  className?: string;
}

export function ResolutionSummary({
  disputeDetail,
  className,
}: ResolutionSummaryProps) {
  const outcome = inferResolvedOutcome({
    status: disputeDetail.status,
    refundAmount: disputeDetail.refundAmount,
    orderStatus: disputeDetail.orderStatus,
  });

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-success-500" />
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
          Keputusan Tercatat
        </h4>
      </div>

      <div className="space-y-3 rounded-lg border border-border bg-surface-2/60 p-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
            Keputusan Dana Escrow
          </div>
          <div className="mt-1 text-sm font-semibold text-ink-900">
            {outcome
              ? getDisputeOutcomeLabel(outcome)
              : "Dispute telah ditutup"}
          </div>
        </div>

        {disputeDetail.refundAmount != null && disputeDetail.refundAmount > 0 ? (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
              Nominal Refund Klien
            </div>
            <div className="mt-1 text-sm font-semibold text-ink-900">
              {formatCurrency(disputeDetail.refundAmount)}
            </div>
          </div>
        ) : null}

        {disputeDetail.resolutionNote ? (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
              Catatan Resolusi Resmi
            </div>
            <p className="mt-1 text-sm font-medium leading-relaxed text-ink-700">
              {disputeDetail.resolutionNote}
            </p>
          </div>
        ) : (
          <p className="text-sm font-medium text-ink-500">
            Tidak ada catatan resolusi tersimpan.
          </p>
        )}

        {disputeDetail.resolvedAt ? (
          <div className="border-t border-border pt-3 text-xs font-medium text-ink-400">
            Diselesaikan pada {formatDate(disputeDetail.resolvedAt)}
          </div>
        ) : null}
      </div>
    </div>
  );
}
