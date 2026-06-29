import {
  Flag,
  LayoutGrid,
  MessageCircle,
  PenSquare,
  Settings,
  Shield,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Sidebar badge key for pending counts (wired in a later wave). */
  badge?: "moderation" | "disputes" | "chat";
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Umum",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutGrid }],
  },
  {
    label: "Manajemen",
    items: [
      { href: "/users", label: "Manajemen User", icon: Users },
      { href: "/moderation", label: "Moderasi Konten", icon: Shield, badge: "moderation" },
      { href: "/disputes", label: "Dispute & Laporan", icon: Flag, badge: "disputes" },
      { href: "/transactions", label: "Transaksi & Escrow", icon: Wallet },
    ],
  },
  {
    label: "Komunikasi & Konten",
    items: [
      { href: "/chat", label: "Live Chat", icon: MessageCircle, badge: "chat" },
      { href: "/articles", label: "Artikel & Blog", icon: PenSquare },
    ],
  },
  {
    label: "Sistem",
    items: [{ href: "/settings", label: "Profil & Settings", icon: Settings }],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((group) => group.items);

/** Page title for a pathname, used by the top bar. */
export function pageTitle(pathname: string): string {
  const match = ALL_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  return match?.label ?? "Dashboard";
}
