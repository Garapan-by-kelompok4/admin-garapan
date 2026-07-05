"use client";

import { Plus, Trash2 } from "lucide-react";
import { KategoriItem, SkillItem } from "@/lib/api/settings";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AddSkillForm } from "@/components/settings/add-skill-form";
import type { AddSkillInput } from "@/lib/validators/settings";

export interface SettingsMasterTabProps {
  skills: SkillItem[];
  kategoriList: KategoriItem[];
  isLoadingSkills: boolean;
  isAddSkillOpen: boolean;
  onAddSkillOpenChange: (open: boolean) => void;
  isAddPending: boolean;
  onAddSkill: (values: AddSkillInput) => void;
  onDeleteSkill: (id: string, name: string) => void;
  formatDate: (dateStr: string) => string;
}

export function SettingsMasterTab({
  skills,
  kategoriList,
  isLoadingSkills,
  isAddSkillOpen,
  onAddSkillOpenChange,
  isAddPending,
  onAddSkill,
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
        <Button
          type="button"
          onClick={() => onAddSkillOpenChange(true)}
          className="h-9 px-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-bold text-xs gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" /> Tambah Kompetensi
        </Button>
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
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => onDeleteSkill(skill.id, skill.name)}
                      className="h-7 w-7 rounded border-danger-200 bg-danger-50/50 hover:bg-danger-55 hover:text-danger-700 text-danger-600 ml-auto"
                      title="Hapus Kompetensi"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={isAddSkillOpen} onOpenChange={onAddSkillOpenChange}>
        <DialogContent className="max-w-[400px] rounded-xl p-5 border-border bg-white shadow-sh-3">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="font-heading font-bold text-base text-ink-900">
              Tambah Kompetensi Master
            </DialogTitle>
          </DialogHeader>
          <AddSkillForm
            kategoriList={kategoriList}
            isPending={isAddPending}
            onSubmit={onAddSkill}
            onCancel={() => onAddSkillOpenChange(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
