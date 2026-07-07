import { z } from "zod";

const disputeOutcomes = [
  "RELEASE",
  "REFUND",
  "PARTIAL_REFUND",
  "REJECT",
] as const;

export function createResolveDisputeSchema(orderAmount: number) {
  return z
    .object({
      outcome: z
        .string()
        .min(1, { message: "Silakan pilih resolusi tindakan" })
        .pipe(z.enum(disputeOutcomes)),
      resolutionNote: z
        .string()
        .min(1, { message: "Catatan resolusi wajib diisi" }),
      refundAmount: z.coerce.number().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.outcome !== "PARTIAL_REFUND") return;

      if (!data.refundAmount || data.refundAmount <= 0) {
        ctx.addIssue({
          code: "custom",
          message: "Nominal refund parsial wajib diisi dan harus lebih dari 0",
          path: ["refundAmount"],
        });
      }

      if (data.refundAmount && data.refundAmount > orderAmount) {
        ctx.addIssue({
          code: "custom",
          message: "Nominal refund parsial tidak boleh melebihi nilai transaksi",
          path: ["refundAmount"],
        });
      }
    });
}

export type ResolveDisputeFormInput = z.input<
  ReturnType<typeof createResolveDisputeSchema>
>;

export type ResolveDisputeInput = z.infer<
  ReturnType<typeof createResolveDisputeSchema>
>;
