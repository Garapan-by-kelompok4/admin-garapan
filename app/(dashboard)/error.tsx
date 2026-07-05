"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log details to analytical tracker if desired
    console.error("Dashboard error boundary:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[480px] p-6 text-center select-none">
      <div className="h-14 w-14 rounded-full bg-danger-50 text-danger-500 border border-danger-100 flex items-center justify-center shadow-sm mb-4">
        <AlertTriangle className="h-7 w-7" />
      </div>

      <h2 className="font-heading font-bold text-lg text-ink-900 leading-tight">
        Terjadi Kesalahan Sistem
      </h2>
      <p className="text-xs text-ink-500 max-w-sm mt-2 leading-relaxed">
        Gagal memuat halaman ini karena masalah koneksi atau rendering data.
        Silakan coba memuat kembali halaman.
      </p>

      {error.digest && (
        <span className="text-[10px] text-ink-400 font-mono mt-3 select-all bg-surface-2 px-2 py-0.5 rounded border border-border">
          Digest ID: {error.digest}
        </span>
      )}

      <div className="flex items-center gap-3 mt-6">
        <Button
          type="button"
          onClick={() => reset()}
          className="h-9 bg-brand-500 px-4 text-xs font-bold text-white shadow-sm hover:bg-brand-600"
        >
          <RotateCcw className="h-4 w-4" /> Coba Lagi
        </Button>
        <Button
          variant="outline"
          render={<Link href="/dashboard" />}
          className="h-9 px-4 text-xs font-bold text-ink-700 shadow-sm"
        >
          <Home className="h-4 w-4" /> Kembali ke Home
        </Button>
      </div>
    </div>
  );
}
