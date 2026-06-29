"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { IconButton } from "@/components/ui/icon-button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useLogout } from "@/hooks/use-logout";
import { NAV_GROUPS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();

  return (
    <aside className="sticky top-0 flex h-screen w-[248px] shrink-0 flex-col border-r border-border bg-surface">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-border px-5 pb-[18px] pt-5">
        <div className="grid size-[34px] place-items-center rounded-[9px] bg-brand-mark font-display text-[15px] font-extrabold text-white">
          G
        </div>
        <div className="leading-tight">
          <div className="font-display text-[15px] font-extrabold tracking-tight text-ink-900">
            GARAPAN
          </div>
          <div className="text-xs text-ink-400">Admin Console</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-[10px] pb-5 pt-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-1">
            <div className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-ink-300">
              {group.label}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "mb-0.5 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-brand-50 font-semibold text-brand-600"
                      : "font-medium text-ink-500 hover:bg-surface-3 hover:text-ink-700",
                  )}
                >
                  <Icon className="size-[18px] shrink-0" strokeWidth={1.75} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="flex items-center gap-3 border-t border-border p-3">
        <UserAvatar name={user?.name ?? "Admin"} size="md" />
        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate text-[13px] font-semibold text-ink-900">
            {user?.name ?? "Admin"}
          </div>
          <div className="truncate text-xs text-ink-400">Administrator</div>
        </div>
        <IconButton variant="danger" title="Keluar" onClick={() => void logout()}>
          <LogOut strokeWidth={1.75} />
        </IconButton>
      </div>
    </aside>
  );
}
