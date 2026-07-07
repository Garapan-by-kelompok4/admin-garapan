import { Dispute, DisputePriority } from "@/lib/api/disputes";

type StatusTone = {
  dotClassName?: string;
  labelClassName: string;
};

export function disputePriorityTone(
  priority: Dispute["priority"],
): StatusTone {
  switch (priority) {
    case "Tinggi":
      return {
        labelClassName: "text-[11px] font-bold text-danger-700",
      };
    case "Sedang":
      return {
        labelClassName: "text-[11px] font-bold text-warn-700",
      };
    case "Rendah":
      return {
        labelClassName: "text-[11px] font-bold text-slate-700",
      };
    default:
      return {
        labelClassName: "text-xs font-semibold text-ink-700",
      };
  }
}

export function disputeStatusTone(status: Dispute["status"]): StatusTone {
  switch (status) {
    case "Terbuka":
      return {
        dotClassName: "bg-danger-500",
        labelClassName: "text-xs font-semibold text-danger-700",
      };
    case "Selesai":
      return {
        dotClassName: "bg-success-500",
        labelClassName: "text-xs font-semibold text-success-700",
      };
    case "Ditolak":
      return {
        dotClassName: "bg-slate-500",
        labelClassName: "text-xs font-semibold text-slate-700",
      };
    default:
      return {
        labelClassName: "text-xs font-semibold text-ink-700",
      };
  }
}

export function DisputePriorityPill({
  priority,
}: {
  priority: Dispute["priority"];
}) {
  switch (priority) {
    case "Tinggi":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-danger-50 text-danger-700 border border-danger-100/50">
          Tinggi
        </span>
      );
    case "Sedang":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-warn-50 text-warn-700 border border-warn-100/50">
          Sedang
        </span>
      );
    case "Rendah":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200/50">
          Rendah
        </span>
      );
    default:
      return (
        <span className="text-xs font-semibold text-ink-700">{priority}</span>
      );
  }
}

export function DisputeStatusPill({
  status,
}: {
  status: Dispute["status"];
}) {
  switch (status) {
    case "Terbuka":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-danger-50 text-danger-700">
          <span className="h-1.5 w-1.5 rounded-full bg-danger-500" />
          Terbuka
        </span>
      );
    case "Selesai":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-success-50 text-success-700">
          <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
          Selesai
        </span>
      );
    case "Ditolak":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
          Ditolak
        </span>
      );
    default:
      return <span className="text-xs font-semibold">{status}</span>;
  }
}

export type { DisputePriority };
