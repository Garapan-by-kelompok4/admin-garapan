"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  DisputeDetail,
  ResolveDisputePayload,
} from "@/lib/api/disputes";
import { formatCurrency } from "@/lib/utils";
import {
  createResolveDisputeSchema,
  type ResolveDisputeFormInput,
  type ResolveDisputeInput,
} from "@/lib/validators/disputes";

interface ResolutionFormProps {
  disputeDetail: DisputeDetail;
  onResolve: (params: { id: string; payload: ResolveDisputePayload }) => void;
  onClose: () => void;
  isPending: boolean;
}

export function ResolutionForm({
  disputeDetail,
  onResolve,
  onClose,
  isPending,
}: ResolutionFormProps) {
  const schema = useMemo(
    () => createResolveDisputeSchema(disputeDetail.orderAmount),
    [disputeDetail.orderAmount],
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ResolveDisputeFormInput, unknown, ResolveDisputeInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      outcome: "",
      resolutionNote: "",
      refundAmount: undefined,
    },
  });

  const outcome = watch("outcome");

  const onSubmit = (values: ResolveDisputeInput) => {
    onResolve({
      id: disputeDetail.id,
      payload: {
        outcome: values.outcome,
        resolutionNote: values.resolutionNote,
        refundAmount:
          values.outcome === "PARTIAL_REFUND"
            ? String(values.refundAmount)
            : undefined,
      },
    });
  };

  if (
    disputeDetail.status !== "Terbuka" &&
    disputeDetail.status !== "Diproses"
  ) {
    return null;
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 border-t border-border pt-5"
      noValidate
    >
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-brand-500" />
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
          Tindak Lanjut &amp; Keputusan Resolusi
        </h4>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="outcome" className="text-xs font-bold text-ink-700">
            Keputusan Dana Escrow
          </Label>
          <select
            id="outcome"
            className="h-[38px] w-full cursor-pointer rounded-lg border border-border bg-white px-3 text-sm font-medium text-ink-700 transition-all focus:border-brand-400 focus:outline-none focus:ring-3 focus:ring-brand-50"
            aria-invalid={Boolean(errors.outcome)}
            {...register("outcome", {
              onChange: (event) => {
                if (event.target.value !== "PARTIAL_REFUND") {
                  setValue("refundAmount", undefined);
                }
              },
            })}
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
          {errors.outcome && (
            <p className="text-xs text-danger-500">{errors.outcome.message}</p>
          )}
        </div>

        {outcome === "PARTIAL_REFUND" && (
          <div className="space-y-1.5">
            <Label
              htmlFor="refundAmount"
              className="text-xs font-bold text-ink-700"
            >
              Nominal Refund Klien (Maks:{" "}
              {formatCurrency(disputeDetail.orderAmount)})
            </Label>
            <input
              id="refundAmount"
              type="number"
              placeholder="Contoh: 500000"
              className="h-[38px] w-full rounded-lg border border-border bg-white px-3 text-sm font-semibold text-ink-900 placeholder:text-ink-300 transition-all focus:border-brand-400 focus:outline-none focus:ring-3 focus:ring-brand-50"
              aria-invalid={Boolean(errors.refundAmount)}
              {...register("refundAmount")}
            />
            {errors.refundAmount && (
              <p className="text-xs text-danger-500">
                {errors.refundAmount.message}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="resolutionNote"
          className="text-xs font-bold text-ink-700"
        >
          Catatan Resolusi Resmi <span className="text-danger-500">*</span>
        </Label>
        <Textarea
          id="resolutionNote"
          rows={3}
          placeholder="Tuliskan keputusan resolusi, misal: 'Pengerjaan tidak lengkap, disetujui refund parsial 50%...'"
          className="resize-none text-sm font-medium"
          aria-invalid={Boolean(errors.resolutionNote)}
          {...register("resolutionNote")}
        />
        {errors.resolutionNote && (
          <p className="text-xs text-danger-500">
            {errors.resolutionNote.message}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2.5 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="text-sm font-semibold"
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="text-sm font-semibold"
        >
          {isPending ? "Memproses..." : "Selesaikan Dispute"}
          {!isPending && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </form>
  );
}
