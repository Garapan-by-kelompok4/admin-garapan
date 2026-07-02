"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi, DashboardStats, AnalyticsResponse, ActivityItem } from "@/lib/api/dashboard";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { 
  Users, 
  TrendingUp, 
  Wallet, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight,
  Shield, 
  MessageSquare, 
  CheckCircle, 
  ArrowRight,
  Activity,
  HeartPulse,
  ChevronRight,
  Clock
} from "lucide-react";
import Link from "next/link";
import { avatarClass, initials } from "@/lib/avatar";

export default function DashboardPage() {
  const [period, setPeriod] = useState<"7H" | "30H" | "90H" | "1T">("30H");

  // Query Dashboard Stats
  const { data: stats, isLoading: isLoadingStats } = useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: () => dashboardApi.getStats(),
  });

  // Query Analytics Charts Data
  const { data: analytics, isLoading: isLoadingCharts } = useQuery<AnalyticsResponse>({
    queryKey: ["dashboardAnalytics", period],
    queryFn: () => dashboardApi.getChartData(period),
  });

  // Query Activity Logs
  const { data: activities = [], isLoading: isLoadingActivities } = useQuery<ActivityItem[]>({
    queryKey: ["dashboardActivities"],
    queryFn: () => dashboardApi.getActivityLog(),
  });

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDelta = (val: number) => {
    const abs = Math.abs(val);
    const isPositive = val >= 0;
    return (
      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold ${
        isPositive ? "bg-success-50 text-success-700" : "bg-danger-50 text-danger-700"
      }`}>
        {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
        {abs}%
      </span>
    );
  };

  // Sparkline generator helper
  const renderSparkline = (points: number[], color: string) => {
    const width = 110;
    const height = 28;
    const max = Math.max(...points, 1);
    const min = Math.min(...points, 0);
    const range = max - min;
    const step = width / (points.length - 1);
    
    const svgPoints = points.map((p, idx) => {
      const x = idx * step;
      const y = height - ((p - min) / range) * height + 2; // offset padding
      return `${x},${y}`;
    }).join(" ");

    return (
      <svg width={width} height={height} className="overflow-visible select-none pointer-events-none">
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
  };

  // Handoff chart color schemes
  const donutColors = ["#2047C9", "#4A68E0", "#7E95F0", "#B6C3F9", "#DCE4FD"];

  return (
    <div className="space-y-6">
      
      {/* 1. Stat Cards (4 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total User Aktif",
            val: stats?.activeUsers != null ? new Intl.NumberFormat("id-ID").format(stats.activeUsers) : "-",
            delta: stats?.activeUsersDelta ?? 0,
            spark: [],
            color: "#2047C9",
            icon: Users,
            iconBg: "bg-brand-50 text-brand-500 border-brand-100"
          },
          {
            label: "Transaksi Bulan Ini",
            val: stats?.transactionsCount != null ? new Intl.NumberFormat("id-ID").format(stats.transactionsCount) : "-",
            delta: stats?.transactionsDelta ?? 0,
            spark: [],
            color: "#10B981",
            icon: CheckCircle,
            iconBg: "bg-success-50 text-success-500 border-success-100"
          },
          {
            label: "Pendapatan Platform",
            val: stats?.revenue ? formatCurrency(stats.revenue) : "-",
            delta: stats?.revenueDelta ?? 0,
            spark: [],
            color: "#F59E0B",
            icon: Wallet,
            iconBg: "bg-warn-50 text-warn-500 border-warn-100"
          },
          {
            label: "Laporan Pending",
            val: stats?.pendingReports ?? "-",
            delta: stats?.pendingReportsDelta ?? 0,
            spark: [],
            color: "#EF4444",
            icon: AlertTriangle,
            iconBg: "bg-danger-50 text-danger-500 border-danger-100"
          }
        ].map((item, idx) => (
          <div key={idx} className="bg-white border border-border rounded-xl p-5 space-y-4 shadow-sh-1 hover:shadow-sh-2 transition-all">
            <div className="flex justify-between items-start">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center border ${item.iconBg} flex-shrink-0`}>
                <item.icon className="h-4.5 w-4.5" />
              </div>
              <div className="flex items-center gap-1.5">
                {formatDelta(item.delta)}
                <span className="text-[10px] text-ink-400 font-medium">vs bln lalu</span>
              </div>
            </div>
            <div>
              <div className="text-[12.5px] text-ink-450 font-semibold">{item.label}</div>
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

      {/* 2. Charts Row (Line Chart + Donut Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left Column: Transaction Line Chart */}
        <div className="lg:col-span-2 bg-white border border-border rounded-xl p-5 space-y-4 shadow-sh-1">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <div>
              <h3 className="font-heading font-bold text-sm text-ink-900">
                Nilai Transaksi Harian
              </h3>
              <p className="text-[11px] text-ink-400 font-medium mt-0.5">
                Perkembangan total volume pembayaran yang diproses.
              </p>
            </div>

            {/* Time Toggle */}
            <div className="flex bg-surface-3 p-0.5 rounded-lg border border-border/40 select-none">
              {(["7H", "30H", "90H", "1T"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setPeriod(t)}
                  className={`px-2 py-1 text-[10.5px] font-bold rounded-md transition-all cursor-pointer ${
                    period === t 
                      ? "bg-white text-ink-900 shadow-sm font-extrabold" 
                      : "text-ink-500 hover:text-ink-900"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Aggregated values above line chart */}
          <div className="grid grid-cols-3 gap-4 py-1 select-none">
            {[
              { label: "Total Pesanan", val: analytics?.timeSeries ? new Intl.NumberFormat("id-ID").format(analytics.timeSeries.reduce((s, p) => s + p.orderCount, 0)) : "-" },
              { label: "Nilai Transaksi", val: analytics?.timeSeries ? formatCurrency(analytics.timeSeries.reduce((s, p) => s + p.revenue, 0)) : "-" },
              { label: "Rata-rata Harian", val: analytics?.timeSeries?.length ? formatCurrency(Math.round(analytics.timeSeries.reduce((s, p) => s + p.revenue, 0) / analytics.timeSeries.length)) : "-" }
            ].map((agg, idx) => (
              <div key={idx} className="border-r border-border last:border-r-0">
                <div className="text-[11px] text-ink-400 font-semibold">{agg.label}</div>
                <div className="text-lg font-extrabold text-ink-900 mt-1 font-heading">{agg.val}</div>
              </div>
            ))}
          </div>

          {/* Area Line Chart */}
          <div className="h-[230px] w-full pt-2 select-none">
            {isLoadingCharts ? (
              <div className="h-full w-full bg-surface-2 animate-pulse rounded-lg flex items-center justify-center text-xs text-ink-400">
                Memuat data chart...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.ordersLine || []} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2047C9" stopOpacity={0.16} />
                      <stop offset="95%" stopColor="#2047C9" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    stroke="#94A3B8" 
                    fontSize={10} 
                    fontWeight={500} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    stroke="#94A3B8" 
                    fontSize={10} 
                    fontWeight={500} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => `Rp ${val / 1000000}M`}
                    dx={-5}
                  />
                  <Tooltip 
                    formatter={(value: any) => [formatCurrency(Number(value)), "Nilai Transaksi"]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #E5E9F0", fontSize: "12px", fontFamily: "Inter" }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#2047C9" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right Column: Category Donut Chart */}
        <div className="bg-white border border-border rounded-xl p-5 space-y-4 shadow-sh-1 flex flex-col justify-between">
          <div className="border-b border-border pb-3 flex-shrink-0">
            <h3 className="font-heading font-bold text-sm text-ink-900">
              Kategori Jasa Teraktif
            </h3>
            <p className="text-[11px] text-ink-400 font-medium mt-0.5">
              Distribusi penawaran jasa oleh mahasiswa.
            </p>
          </div>

          <div className="flex-1 flex flex-row items-center justify-between gap-4 py-2 min-h-[170px] select-none">
            {isLoadingCharts ? (
              <div className="h-[150px] w-full bg-surface-2 animate-pulse rounded-full" />
            ) : (
              <>
                {/* Donut Chart */}
                <div className="relative w-[150px] h-[150px] flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics?.categoriesDonut || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={66}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {(analytics?.categoriesDonut || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={donutColors[index % donutColors.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[20px] font-extrabold text-ink-900 leading-none tracking-tight font-heading">
                      {analytics?.categoriesDonut?.reduce((s, c) => s + c.value, 0) ?? "-"}
                    </span>
                    <span className="text-[10px] text-ink-400 font-semibold uppercase mt-0.5">
                      total jasa
                    </span>
                  </div>
                </div>

                {/* Legend list */}
                <div className="flex-1 space-y-2 max-w-[130px]">
                  {(analytics?.categoriesDonut || []).map((cat, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span 
                          className="h-2.5 w-2.5 rounded-sm flex-shrink-0" 
                          style={{ backgroundColor: donutColors[index % donutColors.length] }} 
                        />
                        <span className="text-ink-600 font-semibold truncate">{cat.name}</span>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-ink-400 pl-1">{cat.percentage}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* 3. Bottom Row: Activity Feed & Attention Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left Column: Recent Activities */}
        <div className="lg:col-span-2 bg-white border border-border rounded-xl overflow-hidden shadow-sh-1">
          <div className="p-4 bg-white border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-sm text-ink-900">
                Aktivitas Audit Log Terbaru
              </h3>
              <p className="text-[11px] text-ink-400 font-medium mt-0.5">
                Audit otomatis aktivitas admin dan peristiwa penting di marketplace.
              </p>
            </div>
            <Link 
              href="/settings?tab=audit" 
              className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              Lihat Semua <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Activities list */}
          <div className="divide-y divide-border max-h-[360px] overflow-y-auto">
            {isLoadingActivities ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="p-4 flex gap-3 animate-pulse">
                  <div className="h-8 w-8 rounded bg-surface-3" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-surface-3 rounded w-1/4" />
                    <div className="h-2 bg-surface-3 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : activities.length > 0 ? (
              activities.map((act) => {
                let badgeStyle = "bg-brand-50 border-brand-100 text-brand-600";
                if (act.action === "user") badgeStyle = "bg-success-50 border-success-100 text-success-600";
                if (act.action === "report") badgeStyle = "bg-danger-50 border-danger-100 text-danger-600";
                
                return (
                  <div key={act.id} className="p-3.5 px-5 flex items-start gap-4 hover:bg-surface-2 transition-all">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center border ${badgeStyle} flex-shrink-0`}>
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-ink-700 font-medium leading-relaxed">
                        <span className="font-bold text-ink-900">{act.actorName}</span> ({act.actorRole}): {act.message}
                      </div>
                      <div className="text-[10px] text-ink-450 mt-1 font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(act.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                        <span className="text-ink-200">•</span>
                        {formatDateLabel(act.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-ink-400 font-medium">
                Belum ada log aktivitas hari ini.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Attention Cards & System Health */}
        <div className="space-y-4 flex flex-col justify-between">
          
          {/* Perlu Perhatian Card */}
          <div className="bg-white border border-border rounded-xl p-5 space-y-3.5 shadow-sh-1">
            <h3 className="font-heading font-bold text-sm text-ink-900 border-b border-border pb-2.5">
              Pusat Perhatian Admin
            </h3>
            
            <div className="space-y-2 select-none">
              {[
                { label: "Dispute & Laporan", href: "/disputes", color: "bg-danger-50 border-danger-100 text-danger-700" },
                { label: "Moderasi Konten", href: "/moderation", color: "bg-warn-50 border-warn-100 text-warn-700" },
                { label: "Live Chat Support", href: "/chat", color: "bg-brand-50 border-brand-100 text-brand-700" },
                { label: "Transaksi & Escrow", href: "/transactions", color: "bg-slate-50 border-slate-200 text-slate-700" }
              ].map((link, idx) => (
                <Link
                  key={idx}
                  href={link.href}
                  className="p-2.5 px-3.5 bg-white border border-border hover:bg-[#F7F8FB] hover:border-border-strong rounded-lg flex items-center justify-between transition-all duration-100 cursor-pointer shadow-sm group"
                >
                  <span className="text-xs font-semibold text-ink-800">{link.label}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-ink-400 group-hover:text-ink-700 group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* System Health Card (Dark theme) */}
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

      </div>

    </div>
  );
}
