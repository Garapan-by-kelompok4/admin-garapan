import { apiClient } from "./client";

export type ArticleStatus = "Published" | "Draft";
export type ArticleStatusFilter = "all" | "draft" | "published";

export interface ArticleAuthor {
  name: string;
  role: string;
  avatarUrl: string | null;
}

export interface Article {
  id: string;
  adminId?: string;
  title: string;
  content: string;
  imageUrl: string;
  thumbnailUrl: string;
  category: string;
  tags: string[];
  seoDescription: string;
  views: number;
  publishedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  status: ArticleStatus;
  author?: ArticleAuthor;
}

export interface ListArticlesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ArticleStatusFilter;
  category?: string;
  tag?: string;
}

export interface ListArticlesResponse {
  data: Article[];
  total: number;
  page: number;
  limit: number;
}

export interface ArticleTaxonomyResponse {
  data: string[];
  total: number;
}

export interface CreateArticlePayload {
  title: string;
  content: string;
  imageUrl?: string;
  category?: string;
  tags?: string[];
  seoDescription?: string;
}

export type UpdateArticlePayload = Partial<CreateArticlePayload>;

interface RawArticleAuthor {
  name?: unknown;
  role?: unknown;
  avatarUrl?: unknown;
}

interface RawArticle {
  id?: unknown;
  adminId?: unknown;
  admin_id?: unknown;
  title?: unknown;
  judul?: unknown;
  content?: unknown;
  imageUrl?: unknown;
  thumbnailUrl?: unknown;
  image_url?: unknown;
  thumbnail_url?: unknown;
  category?: unknown;
  kategori?: unknown;
  tags?: unknown;
  seoDescription?: unknown;
  seo_description?: unknown;
  views?: unknown;
  publishedAt?: unknown;
  published_at?: unknown;
  deletedAt?: unknown;
  deleted_at?: unknown;
  createdAt?: unknown;
  tanggal?: unknown;
  created_at?: unknown;
  updatedAt?: unknown;
  updated_at?: unknown;
  status?: unknown;
  author?: RawArticleAuthor;
}

interface RawListArticlesResponse {
  data?: RawArticle[];
  total?: number;
  page?: number;
  limit?: number;
}

interface RawTaxonomyResponse {
  data?: string[];
  total?: number;
}

function normaliseTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((tag): tag is string => typeof tag === "string");
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function stringOr(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function optionalString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function nullableString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function normaliseArticle(raw: RawArticle): Article {
  const publishedAt = raw.publishedAt ?? raw.published_at ?? null;
  const imageUrl =
    raw.imageUrl ??
    raw.thumbnailUrl ??
    raw.image_url ??
    raw.thumbnail_url ??
    "";

  return {
    id: stringOr(raw.id),
    adminId: optionalString(raw.adminId ?? raw.admin_id),
    title: stringOr(raw.title ?? raw.judul, "Tanpa Judul"),
    content: stringOr(raw.content),
    imageUrl: stringOr(imageUrl),
    thumbnailUrl: stringOr(imageUrl),
    category: stringOr(raw.category ?? raw.kategori, "Umum"),
    tags: normaliseTags(raw.tags),
    seoDescription: stringOr(raw.seoDescription ?? raw.seo_description),
    views: typeof raw.views === "number" ? raw.views : 0,
    publishedAt: nullableString(publishedAt),
    deletedAt: nullableString(raw.deletedAt ?? raw.deleted_at),
    createdAt: stringOr(
      raw.createdAt ?? raw.tanggal ?? raw.created_at,
      new Date().toISOString(),
    ),
    updatedAt: stringOr(
      raw.updatedAt ?? raw.updated_at ?? raw.createdAt,
      new Date().toISOString(),
    ),
    status: raw.status === "Draft" || !publishedAt ? "Draft" : "Published",
    author: raw.author
      ? {
          name: stringOr(raw.author.name, "Admin GARAPAN"),
          role: stringOr(raw.author.role, "Editor"),
          avatarUrl: nullableString(raw.author.avatarUrl),
        }
      : undefined,
  };
}

function buildArticlePayload(
  payload: CreateArticlePayload | UpdateArticlePayload,
) {
  const body: Record<string, unknown> = {};

  if (payload.title !== undefined) body.title = payload.title;
  if (payload.content !== undefined) body.content = payload.content;
  if (payload.imageUrl !== undefined) body.imageUrl = payload.imageUrl;
  if (payload.category !== undefined) body.category = payload.category;
  if (payload.tags !== undefined) body.tags = payload.tags;
  if (payload.seoDescription !== undefined)
    body.seoDescription = payload.seoDescription;

  return body;
}

async function uploadImage(
  path: string,
  file: File,
): Promise<{ imageUrl: string }> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`/api/proxy${path}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      typeof error.message === "string"
        ? error.message
        : `Upload failed with status ${response.status}`,
    );
  }

  const raw = await response.json();
  return { imageUrl: raw.imageUrl ?? "" };
}

export const articlesApi = {
  list: async (
    params: ListArticlesParams = {},
  ): Promise<ListArticlesResponse> => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.search) query.set("search", params.search);
    if (params.status) query.set("status", params.status);
    if (params.category) query.set("category", params.category);
    if (params.tag) query.set("tag", params.tag);

    const queryString = query.toString();
    const res = await apiClient<RawListArticlesResponse>(
      `/admin/artikel${queryString ? `?${queryString}` : ""}`,
    );

    return {
      data: (res.data ?? []).map(normaliseArticle),
      total: res.total ?? 0,
      page: res.page ?? params.page ?? 1,
      limit: res.limit ?? params.limit ?? 10,
    };
  },

  getById: async (id: string): Promise<Article> => {
    const raw = await apiClient<RawArticle>(`/admin/artikel/${id}`);
    return normaliseArticle(raw);
  },

  create: async (payload: CreateArticlePayload): Promise<Article> => {
    const raw = await apiClient<RawArticle>("/artikel", {
      method: "POST",
      body: JSON.stringify(buildArticlePayload(payload)),
    });
    return normaliseArticle(raw);
  },

  update: async (
    id: string,
    payload: UpdateArticlePayload,
  ): Promise<Article> => {
    const raw = await apiClient<RawArticle>(`/artikel/${id}`, {
      method: "PATCH",
      body: JSON.stringify(buildArticlePayload(payload)),
    });
    return normaliseArticle(raw);
  },

  publish: async (id: string): Promise<Article> => {
    const raw = await apiClient<RawArticle>(`/artikel/${id}/publish`, {
      method: "PATCH",
    });
    return normaliseArticle(raw);
  },

  unpublish: async (id: string): Promise<Article> => {
    const raw = await apiClient<RawArticle>(`/admin/artikel/${id}/unpublish`, {
      method: "PATCH",
    });
    return normaliseArticle(raw);
  },

  archive: async (id: string): Promise<Article> => {
    const raw = await apiClient<RawArticle>(`/admin/artikel/${id}/archive`, {
      method: "PATCH",
    });
    return normaliseArticle(raw);
  },

  delete: async (id: string): Promise<Article> => {
    const raw = await apiClient<RawArticle>(`/admin/artikel/${id}`, {
      method: "DELETE",
    });
    return normaliseArticle(raw);
  },

  restore: async (id: string): Promise<Article> => {
    const raw = await apiClient<RawArticle>(`/admin/artikel/${id}/restore`, {
      method: "POST",
    });
    return normaliseArticle(raw);
  },

  uploadCover: async (file: File): Promise<{ imageUrl: string }> => {
    return uploadImage("/admin/artikel/upload", file);
  },

  replaceCover: async (id: string, file: File): Promise<Article> => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`/api/proxy/admin/artikel/${id}/cover`, {
      method: "PATCH",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        typeof error.message === "string"
          ? error.message
          : `Upload failed with status ${response.status}`,
      );
    }

    return normaliseArticle(await response.json());
  },

  categories: async (): Promise<ArticleTaxonomyResponse> => {
    const res = await apiClient<RawTaxonomyResponse>("/artikel/categories");
    return { data: res.data ?? [], total: res.total ?? 0 };
  },

  tags: async (): Promise<ArticleTaxonomyResponse> => {
    const res = await apiClient<RawTaxonomyResponse>("/artikel/tags");
    return { data: res.data ?? [], total: res.total ?? 0 };
  },
};
