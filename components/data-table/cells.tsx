import { StatusPill } from "@/components/ui/status-pill";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";

/** Avatar + name (+ optional secondary line such as email). */
export function AvatarNameCell({ name, sub }: { name: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3">
      <UserAvatar name={name} />
      <div className="min-w-0">
        <div className="truncate text-[13px] font-semibold text-ink-900">{name}</div>
        {sub && <div className="truncate text-xs text-ink-400">{sub}</div>}
      </div>
    </div>
  );
}

/** Monospace, brand-colored identifier (TRX-…, LP-…, etc.). */
export function MonoIdCell({ id, className }: { id: string; className?: string }) {
  return (
    <span className={cn("font-mono text-[12.5px] text-brand-600", className)}>
      {id}
    </span>
  );
}

export function StatusCell({ status }: { status: string }) {
  return <StatusPill status={status} />;
}

/** Right-aligned container for row action buttons. */
export function ActionsCell({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-end gap-1.5">{children}</div>;
}
