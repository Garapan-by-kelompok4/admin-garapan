import { EscrowStatus } from "@/lib/api/orders";

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
