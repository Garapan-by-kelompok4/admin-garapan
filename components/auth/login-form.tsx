"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { AuthError, login } from "@/lib/api/auth";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";
import { useAuthStore } from "@/store/auth-store";

/** Only allow same-origin relative redirects (avoid open-redirects). */
function safeRedirect(value: string | null): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "/dashboard";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);
  const setStatus = useAuthStore((state) => state.setStatus);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    try {
      const { user } = await login(values);
      setUser(user);
      setStatus("authenticated");
      toast.success(`Selamat datang, ${user.name}`);
      router.replace(safeRedirect(searchParams.get("redirect")));
    } catch (error) {
      const message =
        error instanceof AuthError ? error.message : "Gagal masuk, coba lagi";
      toast.error(message);
    }
  }

  return (
    <div className="w-full max-w-[400px]">
      <h2 className="font-display text-[26px] font-bold tracking-tight text-ink-900">
        Masuk ke akun Admin
      </h2>
      <p className="mt-1.5 text-sm text-ink-400">
        Gunakan email kantor dan password yang diberikan oleh Super Admin.
      </p>

      <form className="mt-7 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3 top-2.5 size-[18px] text-ink-400"
              strokeWidth={1.75}
            />
            <Input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="nama@garapan.test"
              className="h-11 pl-10"
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
          </div>
        </Field>

        <Field label="Password" htmlFor="password" error={errors.password?.message}>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3 top-2.5 size-[18px] text-ink-400"
              strokeWidth={1.75}
            />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className="h-11 pl-10 pr-11"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />
            <IconButton
              variant="ghost"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
              aria-pressed={showPassword}
              className="absolute right-1.5 top-1.5"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </IconButton>
          </div>
        </Field>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 h-11 w-full text-sm"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              Masuk ke Dashboard
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-7 text-center text-xs text-ink-400">
        Akses dibatasi untuk admin terdaftar. Semua aktivitas dicatat dalam audit
        log.
      </p>
    </div>
  );
}
