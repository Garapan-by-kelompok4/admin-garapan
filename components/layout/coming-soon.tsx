import { Construction } from "lucide-react";

/** Placeholder for dashboard screens that land in later waves. */
export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <div className="grid size-14 place-items-center rounded-xl bg-brand-50 text-brand-500">
        <Construction className="size-7" strokeWidth={1.75} />
      </div>
      <h1 className="font-display text-xl font-bold text-ink-900">{title}</h1>
      <p className="max-w-sm text-sm text-ink-400">
        Halaman ini sedang dibangun dan akan tersedia pada wave berikutnya.
      </p>
    </div>
  );
}
