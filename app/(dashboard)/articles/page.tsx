"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ArticleEditorSkeleton } from "@/components/articles/article-editor-skeleton";

const ArticleEditor = dynamic(
  () =>
    import("@/components/articles/article-editor").then((m) => m.ArticleEditor),
  { ssr: false, loading: () => <ArticleEditorSkeleton /> },
);
import { createArticleColumns } from "@/components/articles/article-columns";
import { ArticleList } from "@/components/articles/article-list";
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
import { paginatedListPlaceholder } from "@/lib/query/pagination";

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
    reset,
    watch,
    setValue,
    getValues,
    formState: { isValid },
  } = useForm<ArticleFormInput>({
    resolver: zodResolver(articleFormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      content: "",
      category: "",
      tags: [],
      seoDescription: "",
    },
  });

  const [tagInput, setTagInput] = useState("");

  const title = watch("title");
  const content = watch("content");
  const category = watch("category");
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
    placeholderData: paginatedListPlaceholder,
  });

  const categoriesQuery = useQuery({
    queryKey: ["article-categories"],
    queryFn: () => articlesApi.categories(),
  });

  const tagsQuery = useQuery({
    queryKey: ["article-tags"],
    queryFn: () => articlesApi.tags(),
  });

  const categoryOptions = useMemo(
    () => categoriesQuery.data?.data ?? [],
    [categoriesQuery.data?.data],
  );

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
      category: article.category || categoryOptions[0] || "",
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
      category: categoryOptions[0] || "",
      tags: [],
      seoDescription: "",
    });
    setTagInput("");
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
        category: values.category.trim() || categoryOptions[0] || "",
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

  const handleAddTag = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = articleTagInputSchema.safeParse({ tag: tagInput });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Tag tidak valid");
      return;
    }
    const tag = parsed.data.tag;
    const currentTags = getValues("tags");
    if (currentTags.includes(tag)) {
      setTagInput("");
      return;
    }
    setValue("tags", [...currentTags, tag], { shouldValidate: true });
    setTagInput("");
  };

  const columns = useMemo(
    () =>
      createArticleColumns({
        onEdit: handleEditClick,
        onPublish: (id) => publishMutation.mutate(id),
        onUnpublish: (id) => unpublishMutation.mutate(id),
        onDelete: (id) => deleteMutation.mutate(id),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [publishMutation, unpublishMutation, deleteMutation],
  );

  const canSave = isValid && !saveMutation.isPending;

  return (
    <div className="space-y-6">
      {!isEditing ? (
        <ArticleList
          total={listQuery.data?.total ?? 0}
          pageStats={pageStats}
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          statusFilter={statusFilter}
          onStatusFilterChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={(value) => {
            setCategoryFilter(value);
            setPage(1);
          }}
          tagFilter={tagFilter}
          onTagFilterChange={(value) => {
            setTagFilter(value);
            setPage(1);
          }}
          categoryOptions={categoryOptions}
          tagOptions={tagOptions}
          columns={columns}
          visibleArticles={visibleArticles}
          page={page}
          limit={limit}
          isLoading={listQuery.isLoading}
          error={listQuery.error}
          onPageChange={setPage}
          onCreateNew={handleCreateNew}
        />
      ) : (
        <ArticleEditor
          editingArticleId={editingArticleId}
          isFetchingArticle={isFetchingArticle}
          title={title}
          onTitleChange={(value) =>
            setValue("title", value, { shouldValidate: true })
          }
          content={content}
          onContentChange={(value) =>
            setValue("content", value, { shouldValidate: true })
          }
          coverPreview={coverPreview}
          onCoverRemove={() => {
            setCoverFile(null);
            setCoverPreview("");
            setCoverRemoved(true);
          }}
          onFileChange={handleFileChange}
          category={category}
          onCategoryChange={(value) =>
            setValue("category", value, { shouldValidate: true })
          }
          tags={tags}
          tagInput={tagInput}
          onTagInputChange={setTagInput}
          onAddTag={handleAddTag}
          onRemoveTag={(tag) =>
            setValue(
              "tags",
              tags.filter((item) => item !== tag),
              { shouldValidate: true },
            )
          }
          onAddTagOption={(option) => {
            if (!tags.includes(option)) {
              setValue("tags", [...tags, option], { shouldValidate: true });
            }
          }}
          tagOptions={tagOptions}
          seoDescription={seoDescription}
          onSeoDescriptionChange={(value) =>
            setValue("seoDescription", value, { shouldValidate: true })
          }
          canSave={canSave}
          isSaving={saveMutation.isPending}
          onSaveDraft={() => saveMutation.mutate(false)}
          onPublish={() => saveMutation.mutate(true)}
          onBack={resetEditor}
        />
      )}
    </div>
  );
}
