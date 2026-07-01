import { apiClient } from "./client";

export interface Article {
  id: string;
  title: string;
  content: string;
  thumbnailUrl?: string;
  category: string;
  status: "Published" | "Draft";
  createdAt: string;
  views: number;
  tags?: string[];
  seoDescription?: string;
  // Indonesian compatibility matching the design handoff
  judul?: string;
  tanggal?: string;
  kategori?: string;
}

export interface ListArticlesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
}

export interface ListArticlesResponse {
  data: Article[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateArticlePayload {
  title: string;
  content: string;
  category: string;
  thumbnailUrl?: string;
  tags?: string[];
  seoDescription?: string;
  status?: "Published" | "Draft";
}

export interface UpdateArticlePayload extends Partial<CreateArticlePayload> {}

function normaliseArticle(art: any): Article {
  return {
    id: art.id,
    title: art.title ?? art.judul ?? "Tanpa Judul",
    content: art.content ?? "",
    thumbnailUrl: art.thumbnailUrl ?? art.imageUrl ?? art.thumbnail_url ?? "",
    category: art.category ?? art.kategori ?? "Umum",
    status: art.published === true ? "Published" : art.published === false ? "Draft" : (art.status || "Draft"),
    createdAt: art.createdAt ?? art.tanggal ?? art.created_at ?? new Date().toISOString(),
    views: typeof art.views === "number" ? art.views : 0,
    tags: art.tags ?? [],
    seoDescription: art.seoDescription ?? art.seo_description ?? "",
  };
}

export const articlesApi = {
  list: async (params: ListArticlesParams = {}): Promise<ListArticlesResponse> => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.search) query.set("search", params.search);
    if (params.status) query.set("status", params.status);
    if (params.category) query.set("category", params.category);

    const queryString = query.toString();
    const path = `/admin/artikel${queryString ? `?${queryString}` : ""}`;
    const res = await apiClient<any>(path);

    return {
      data: (res.data ?? []).map(normaliseArticle),
      total: res.total ?? 0,
      page: res.page ?? 1,
      limit: res.limit ?? 10,
    };
  },

  getById: async (id: string): Promise<Article> => {
    const art = await apiClient<any>(`/admin/artikel/${id}`);
    return normaliseArticle(art);
  },

  create: async (payload: CreateArticlePayload): Promise<Article> => {
    const body: Record<string, unknown> = {
      title: payload.title,
      content: payload.content,
    };
    if (payload.thumbnailUrl) body.imageUrl = payload.thumbnailUrl;

    const res = await apiClient<any>("/artikel", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return normaliseArticle(res);
  },

  update: async (id: string, payload: UpdateArticlePayload): Promise<Article> => {
    const body: Record<string, unknown> = {};
    if (payload.title) body.title = payload.title;
    if (payload.content) body.content = payload.content;
    if (payload.thumbnailUrl) body.imageUrl = payload.thumbnailUrl;

    const res = await apiClient<any>(`/admin/artikel/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return normaliseArticle(res);
  },

  publish: async (id: string): Promise<void> => {
    return apiClient<void>(`/artikel/${id}/publish`, {
      method: "PATCH",
    });
  },

  unpublish: async (id: string): Promise<void> => {
    return apiClient<void>(`/admin/artikel/${id}/unpublish`, {
      method: "PATCH",
    });
  },

  uploadThumbnail: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("image", file);

    return apiClient<{ url: string }>("/admin/artikel/upload", {
      method: "POST",
      headers: {},
      body: formData,
    });
  },
};
