import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ message: "Email tidak valid" }),
  password: z.string().min(1, { message: "Password wajib diisi" }),
});

export type LoginInput = z.infer<typeof loginSchema>;
