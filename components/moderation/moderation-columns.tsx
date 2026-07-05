import { ColumnDef } from "@tanstack/react-table";
import { FileText } from "lucide-react";
import { FlaggedContent } from "@/lib/api/content";
import { avatarClass, initials } from "@/lib/avatar";
import { formatDate } from "@/lib/utils";
import { ModerationStatusPill } from "./moderation-status-pill";

interface CreateModerationColumnsOptions {
  onReview: (contentId: string) => void;
}

export function createModerationColumns({
  onReview,
}: CreateModerationColumnsOptions): ColumnDef<FlaggedContent>[] {
  return [
    {
      accessorKey: "title",
      header: "Jasa",
      cell: ({ row }) => (
        <div className="flex items-center gap-3 max-w-[260px]">
          <div className="h-11 w-11 rounded-lg bg-surface-2 border border-border flex items-center justify-center flex-shrink-0 select-none">
            <FileText className="h-5 w-5 text-ink-400" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-ink-900 truncate leading-snug">
              {row.original.title}
            </div>
            <div className="text-[11px] text-ink-400 mt-1 font-mono">
              ID: {row.original.id}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "owner",
      header: "Pemilik",
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div
            className={`h-7 w-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${avatarClass(row.original.owner?.fullName)}`}
          >
            {initials(row.original.owner?.fullName)}
          </div>
          <span className="font-medium text-ink-700 text-sm">
            {row.original.owner?.fullName ?? "-"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Kategori",
      cell: ({ getValue }) => (
        <span className="inline-flex px-2 py-0.5 rounded border border-border bg-surface-2 text-[11px] font-semibold text-ink-500">
          {String(getValue() ?? "Lainnya")}
        </span>
      ),
    },
    {
      accessorKey: "reportCount",
      header: "Laporan",
      cell: ({ getValue }) => {
        const count = Number(getValue() ?? 0);
        const isHigh = count >= 5;
        return (
          <span
            className={`inline-flex items-center justify-center h-5 px-2 rounded-full text-[11px] font-bold ${
              isHigh
                ? "bg-danger-50 text-danger-700 border border-danger-100"
                : "bg-warn-50 text-warn-700 border border-warn-100"
            }`}
          >
            {count} Laporan
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => (
        <ModerationStatusPill status={getValue() as FlaggedContent["status"]} />
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Tanggal Posting",
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
