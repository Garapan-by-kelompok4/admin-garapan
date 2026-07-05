"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

interface CopyIdButtonProps {
  value: string;
  label: string;
}

export function CopyIdButton({ value, label }: CopyIdButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timeout = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const handleCopy = async () => {
    await navigator.clipboard?.writeText(value);
    setCopied(true);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`flex h-6 shrink-0 items-center justify-center gap-1 rounded-md px-1.5 text-[10px] font-bold transition-all ${
        copied
          ? "bg-success-50 text-success-700"
          : "w-6 text-ink-400 hover:bg-surface-3 hover:text-brand-600"
      }`}
      title={copied ? "ID lengkap tersalin" : "Salin ID lengkap"}
      aria-label={copied ? `${label} tersalin` : `Salin ${label}`}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" />
          <span>Tersalin</span>
        </>
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
