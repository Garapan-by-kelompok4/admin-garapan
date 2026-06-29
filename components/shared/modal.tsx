"use client";

import { X } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "default" | "lg";
};

/** Detail/action modal used across list pages (handoff `Modal`). */
export function Modal({
  open,
  onOpenChange,
  title,
  children,
  footer,
  size = "default",
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn("max-w-lg gap-0 p-0", size === "lg" && "sm:max-w-[820px]")}
      >
        <DialogHeader className="flex flex-row items-center justify-between border-b border-border px-5 py-4">
          <DialogTitle className="text-[15px] font-bold">{title}</DialogTitle>
          <DialogClose render={<IconButton variant="ghost" aria-label="Tutup" />}>
            <X />
          </DialogClose>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-[18px]">
          {children}
        </div>
        {footer && (
          <div className="flex items-center justify-end gap-2.5 border-t border-border px-5 py-3.5">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
