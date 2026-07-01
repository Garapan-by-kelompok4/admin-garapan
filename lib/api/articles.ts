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
    const res = await apiClient<ListArticlesResponse>(path);
    
    // Normalise fields to match the UI requirements and support both forms
    return {
      ...res,
      data: res.data.map((art) => ({
        ...art,
        title: art.title || art.judul || "Tanpa Judul",
        judul: art.judul || art.title || "Tanpa Judul",
        createdAt: art.createdAt || art.tanggal || new Date().toISOString(),
        tanggal: art.tanggal || art.createdAt || new Date().toISOString(),
        category: art.category || art.kategori || "Umum",
        kategori: art.kategori || art.category || "Umum",
        status: art.status || "Draft",
        views: typeof art.views === "number" ? art.views : 0,
      })),
    };
  },

  getById: async (id: string): Promise<Article> => {
    const art = await apiClient<Article>(`/admin/artikel/${id}`);
    return {
      ...art,
      title: art.title || art.judul || "Tanpa Judul",
      judul: art.judul || art.title || "Tanpa Judul",
      createdAt: art.createdAt || art.tanggal || new Date().toISOString(),
      tanggal: art.tanggal || art.createdAt || new Date().toISOString(),
      category: art.category || art.kategori || "Umum",
      kategori: art.kategori || art.category || "Umum",
    };
  },

  create: async (payload: CreateArticlePayload): Promise<Article> => {
    return apiClient<Article>("/artikel", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update: async (id: string, payload: UpdateArticlePayload): Promise<Article> => {
    return apiClient<Article>(`/artikel/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  publish: async (id: string): Promise<void> => {
    return apiClient<void>(`/artikel/${id}/publish`, {
      method: "PATCH",
    });
  },

  unpublish: async (id: string): Promise<void> => {
    return apiClient<void>(`/artikel/${id}/unpublish`, {
      method: "PATCH",
    });
  },

  uploadThumbnail: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("image", file);

    return apiClient<{ url: string }>("/admin/artikel/upload", {
      method: "POST",
      // Let fetch set the boundary header for FormData automatically
      headers: {},
      body: formData,
    });
  },
};
