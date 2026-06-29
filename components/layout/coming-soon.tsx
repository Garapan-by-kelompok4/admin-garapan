import { Construction } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";

/** Placeholder for dashboard screens that land in later waves. */
export function ComingSoon({ title }: { title: string }) {
  return (
    <EmptyState
      icon={Construction}
      title={title}
      hint="Halaman ini sedang dibangun dan akan tersedia pada wave berikutnya."
      className="min-h-[60vh]"
    />
  );
}
