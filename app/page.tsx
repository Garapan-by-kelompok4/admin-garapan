import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-6 p-8">
      <div className="max-w-lg text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">
          GARAPAN
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-ink-900">
          Admin Panel
        </h1>
        <p className="mt-3 text-sm text-ink-400">
          Foundation scaffold siap. Lanjut ke Wave 1: auth BFF, shell, dan
          halaman login.
        </p>
      </div>
      <Button nativeButton={false} render={<Link href="/login" />}>
        Ke Login
      </Button>
    </main>
  );
}
