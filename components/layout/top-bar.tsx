"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  ChevronDown,
  Flag,
  LogOut,
  Menu,
  MessageCircle,
  Search,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
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
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { SidebarContent } from "@/components/layout/sidebar";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const opsCounts = useOpsBadgeCounts();
  const title = pageTitle(pathname);
  const name = user?.name ?? "Admin";
  const [searchQuery, setSearchQuery] = useState("");
  const totalNotificationCount =
    opsCounts.moderation + opsCounts.disputes + opsCounts.chat;
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

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
    <header className="sticky top-0 z-40 flex h-[58px] items-center gap-3 border-b border-border bg-surface/85 px-4 backdrop-blur-md backdrop-saturate-150 md:h-[62px] md:gap-5 md:px-7">
      <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Buka navigasi"
          onClick={() => setIsMobileNavOpen(true)}
          className="shrink-0 text-ink-600 hover:bg-surface-3 md:hidden"
        >
          <Menu className="size-[19px]" strokeWidth={1.8} />
        </Button>
        <SheetContent
          side="left"
          className="w-[286px] max-w-[86vw] gap-0 p-0"
          showCloseButton={false}
        >
          <SheetTitle className="sr-only">Navigasi admin</SheetTitle>
          <SidebarContent onNavigate={() => setIsMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="min-w-0 md:min-w-[180px]">
        <div className="text-xs text-ink-400">GARAPAN · Admin</div>
        <div className="truncate font-display text-base font-bold tracking-tight text-ink-900">
          {title}
        </div>
      </div>

      <form
        onSubmit={handleSearchSubmit}
        className="hidden h-9 max-w-[520px] flex-1 items-center gap-2 rounded-[9px] border border-border bg-surface-2 px-3 text-ink-400 md:flex"
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
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                title="Notifikasi"
                className="relative text-ink-500 hover:bg-surface-3"
              />
            }
          >
            <Bell className="size-[18px]" strokeWidth={1.75} />
            {totalNotificationCount > 0 ? (
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-danger-500" />
            ) : null}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-[min(360px,calc(100vw-24px))] p-0"
          >
            <div className="border-b border-border px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-ink-900">
                    Notifikasi
                  </div>
                  <div className="text-xs text-ink-400">
                    Ringkasan aktivitas yang perlu ditinjau
                  </div>
                </div>
                {totalNotificationCount > 0 ? (
                  <span className="rounded-full bg-danger-50 px-2 py-0.5 text-[11px] font-bold text-danger-700">
                    {totalNotificationCount}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="max-h-[380px] overflow-y-auto p-1.5">
              {opsCounts.chat > 0 ? (
                <DropdownMenuItem
                  render={<Link href="/chat" />}
                  className="block cursor-pointer px-2.5 py-2.5"
                >
                  <NotificationSummaryRow
                    icon={MessageCircle}
                    tone="info"
                    title={`${opsCounts.chat} pesan live chat belum dibaca`}
                    description="Buka Live Chat untuk melihat sesi dukungan terbaru."
                  />
                </DropdownMenuItem>
              ) : null}

              {opsCounts.moderation > 0 ? (
                <DropdownMenuItem
                  render={<Link href="/moderation" />}
                  className="block cursor-pointer px-2.5 py-2.5"
                >
                  <NotificationSummaryRow
                    icon={ShieldAlert}
                    tone="warn"
                    title={`${opsCounts.moderation} konten perlu moderasi`}
                    description="Tinjau laporan jasa atau project yang masuk."
                  />
                </DropdownMenuItem>
              ) : null}

              {opsCounts.disputes > 0 ? (
                <DropdownMenuItem
                  render={<Link href="/disputes" />}
                  className="block cursor-pointer px-2.5 py-2.5"
                >
                  <NotificationSummaryRow
                    icon={Flag}
                    tone="danger"
                    title={`${opsCounts.disputes} laporan/dispute aktif`}
                    description="Periksa laporan pengguna dan status resolusinya."
                  />
                </DropdownMenuItem>
              ) : null}

              {totalNotificationCount === 0 ? (
                <div className="px-4 py-8 text-center">
                  <div className="mx-auto grid size-10 place-items-center rounded-full bg-surface-2 text-ink-400">
                    <Bell className="size-4" strokeWidth={1.8} />
                  </div>
                  <div className="mt-3 text-sm font-semibold text-ink-900">
                    Tidak ada notifikasi baru
                  </div>
                  <div className="mt-1 text-xs leading-5 text-ink-400">
                    Chat, laporan, dan moderasi yang perlu tindakan akan muncul
                    di sini.
                  </div>
                </div>
              ) : null}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

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
            <span className="hidden max-w-[120px] truncate text-[13px] font-semibold text-ink-700 sm:inline">
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

type NotificationSummaryRowProps = {
  icon: LucideIcon;
  tone: "danger" | "info" | "warn";
  title: string;
  description: string;
};

function NotificationSummaryRow({
  icon: Icon,
  tone,
  title,
  description,
}: NotificationSummaryRowProps) {
  return (
    <div className="flex gap-3">
      <div
        className={cn(
          "mt-0.5 grid size-9 shrink-0 place-items-center rounded-full",
          tone === "danger" && "bg-danger-50 text-danger-700",
          tone === "info" && "bg-brand-50 text-brand-700",
          tone === "warn" && "bg-warn-50 text-warn-700",
        )}
      >
        <Icon className="size-4" strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold text-ink-900">{title}</div>
        <div className="mt-0.5 text-xs leading-5 text-ink-500">
          {description}
        </div>
      </div>
    </div>
  );
}
