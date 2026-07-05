import Link from "next/link";
import { ChevronRight, HeartPulse } from "lucide-react";

import type { OpsBadgeCounts } from "@/hooks/use-ops-badge-counts";

const attentionLinks: Array<{
  label: string;
  href: string;
  countKey: keyof OpsBadgeCounts;
  color: string;
}> = [
  {
    label: "Dispute & Laporan",
    href: "/disputes",
    countKey: "disputes",
    color: "bg-danger-50 border-danger-100 text-danger-700",
  },
  {
    label: "Moderasi Konten",
    href: "/moderation",
    countKey: "moderation",
    color: "bg-warn-50 border-warn-100 text-warn-700",
  },
  {
    label: "Live Chat Support",
    href: "/chat",
    countKey: "chat",
    color: "bg-brand-50 border-brand-100 text-brand-700",
  },
  {
    label: "Transaksi & Escrow",
    href: "/transactions",
    countKey: "transactions",
    color: "bg-slate-50 border-slate-200 text-slate-700",
  },
];

export interface DashboardAttentionPanelProps {
  counts: OpsBadgeCounts;
}

export function DashboardAttentionPanel({
  counts,
}: DashboardAttentionPanelProps) {
  return (
    <div className="space-y-4 flex flex-col justify-between">
      <div className="bg-white border border-border rounded-xl p-5 space-y-3.5 shadow-sh-1">
        <h3 className="font-heading font-bold text-sm text-ink-900 border-b border-border pb-2.5">
          Pusat Perhatian Admin
        </h3>

        <div className="space-y-2 select-none">
          {attentionLinks.map((link) => {
            const count = counts[link.countKey];
            return (
              <Link
                key={link.href}
                href={link.href}
                className="p-2.5 px-3.5 bg-white border border-border hover:bg-[#F7F8FB] hover:border-border-strong rounded-lg flex items-center justify-between transition-all duration-100 cursor-pointer shadow-sm group"
              >
                <span className="text-xs font-semibold text-ink-800">
                  {link.label}
                </span>
                <div className="flex items-center gap-2">
                  {count > 0 ? (
                    <span
                      className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold border ${link.color}`}
                    >
                      {count}
                    </span>
                  ) : null}
                  <ChevronRight className="h-3.5 w-3.5 text-ink-400 group-hover:text-ink-700 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#0F1729] to-[#1E293B] border border-slate-800 rounded-xl p-5 text-white shadow-sh-2">
        <div className="flex items-center gap-1.5">
          <HeartPulse className="h-4 w-4 text-emerald-500 animate-pulse" />
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
            Status Operasional
          </h4>
        </div>
        <p className="text-xs text-slate-400 mt-3">
          Monitoring server akan tersedia di v2.
        </p>
      </div>
    </div>
  );
}
