import { EscrowStatus } from "@/lib/api/orders";

type StatusTone = {
  dotClassName?: string;
  labelClassName: string;
};

export function transactionStatusTone(status: EscrowStatus): StatusTone {
  switch (status) {
    case "Ditahan":
      return {
        dotClassName: "bg-warn-500 animate-pulse",
        labelClassName: "text-xs font-semibold text-warn-700",
      };
    case "Dicairkan":
      return {
        dotClassName: "bg-success-500",
        labelClassName: "text-xs font-semibold text-success-700",
      };
    case "Refund":
      return {
        dotClassName: "bg-danger-500",
        labelClassName: "text-xs font-semibold text-danger-700",
      };
    default:
      return {
        labelClassName: "text-xs font-semibold text-ink-700",
      };
  }
}

export function TransactionStatusPill({ status }: { status: EscrowStatus }) {
  switch (status) {
    case "Ditahan":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-warn-50 text-warn-700">
          <span className="h-1.5 w-1.5 rounded-full bg-warn-500 animate-pulse" />
          Ditahan
        </span>
      );
    case "Dicairkan":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-success-50 text-success-700">
          <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
          Dicairkan
        </span>
      );
    case "Refund":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-danger-50 text-danger-700">
          <span className="h-1.5 w-1.5 rounded-full bg-danger-500" />
          Refund
        </span>
      );
    default:
      return <span className="text-xs font-semibold">{status}</span>;
  }
}
