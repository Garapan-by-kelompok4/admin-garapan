"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { KategoriItem } from "@/lib/api/settings";
import { addSkillSchema, type AddSkillFormInput, type AddSkillInput } from "@/lib/validators/settings";

interface AddSkillFormProps {
  kategoriList: KategoriItem[];
  isPending: boolean;
  onSubmit: (values: AddSkillInput) => void;
  onCancel: () => void;
}

export function AddSkillForm({
  kategoriList,
  isPending,
  onSubmit,
  onCancel,
}: AddSkillFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddSkillFormInput, unknown, AddSkillInput>({
    resolver: zodResolver(addSkillSchema),
    defaultValues: {
      name: "",
      kategoriId: "",
    },
  });
  const kategoriId = watch("kategoriId");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-3" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="skillName" className="text-xs font-bold text-ink-700">
          Nama Kompetensi
        </Label>
        <Input
          id="skillName"
          placeholder="Contoh: Flutter Mobile App"
          className="h-10 text-xs font-medium"
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs text-danger-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="kategoriId" className="text-xs font-bold text-ink-700">
          Kategori Jasa
        </Label>
        <input type="hidden" {...register("kategoriId")} />
        <Select
          value={kategoriId || "none"}
          onValueChange={(value) => {
            if (typeof value !== "string") return;
            setValue("kategoriId", value === "none" ? "" : value, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
        >
          <SelectTrigger
            id="kategoriId"
            className="h-[38px] w-full border-border bg-white px-3 text-xs font-medium text-ink-700 focus-visible:border-brand-400 focus-visible:ring-brand-50"
          >
            <SelectValue>
              {(value) =>
                value === "none"
                  ? "Pilih Kategori (opsional)"
                  : kategoriList.find((kat) => kat.id === value)?.name ??
                    "Pilih Kategori (opsional)"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent align="start" className="min-w-[240px] p-1">
            <SelectItem value="none" className="px-2 py-1.5 text-sm">
              Pilih Kategori (opsional)
            </SelectItem>
            {kategoriList.map((kat) => (
              <SelectItem
                key={kat.id}
                value={kat.id}
                className="px-2 py-1.5 text-sm"
              >
                {kat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4 flex justify-end gap-2 border-t border-border pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold"
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 text-xs font-semibold"
        >
          {isPending ? "Menambahkan..." : "Tambah"}
        </Button>
      </div>
    </form>
  );
}
