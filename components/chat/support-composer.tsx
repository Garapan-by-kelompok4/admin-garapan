"use client";

import { useRef, useState } from "react";
import {
  ChevronDown,
  FileUp,
  ImageIcon,
  Loader2,
  Plus,
  Send,
  Sparkles,
} from "lucide-react";

import { AttachmentOptionsSheet } from "@/components/chat/attachment-options-sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CHAT_DOCUMENT_ACCEPT,
  CHAT_IMAGE_ACCEPT,
} from "@/lib/chat-attachments";
import { quickReplies } from "@/lib/chat-utils";

export interface SupportComposerProps {
  messageInput: string;
  onMessageInputChange: (value: string) => void;
  onSend: (e?: React.FormEvent) => void;
  onFileSelected: (file: File) => void;
  isSending?: boolean;
  isUploading?: boolean;
  disabled?: boolean;
  onQuickReply: (text: string) => void;
}

export function SupportComposer({
  messageInput,
  onMessageInputChange,
  onSend,
  onFileSelected,
  isSending = false,
  isUploading = false,
  disabled = false,
  onQuickReply,
}: SupportComposerProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const [attachSheetOpen, setAttachSheetOpen] = useState(false);
  const isBusy = isSending || isUploading || disabled;
  const visibleQuickReplies = quickReplies.slice(0, 2);
  const overflowQuickReplies = quickReplies.slice(2);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) onFileSelected(file);
  };

  const pickImage = () => {
    setAttachSheetOpen(false);
    imageInputRef.current?.click();
  };

  const pickDocument = () => {
    setAttachSheetOpen(false);
    documentInputRef.current?.click();
  };

  const attachButtonClassName =
    "grid h-[38px] w-[38px] flex-shrink-0 place-items-center rounded-lg border border-border bg-surface-2 text-ink-600 shadow-sm transition-colors hover:bg-surface-3 hover:text-ink-900 disabled:cursor-not-allowed disabled:opacity-50";

  const attachButtonContent = isUploading ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    <Plus className="h-4 w-4" />
  );

  return (
    <div className="flex flex-shrink-0 flex-col gap-3 border-t border-border bg-white p-3 md:p-4">
      <div className="flex min-w-0 flex-wrap items-center gap-1.5 select-none">
        <span className="mr-1 flex flex-shrink-0 items-center gap-1 self-center text-[10px] font-bold text-brand-600">
          <Sparkles className="h-3 w-3" /> Balas cepat:
        </span>
        {visibleQuickReplies.map((r, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onQuickReply(r)}
            title={r}
            disabled={isBusy}
            className="min-w-0 max-w-[360px] cursor-pointer rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-ink-600 transition-colors hover:bg-surface-3 hover:text-ink-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="block truncate">{r}</span>
          </button>
        ))}
        {overflowQuickReplies.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger
              disabled={isBusy}
              className="flex h-[26px] flex-shrink-0 items-center gap-1 rounded-full border border-border bg-white px-2.5 text-[11px] font-bold text-ink-600 shadow-sm transition-colors hover:bg-surface-2 hover:text-ink-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Template lainnya
              <ChevronDown className="h-3 w-3 text-ink-400" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-[min(360px,calc(100vw-24px))]"
            >
              {overflowQuickReplies.map((reply, idx) => (
                <DropdownMenuItem
                  key={idx}
                  onClick={() => onQuickReply(reply)}
                  className="cursor-pointer text-xs font-medium leading-relaxed"
                >
                  {reply}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <form onSubmit={onSend} className="flex items-end gap-2">
        <input
          ref={imageInputRef}
          type="file"
          accept={CHAT_IMAGE_ACCEPT}
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={documentInputRef}
          type="file"
          accept={CHAT_DOCUMENT_ACCEPT}
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          type="button"
          disabled={isBusy}
          aria-label="Lampirkan file"
          onClick={() => setAttachSheetOpen(true)}
          className={`${attachButtonClassName} md:hidden`}
        >
          {attachButtonContent}
        </button>

        <div className="hidden md:block">
          <DropdownMenu>
            <DropdownMenuTrigger
              type="button"
              disabled={isBusy}
              aria-label="Lampirkan file"
              className={attachButtonClassName}
            >
              {attachButtonContent}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-48">
              <DropdownMenuItem
                className="cursor-pointer gap-2 text-xs font-medium"
                onClick={() => imageInputRef.current?.click()}
              >
                <ImageIcon className="h-4 w-4 text-brand-500" />
                Foto / gambar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer gap-2 text-xs font-medium"
                onClick={() => documentInputRef.current?.click()}
              >
                <FileUp className="h-4 w-4 text-brand-500" />
                Dokumen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <AttachmentOptionsSheet
          open={attachSheetOpen}
          onOpenChange={setAttachSheetOpen}
          onPickPhoto={pickImage}
          onPickDocument={pickDocument}
        />

        <textarea
          rows={1}
          value={messageInput}
          onChange={(e) => onMessageInputChange(e.target.value)}
          placeholder="Tulis pesan balasan bantuan..."
          disabled={isBusy}
          className="max-h-[100px] min-h-[38px] flex-1 resize-y rounded-lg border border-border bg-surface-2 p-2 px-3 text-xs font-medium transition-all placeholder:text-ink-300 focus:border-brand-400 focus:ring-3 focus:ring-brand-50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
        />

        <button
          type="submit"
          disabled={isBusy || !messageInput.trim()}
          className="flex h-[38px] flex-shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-brand-500 px-4 text-xs font-bold text-white shadow-sm transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>Kirim</span>
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
