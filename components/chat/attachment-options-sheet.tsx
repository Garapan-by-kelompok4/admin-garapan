"use client";

import { FileUp, ImageIcon } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

export interface AttachmentOptionsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPickPhoto: () => void;
  onPickDocument: () => void;
}

function AttachmentOptionRow({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof ImageIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3.5 rounded-xl px-0 py-3.5 text-left transition-colors active:bg-surface-2"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-500">
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-sm font-semibold text-ink-900">{label}</span>
    </button>
  );
}

export function AttachmentOptionsSheet({
  open,
  onOpenChange,
  onPickPhoto,
  onPickDocument,
}: AttachmentOptionsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="gap-0 rounded-t-[20px] border-t border-border px-5 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <SheetTitle className="mb-3 text-base font-bold text-ink-900">
          Kirim Lampiran
        </SheetTitle>
        <AttachmentOptionRow
          icon={ImageIcon}
          label="Foto"
          onClick={onPickPhoto}
        />
        <AttachmentOptionRow
          icon={FileUp}
          label="Dokumen"
          onClick={onPickDocument}
        />
      </SheetContent>
    </Sheet>
  );
}
