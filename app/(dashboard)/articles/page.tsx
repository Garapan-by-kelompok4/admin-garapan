"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlertTriangle,
  ArrowLeft,
  Bold,
  BookOpen,
  Calendar,
  CheckCircle2,
  Edit2,
  FileEdit,
  FileText,
  Heading1,
  Heading2,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Plus,
  Quote,
  Redo2,
  Search,
  Sparkles,
  Tag,
  Trash2,
  Undo2,
  Unlink,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table/data-table";
import {
  Article,
  ArticleStatusFilter,
  articlesApi,
  CreateArticlePayload,
} from "@/lib/api/articles";
import {
  articleFormSchema,
  articleTagInputSchema,
  type ArticleFormInput,
} from "@/lib/validators/articles";

interface RichEditorProps {
  content: string;
  onChange: (html: string) => void;
}

function RichEditor({ content, onChange }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-brand-600 underline underline-offset-2",
        },
      }),
      Placeholder.configure({
        placeholder: "Tulis isi artikel di sini...",
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  const buttonClass = (active = false) =>
    `flex h-8 w-8 items-center justify-center rounded transition-all hover:bg-surface-3 ${
      active
        ? "border border-border bg-white text-brand-600 shadow-sm"
        : "text-ink-600"
    }`;

  const textButtonClass = (active = false) =>
    `flex h-8 items-center justify-center gap-1 rounded px-2 text-xs font-semibold transition-all hover:bg-surface-3 ${
      active
        ? "border border-border bg-white text-brand-600 shadow-sm"
        : "text-ink-600"
    }`;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Masukkan URL tautan", previousUrl ?? "https://");

    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run();
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-surface-2 p-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
          className={`${buttonClass()} disabled:cursor-not-allowed disabled:opacity-35`}
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
          className={`${buttonClass()} disabled:cursor-not-allowed disabled:opacity-35`}
        >
          <Redo2 className="h-4 w-4" />
        </button>
        <div className="mx-1 h-6 w-px self-center bg-border" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Tebal"
          className={buttonClass(editor.isActive("bold"))}
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Miring"
          className={buttonClass(editor.isActive("italic"))}
        >
          <Italic className="h-4 w-4" />
        </button>
        <div className="mx-1 h-6 w-px self-center bg-border" />
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          title="Judul 1"
          className={buttonClass(editor.isActive("heading", { level: 1 }))}
        >
          <Heading1 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          title="Judul 2"
          className={buttonClass(editor.isActive("heading", { level: 2 }))}
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="List Poin"
          className={textButtonClass(editor.isActive("bulletList"))}
        >
          <List className="h-4 w-4" />
          Poin
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="List Angka"
          className={textButtonClass(editor.isActive("orderedList"))}
        >
          <ListOrdered className="h-4 w-4" />
          Angka
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Kutipan"
          className={textButtonClass(editor.isActive("blockquote"))}
        >
          <Quote className="h-4 w-4" />
          Kutipan
        </button>
        <div className="mx-1 h-6 w-px self-center bg-border" />
        <button
          type="button"
          onClick={setLink}
          title="Tambah tautan"
          className={buttonClass(editor.isActive("link"))}
        >
          <LinkIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().extendMarkRange("link").unsetLink().run()
          }
          disabled={!editor.isActive("link")}
          title="Hapus tautan"
          className={`${buttonClass()} disabled:cursor-not-allowed disabled:opacity-35`}
        >
          <Unlink className="h-4 w-4" />
        </button>
      </div>
      <EditorContent
        editor={editor}
        className="min-h-[300px] max-h-[500px] overflow-y-auto p-4 prose prose-sm max-w-none [&_.ProseMirror]:min-h-[270px] [&_.ProseMirror]:focus:outline-none [&_.ProseMirror_.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_.is-editor-empty:first-child::before]:text-ink-300 [&_.ProseMirror_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]"
      />
    </div>
  );
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

function statusLabel(status: ArticleStatusFilter) {
  if (status === "draft") return "Draf";
  if (status === "published") return "Published";
  return "Semua";
}

const fallbackCategories = [
  "Umum",
  "Tips",
  "Tutorial",
  "Pengumuman",
  "Tren IT",
];

export default function ArticlesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ArticleStatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [isEditing, setIsEditing] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [isFetchingArticle, setIsFetchingArticle] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [coverRemoved, setCoverRemoved] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors, isValid },
  } = useForm<ArticleFormInput>({
    resolver: zodResolver(articleFormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      content: "",
      category: "Umum",
      tags: [],
      seoDescription: "",
    },
  });

  const {
    register: registerTag,
    handleSubmit: handleTagSubmit,
    reset: resetTag,
    formState: { errors: tagErrors },
  } = useForm<{ tag: string }>({
    resolver: zodResolver(articleTagInputSchema),
    defaultValues: { tag: "" },
  });

  const tags = watch("tags");
  const seoDescription = watch("seoDescription") ?? "";

  const limit = 10;

  const listQuery = useQuery({
    queryKey: [
      "articles",
      page,
      search,
      statusFilter,
      categoryFilter,
      tagFilter,
    ],
    queryFn: () =>
      articlesApi.list({
        page,
        limit,
        search: search || undefined,
        status: statusFilter,
        category: categoryFilter === "all" ? undefined : categoryFilter,
        tag: tagFilter === "all" ? undefined : tagFilter,
      }),
  });

  const categoriesQuery = useQuery({
    queryKey: ["article-categories"],
    queryFn: () => articlesApi.categories(),
  });

  const tagsQuery = useQuery({
    queryKey: ["article-tags"],
    queryFn: () => articlesApi.tags(),
  });

  const categoryOptions = useMemo(() => {
    return Array.from(
      new Set([...(categoriesQuery.data?.data ?? []), ...fallbackCategories]),
    ).filter(Boolean);
  }, [categoriesQuery.data?.data]);

  const tagOptions = tagsQuery.data?.data ?? [];

  const visibleArticles = useMemo(
    () => listQuery.data?.data ?? [],
    [listQuery.data?.data],
  );
  const pageStats = useMemo(() => {
    const published = visibleArticles.filter(
      (article) => article.status === "Published",
    ).length;
    const draft = visibleArticles.filter(
      (article) => article.status === "Draft",
    ).length;
    const views = visibleArticles.reduce(
      (total, article) => total + article.views,
      0,
    );
    const topArticle = [...visibleArticles].sort(
      (a, b) => b.views - a.views,
    )[0];
    return { published, draft, views, topArticle };
  }, [visibleArticles]);

  const fillEditor = (article: Article) => {
    reset({
      title: article.title,
      content: article.content,
      category: article.category || "Umum",
      tags: article.tags,
      seoDescription: article.seoDescription,
    });
    setCoverPreview(article.imageUrl);
    setCoverFile(null);
    setCoverRemoved(false);
  };

  const invalidateArticles = () => {
    queryClient.invalidateQueries({ queryKey: ["articles"] });
    queryClient.invalidateQueries({ queryKey: ["article-categories"] });
    queryClient.invalidateQueries({ queryKey: ["article-tags"] });
  };

  const resetEditor = () => {
    setIsEditing(false);
    setEditingArticleId(null);
    reset({
      title: "",
      content: "",
      category: "Umum",
      tags: [],
      seoDescription: "",
    });
    resetTag({ tag: "" });
    setCoverFile(null);
    setCoverPreview("");
    setCoverRemoved(false);
  };

  const saveMutation = useMutation({
    mutationFn: async (publishAfterSave: boolean) => {
      const values = getValues();
      let finalImageUrl = coverPreview;

      if (coverFile) {
        if (editingArticleId) {
          const updated = await articlesApi.replaceCover(
            editingArticleId,
            coverFile,
          );
          finalImageUrl = updated.imageUrl;
        } else {
          const uploaded = await articlesApi.uploadCover(coverFile);
          finalImageUrl = uploaded.imageUrl;
        }
      }

      const payload: CreateArticlePayload = {
        title: values.title.trim(),
        content: values.content,
        imageUrl: coverRemoved ? "" : finalImageUrl || undefined,
        category: values.category.trim() || "Umum",
        tags: values.tags,
        seoDescription: values.seoDescription?.trim() || undefined,
      };

      const saved = editingArticleId
        ? await articlesApi.update(editingArticleId, payload)
        : await articlesApi.create(payload);

      if (publishAfterSave) {
        return articlesApi.publish(saved.id);
      }

      return saved;
    },
    onSuccess: () => {
      toast.success(
        editingArticleId
          ? "Artikel berhasil diperbarui"
          : "Artikel baru berhasil dibuat",
      );
      invalidateArticles();
      resetEditor();
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Gagal menyimpan artikel",
      );
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => articlesApi.publish(id),
    onSuccess: () => {
      toast.success("Artikel berhasil dipublikasikan");
      invalidateArticles();
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "Gagal mempublikasikan artikel",
      ),
  });

  const unpublishMutation = useMutation({
    mutationFn: (id: string) => articlesApi.unpublish(id),
    onSuccess: () => {
      toast.success("Artikel ditarik kembali ke draf");
      invalidateArticles();
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Gagal menarik artikel"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => articlesApi.delete(id),
    onSuccess: (deleted) => {
      invalidateArticles();
      toast("Artikel dihapus", {
        description: "Artikel masuk soft delete dan tidak tampil di daftar.",
        action: {
          label: "Pulihkan",
          onClick: () => restoreMutation.mutate(deleted.id),
        },
      });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "Gagal menghapus artikel",
      ),
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => articlesApi.restore(id),
    onSuccess: () => {
      toast.success("Artikel dipulihkan sebagai draf");
      invalidateArticles();
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "Gagal memulihkan artikel",
      ),
  });

  const handleCreateNew = () => {
    resetEditor();
    setIsEditing(true);
  };

  const handleEditClick = async (id: string) => {
    setIsFetchingArticle(true);
    setEditingArticleId(id);
    setIsEditing(true);
    try {
      const article = await articlesApi.getById(id);
      fillEditor(article);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memuat artikel");
      resetEditor();
    } finally {
      setIsFetchingArticle(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("File cover harus berupa gambar");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 5 MB");
      return;
    }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setCoverRemoved(false);
  };

  const handleAddTag = handleTagSubmit(({ tag }) => {
    const currentTags = getValues("tags");
    if (currentTags.includes(tag)) {
      resetTag({ tag: "" });
      return;
    }
    setValue("tags", [...currentTags, tag], { shouldValidate: true });
    resetTag({ tag: "" });
  });

  const handleSave = handleSubmit(() => {
    saveMutation.mutate(false);
  });

  const handlePublish = handleSubmit(() => {
    saveMutation.mutate(true);
  });

  const columns: ColumnDef<Article>[] = [
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
      cell: ({ row }) => formatDate(row.original.publishedAt),
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
          {new Intl.NumberFormat("id-ID").format(row.original.views)}
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
              onClick={() => handleEditClick(article.id)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white text-ink-500 shadow-sm transition-colors hover:bg-surface-2 hover:text-brand-600"
              title="Edit artikel"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            {isPublished ? (
              <button
                type="button"
                onClick={() => unpublishMutation.mutate(article.id)}
                className="h-8 rounded-lg border border-border bg-white px-2.5 text-xs font-semibold text-ink-600 transition-colors hover:bg-surface-3"
              >
                Tarik Draf
              </button>
            ) : (
              <button
                type="button"
                onClick={() => publishMutation.mutate(article.id)}
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
                  deleteMutation.mutate(article.id);
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

  const canSave = isValid && !saveMutation.isPending;

  return (
    <div className="space-y-6">
      {!isEditing ? (
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
                  {new Intl.NumberFormat("id-ID").format(
                    listQuery.data?.total ?? 0,
                  )}
                </div>
                <div className="mt-1 text-[11px] font-medium text-ink-400">
                  Halaman ini: {pageStats.published} Published ·{" "}
                  {pageStats.draft} Draf
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
              onClick={handleCreateNew}
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
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className="h-[38px] w-full rounded-lg border border-border bg-white pl-9 pr-8 text-[13.5px] font-medium transition-all placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-3 focus:ring-brand-50"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="absolute right-2.5 top-2.5 bg-transparent p-0.5 text-ink-400 hover:text-ink-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as ArticleStatusFilter);
                setPage(1);
              }}
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
              onChange={(event) => {
                setCategoryFilter(event.target.value);
                setPage(1);
              }}
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
              onChange={(event) => {
                setTagFilter(event.target.value);
                setPage(1);
              }}
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

          {listQuery.error ? (
            <div className="rounded-xl border border-border bg-white p-8 text-center">
              <AlertTriangle className="mx-auto h-8 w-8 text-danger-500" />
              <h3 className="mt-2 font-heading text-sm font-bold text-ink-900">
                Gagal memuat data
              </h3>
              <p className="mt-1 text-xs text-ink-400">
                {listQuery.error instanceof Error
                  ? listQuery.error.message
                  : "Terjadi kesalahan koneksi"}
              </p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={visibleArticles}
              total={listQuery.data?.total ?? 0}
              page={page}
              limit={limit}
              isLoading={listQuery.isLoading}
              onPageChange={setPage}
            />
          )}
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <button
              type="button"
              onClick={resetEditor}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 shadow-sm transition-colors hover:bg-surface-3"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke List
            </button>
            <div className="text-xs font-semibold text-ink-400">
              {editingArticleId ? "Mengubah Artikel" : "Membuat Artikel Baru"}
            </div>
          </div>

          {isFetchingArticle ? (
            <div className="rounded-xl border border-border bg-white p-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
              <p className="mt-2 text-xs font-medium text-ink-500">
                Memuat data artikel...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
              <div className="space-y-5 rounded-xl border border-border bg-white p-5 shadow-sh-1 lg:col-span-2">
                <div className="space-y-1">
                  <input
                    type="text"
                    placeholder="Judul Artikel..."
                    className="w-full border-b border-border/80 pb-2 font-heading text-2xl font-extrabold tracking-tight text-ink-900 placeholder:text-ink-300 focus:border-brand-400 focus:outline-none"
                    aria-invalid={Boolean(errors.title)}
                    {...register("title")}
                  />
                  {errors.title && (
                    <p className="text-xs text-danger-500">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-ink-700">
                    Gambar Cover / Thumbnail (Rasio 16:7)
                  </span>
                  <div className="relative flex h-[180px] flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-surface-2 p-5 text-center">
                    {coverPreview ? (
                      <>
                        <img
                          src={coverPreview}
                          alt="Cover Preview"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                        <label
                          htmlFor="cover-file"
                          className="absolute bottom-3 left-3 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-bold text-brand-700 shadow-sm hover:bg-white"
                        >
                          Ganti cover
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setCoverFile(null);
                            setCoverPreview("");
                            setCoverRemoved(true);
                          }}
                          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                          title="Hapus Gambar"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center space-y-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink-400 shadow-sm">
                          <Upload className="h-5 w-5" />
                        </div>
                        <label
                          htmlFor="cover-file"
                          className="cursor-pointer text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline"
                        >
                          Pilih gambar cover
                        </label>
                        <p className="text-[10px] text-ink-400">
                          PNG, JPG, JPEG sampai dengan 5 MB
                        </p>
                      </div>
                    )}
                    <input
                      id="cover-file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-ink-700">
                    Isi Konten Artikel
                  </span>
                  <Controller
                    name="content"
                    control={control}
                    render={({ field }) => (
                      <RichEditor
                        content={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors.content && (
                    <p className="text-xs text-danger-500">
                      {errors.content.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4 rounded-xl border border-border bg-white p-5 shadow-sh-1">
                  <h3 className="border-b border-border pb-2.5 font-heading text-sm font-bold text-ink-900">
                    Pengaturan Publikasi
                  </h3>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink-700">
                      Kategori
                    </label>
                    <input
                      placeholder="Tulis kategori artikel..."
                      className="h-[38px] w-full rounded-lg border border-border bg-white px-3 text-xs font-medium text-ink-700 transition-all focus:border-brand-400 focus:outline-none focus:ring-3 focus:ring-brand-50"
                      aria-invalid={Boolean(errors.category)}
                      {...register("category")}
                    />
                    {errors.category && (
                      <p className="text-xs text-danger-500">
                        {errors.category.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink-700">
                      Tag Artikel
                    </label>
                    <form onSubmit={handleAddTag} className="flex gap-1.5">
                      <input
                        placeholder="Tekan enter untuk tambah..."
                        className="h-[36px] flex-1 rounded-lg border border-border bg-white px-3 text-xs font-medium transition-all placeholder:text-ink-300 focus:border-brand-400 focus:outline-none focus:ring-3 focus:ring-brand-50"
                        aria-invalid={Boolean(tagErrors.tag)}
                        {...registerTag("tag")}
                      />
                    </form>
                    {tagErrors.tag && (
                      <p className="text-xs text-danger-500">{tagErrors.tag.message}</p>
                    )}
                    {tagOptions.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {tagOptions.slice(0, 8).map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() =>
                              !tags.includes(option) &&
                              setValue("tags", [...tags, option], {
                                shouldValidate: true,
                              })
                            }
                            className="inline-flex items-center gap-1 rounded bg-surface-2 px-2 py-0.5 text-[10px] font-semibold text-ink-600 hover:bg-brand-50 hover:text-brand-700"
                          >
                            <Tag className="h-2.5 w-2.5" />
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1.5">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded border border-brand-100 bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() =>
                                setValue(
                                  "tags",
                                  tags.filter((item) => item !== tag),
                                  { shouldValidate: true },
                                )
                              }
                              className="bg-transparent p-0.5 text-brand-500 hover:text-brand-700"
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between">
                      <label className="text-xs font-bold text-ink-700">
                        SEO Meta Deskripsi
                      </label>
                      <span className="text-[10px] font-medium text-ink-400">
                        {seoDescription.length}/160
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Masukkan ringkasan singkat artikel untuk hasil pencarian Google..."
                      className="w-full resize-none rounded-lg border border-border bg-white p-2.5 text-xs font-medium transition-all placeholder:text-ink-300 focus:border-brand-400 focus:outline-none focus:ring-3 focus:ring-brand-50"
                      aria-invalid={Boolean(errors.seoDescription)}
                      {...register("seoDescription")}
                    />
                    {errors.seoDescription && (
                      <p className="text-xs text-danger-500">
                        {errors.seoDescription.message}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex flex-col gap-2 border-t border-border pt-2">
                    <button
                      type="button"
                      disabled={!canSave}
                      onClick={handlePublish}
                      className="flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-brand-500 text-xs font-bold text-white shadow-sm transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {saveMutation.isPending
                        ? "Menyimpan..."
                        : "Publikasikan Artikel"}
                    </button>
                    <button
                      type="button"
                      disabled={!canSave}
                      onClick={handleSave}
                      className="flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-white text-xs font-bold text-ink-700 transition-colors hover:bg-surface-3 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FileEdit className="h-4 w-4" />
                      Simpan ke Draf
                    </button>
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-brand-100 bg-brand-50/60 p-5 text-brand-850 shadow-sh-1">
                  <h4 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider">
                    <Sparkles className="h-4 w-4 text-brand-600" />
                    Tips Optimasi SEO
                  </h4>
                  <ul className="list-disc space-y-2 pl-4 text-[11.5px] font-medium leading-relaxed">
                    <li>Gunakan kata kunci utama di awal judul artikel.</li>
                    <li>
                      Deskripsi meta SEO idealnya berisikan 120 - 150 karakter.
                    </li>
                    <li>
                      Sematkan Heading (H2) untuk membagi struktur bacaan.
                    </li>
                    <li>
                      Tambahkan 2-4 tag relevan agar artikel mudah disaring
                      pembaca.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
