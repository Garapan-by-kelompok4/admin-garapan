"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1);

  return (
    <div
      className={cn(
        "flex items-center justify-between border-t border-border px-5 py-3.5",
        className,
      )}
    >
      <div className="text-[13px] text-ink-400">
        Menampilkan <b className="text-ink-700">{start}–{end}</b> dari{" "}
        <b className="text-ink-700">{total}</b> data
      </div>
      <div className="flex items-center gap-1">
        <IconButton
          aria-label="Halaman sebelumnya"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft />
        </IconButton>
        {pages.map((n) => (
          <IconButton
            key={n}
            aria-label={`Halaman ${n}`}
            aria-current={n === page ? "page" : undefined}
            onClick={() => onPageChange(n)}
            className={cn(
              "text-[13px] font-semibold",
              n === page &&
                "border-brand-500 bg-brand-500 text-white hover:bg-brand-600 hover:text-white",
            )}
          >
            {n}
          </IconButton>
        ))}
        {totalPages > 5 && <span className="px-1 text-ink-400">…</span>}
        <IconButton
          aria-label="Halaman berikutnya"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight />
        </IconButton>
      </div>
    </div>
  );
}
