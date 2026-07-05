import { Search, X } from "lucide-react";

interface ModerationToolbarProps {
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

const STATUS_OPTIONS = [
  "Semua",
  "Ditinjau",
  "Aman",
  "Dihapus",
  "Disembunyikan",
] as const;

export function ModerationToolbar({
  statusFilter,
  onStatusFilterChange,
  search,
  onSearchChange,
}: ModerationToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
      <div className="flex bg-surface-3/50 p-1 rounded-lg border border-border/80 self-start select-none">
        {STATUS_OPTIONS.map((st) => (
          <button
            key={st}
            onClick={() => onStatusFilterChange(st)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              statusFilter === st
                ? "bg-white text-ink-900 shadow-sm border border-border/30 font-bold"
                : "text-ink-500 hover:text-ink-900"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      <div className="flex max-w-xs relative w-full md:w-64">
        <Search className="absolute left-3 top-2.5 h-[15px] w-[15px] text-ink-400 pointer-events-none" />
        <input
          placeholder="Cari judul jasa atau pemilik..."
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
    </div>
  );
}
