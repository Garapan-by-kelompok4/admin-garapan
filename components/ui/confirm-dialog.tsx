"use client";

import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "default";
  isLoading?: boolean;
  onConfirm: () => void;
}

const cancelButtonClass =
  "px-4 py-2 text-sm font-semibold border border-border bg-white rounded-lg text-ink-700 hover:bg-surface-3 transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed";

const confirmDestructiveClass =
  "px-4 py-2 text-sm font-semibold bg-danger-500 hover:bg-danger-600 text-white rounded-lg transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed";

const confirmDefaultClass =
  "px-4 py-2 text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed";

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Ya, Lanjutkan",
  cancelLabel = "Batal",
  variant = "destructive",
  isLoading = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-sm gap-0 overflow-hidden rounded-xl border-border bg-white p-0 shadow-sh-3"
        showCloseButton={false}
      >
        <div className="p-5">
          <div className="flex items-start gap-3">
            {variant === "destructive" ? (
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-danger-50 text-danger-600">
                <AlertTriangle className="size-4" />
              </div>
            ) : null}
            <div className="min-w-0 space-y-1.5">
              <DialogTitle className="font-heading text-sm font-bold leading-snug text-ink-900">
                {title}
              </DialogTitle>
              {description ? (
                <DialogDescription className="text-xs leading-relaxed text-ink-500">
                  {description}
                </DialogDescription>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 border-t border-border bg-surface-2/40 px-5 py-3.5">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className={cancelButtonClass}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              variant === "destructive"
                ? confirmDestructiveClass
                : confirmDefaultClass,
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
