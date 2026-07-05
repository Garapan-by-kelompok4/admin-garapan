import { ColumnDef } from "@tanstack/react-table";
import {
  Dispute,
} from "@/lib/api/disputes";
import { CopyIdButton } from "@/components/data-table/copy-id-button";
import {
  StatusIndicator,
  StatusStack,
} from "@/components/data-table/status-indicator";
import { avatarClass, initials } from "@/lib/avatar";
import { formatDate } from "@/lib/utils";
import {
  disputeStatusTone,
} from "./dispute-status-pill";

function shortId(id: string) {
  return id ? `${id.slice(0, 8)}...${id.slice(-4)}` : "-";
}

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
        <div className="flex w-[132px] items-center gap-1.5">
          <span
            className="font-mono text-xs font-bold text-brand-600"
            title={String(getValue())}
          >
            {shortId(String(getValue()))}
          </span>
          <CopyIdButton value={String(getValue())} label="ID laporan" />
        </div>
      ),
    },
    {
      id: "parties",
      header: "Pihak Terkait",
      cell: ({ row }) => (
        <div className="w-[260px] space-y-2">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${avatarClass(row.original.reporterName)}`}
            >
              {initials(row.original.reporterName)}
            </div>
            <div className="min-w-0">
              <div className="truncate font-semibold leading-none text-ink-900">
                {row.original.reporterName}
              </div>
              <div className="mt-0.5 text-[10px] font-medium text-ink-400">
                Pelapor - Klien
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${avatarClass(row.original.reportedName)}`}
            >
              {initials(row.original.reportedName)}
            </div>
            <div className="min-w-0">
              <div className="truncate font-semibold leading-none text-ink-900">
                {row.original.reportedName}
              </div>
              <div className="mt-0.5 text-[10px] font-medium text-ink-400">
                Terlapor - Mahasiswa
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "issueType",
      header: "Jenis Masalah",
      cell: ({ getValue }) => (
        <span
          className="block max-w-[300px] truncate text-sm font-medium leading-snug text-ink-700"
          title={String(getValue())}
        >
          {String(getValue())}
        </span>
      ),
    },
    {
      id: "state",
      header: "Status",
      cell: ({ row }) => {
        const statusTone = disputeStatusTone(row.original.status);

        return (
          <StatusStack
            className="w-[110px]"
            sublabel={row.original.priority}
          >
            <StatusIndicator
              label={row.original.status}
              dotClassName={statusTone.dotClassName}
              labelClassName={statusTone.labelClassName}
            />
          </StatusStack>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Tanggal",
      cell: ({ row }) => (
        <span className="block w-[86px] text-xs font-medium text-ink-500">
          {formatDate(row.original.createdAt)}
        </span>
      ),
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
