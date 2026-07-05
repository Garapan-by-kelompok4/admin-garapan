import { ColumnDef } from "@tanstack/react-table";
import { Edit2, FileText, Trash2 } from "lucide-react";
import { Article } from "@/lib/api/articles";
import { formatDate, formatNumber } from "@/lib/utils";

export interface ArticleColumnHandlers {
  onEdit: (id: string) => void;
  onPublish: (id: string) => void;
  onUnpublish: (id: string) => void;
  onDelete: (id: string) => void;
}

export function createArticleColumns(
  handlers: ArticleColumnHandlers,
): ColumnDef<Article>[] {
  return [
    {
      accessorKey: "title",
      header: "Artikel",
      cell: ({ row }) => (
        <div className="flex max-w-[340px] items-center gap-3.5">
          <div className="h-10 w-14 flex-shrink-0 overflow-hidden rounded border border-border bg-surface-2">
            {row.original.imageUrl ? (
              <img
                src={row.original.imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-surface-3">
                <FileText className="h-4 w-4 text-ink-300" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate font-semibold leading-snug text-ink-900">
              {row.original.title}
            </div>
            <div className="mt-1 font-mono text-[10px] text-ink-400">
              ID: {row.original.id}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Kategori",
      cell: ({ row }) => (
        <span className="inline-flex rounded border border-border bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-ink-600">
          {row.original.category || "Umum"}
        </span>
      ),
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }) => (
        <div className="flex max-w-[180px] flex-wrap gap-1">
          {row.original.tags.length > 0 ? (
            row.original.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-xs text-ink-400">-</span>
          )}
          {row.original.tags.length > 2 && (
            <span className="text-[10px] font-semibold text-ink-400">
              +{row.original.tags.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const isPublished = row.original.status === "Published";
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold ${
              isPublished
                ? "bg-success-50 text-success-700"
                : "bg-slate-50 text-slate-650"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${isPublished ? "bg-success-500" : "bg-slate-400"}`}
            />
            {isPublished ? "Published" : "Draft"}
          </span>
        );
      },
    },
    {
      accessorKey: "author",
      header: "Author",
      cell: ({ row }) => (
        <div className="text-xs">
          <div className="font-semibold text-ink-800">
            {row.original.author?.name ?? "Admin GARAPAN"}
          </div>
          <div className="text-ink-400">
            {row.original.author?.role ?? "Editor"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "publishedAt",
      header: "Tgl. Publikasi",
      cell: ({ row }) => formatDate(row.original.publishedAt ?? ""),
    },
    {
      accessorKey: "updatedAt",
      header: "Update",
      cell: ({ row }) => formatDate(row.original.updatedAt),
    },
    {
      accessorKey: "views",
      header: "Views",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-ink-900">
          {formatNumber(row.original.views)}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Aksi</span>,
      cell: ({ row }) => {
        const article = row.original;
        const isPublished = article.status === "Published";
        return (
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => handlers.onEdit(article.id)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white text-ink-500 shadow-sm transition-colors hover:bg-surface-2 hover:text-brand-600"
              title="Edit artikel"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            {isPublished ? (
              <button
                type="button"
                onClick={() => handlers.onUnpublish(article.id)}
                className="h-8 rounded-lg border border-border bg-white px-2.5 text-xs font-semibold text-ink-600 transition-colors hover:bg-surface-3"
              >
                Tarik Draf
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handlers.onPublish(article.id)}
                className="h-8 rounded-lg bg-brand-500 px-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-brand-600"
              >
                Terbitkan
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (
                  confirm(
                    "Hapus artikel ini? Artikel akan disembunyikan dari admin dan publik.",
                  )
                ) {
                  handlers.onDelete(article.id);
                }
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white text-danger-600 shadow-sm transition-colors hover:bg-danger-50"
              title="Hapus artikel"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      },
    },
  ];
}
