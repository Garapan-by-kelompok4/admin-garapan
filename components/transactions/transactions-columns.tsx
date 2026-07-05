import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { OrderTransaction, EscrowStatus } from "@/lib/api/orders";
import { avatarClass, initials } from "@/lib/avatar";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TransactionStatusPill } from "./transaction-status-pill";

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
        <span className="font-mono font-bold text-xs text-ink-900 select-all">
          {String(getValue())}
        </span>
      ),
    },
    {
      id: "client",
      header: "Klien",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div
            className={`h-7 w-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${avatarClass(row.original.clientName)}`}
          >
            {initials(row.original.clientName)}
          </div>
          <div>
            <div className="font-semibold text-ink-900 leading-none">
              {row.original.clientName}
            </div>
            <div className="text-[10px] text-ink-400 mt-0.5 font-medium">
              ID: {row.original.clientId}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "student",
      header: "Mahasiswa",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div
            className={`h-7 w-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${avatarClass(row.original.studentName)}`}
          >
            {initials(row.original.studentName)}
          </div>
          <div>
            <div className="font-semibold text-ink-900 leading-none">
              {row.original.studentName}
            </div>
            <div className="text-[10px] text-ink-400 mt-0.5 font-medium">
              ID: {row.original.studentId}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "serviceTitle",
      header: "Jasa",
      cell: ({ getValue }) => (
        <span className="font-semibold text-ink-700 text-sm leading-snug truncate max-w-[200px] block">
          {String(getValue())}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: "Nominal",
      cell: ({ getValue }) => (
        <span className="font-extrabold text-ink-900 text-sm">
          {formatCurrency(Number(getValue()))}
        </span>
      ),
    },
    {
      accessorKey: "escrowStatus",
      header: "Status Escrow",
      cell: ({ getValue }) => (
        <TransactionStatusPill status={getValue() as EscrowStatus} />
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Tanggal Transaksi",
      cell: ({ getValue }) => formatDate(getValue() as string),
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
