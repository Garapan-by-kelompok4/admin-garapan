"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import {
  Article,
  ArticleStatusFilter,
} from "@/lib/api/articles";

export function statusLabel(status: ArticleStatusFilter) {
  if (status === "draft") return "Draf";
  if (status === "published") return "Published";
  return "Semua";
}

export interface ArticleListPageStats {
  published: number;
  draft: number;
  views: number;
  topArticle?: Article;
}

export interface ArticleListProps {
  total: number;
  pageStats: ArticleListPageStats;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: ArticleStatusFilter;
  onStatusFilterChange: (value: ArticleStatusFilter) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  tagFilter: string;
  onTagFilterChange: (value: string) => void;
  categoryOptions: string[];
  tagOptions: string[];
  columns: ColumnDef<Article>[];
  visibleArticles: Article[];
  page: number;
  limit: number;
  isLoading: boolean;
  error: Error | null;
  onPageChange: (page: number) => void;
  onCreateNew: () => void;
}

export function ArticleList({
  total,
  pageStats,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  tagFilter,
  onTagFilterChange,
  categoryOptions,
  tagOptions,
  columns,
  visibleArticles,
  page,
  limit,
  isLoading,
  error,
  onPageChange,
  onCreateNew,
}: ArticleListProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-border bg-white p-5 shadow-sh-1">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-brand-100 bg-brand-50">
            <BookOpen className="h-5 w-5 text-brand-500" />
          </div>
          <div>
            <div className="text-xs font-semibold text-ink-400">
              Total Artikel
            </div>
            <div className="mt-1 text-2xl font-extrabold leading-none tracking-tight text-ink-900">
              {new Intl.NumberFormat("id-ID").format(total)}
            </div>
            <div className="mt-1 text-[11px] font-medium text-ink-400">
              Halaman ini: {pageStats.published} Published · {pageStats.draft}{" "}
              Draf
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-border bg-white p-5 shadow-sh-1">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-success-100 bg-success-50">
            <Calendar className="h-5 w-5 text-success-500" />
          </div>
          <div>
            <div className="text-xs font-semibold text-ink-400">
              Total Views Halaman Ini
            </div>
            <div className="mt-1 text-2xl font-extrabold leading-none tracking-tight text-ink-900">
              {new Intl.NumberFormat("id-ID").format(pageStats.views)}
            </div>
            <div className="mt-1 text-[11px] font-bold text-success-700">
              Berdasarkan hasil filter aktif
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-border bg-white p-5 shadow-sh-1">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-warn-100 bg-warn-50">
            <Sparkles className="h-5 w-5 text-warn-500" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-ink-400">
              Artikel Terpopuler
            </div>
            <div
              className="mt-1 max-w-[240px] truncate text-sm font-bold text-ink-900"
              title={pageStats.topArticle?.title}
            >
              {pageStats.topArticle?.title ?? "-"}
            </div>
            <div className="mt-1.5 text-[10px] font-medium text-ink-400">
              {pageStats.topArticle
                ? `${pageStats.topArticle.views} views pada hasil filter`
                : "Belum ada data"}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-stretch justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
        <h2 className="font-heading text-base font-bold leading-tight text-ink-900">
          Koleksi Artikel Edukasi
        </h2>
        <button
          type="button"
          onClick={onCreateNew}
          className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-brand-500 px-4 text-xs font-bold text-white shadow-sm transition-colors hover:bg-brand-600"
        >
          <Plus className="h-4 w-4" />
          Buat Artikel Baru
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(260px,1fr)_auto_auto_auto] lg:items-center">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-[15px] w-[15px] text-ink-400" />
          <input
            placeholder="Cari judul artikel..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-[38px] w-full rounded-lg border border-border bg-white pl-9 pr-8 text-[13.5px] font-medium transition-all placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-3 focus:ring-brand-50"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-2.5 bg-transparent p-0.5 text-ink-400 hover:text-ink-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            onStatusFilterChange(event.target.value as ArticleStatusFilter)
          }
          className="h-[38px] rounded-lg border border-border bg-white px-3 text-[13.5px] font-medium text-ink-700 transition-all focus:border-brand-400 focus:outline-none focus:ring-3 focus:ring-brand-50"
        >
          {(["all", "published", "draft"] as ArticleStatusFilter[]).map(
            (status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ),
          )}
        </select>

        <select
          value={categoryFilter}
          onChange={(event) => onCategoryFilterChange(event.target.value)}
          className="h-[38px] rounded-lg border border-border bg-white px-3 text-[13.5px] font-medium text-ink-700 transition-all focus:border-brand-400 focus:outline-none focus:ring-3 focus:ring-brand-50"
        >
          <option value="all">Semua Kategori</option>
          {categoryOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={tagFilter}
          onChange={(event) => onTagFilterChange(event.target.value)}
          className="h-[38px] rounded-lg border border-border bg-white px-3 text-[13.5px] font-medium text-ink-700 transition-all focus:border-brand-400 focus:outline-none focus:ring-3 focus:ring-brand-50"
        >
          <option value="all">Semua Tag</option>
          {tagOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <div className="rounded-xl border border-border bg-white p-8 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-danger-500" />
          <h3 className="mt-2 font-heading text-sm font-bold text-ink-900">
            Gagal memuat data
          </h3>
          <p className="mt-1 text-xs text-ink-400">
            {error.message || "Terjadi kesalahan koneksi"}
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={visibleArticles}
          total={total}
          page={page}
          limit={limit}
          isLoading={isLoading}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
}
