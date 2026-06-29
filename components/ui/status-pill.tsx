import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const statusPillVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold",
  {
    variants: {
      tone: {
        success: "bg-success-50 text-success-700",
        warn: "bg-warn-50 text-warn-700",
        danger: "bg-danger-50 text-danger-700",
        info: "bg-info-50 text-info-500",
        neutral: "bg-surface-3 text-ink-500",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

type Tone = NonNullable<VariantProps<typeof statusPillVariants>["tone"]>;

// Domain status → tone (design handoff). Statuses are the Bahasa Indonesia
// labels returned/derived across users, disputes, transactions, moderation,
// articles.
const STATUS_TONE: Record<string, Tone> = {
  Aktif: "success",
  Selesai: "success",
  Aman: "success",
  Dicairkan: "success",
  Published: "success",
  Pending: "warn",
  Terbuka: "warn",
  Ditinjau: "warn",
  Ditahan: "warn",
  Sedang: "warn",
  Suspended: "danger",
  Dihapus: "danger",
  Refund: "danger",
  Tinggi: "danger",
  Diproses: "info",
  Ditolak: "neutral",
  Disembunyikan: "neutral",
  Draft: "neutral",
  Rendah: "neutral",
};

type StatusPillProps = {
  status: string;
  /** Override the auto-resolved tone. */
  tone?: Tone;
  noDot?: boolean;
  className?: string;
};

export function StatusPill({ status, tone, noDot, className }: StatusPillProps) {
  const resolved = tone ?? STATUS_TONE[status] ?? "neutral";
  return (
    <span className={cn(statusPillVariants({ tone: resolved }), className)}>
      {!noDot && (
        <span className="size-1.5 rounded-full bg-current opacity-80" aria-hidden />
      )}
      {status}
    </span>
  );
}

export { statusPillVariants };
