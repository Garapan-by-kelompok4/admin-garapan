import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { OrderTransaction } from "@/lib/api/orders";
import { CopyIdButton } from "@/components/data-table/copy-id-button";
import { avatarClass, initials } from "@/lib/avatar";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TransactionStatusPill } from "./transaction-status-pill";

function shortId(id: string) {
  return id ? `${id.slice(0, 8)}...${id.slice(-4)}` : "-";
}

interface CreateTransactionsColumnsOptions {
  onViewDetail: (orderId: string) => void;
}

export function createTransactionsColumns({
  onViewDetail,
}: CreateTransactionsColumnsOptions): ColumnDef<OrderTransaction>[] {
  return [
    {
      accessorKey: "id",
      header: "ID Transaksi",
      cell: ({ getValue }) => (
        <div className="flex w-[132px] items-center gap-1.5">
          <span
            className="font-mono text-xs font-bold text-ink-900"
            title={String(getValue())}
          >
            {shortId(String(getValue()))}
          </span>
          <CopyIdButton value={String(getValue())} label="ID transaksi" />
        </div>
      ),
    },
    {
      id: "parties",
      header: "Pihak",
      cell: ({ row }) => (
        <div className="w-[280px] space-y-2">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${avatarClass(row.original.clientName)}`}
            >
              {initials(row.original.clientName)}
            </div>
            <div className="min-w-0">
              <div className="truncate font-semibold leading-none text-ink-900">
                {row.original.clientName}
              </div>
              <div className="mt-0.5 text-[10px] font-medium text-ink-400">
                Klien - {shortId(row.original.clientId)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${avatarClass(row.original.studentName)}`}
            >
              {initials(row.original.studentName)}
            </div>
            <div className="min-w-0">
              <div className="truncate font-semibold leading-none text-ink-900">
                {row.original.studentName}
              </div>
              <div className="mt-0.5 text-[10px] font-medium text-ink-400">
                Mahasiswa - {shortId(row.original.studentId)}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "serviceTitle",
      header: "Jasa",
      cell: ({ getValue }) => (
        <span
          className="block max-w-[260px] truncate text-sm font-semibold leading-snug text-ink-700"
          title={String(getValue())}
        >
          {String(getValue())}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: "Nominal",
      cell: ({ getValue }) => (
        <span className="block w-[112px] text-sm font-extrabold text-ink-900">
          {formatCurrency(Number(getValue()))}
        </span>
      ),
    },
    {
      id: "state",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex w-[132px] flex-col items-start gap-1.5">
          <TransactionStatusPill status={row.original.escrowStatus} />
          <span className="text-[11px] font-medium text-ink-400">
            {formatDate(row.original.createdAt)}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Aksi</span>,
      cell: ({ row }) => (
        <div className="text-right">
          <button
            onClick={() => onViewDetail(row.original.id)}
            className="h-8 w-8 rounded-lg border border-border bg-white flex items-center justify-center text-ink-500 hover:bg-surface-2 hover:text-brand-600 transition-colors shadow-sm cursor-pointer"
            title="Lihat Detail Escrow"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];
}
