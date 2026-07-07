import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserStatusFilter } from "@/lib/api/users";

type UserRoleTab = "MAHASISWA" | "KLIEN";

interface UsersToolbarProps {
  activeTab: UserRoleTab;
  onTabChange: (tab: UserRoleTab) => void;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: UserStatusFilter;
  onStatusFilterChange: (value: UserStatusFilter) => void;
}

export function UsersToolbar({
  activeTab,
  onTabChange,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: UsersToolbarProps) {
  const statusOptions: Array<{ value: UserStatusFilter; label: string }> = [
    { value: "Semua", label: "Semua Status" },
    { value: "Aktif", label: "Aktif" },
    { value: "Suspended", label: "Suspended" },
    { value: "Pending", label: "Pending" },
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-4 gap-4">
        <div className="flex border-b border-transparent">
          <button
            onClick={() => onTabChange("MAHASISWA")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "MAHASISWA"
                ? "border-brand-500 text-brand-600 font-bold"
                : "border-transparent text-ink-500 hover:text-ink-900"
            }`}
          >
            Mahasiswa
          </button>
          <button
            onClick={() => onTabChange("KLIEN")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "KLIEN"
                ? "border-brand-500 text-brand-600 font-bold"
                : "border-transparent text-ink-500 hover:text-ink-900"
            }`}
          >
            Klien
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        <div className="flex flex-1 max-w-sm relative">
          <Search className="absolute left-3 top-2.5 h-[15px] w-[15px] text-ink-400 pointer-events-none" />
          <input
            placeholder="Cari nama, email, kampus..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-[38px] pl-9 pr-8 bg-white border border-border rounded-lg text-[13.5px] placeholder:text-ink-400 focus:outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-50 transition-all font-medium"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-2.5 p-0.5 text-ink-400 hover:text-ink-700 bg-transparent border-0 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-white px-3 py-2 shadow-sh-1 md:justify-start">
          <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-ink-400 select-none">
            Status
          </span>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              if (typeof value === "string") {
                onStatusFilterChange(value as UserStatusFilter);
              }
            }}
          >
            <SelectTrigger className="h-7 min-w-[132px] border-0 bg-surface-2 px-2 py-0 text-[13px] font-semibold text-ink-800 shadow-none focus-visible:ring-0">
              <SelectValue>
                {(value) =>
                  statusOptions.find((option) => option.value === value)
                    ?.label ?? "Pilih status"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent align="end" className="min-w-[170px] p-1">
              {statusOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="px-2 py-1.5 text-[13px] font-semibold"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
}
