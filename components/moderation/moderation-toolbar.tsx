import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ModerationTypeFilter = "Semua" | "jasa" | "project";

interface ModerationToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: ModerationTypeFilter;
  onTypeFilterChange: (value: ModerationTypeFilter) => void;
}

export function ModerationToolbar({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
}: ModerationToolbarProps) {
  const typeOptions = [
    { value: "Semua" as const, label: "Semua Tipe" },
    { value: "jasa" as const, label: "Jasa" },
    { value: "project" as const, label: "Proyek" },
  ];

  return (
    <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
      <div className="flex flex-1 max-w-sm relative">
        <Search className="absolute left-3 top-2.5 h-[15px] w-[15px] text-ink-400 pointer-events-none" />
        <input
          placeholder="Cari judul jasa/proyek, ID, atau pemilik..."
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
          Tipe
        </span>
        <Select
          value={typeFilter}
          onValueChange={(value) => {
            if (
              value === "Semua" ||
              value === "jasa" ||
              value === "project"
            ) {
              onTypeFilterChange(value);
            }
          }}
        >
          <SelectTrigger className="h-7 min-w-[132px] border-0 bg-surface-2 px-2 py-0 text-[13px] font-semibold text-ink-800 shadow-none focus-visible:ring-0">
            <SelectValue>
              {(value) =>
                typeOptions.find((option) => option.value === value)?.label ??
                "Pilih tipe"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent align="end" className="min-w-[170px] p-1">
            {typeOptions.map((option) => (
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
  );
}
