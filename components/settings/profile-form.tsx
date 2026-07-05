"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AdminProfile } from "@/lib/api/settings";
import { avatarClass, initials } from "@/lib/avatar";
import { profileSchema, type ProfileInput } from "@/lib/validators/settings";

interface ProfileFormProps {
  profile: AdminProfile | undefined;
  isLoading: boolean;
  isPending: boolean;
  onSubmit: (values: ProfileInput) => void;
}

export function ProfileForm({
  profile,
  isLoading,
  isPending,
  onSubmit,
}: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      bio: "",
    },
  });

  const fullName = watch("fullName");

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName,
        phone: profile.phone || "",
        bio: profile.bio || "",
      });
    }
  }, [profile, reset]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs font-medium text-ink-500">
        Memuat detail profil...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="flex items-center gap-4 border-b border-border/50 pb-5">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-full border border-border text-xl font-bold text-white shadow-sm ${avatarClass(fullName || "AD")}`}
        >
          {initials(fullName || "AD")}
        </div>
        <div>
          <h4 className="font-heading text-sm font-bold text-ink-900">
            Foto Profil
          </h4>
          <p className="mt-0.5 text-[10px] font-semibold text-ink-400">
            Initials avatar otomatis dibuat berdasarkan nama lengkap Anda.
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded border border-border bg-white px-2.5 py-1.5 text-[10px] font-bold text-ink-400 opacity-50"
              title="Upload dinonaktifkan"
            >
              Ganti Foto
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-xs font-bold text-ink-700">
            Nama Lengkap
          </Label>
          <Input
            id="fullName"
            className="h-10 text-xs font-medium"
            aria-invalid={Boolean(errors.fullName)}
            {...register("fullName")}
          />
          {errors.fullName && (
            <p className="text-xs text-danger-500">{errors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-ink-700">
            Alamat Email (Akun)
          </Label>
          <Input
            type="email"
            value={profile?.email || ""}
            className="h-10 cursor-not-allowed bg-surface-2 text-xs font-medium text-ink-450"
            disabled
            readOnly
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-xs font-bold text-ink-700">
            Nomor Telepon
          </Label>
          <Input
            id="phone"
            placeholder="Contoh: 081234567890"
            className="h-10 text-xs font-medium"
            aria-invalid={Boolean(errors.phone)}
            {...register("phone")}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-ink-700">
            Peran Akses (Role)
          </Label>
          <span className="flex h-10 w-full cursor-not-allowed select-none items-center rounded-lg border border-border bg-surface-2 px-3 text-xs font-bold capitalize text-ink-450">
            {profile?.role?.toLowerCase() || "Super Admin"}
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bio" className="text-xs font-bold text-ink-700">
          Biografi Diri
        </Label>
        <Textarea
          id="bio"
          rows={4}
          placeholder="Tuliskan biografi singkat mengenai diri Anda..."
          className="resize-none text-xs font-medium"
          aria-invalid={Boolean(errors.bio)}
          {...register("bio")}
        />
      </div>

      <div className="flex justify-end pt-3">
        <Button
          type="submit"
          disabled={isPending}
          className="h-10 px-5 text-xs font-bold"
        >
          {isPending ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>
    </form>
  );
}
