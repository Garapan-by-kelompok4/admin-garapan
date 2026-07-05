import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().min(1, { message: "Nama lengkap wajib diisi" }),
  phone: z.string().optional(),
  bio: z.string().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, { message: "Password lama wajib diisi" }),
    newPassword: z
      .string()
      .min(6, { message: "Password baru minimal 6 karakter" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Konfirmasi password wajib diisi" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password baru tidak cocok",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const addSkillSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Nama kompetensi wajib diisi" })
    .transform((value) => value.trim())
    .pipe(z.string().min(1, { message: "Nama kompetensi wajib diisi" })),
  kategoriId: z
    .string()
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
});

export type AddSkillFormInput = z.input<typeof addSkillSchema>;
export type AddSkillInput = z.infer<typeof addSkillSchema>;
