"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { usersApi, type UserStatusFilter } from "@/lib/api/users";
import { formatDate, getErrorMessage } from "@/lib/utils";
import { paginatedListPlaceholder } from "@/lib/query/pagination";
import { DataTable } from "@/components/data-table/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { UsersToolbar } from "@/components/users/users-toolbar";
import { createUsersColumns } from "@/components/users/users-columns";
import { UserDetailDialog } from "@/components/users/user-detail-dialog";
import { UserAvatar } from "@/components/user-avatar";
import { UserStatusPill } from "@/components/users/user-status-pill";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") ?? "";
  const [activeTab, setActiveTab] = useState<"MAHASISWA" | "KLIEN">(
    "MAHASISWA",
  );
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>("Semua");
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [banTarget, setBanTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ["users", activeTab, page, search, statusFilter],
    queryFn: () =>
      usersApi.listWithStatusFilter({
        page,
        limit,
        search: search || undefined,
        role: activeTab === "MAHASISWA" ? "MAHASISWA" : "KLIEN",
        statusFilter,
      }),
    placeholderData: paginatedListPlaceholder,
  });

  const { data: userDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["userDetail", selectedUserId],
    queryFn: () => usersApi.getById(selectedUserId!),
    enabled: !!selectedUserId,
  });

  const banMutation = useMutation({
    mutationFn: (id: string) => usersApi.ban(id),
    onSuccess: () => {
      toast.success("User berhasil diblokir");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({
        queryKey: ["userDetail", selectedUserId],
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal memblokir user");
    },
  });

  const unbanMutation = useMutation({
    mutationFn: (id: string) => usersApi.unban(id),
    onSuccess: () => {
      toast.success("Aktivasi user berhasil dipulihkan");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({
        queryKey: ["userDetail", selectedUserId],
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal memulihkan user");
    },
  });

  const handleBan = (userId: string, userName: string) => {
    setBanTarget({ id: userId, name: userName });
  };

  const columns = createUsersColumns({
    activeTab,
    onViewDetail: setSelectedUserId,
    onBan: handleBan,
    onUnban: (userId) => unbanMutation.mutate(userId),
  });

  return (
    <div className="space-y-6">
      <UsersToolbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setPage(1);
        }}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
          setPage(1);
        }}
      />

      {error ? (
        <div className="p-8 border border-border rounded-xl bg-white text-center">
          <AlertTriangle className="h-8 w-8 text-danger-500 mx-auto" />
          <h3 className="font-heading font-bold text-sm text-ink-900 mt-2">
            Gagal memuat data
          </h3>
          <p className="text-xs text-ink-400 mt-1">
            {getErrorMessage(error)}
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data?.data || []}
          total={data?.total || 0}
          page={page}
          limit={limit}
          isLoading={isLoading}
          onPageChange={setPage}
          mobileCard={(user) => {
            const isBanned = user.bannedAt !== null;
            return (
              <div className="rounded-lg border border-border bg-white p-4 shadow-sh-1">
                <div className="flex items-start gap-3">
                  <UserAvatar
                    name={user.fullName}
                    avatarUrl={user.avatarUrl}
                    className="size-10"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold text-ink-900">
                      {user.fullName || "User"}
                    </div>
                    <div className="mt-1 truncate text-xs font-medium text-ink-400">
                      {user.email}
                    </div>
                  </div>
                  <UserStatusPill user={user} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="font-semibold text-ink-400">
                      {activeTab === "MAHASISWA" ? "Universitas" : "Perusahaan"}
                    </div>
                    <div className="mt-1 truncate font-bold text-ink-800">
                      {activeTab === "MAHASISWA"
                        ? user.university || "-"
                        : user.company || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-ink-400">
                      Tgl. Daftar
                    </div>
                    <div className="mt-1 font-bold text-ink-800">
                      {formatDate(user.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUserId(user.id)}
                    className="h-9 flex-1 rounded-lg border border-border bg-white text-xs font-bold text-ink-700 shadow-sm"
                  >
                    Lihat Detail
                  </button>
                  {isBanned ? (
                    <button
                      type="button"
                      onClick={() => unbanMutation.mutate(user.id)}
                      className="h-9 flex-1 rounded-lg border border-success-200 bg-success-50 text-xs font-bold text-success-700"
                    >
                      Pulihkan
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleBan(user.id, user.fullName || "User")}
                      className="h-9 flex-1 rounded-lg border border-danger-200 bg-danger-50 text-xs font-bold text-danger-700"
                    >
                      Blokir
                    </button>
                  )}
                </div>
              </div>
            );
          }}
        />
      )}

      <UserDetailDialog
        open={!!selectedUserId}
        onOpenChange={(open) => !open && setSelectedUserId(null)}
        userDetail={userDetail}
        isLoading={isLoadingDetail}
      />

      <ConfirmDialog
        open={banTarget !== null}
        onOpenChange={(open) => !open && setBanTarget(null)}
        title={`Blokir ${banTarget?.name ?? "user"}?`}
        description="User tidak akan bisa login atau menggunakan platform setelah diblokir. Anda dapat memulihkan akun kapan saja."
        confirmLabel="Blokir User"
        isLoading={banMutation.isPending}
        onConfirm={() => {
          if (banTarget) {
            banMutation.mutate(banTarget.id);
            setBanTarget(null);
          }
        }}
      />
    </div>
  );
}
