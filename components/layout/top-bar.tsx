"use client";

import { useEffect, useState } from "react";
import { Bell, ChevronDown, CircleHelp, LogOut, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/hooks/use-logout";
import { useOpsBadgeCounts } from "@/hooks/use-ops-badge-counts";
import { avatarClass, initials } from "@/lib/avatar";
import { Input } from "@/components/ui/input";
import { pageTitle } from "@/lib/nav";
import { useAuthStore } from "@/store/auth-store";

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const { chat: unreadChatCount } = useOpsBadgeCounts();
  const title = pageTitle(pathname);
  const name = user?.name ?? "Admin";
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.getElementById("global-admin-search")?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    router.push(`/users?search=${encodeURIComponent(query)}`);
  };

  return (
    <header className="sticky top-0 z-40 flex h-[62px] items-center gap-5 border-b border-border bg-surface/85 px-7 backdrop-blur-md backdrop-saturate-150">
      <div className="min-w-[180px]">
        <div className="text-xs text-ink-400">GARAPAN · Admin</div>
        <div className="font-display text-base font-bold tracking-tight text-ink-900">
          {title}
        </div>
      </div>

      <form
        onSubmit={handleSearchSubmit}
        className="flex h-9 max-w-[520px] flex-1 items-center gap-2 rounded-[9px] border border-border bg-surface-2 px-3 text-ink-400"
      >
        <Search className="size-4 shrink-0" strokeWidth={1.75} />
        <Input
          id="global-admin-search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="h-full flex-1 border-0 bg-transparent px-0 text-sm text-ink-700 shadow-none focus-visible:border-transparent focus-visible:ring-0"
          placeholder="Cari user, transaksi, laporan…"
        />
        <span className="rounded border border-border bg-surface px-1.5 py-0.5 text-[11px] font-medium text-ink-400">
          ⌘K
        </span>
      </form>

      <div className="ml-auto flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Bantuan"
          className="text-ink-500 hover:bg-surface-3"
          render={<Link href="/settings" />}
        >
          <CircleHelp className="size-[18px]" strokeWidth={1.75} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Notifikasi chat"
          className="relative text-ink-500 hover:bg-surface-3"
          render={<Link href="/chat" />}
        >
          <Bell className="size-[18px]" strokeWidth={1.75} />
          {unreadChatCount > 0 ? (
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-danger-500" />
          ) : null}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                className="h-auto rounded-full border border-border py-1 pl-1 pr-2.5 hover:bg-surface-3"
              />
            }
          >
            <span
              className={`grid size-7 place-items-center rounded-full text-[11px] font-bold text-white ${avatarClass(name)}`}
            >
              {initials(name)}
            </span>
            <span className="max-w-[120px] truncate text-[13px] font-semibold text-ink-700">
              {name}
            </span>
            <ChevronDown className="size-3.5 text-ink-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-1.5 py-1.5">
              <div className="truncate text-sm font-semibold text-ink-900">
                {name}
              </div>
              <div className="truncate text-xs text-ink-400">{user?.email}</div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => void logout()}
            >
              <LogOut />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
