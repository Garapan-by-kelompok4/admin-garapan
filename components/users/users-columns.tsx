import { ColumnDef } from "@tanstack/react-table";
import { Star, Eye, Ban, Unlock } from "lucide-react";
import { User } from "@/lib/api/users";
import { avatarClass, initials } from "@/lib/avatar";
import { formatDate } from "@/lib/utils";
import { UserStatusPill } from "./user-status-pill";

type UserRoleTab = "MAHASISWA" | "KLIEN";

interface CreateUsersColumnsOptions {
  activeTab: UserRoleTab;
  onViewDetail: (userId: string) => void;
  onBan: (userId: string, userName: string) => void;
  onUnban: (userId: string) => void;
}

export function createUsersColumns({
  activeTab,
  onViewDetail,
  onBan,
  onUnban,
}: CreateUsersColumnsOptions): ColumnDef<User>[] {
  const roleSpecificColumn: ColumnDef<User> =
    activeTab === "MAHASISWA"
      ? {
          accessorKey: "university",
          header: "Universitas",
          cell: ({ getValue }) => getValue() || "-",
        }
      : {
          accessorKey: "company",
          header: "Perusahaan",
          cell: ({ getValue }) => getValue() || "-",
        };

  const statsColumn: ColumnDef<User> =
    activeTab === "MAHASISWA"
      ? {
          accessorKey: "rating",
          header: "Rating",
          cell: ({ row }) => {
            const rating = row.original.rating || 0;
            return (
              <div className="flex items-center gap-1.5 font-semibold text-ink-900">
                <Star className="h-4 w-4 fill-amber-400 stroke-amber-500 text-amber-500" />
                <span>{rating.toFixed(1)}</span>
                <span className="text-[11.5px] text-ink-400 font-medium">
                  ({row.original.jobs || 0})
                </span>
              </div>
            );
          },
        }
      : {
          accessorKey: "jobs",
          header: "Pesanan",
          cell: ({ getValue }) => (
            <span className="font-semibold text-ink-900">
              {Number(getValue() ?? 0)}
            </span>
          ),
        };

  return [
    {
      id: "name",
      header: activeTab === "MAHASISWA" ? "Mahasiswa" : "Klien",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div
            className={`h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${avatarClass(row.original.fullName)}`}
          >
            {initials(row.original.fullName)}
          </div>
          <div>
            <div className="font-semibold text-ink-900 leading-tight">
              {row.original.fullName || "User"}
            </div>
            <div className="text-xs text-ink-400 mt-1 font-medium">
              {row.original.email}
            </div>
          </div>
        </div>
      ),
    },
    roleSpecificColumn,
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <UserStatusPill user={row.original} />,
    },
    statsColumn,
    {
      accessorKey: "createdAt",
      header: "Tgl. Daftar",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Aksi</span>,
      cell: ({ row }) => {
        const isBanned = row.original.bannedAt !== null;
        return (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => onViewDetail(row.original.id)}
              className="h-8 w-8 rounded-lg border border-border bg-white flex items-center justify-center text-ink-500 hover:bg-surface-2 hover:text-brand-600 transition-colors shadow-sm cursor-pointer"
              title="Lihat Detail"
            >
              <Eye className="h-4 w-4" />
            </button>
            {isBanned ? (
              <button
                onClick={() => onUnban(row.original.id)}
                className="h-8 w-8 rounded-lg border border-success-200 bg-success-50/50 flex items-center justify-center text-success-600 hover:bg-success-50 hover:text-success-700 transition-colors shadow-sm cursor-pointer"
                title="Pulihkan Akun"
              >
                <Unlock className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() =>
                  onBan(row.original.id, row.original.fullName || "User")
                }
                className="h-8 w-8 rounded-lg border border-danger-200 bg-danger-50/50 flex items-center justify-center text-danger-600 hover:bg-danger-55 hover:text-danger-700 transition-colors shadow-sm cursor-pointer"
                title="Blokir Akun"
              >
                <Ban className="h-4 w-4" />
              </button>
            )}
          </div>
        );
      },
    },
  ];
}
