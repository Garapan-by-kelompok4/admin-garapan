"use client";

import React from "react";
import {
  ArrowLeft,
  CheckCircle2,
  FileEdit,
  Sparkles,
  Tag,
  Upload,
  X,
} from "lucide-react";
import { ArticleRichEditor } from "@/components/articles/article-rich-editor";

export interface ArticleEditorProps {
  editingArticleId: string | null;
  isFetchingArticle: boolean;
  title: string;
  onTitleChange: (value: string) => void;
  content: string;
  onContentChange: (value: string) => void;
  coverPreview: string;
  onCoverRemove: () => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  tags: string[];
  tagInput: string;
  onTagInputChange: (value: string) => void;
  onAddTag: (event: React.FormEvent) => void;
  onRemoveTag: (tag: string) => void;
  onAddTagOption: (tag: string) => void;
  tagOptions: string[];
  seoDescription: string;
  onSeoDescriptionChange: (value: string) => void;
  canSave: boolean;
  isSaving: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
  onBack: () => void;
}

export function ArticleEditor({
  editingArticleId,
  isFetchingArticle,
  title,
  onTitleChange,
  content,
  onContentChange,
  coverPreview,
  onCoverRemove,
  onFileChange,
  category,
  onCategoryChange,
  tags,
  tagInput,
  onTagInputChange,
  onAddTag,
  onRemoveTag,
  onAddTagOption,
  tagOptions,
  seoDescription,
  onSeoDescriptionChange,
  canSave,
  isSaving,
  onSaveDraft,
  onPublish,
  onBack,
}: ArticleEditorProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <button
          type="button"
          onClick={onBack}
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
            <input
              type="text"
              placeholder="Judul Artikel..."
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              className="w-full border-b border-border/80 pb-2 font-heading text-2xl font-extrabold tracking-tight text-ink-900 placeholder:text-ink-300 focus:border-brand-400 focus:outline-none"
            />

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
                      onClick={onCoverRemove}
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
                  onChange={onFileChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-ink-700">
                Isi Konten Artikel
              </span>
              <ArticleRichEditor content={content} onChange={onContentChange} />
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
                  value={category}
                  onChange={(event) => onCategoryChange(event.target.value)}
                  placeholder="Tulis kategori artikel..."
                  className="h-[38px] w-full rounded-lg border border-border bg-white px-3 text-xs font-medium text-ink-700 transition-all focus:border-brand-400 focus:outline-none focus:ring-3 focus:ring-brand-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink-700">
                  Tag Artikel
                </label>
                <form onSubmit={onAddTag} className="flex gap-1.5">
                  <input
                    placeholder="Tekan enter untuk tambah..."
                    value={tagInput}
                    onChange={(event) => onTagInputChange(event.target.value)}
                    className="h-[36px] flex-1 rounded-lg border border-border bg-white px-3 text-xs font-medium transition-all placeholder:text-ink-300 focus:border-brand-400 focus:outline-none focus:ring-3 focus:ring-brand-50"
                  />
                </form>
                {tagOptions.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {tagOptions.slice(0, 8).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => onAddTagOption(option)}
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
                          onClick={() => onRemoveTag(tag)}
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
                  value={seoDescription}
                  onChange={(event) =>
                    onSeoDescriptionChange(event.target.value.substring(0, 160))
                  }
                  className="w-full resize-none rounded-lg border border-border bg-white p-2.5 text-xs font-medium transition-all placeholder:text-ink-300 focus:border-brand-400 focus:outline-none focus:ring-3 focus:ring-brand-50"
                />
              </div>

              <div className="mt-4 flex flex-col gap-2 border-t border-border pt-2">
                <button
                  type="button"
                  disabled={!canSave}
                  onClick={onPublish}
                  className="flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-brand-500 text-xs font-bold text-white shadow-sm transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {isSaving ? "Menyimpan..." : "Publikasikan Artikel"}
                </button>
                <button
                  type="button"
                  disabled={!canSave}
                  onClick={onSaveDraft}
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
                <li>Sematkan Heading (H2) untuk membagi struktur bacaan.</li>
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
  );
}
