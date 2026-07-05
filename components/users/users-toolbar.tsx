import { Search, X } from "lucide-react";

type UserRoleTab = "MAHASISWA" | "KLIEN";

interface UsersToolbarProps {
  activeTab: UserRoleTab;
  onTabChange: (tab: UserRoleTab) => void;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export function UsersToolbar({
  activeTab,
  onTabChange,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: UsersToolbarProps) {
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

        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-500 font-semibold select-none">
            Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="h-[38px] px-3 bg-white border border-border rounded-lg text-[13.5px] font-medium text-ink-700 focus:outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-50 transition-all cursor-pointer"
          >
            <option value="Semua">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Suspended">Suspended</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>
    </>
  );
}
