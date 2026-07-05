"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { KategoriItem, SkillItem } from "@/lib/api/settings";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface SettingsMasterTabProps {
  skills: SkillItem[];
  kategoriList: KategoriItem[];
  isLoadingSkills: boolean;
  isAddSkillOpen: boolean;
  onAddSkillOpenChange: (open: boolean) => void;
  newSkillName: string;
  onNewSkillNameChange: (value: string) => void;
  newSkillCategoryId: string | undefined;
  onNewSkillCategoryIdChange: (value: string | undefined) => void;
  isAddPending: boolean;
  onAddSkillSubmit: (e: React.FormEvent) => void;
  onDeleteSkill: (id: string, name: string) => void;
  formatDate: (dateStr: string) => string;
}

export function SettingsMasterTab({
  skills,
  kategoriList,
  isLoadingSkills,
  isAddSkillOpen,
  onAddSkillOpenChange,
  newSkillName,
  onNewSkillNameChange,
  newSkillCategoryId,
  onNewSkillCategoryIdChange,
  isAddPending,
  onAddSkillSubmit,
  onDeleteSkill,
  formatDate,
}: SettingsMasterTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-border pb-3 gap-4">
        <div>
          <h3 className="font-heading font-bold text-sm text-ink-900">
            Master Data Kompetensi
          </h3>
          <p className="text-[11px] text-ink-400 font-medium mt-0.5">
            Daftar skill keahlian mahasiswa yang dapat ditawarkan sebagai jasa.
          </p>
        </div>
        <button
          onClick={() => onAddSkillOpenChange(true)}
          className="h-9 px-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Tambah Kompetensi
        </button>
      </div>

      {isLoadingSkills ? (
        <div className="p-8 text-center text-xs text-ink-500 font-medium">
          Memuat kompetensi...
        </div>
      ) : (
        <div className="border border-border rounded-lg bg-white overflow-hidden shadow-sh-1 select-none">
          <table className="w-full border-collapse text-left text-xs font-medium">
            <thead>
              <tr className="bg-surface-2 border-b border-border">
                <th className="py-2.5 px-4 text-ink-400 font-bold uppercase tracking-wider">
                  Nama Kompetensi
                </th>
                <th className="py-2.5 px-4 text-ink-400 font-bold uppercase tracking-wider">
                  Kategori Jasa
                </th>
                <th className="py-2.5 px-4 text-ink-400 font-bold uppercase tracking-wider">
                  Tgl. Dibuat
                </th>
                <th className="py-2.5 px-4 text-ink-400 font-bold uppercase tracking-wider text-right">
                  <span className="sr-only">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {skills.map((skill) => (
                <tr
                  key={skill.id}
                  className="hover:bg-[#F7F8FB] transition-colors"
                >
                  <td className="py-3 px-4 font-semibold text-ink-900">
                    {skill.name}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex px-2 py-0.5 rounded border border-border bg-surface-2 text-[10.5px] font-bold text-ink-500">
                      {skill.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-ink-400">
                    {formatDate(skill.createdAt).split(" ")[0]}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onDeleteSkill(skill.id, skill.name)}
                      className="h-7 w-7 rounded border border-danger-200 bg-danger-50/50 hover:bg-danger-55 hover:text-danger-700 text-danger-600 flex items-center justify-center transition-colors cursor-pointer shadow-sm ml-auto"
                      title="Hapus Kompetensi"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        open={isAddSkillOpen}
        onOpenChange={(open) => {
          if (!open) {
            onAddSkillOpenChange(false);
            onNewSkillNameChange("");
            onNewSkillCategoryIdChange(undefined);
          }
        }}
      >
        <DialogContent className="max-w-[400px] rounded-xl p-5 border-border bg-white shadow-sh-3">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="font-heading font-bold text-base text-ink-900">
              Tambah Kompetensi Master
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={onAddSkillSubmit} className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink-700">
                Nama Kompetensi
              </label>
              <input
                placeholder="Contoh: Flutter Mobile App"
                value={newSkillName}
                onChange={(e) => onNewSkillNameChange(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-border rounded-lg text-xs placeholder:text-ink-300 focus:outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-50 transition-all font-medium"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink-700">
                Kategori Jasa
              </label>
              <select
                value={newSkillCategoryId || ""}
                onChange={(e) =>
                  onNewSkillCategoryIdChange(e.target.value || undefined)
                }
                className="w-full h-[38px] px-3 bg-white border border-border rounded-lg text-xs font-medium text-ink-700 focus:outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-50 transition-all cursor-pointer"
              >
                <option value="">Pilih Kategori (opsional)</option>
                {kategoriList.map((kat) => (
                  <option key={kat.id} value={kat.id}>
                    {kat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border mt-4">
              <button
                type="button"
                onClick={() => onAddSkillOpenChange(false)}
                className="px-4 py-2 text-xs font-semibold border border-border bg-white rounded-lg text-ink-700 hover:bg-surface-3 transition-colors cursor-pointer shadow-sm"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isAddPending}
                className="px-4 py-2 text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isAddPending ? "Menambahkan..." : "Tambah"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
