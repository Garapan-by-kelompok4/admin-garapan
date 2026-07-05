import { Search, X } from "lucide-react";

interface DisputesToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export function DisputesToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: DisputesToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
      <div className="flex flex-1 max-w-sm relative">
        <Search className="absolute left-3 top-2.5 h-[15px] w-[15px] text-ink-400 pointer-events-none" />
        <input
          placeholder="Cari ID laporan, pelapor, terlapor..."
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
          <option value="Semua">Semua Laporan</option>
          <option value="Terbuka">Terbuka</option>
          <option value="Diproses">Diproses</option>
          <option value="Selesai">Selesai</option>
          <option value="Ditolak">Ditolak</option>
        </select>
      </div>
    </div>
  );
}
