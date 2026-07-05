"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "@/lib/validators/settings";

interface ChangePasswordFormProps {
  isPending: boolean;
  onSubmit: (values: Pick<ChangePasswordInput, "oldPassword" | "newPassword">) => void;
}

export function ChangePasswordForm({
  isPending,
  onSubmit,
}: ChangePasswordFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleValidSubmit = (values: ChangePasswordInput) => {
    onSubmit({
      oldPassword: values.oldPassword,
      newPassword: values.newPassword,
    });
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(handleValidSubmit)}
      className="max-w-lg space-y-4"
      noValidate
    >
      <div className="space-y-1.5">
        <Label htmlFor="oldPassword" className="text-xs font-bold text-ink-700">
          Password Lama
        </Label>
        <Input
          id="oldPassword"
          type="password"
          className="h-10 text-xs font-medium"
          aria-invalid={Boolean(errors.oldPassword)}
          {...register("oldPassword")}
        />
        {errors.oldPassword && (
          <p className="text-xs text-danger-500">{errors.oldPassword.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="newPassword" className="text-xs font-bold text-ink-700">
          Password Baru
        </Label>
        <Input
          id="newPassword"
          type="password"
          className="h-10 text-xs font-medium"
          aria-invalid={Boolean(errors.newPassword)}
          {...register("newPassword")}
        />
        {errors.newPassword && (
          <p className="text-xs text-danger-500">{errors.newPassword.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="confirmPassword"
          className="text-xs font-bold text-ink-700"
        >
          Konfirmasi Password Baru
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          className="h-10 text-xs font-medium"
          aria-invalid={Boolean(errors.confirmPassword)}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-danger-500">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="flex justify-end pt-3">
        <Button
          type="submit"
          disabled={isPending}
          className="h-10 px-5 text-xs font-bold"
        >
          {isPending ? "Memproses..." : "Ganti Password"}
        </Button>
      </div>
    </form>
  );
}
