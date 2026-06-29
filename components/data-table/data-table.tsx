"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Inbox } from "lucide-react";

import { Pagination } from "@/components/data-table/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Server-side pagination — omit to render a static table without a footer. */
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyHint?: string;
};

/**
 * Shared table for every list page (rule #1). Generic over its data; the page
 * owns the query and pagination state. Server-side pagination model — pass
 * `total`/`page`/`onPageChange` to show the footer.
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  total,
  page,
  pageSize = 10,
  onPageChange,
  isLoading,
  emptyTitle = "Tidak ada hasil",
  emptyHint = "Coba ubah filter atau kata kunci pencarian.",
}: DataTableProps<TData, TValue>) {
  // TanStack Table returns non-memoizable functions; React Compiler skips
  // memoizing this component, which is the expected/supported behavior here.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  const rows = table.getRowModel().rows;

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="h-auto bg-surface-2 px-[18px] py-[11px] text-[11.5px] font-semibold uppercase tracking-[0.04em] text-ink-400"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: pageSize }).map((_, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-transparent">
                {columns.map((_, cellIndex) => (
                  <TableCell key={cellIndex} className="px-[18px] py-[14px]">
                    <Skeleton className="h-4 w-full max-w-[160px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length ? (
            rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-surface-2">
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="px-[18px] py-[14px] text-[13.5px] text-ink-700"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="p-0">
                <EmptyState icon={Inbox} title={emptyTitle} hint={emptyHint} />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {typeof total === "number" && typeof page === "number" && onPageChange && (
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
