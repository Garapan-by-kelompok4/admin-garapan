"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { articlesApi, Article, CreateArticlePayload } from "@/lib/api/articles";
import { DataTable } from "@/components/data-table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { 
  AlertTriangle, 
  Search, 
  X,
  FileText,
  Calendar,
  Eye,
  Plus,
  BookOpen,
  ArrowLeft,
  Upload,
  Sparkles,
  HelpCircle,
  Folder,
  Tag,
  Share2,
  Trash2,
  Edit2,
  CheckCircle2,
  FileEdit
} from "lucide-react";
import { toast } from "sonner";

// --- TIPTAP EDITOR WRAPPER ---
interface RichEditorProps {
  content: string;
  onChange: (html: string) => void;
}

function RichEditor({ content, onChange }: RichEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // Keep editor content in sync when loaded from external source (like editing an article)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="bg-surface-2 border-b border-border p-2 flex flex-wrap gap-1 select-none">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`h-8 w-8 rounded text-xs font-bold transition-all hover:bg-surface-3 flex items-center justify-center cursor-pointer ${
            editor.isActive("bold") ? "bg-white text-brand-600 border border-border shadow-sm" : "text-ink-600"
          }`}
          title="Tebal"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`h-8 w-8 rounded text-xs italic transition-all hover:bg-surface-3 flex items-center justify-center cursor-pointer ${
            editor.isActive("italic") ? "bg-white text-brand-600 border border-border shadow-sm animate-none" : "text-ink-600"
          }`}
          title="Miring"
        >
          I
        </button>
        <div className="h-6 w-[1px] bg-border mx-1 self-center" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`h-8 px-2 rounded text-xs font-bold transition-all hover:bg-surface-3 flex items-center justify-center cursor-pointer ${
            editor.isActive("heading", { level: 1 }) ? "bg-white text-brand-600 border border-border shadow-sm" : "text-ink-600"
          }`}
          title="Judul 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`h-8 px-2 rounded text-xs font-bold transition-all hover:bg-surface-3 flex items-center justify-center cursor-pointer ${
            editor.isActive("heading", { level: 2 }) ? "bg-white text-brand-600 border border-border shadow-sm" : "text-ink-600"
          }`}
          title="Judul 2"
        >
          H2
        </button>
        <div className="h-6 w-[1px] bg-border mx-1 self-center" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`h-8 px-2 rounded text-xs font-semibold transition-all hover:bg-surface-3 flex items-center justify-center cursor-pointer ${
            editor.isActive("bulletList") ? "bg-white text-brand-600 border border-border shadow-sm" : "text-ink-600"
          }`}
          title="List Poin"
        >
          Poin
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`h-8 px-2 rounded text-xs font-semibold transition-all hover:bg-surface-3 flex items-center justify-center cursor-pointer ${
            editor.isActive("orderedList") ? "bg-white text-brand-600 border border-border shadow-sm" : "text-ink-600"
          }`}
          title="List Angka"
        >
          Angka
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`h-8 px-2 rounded text-xs font-semibold transition-all hover:bg-surface-3 flex items-center justify-center cursor-pointer ${
            editor.isActive("blockquote") ? "bg-white text-brand-600 border border-border shadow-sm" : "text-ink-600"
          }`}
          title="Kutipan"
        >
          Kutipan
        </button>
      </div>

      {/* Editor Content Area */}
      <EditorContent 
        editor={editor} 
        className="p-4 min-h-[300px] max-h-[500px] overflow-y-auto focus:outline-none prose prose-sm max-w-none [&_.ProseMirror]:focus:outline-none" 
      />
    </div>
  );
}

// --- MAIN CMS PAGE ---
export default function ArticlesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [page, setPage] = useState(1);
  
  // Page mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);

  // Editor Form States
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Tips Karir");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const limit = 10;

  // Mock stats summary
  const stats = {
    total: 47,
    published: 34,
    draft: 13,
    readers: "28.4K",
    topArticle: "Panduan Menjadi Freelancer Sukses saat Kuliah"
  };

  // Query articles list
  const { data, isLoading, error } = useQuery({
    queryKey: ["articles", page, search, categoryFilter],
    queryFn: async () => {
      const res = await articlesApi.list({
        page,
        limit,
        category: categoryFilter === "Semua" ? undefined : categoryFilter,
        search: search || undefined
      });
      return res;
    }
  });

  // Query single article for editing
  const { data: activeArticle, isFetching: isFetchingArticle } = useQuery<Article, Error>({
    queryKey: ["activeArticle", editingArticleId],
    queryFn: () => articlesApi.getById(editingArticleId!),
    enabled: !!editingArticleId,
  });

  // Sync state manually on success because v5 does not support onSuccess on useQuery anymore
  useEffect(() => {
    if (activeArticle && editingArticleId) {
      setTitle(activeArticle.title);
      setContent(activeArticle.content);
      setCategory(activeArticle.category);
      setTags(activeArticle.tags || []);
      setSeoDescription(activeArticle.seoDescription || "");
      setThumbnailPreview(activeArticle.thumbnailUrl || "");
      setThumbnailFile(null);
    }
  }, [activeArticle, editingArticleId]);

  // Mutation to Create/Update Article
  const saveMutation = useMutation({
    mutationFn: async (publishStatus: "Published" | "Draft") => {
      let finalThumbnailUrl = thumbnailPreview;

      // Upload thumbnail first if a new file is selected
      if (thumbnailFile) {
        setIsUploading(true);
        try {
          const uploadRes = await articlesApi.uploadThumbnail(thumbnailFile);
          finalThumbnailUrl = uploadRes.url;
        } catch (err) {
          toast.error("Gagal mengunggah gambar thumbnail. Menggunakan gambar default.");
        } finally {
          setIsUploading(false);
        }
      }

      // Build minimal payload matching backend DTO (title, content, imageUrl)
      const body: Record<string, unknown> = {
        title,
        content,
      };
      if (finalThumbnailUrl) body.thumbnailUrl = finalThumbnailUrl;

      if (editingArticleId) {
        return articlesApi.update(editingArticleId, body as any);
      }

      // Create the article first (always draft)
      const created = await articlesApi.create(body as any);

      // If user clicked "Publikasikan", publish after create
      if (publishStatus === "Published") {
        await articlesApi.publish(created.id);
      }

      return created;
    },
    onSuccess: (savedArticle) => {
      toast.success(
        editingArticleId 
          ? "Artikel berhasil diperbarui" 
          : "Artikel baru berhasil dibuat"
      );
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      // Reset & go back
      handleCancelEdit();
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal menyimpan artikel");
    }
  });

  // Mutation to Publish
  const publishMutation = useMutation({
    mutationFn: (id: string) => articlesApi.publish(id),
    onSuccess: () => {
      toast.success("Artikel berhasil dipublikasikan");
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal mempublikasikan artikel");
    }
  });

  // Mutation to Unpublish (Draft)
  const unpublishMutation = useMutation({
    mutationFn: (id: string) => articlesApi.unpublish(id),
    onSuccess: () => {
      toast.success("Artikel ditarik kembali ke draf");
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal menarik artikel");
    }
  });

  // Handle opening editor for creation
  const handleCreateNew = () => {
    setEditingArticleId(null);
    setTitle("");
    setContent("");
    setCategory("Tips Karir");
    setTags([]);
    setSeoDescription("");
    setThumbnailFile(null);
    setThumbnailPreview("");
    setIsEditing(true);
  };

  // Handle opening editor for modification
  const handleEditClick = (id: string) => {
    setEditingArticleId(id);
    setIsEditing(true);
  };

  // Close editor and clear
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingArticleId(null);
  };

  // Handle Thumbnail File input select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  // Handle Adding Tags
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const columns: ColumnDef<Article>[] = [
    {
      accessorKey: "title",
      header: "Artikel",
      cell: ({ row }) => (
        <div className="flex items-center gap-3.5 max-w-[280px]">
          <div className="h-10 w-14 rounded bg-surface-2 border border-border overflow-hidden flex-shrink-0 select-none">
            {row.original.thumbnailUrl ? (
              <img src={row.original.thumbnailUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-surface-3">
                <FileText className="h-4 w-4 text-ink-300" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-ink-900 truncate leading-snug">{row.original.title}</div>
            <div className="text-[10px] text-ink-400 mt-1 font-mono">ID: {row.original.id}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Kategori",
      cell: ({ getValue }: any) => (
        <span className="inline-flex px-2 py-0.5 rounded border border-border bg-surface-2 text-[11px] font-semibold text-ink-600">
          {getValue() || "Umum"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }: any) => {
        const isPublished = getValue() === "Published";
        return (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
            isPublished 
              ? "bg-success-50 text-success-700" 
              : "bg-slate-50 text-slate-650"
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isPublished ? "bg-success-500" : "bg-slate-400"}`} />
            {getValue()}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Tgl. Publikasi",
      cell: ({ getValue }: any) => formatDate(getValue()),
    },
    {
      accessorKey: "views",
      header: "Views",
      cell: ({ getValue }: any) => (
        <span className="font-mono font-semibold text-ink-900 text-xs">
          {new Intl.NumberFormat("id-ID").format(getValue() || 0)}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Aksi</span>,
      cell: ({ row }) => {
        const isPublished = row.original.status === "Published";
        return (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => handleEditClick(row.original.id)}
              className="h-8 w-8 rounded-lg border border-border bg-white flex items-center justify-center text-ink-500 hover:bg-surface-2 hover:text-brand-600 transition-colors shadow-sm cursor-pointer"
              title="Edit Artikel"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            {isPublished ? (
              <button
                onClick={() => {
                  if (confirm("Tarik artikel kembali ke draf?")) {
                    unpublishMutation.mutate(row.original.id);
                  }
                }}
                className="px-2.5 h-8 border border-border bg-white rounded-lg text-xs font-semibold text-ink-600 hover:bg-surface-3 transition-colors cursor-pointer"
              >
                Tarik Draf
              </button>
            ) : (
              <button
                onClick={() => publishMutation.mutate(row.original.id)}
                className="px-2.5 h-8 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                Terbitkan
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {!isEditing ? (
        // --- ARTICLES CMS LIST VIEW ---
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total count */}
            <div className="bg-white border border-border rounded-xl p-5 flex items-center gap-4 shadow-sh-1">
              <div className="h-11 w-11 rounded-lg flex items-center justify-center border border-brand-100 bg-brand-50 flex-shrink-0">
                <BookOpen className="h-5 w-5 text-brand-500" />
              </div>
              <div>
                <div className="text-xs text-ink-400 font-semibold">Total Artikel</div>
                <div className="text-2xl font-extrabold text-ink-900 mt-1 leading-none tracking-tight">
                  {stats.total}
                </div>
                <div className="text-[11px] text-ink-400 mt-1 font-medium">
                  {stats.published} Diterbitkan · {stats.draft} Draf
                </div>
              </div>
            </div>

            {/* Readers */}
            <div className="bg-white border border-border rounded-xl p-5 flex items-center gap-4 shadow-sh-1">
              <div className="h-11 w-11 rounded-lg flex items-center justify-center border border-success-100 bg-success-50 flex-shrink-0">
                <Share2 className="h-5 w-5 text-success-500" />
              </div>
              <div>
                <div className="text-xs text-ink-400 font-semibold">Total Pembaca (30 hari)</div>
                <div className="text-2xl font-extrabold text-ink-900 mt-1 leading-none tracking-tight">
                  {stats.readers}
                </div>
                <div className="text-[11px] text-success-700 mt-1 font-bold">
                  +18% peningkatan
                </div>
              </div>
            </div>

            {/* Popular article */}
            <div className="bg-white border border-border rounded-xl p-5 flex items-center gap-4 shadow-sh-1">
              <div className="h-11 w-11 rounded-lg flex items-center justify-center border border-warn-100 bg-warn-50 flex-shrink-0">
                <Sparkles className="h-5 w-5 text-warn-500" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-ink-400 font-semibold">Artikel Terpopuler</div>
                <div className="text-sm font-bold text-ink-900 mt-1 truncate max-w-[200px]" title={stats.topArticle}>
                  {stats.topArticle}
                </div>
                <div className="text-[10px] text-ink-400 mt-1.5 font-medium">
                  Views terbanyak bulan ini
                </div>
              </div>
            </div>
          </div>

          {/* Action Header bar */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 border-b border-border pb-4">
            <h2 className="font-heading font-bold text-base text-ink-900 leading-tight">
              Koleksi Artikel Edukasi
            </h2>
            <button
              onClick={handleCreateNew}
              className="h-9 px-4 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Buat Artikel Baru
            </button>
          </div>

          {/* Search bar & filter */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
            <div className="flex flex-1 max-w-sm relative">
              <Search className="absolute left-3 top-2.5 h-[15px] w-[15px] text-ink-400 pointer-events-none" />
              <input
                placeholder="Cari judul artikel..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full h-[38px] pl-9 pr-8 bg-white border border-border rounded-lg text-[13.5px] placeholder:text-ink-400 focus:outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-50 transition-all font-medium"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="absolute right-2.5 top-2.5 p-0.5 text-ink-400 hover:text-ink-700 bg-transparent border-0 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-500 font-semibold select-none">Kategori:</span>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="h-[38px] px-3 bg-white border border-border rounded-lg text-[13.5px] font-medium text-ink-700 focus:outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-50 transition-all cursor-pointer"
              >
                <option value="Semua">Semua Kategori</option>
                <option value="Tips Karir">Tips Karir</option>
                <option value="Tutorial">Tutorial</option>
                <option value="Pengumuman">Pengumuman</option>
                <option value="Tren IT">Tren IT</option>
              </select>
            </div>
          </div>

          {/* Articles Data Table */}
          {error ? (
            <div className="p-8 border border-border rounded-xl bg-white text-center">
              <AlertTriangle className="h-8 w-8 text-danger-500 mx-auto" />
              <h3 className="font-heading font-bold text-sm text-ink-900 mt-2">Gagal memuat data</h3>
              <p className="text-xs text-ink-400 mt-1">{(error as any).message || "Terjadi kesalahan koneksi"}</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={data?.data || []}
              total={data?.total || 0}
              page={page}
              limit={limit}
              isLoading={isLoading}
              onPageChange={setPage}
            />
          )}
        </>
      ) : (
        // --- ARTICLES CMS EDITOR VIEW ---
        <div className="space-y-6">
          {/* Header Action Back */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <button
              onClick={handleCancelEdit}
              className="px-3 py-1.5 border border-border bg-white text-xs font-semibold text-ink-700 rounded-lg hover:bg-surface-3 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" /> Kembali ke List
            </button>
            <div className="text-xs text-ink-400 font-semibold select-none">
              {editingArticleId ? "Mengubah Artikel" : "Membuat Artikel Baru"}
            </div>
          </div>

          {isFetchingArticle ? (
            <div className="p-12 text-center bg-white border border-border rounded-xl">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent mx-auto" />
              <p className="text-xs text-ink-500 mt-2 font-medium">Memuat data artikel...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* Left Column - Main Editor Block (flex-1/2 cols) */}
              <div className="lg:col-span-2 bg-white border border-border rounded-xl p-5 space-y-5 shadow-sh-1">
                
                {/* Title Input */}
                <input
                  type="text"
                  placeholder="Judul Artikel..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-2xl font-extrabold tracking-tight text-ink-900 border-b border-border/80 focus:border-brand-400 focus:outline-none pb-2 placeholder:text-ink-300 font-heading"
                />

                {/* Thumbnail upload wrapper */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-ink-700">Gambar Cover / Thumbnail (Rasio 16:7)</span>
                  <div className="border-2 border-dashed border-border rounded-lg p-5 bg-surface-2 flex flex-col items-center justify-center text-center relative overflow-hidden h-[180px]">
                    {thumbnailPreview ? (
                      <>
                        <img src={thumbnailPreview} alt="Cover Preview" className="absolute inset-0 h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setThumbnailFile(null);
                            setThumbnailPreview("");
                          }}
                          className="absolute top-3 right-3 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer border-0"
                          title="Hapus Gambar"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <div className="space-y-2 flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-ink-400 shadow-sm">
                          <Upload className="h-5 w-5" />
                        </div>
                        <div>
                          <label htmlFor="thumbnail-file" className="text-xs font-bold text-brand-600 hover:text-brand-700 cursor-pointer hover:underline">
                            Pilih gambar thumbnail
                          </label>
                          <input
                            type="file"
                            id="thumbnail-file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <p className="text-[10px] text-ink-400 mt-1">PNG, JPG, JPEG sampai dengan 5 MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* TipTap Rich Editor */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-ink-700">Isi Konten Artikel</span>
                  <RichEditor content={content} onChange={setContent} />
                </div>
              </div>

              {/* Right Column - Publish Settings Sidebar */}
              <div className="space-y-6">
                
                {/* Publication Settings */}
                <div className="bg-white border border-border rounded-xl p-5 space-y-4 shadow-sh-1">
                  <h3 className="font-heading font-bold text-sm text-ink-900 border-b border-border pb-2.5">
                    Pengaturan Publikasi
                  </h3>

                  {/* Category Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink-700">Kategori</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-[38px] px-3 bg-white border border-border rounded-lg text-xs font-medium text-ink-700 focus:outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-50 transition-all cursor-pointer"
                    >
                      <option value="Tips Karir">Tips Karir</option>
                      <option value="Tutorial">Tutorial</option>
                      <option value="Pengumuman">Pengumuman</option>
                      <option value="Tren IT">Tren IT</option>
                    </select>
                  </div>

                  {/* Tags Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink-700">Tag Artikel</label>
                    <form onSubmit={handleAddTag} className="flex gap-1.5">
                      <input
                        placeholder="Tekan enter untuk tambah..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        className="flex-1 h-[36px] px-3 bg-white border border-border rounded-lg text-xs placeholder:text-ink-300 focus:outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-50 transition-all font-medium"
                      />
                    </form>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1.5">
                        {tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-50 text-[10px] font-bold text-brand-700 border border-brand-100"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(idx)}
                              className="text-brand-500 hover:text-brand-700 p-0.5 bg-transparent border-0 cursor-pointer"
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* SEO Meta Description */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-baseline">
                      <label className="text-xs font-bold text-ink-700">SEO Meta Deskripsi</label>
                      <span className="text-[10px] text-ink-400 font-medium">
                        {seoDescription.length}/160
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Masukkan ringkasan singkat artikel untuk hasil pencarian Google..."
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value.substring(0, 160))}
                      className="w-full p-2.5 bg-white border border-border rounded-lg text-xs placeholder:text-ink-300 focus:outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-50 transition-all font-medium resize-none"
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-border mt-4">
                    <button
                      type="button"
                      disabled={saveMutation.isPending || !title.trim() || !content.trim() || isUploading}
                      onClick={() => saveMutation.mutate("Published")}
                      className="w-full h-10 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {saveMutation.isPending ? "Menyimpan..." : "Publikasikan Artikel"}
                    </button>
                    <button
                      type="button"
                      disabled={saveMutation.isPending || !title.trim() || !content.trim() || isUploading}
                      onClick={() => saveMutation.mutate("Draft")}
                      className="w-full h-10 border border-border bg-white text-ink-700 hover:bg-surface-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FileEdit className="h-4 w-4" />
                      Simpan ke Draf
                    </button>
                  </div>
                </div>

                {/* SEO Tips */}
                <div className="bg-brand-50/60 border border-brand-100 rounded-xl p-5 space-y-3 shadow-sh-1 text-brand-850">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-brand-600 animate-pulse" /> Tips Optimasi SEO
                  </h4>
                  <ul className="text-[11.5px] space-y-2 list-disc pl-4 font-medium leading-relaxed">
                    <li>Gunakan kata kunci utama di awal judul artikel.</li>
                    <li>Deskripsi meta SEO idealnya berisikan 120 - 150 karakter untuk snippet hasil pencarian Google.</li>
                    <li>Sematkan Heading (H2) untuk membagi struktur bacaan agar nyaman dibaca.</li>
                    <li>Tambahkan 2-4 tag relevan agar artikel mudah disaring pembaca.</li>
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
