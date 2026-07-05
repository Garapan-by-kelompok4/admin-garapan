import { z } from "zod";

function hasArticleContent(html: string) {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim();
  return text.length > 0;
}

export const articleFormSchema = z.object({
  title: z.string().min(1, { message: "Judul artikel wajib diisi" }),
  content: z
    .string()
    .refine(hasArticleContent, { message: "Konten artikel wajib diisi" }),
  category: z.string().min(1, { message: "Kategori wajib diisi" }),
  tags: z.array(z.string()),
  seoDescription: z
    .string()
    .max(160, { message: "Deskripsi SEO maksimal 160 karakter" })
    .optional(),
});

export type ArticleFormInput = z.infer<typeof articleFormSchema>;

export const articleTagInputSchema = z.object({
  tag: z
    .string()
    .min(1, { message: "Tag tidak boleh kosong" })
    .transform((value) => value.trim())
    .pipe(z.string().min(1, { message: "Tag tidak boleh kosong" })),
});

export type ArticleTagInput = z.infer<typeof articleTagInputSchema>;
