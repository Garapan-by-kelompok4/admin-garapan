import { ColumnDef } from "@tanstack/react-table";
import {
  Dispute,
  DisputePriority,
  DisputeStatus,
} from "@/lib/api/disputes";
import { avatarClass, initials } from "@/lib/avatar";
import { formatDate } from "@/lib/utils";
import {
  DisputePriorityPill,
  DisputeStatusPill,
} from "./dispute-status-pill";

interface CreateDisputesColumnsOptions {
  onReview: (disputeId: string) => void;
}

export function createDisputesColumns({
  onReview,
}: CreateDisputesColumnsOptions): ColumnDef<Dispute>[] {
  return [
    {
      accessorKey: "id",
      header: "ID Laporan",
      cell: ({ getValue }) => (
        <span className="font-mono font-bold text-xs text-brand-600 select-all">
          {String(getValue())}
        </span>
      ),
    },
    {
      id: "reporter",
      header: "Pelapor",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div
            className={`h-7 w-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${avatarClass(row.original.reporterName)}`}
          >
            {initials(row.original.reporterName)}
          </div>
          <div>
            <div className="font-semibold text-ink-900 leading-none">
              {row.original.reporterName}
            </div>
            <div className="text-[10px] text-ink-400 mt-0.5 font-medium">
              Klien
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "reported",
      header: "Terlapor",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div
            className={`h-7 w-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${avatarClass(row.original.reportedName)}`}
          >
            {initials(row.original.reportedName)}
          </div>
          <div>
            <div className="font-semibold text-ink-900 leading-none">
              {row.original.reportedName}
            </div>
            <div className="text-[10px] text-ink-400 mt-0.5 font-medium">
              Mahasiswa
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "issueType",
      header: "Jenis Masalah",
      cell: ({ getValue }) => (
        <span className="font-medium text-ink-700 text-sm leading-snug">
          {String(getValue())}
        </span>
      ),
    },
    {
      accessorKey: "priority",
      header: "Prioritas",
      cell: ({ getValue }) => (
        <DisputePriorityPill priority={getValue() as DisputePriority} />
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => (
        <DisputeStatusPill status={getValue() as DisputeStatus} />
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Tanggal",
      cell: ({ getValue }) => formatDate(getValue() as string),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Aksi</span>,
      cell: ({ row }) => (
        <div className="text-right">
          <button
            onClick={() => onReview(row.original.id)}
            className="px-3 py-1.5 text-xs font-semibold border border-border hover:bg-surface-3 bg-white text-ink-700 rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            Tinjau
          </button>
        </div>
      ),
    },
  ];
}
