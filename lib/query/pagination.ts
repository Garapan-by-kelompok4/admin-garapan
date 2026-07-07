import { keepPreviousData } from "@tanstack/react-query";

/** Avoid table flicker while paginated list queries refetch (admin-requirements.md). */
export const paginatedListPlaceholder = keepPreviousData;

export interface PaginatedSlice<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginatedFetcher<T> {
  (page: number, limit: number): Promise<PaginatedSlice<T>>;
}

/** Fetch every page from a server-paginated endpoint (max `pageSize` per request). */
export async function fetchAllPaginated<T>(
  fetchPage: PaginatedFetcher<T>,
  pageSize = 100,
): Promise<T[]> {
  const first = await fetchPage(1, pageSize);
  const items = [...first.data];
  const totalPages = Math.max(1, Math.ceil(first.total / pageSize));

  if (totalPages <= 1) {
    return items;
  }

  const remaining = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      fetchPage(index + 2, pageSize),
    ),
  );

  for (const page of remaining) {
    items.push(...page.data);
  }

  return items;
}

/** Client-side pagination over an in-memory list. */
export function paginateSlice<T>(
  items: T[],
  page: number,
  limit: number,
): PaginatedSlice<T> {
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    total: items.length,
    page,
    limit,
  };
}
