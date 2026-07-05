import {
  Users,
  Wallet,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
} from "lucide-react";

import type { DashboardStats } from "@/lib/api/dashboard";
import { formatCurrency } from "@/lib/utils";

function formatDelta(val: number) {
  const abs = Math.abs(val);
  const isPositive = val >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold ${
        isPositive
          ? "bg-success-50 text-success-700"
          : "bg-danger-50 text-danger-700"
      }`}
    >
      {isPositive ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : (
        <ArrowDownRight className="h-3 w-3" />
      )}
      {abs}%
    </span>
  );
}

function renderSparkline(points: number[], color: string) {
  const width = 110;
  const height = 28;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min;
  const step = width / (points.length - 1);

  const svgPoints = points
    .map((p, idx) => {
      const x = idx * step;
      const y = height - ((p - min) / range) * height + 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      className="overflow-visible select-none pointer-events-none"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={svgPoints}
      />
    </svg>
  );
}

interface DashboardStatCardsProps {
  stats?: DashboardStats;
}

export function DashboardStatCards({ stats }: DashboardStatCardsProps) {
  const cards = [
    {
      label: "Total User Aktif",
      val:
        stats?.activeUsers != null
          ? new Intl.NumberFormat("id-ID").format(stats.activeUsers)
          : "-",
      delta: stats?.activeUsersDelta ?? 0,
      spark: [] as number[],
      color: "#2047C9",
      icon: Users,
      iconBg: "bg-brand-50 text-brand-500 border-brand-100",
    },
    {
      label: "Transaksi Bulan Ini",
      val:
        stats?.transactionsCount != null
          ? new Intl.NumberFormat("id-ID").format(stats.transactionsCount)
          : "-",
      delta: stats?.transactionsDelta ?? 0,
      spark: [] as number[],
      color: "#10B981",
      icon: CheckCircle,
      iconBg: "bg-success-50 text-success-500 border-success-100",
    },
    {
      label: "Pendapatan Platform",
      val: stats?.revenue ? formatCurrency(stats.revenue) : "-",
      delta: stats?.revenueDelta ?? 0,
      spark: [] as number[],
      color: "#F59E0B",
      icon: Wallet,
      iconBg: "bg-warn-50 text-warn-500 border-warn-100",
    },
    {
      label: "Laporan Pending",
      val: stats?.pendingReports ?? "-",
      delta: stats?.pendingReportsDelta ?? 0,
      spark: [] as number[],
      color: "#EF4444",
      icon: AlertTriangle,
      iconBg: "bg-danger-50 text-danger-500 border-danger-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((item, idx) => (
        <div
          key={idx}
          className="bg-white border border-border rounded-xl p-5 space-y-4 shadow-sh-1 hover:shadow-sh-2 transition-all"
        >
          <div className="flex justify-between items-start">
            <div
              className={`h-9 w-9 rounded-lg flex items-center justify-center border ${item.iconBg} flex-shrink-0`}
            >
              <item.icon className="h-4.5 w-4.5" />
            </div>
            <div className="flex items-center gap-1.5">
              {formatDelta(item.delta)}
              <span className="text-[10px] text-ink-400 font-medium">
                vs bln lalu
              </span>
            </div>
          </div>
          <div>
            <div className="text-[12.5px] text-ink-450 font-semibold">
              {item.label}
            </div>
            <div className="flex justify-between items-end mt-1.5">
              <div className="text-2xl font-extrabold text-ink-900 leading-none tracking-tight font-heading">
                {item.val}
              </div>
              {renderSparkline(item.spark, item.color)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
