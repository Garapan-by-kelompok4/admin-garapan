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
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  total?: number;
  page?: number;
  limit?: number;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  total = 0,
  page = 1,
  limit = 10,
  isLoading = false,
  onPageChange,
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
      <div className="rounded-lg border border-border bg-white shadow-sh-1 overflow-hidden">
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

      {/* Pagination Controls */}
      {data.length > 0 && onPageChange && (
        <div className="flex items-center justify-between px-2 select-none">
          <div className="text-xs text-ink-400 font-medium">
            Menampilkan{" "}
            <span className="font-semibold text-ink-700">{startIdx}</span>-
            <span className="font-semibold text-ink-700">{endIdx}</span> dari{" "}
            <span className="font-semibold text-ink-700">{total}</span> data
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={!hasPreviousPage}
              className="h-8 w-8 rounded-lg border border-border bg-white flex items-center justify-center text-ink-500 hover:bg-surface-3 transition-colors disabled:opacity-40 disabled:hover:bg-white cursor-pointer disabled:cursor-default"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {getPageNumbers().map((p) => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`h-8 w-8 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  p === page
                    ? "bg-brand-500 border-brand-500 text-white shadow-sm"
                    : "border-border bg-white text-ink-700 hover:bg-surface-3"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={!hasNextPage}
              className="h-8 w-8 rounded-lg border border-border bg-white flex items-center justify-center text-ink-500 hover:bg-surface-3 transition-colors disabled:opacity-40 disabled:hover:bg-white cursor-pointer disabled:cursor-default"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
