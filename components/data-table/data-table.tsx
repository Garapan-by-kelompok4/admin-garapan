"use client";

import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  total?: number;
  page?: number;
  limit?: number;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
  mobileCard?: (row: TData) => React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  total = 0,
  page = 1,
  limit = 10,
  isLoading = false,
  onPageChange,
  mobileCard,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  const startIdx = (page - 1) * limit + 1;
  const endIdx = Math.min(page * limit, total);

  // Generate pagination buttons
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = startPage + maxVisible - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "rounded-lg border border-border bg-white shadow-sh-1 overflow-hidden",
          mobileCard && "hidden md:block",
        )}
      >
        <Table className="border-collapse separate border-spacing-0">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent border-b border-border"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="h-auto py-[11px] px-[18px] text-[11.5px] font-semibold uppercase tracking-[0.04em] text-ink-400 bg-surface-2 first:pl-[22px] last:pr-[22px]"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading Skeleton State
              Array.from({ length: limit }).map((_, idx) => (
                <TableRow
                  key={idx}
                  className="border-b border-border last:border-b-0"
                >
                  {columns.map((_, cellIdx) => (
                    <TableCell
                      key={cellIdx}
                      className="py-[14px] px-[18px] first:pl-[22px] last:pr-[22px]"
                    >
                      <Skeleton className="h-4 w-full bg-surface-3" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-[#F7F8FB] border-b border-border last:border-b-0 transition-all duration-100"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="py-[14px] px-[18px] text-[14px] text-ink-700 first:pl-[22px] last:pr-[22px]"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              // Empty State
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-72 text-center py-8"
                >
                  <div className="flex flex-col items-center justify-center space-y-2 select-none">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-ink-400">
                      <ChevronLeft className="h-6 w-6 rotate-45 stroke-[1.5]" />
                    </div>
                    <h3 className="font-heading font-bold text-sm text-ink-900 mt-2">
                      Tidak ada hasil
                    </h3>
                    <p className="text-xs text-ink-400 max-w-[280px]">
                      Coba sesuaikan kata kunci pencarian Anda atau periksa
                      filter yang sedang aktif.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {mobileCard && (
        <div className="space-y-3 md:hidden">
          {isLoading ? (
            Array.from({ length: Math.min(limit, 5) }).map((_, idx) => (
              <div
                key={idx}
                data-testid="mobile-data-card"
                className="rounded-lg border border-border bg-white p-4 shadow-sh-1"
              >
                <Skeleton className="h-4 w-2/3 bg-surface-3" />
                <Skeleton className="mt-3 h-3 w-full bg-surface-3" />
                <Skeleton className="mt-2 h-3 w-1/2 bg-surface-3" />
              </div>
            ))
          ) : data.length > 0 ? (
            data.map((row, idx) => (
              <div key={idx} data-testid="mobile-data-card">
                {mobileCard(row)}
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-border bg-white px-6 py-12 text-center shadow-sh-1">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-ink-400">
                <ChevronLeft className="h-6 w-6 rotate-45 stroke-[1.5]" />
              </div>
              <h3 className="mt-4 font-heading text-sm font-bold text-ink-900">
                Tidak ada hasil
              </h3>
              <p className="mx-auto mt-1 max-w-[280px] text-xs text-ink-400">
                Coba sesuaikan kata kunci pencarian Anda atau periksa filter
                yang sedang aktif.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {data.length > 0 && onPageChange && (
        <div className="flex flex-col gap-3 px-2 select-none sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-ink-400 font-medium">
            Menampilkan{" "}
            <span className="font-semibold text-ink-700">{startIdx}</span>-
            <span className="font-semibold text-ink-700">{endIdx}</span> dari{" "}
            <span className="font-semibold text-ink-700">{total}</span> data
          </div>

          <div className="flex items-center justify-between gap-1 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => onPageChange(page - 1)}
              disabled={!hasPreviousPage}
              className="h-8 w-8 bg-white text-ink-500 hover:bg-surface-3 disabled:hover:bg-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="hidden items-center gap-1 sm:flex">
              {getPageNumbers().map((p) => (
                <Button
                  key={p}
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => onPageChange(p)}
                  className={cn(
                    "h-8 w-8 text-xs font-bold",
                    p === page
                      ? "border-brand-500 bg-brand-500 text-white shadow-sm hover:bg-brand-500"
                      : "bg-white text-ink-700 hover:bg-surface-3",
                  )}
                >
                  {p}
                </Button>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => onPageChange(page + 1)}
              disabled={!hasNextPage}
              className="h-8 w-8 bg-white text-ink-500 hover:bg-surface-3 disabled:hover:bg-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
