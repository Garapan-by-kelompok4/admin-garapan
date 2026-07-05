"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { usersApi } from "@/lib/api/users";
import { getErrorMessage } from "@/lib/utils";
import { DataTable } from "@/components/data-table/data-table";
import { UsersToolbar } from "@/components/users/users-toolbar";
import { createUsersColumns } from "@/components/users/users-columns";
import { UserDetailDialog } from "@/components/users/user-detail-dialog";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") ?? "";
  const [activeTab, setActiveTab] = useState<"MAHASISWA" | "KLIEN">(
    "MAHASISWA",
  );
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ["users", activeTab, page, search, statusFilter],
    queryFn: async () => {
      const res = await usersApi.list({
        page,
        limit,
        search: search || undefined,
        role: activeTab === "MAHASISWA" ? "MAHASISWA" : "KLIEN",
      });

      if (statusFilter !== "Semua") {
        const filtered = res.data.filter((u) => {
          const isBanned = u.bannedAt !== null;
          const isPending = !u.emailVerified;

          if (statusFilter === "Suspended") return isBanned;
          if (statusFilter === "Pending") return isPending && !isBanned;
          if (statusFilter === "Aktif") return !isBanned && !isPending;
          return true;
        });
        return {
          ...res,
          data: filtered,
          total: filtered.length,
        };
      }

      return res;
    },
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
    if (confirm(`Apakah Anda yakin ingin memblokir ${userName}?`)) {
      banMutation.mutate(userId);
    }
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
        />
      )}

      <UserDetailDialog
        open={!!selectedUserId}
        onOpenChange={(open) => !open && setSelectedUserId(null)}
        userDetail={userDetail}
        isLoading={isLoadingDetail}
      />
    </div>
  );
}
