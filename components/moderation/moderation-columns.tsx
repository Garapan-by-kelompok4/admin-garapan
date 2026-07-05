import { ColumnDef } from "@tanstack/react-table";
import { FlaggedContent } from "@/lib/api/content";
import { CopyIdButton } from "@/components/data-table/copy-id-button";
import {
  StatusIndicator,
  StatusStack,
} from "@/components/data-table/status-indicator";
import { avatarClass, initials } from "@/lib/avatar";
import { moderationContentLabels } from "@/lib/moderation/content-labels";
import { formatDate } from "@/lib/utils";
import { moderationStatusTone } from "./moderation-status-pill";
import { ModerationTypePill } from "./moderation-type-pill";

function shortId(id: string) {
  return id ? `${id.slice(0, 8)}...${id.slice(-4)}` : "-";
}

interface CreateModerationColumnsOptions {
  onReview: (contentId: string) => void;
}

export function createModerationColumns({
  onReview,
}: CreateModerationColumnsOptions): ColumnDef<FlaggedContent>[] {
  return [
    {
      id: "contentType",
      header: "Tipe",
      cell: ({ row }) => (
        <div className="w-[76px]">
          <ModerationTypePill contentType={row.original.contentType} />
        </div>
      ),
    },
    {
      accessorKey: "id",
      header: "ID Konten",
      cell: ({ row }) => {
        const labels = moderationContentLabels(row.original.contentType);

        return (
          <div className="flex w-[132px] items-center gap-1.5">
            <span
              className="font-mono text-xs font-bold text-brand-600"
              title={row.original.id}
            >
              {shortId(row.original.id)}
            </span>
            <CopyIdButton value={row.original.id} label={labels.copyIdLabel} />
          </div>
        );
      },
    },
    {
      accessorKey: "title",
      header: "Judul",
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
      id: "owner",
      header: "Pemilik",
      cell: ({ row }) => {
        const labels = moderationContentLabels(row.original.contentType);

        return (
          <div className="w-[240px]">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${avatarClass(row.original.owner?.fullName)}`}
              >
                {initials(row.original.owner?.fullName)}
              </div>
              <div className="min-w-0">
                <div className="truncate font-semibold leading-none text-ink-900">
                  {row.original.owner?.fullName ?? "-"}
                </div>
                <div className="mt-0.5 truncate text-[10px] font-medium text-ink-400">
                  Pemilik · {labels.ownerTableSublabel}
                </div>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "reportCount",
      header: "Laporan",
      cell: ({ getValue }) => {
        const count = getValue();
        if (count == null || count === "") {
          return (
            <span className="text-[11px] font-medium text-ink-400">—</span>
          );
        }
        const numericCount = Number(count);
        const isHigh = numericCount >= 5;
        return (
          <span
            className={`inline-flex items-center justify-center h-5 px-2 rounded-full text-[11px] font-bold ${
              isHigh
                ? "bg-danger-50 text-danger-700 border border-danger-100"
                : "bg-warn-50 text-warn-700 border border-warn-100"
            }`}
          >
            {numericCount} Laporan
          </span>
        );
      },
    },
    {
      id: "state",
      header: "Status",
      cell: ({ row }) => {
        const tone = moderationStatusTone(row.original.status);

        return (
          <StatusStack
            className="w-[132px]"
            sublabel={formatDate(row.original.createdAt)}
          >
            <StatusIndicator
              label={row.original.status}
              dotClassName={tone.dotClassName}
              labelClassName={tone.labelClassName}
            />
          </StatusStack>
        );
      },
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
