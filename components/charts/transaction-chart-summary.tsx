import type { AnalyticsResponse } from "@/lib/api/dashboard";
import { formatCurrency, formatNumber } from "@/lib/utils";

export function getTransactionChartSummary(analytics?: AnalyticsResponse) {
  const timeSeries = analytics?.timeSeries;

  if (!timeSeries?.length) {
    return [
      { label: "Total Pesanan", val: "-" },
      { label: "Nilai Transaksi", val: "-" },
      { label: "Rata-rata Harian", val: "-" },
    ];
  }

  const totalOrders = timeSeries.reduce((sum, point) => sum + point.orderCount, 0);
  const totalRevenue = timeSeries.reduce((sum, point) => sum + point.revenue, 0);

  return [
    { label: "Total Pesanan", val: formatNumber(totalOrders) },
    { label: "Nilai Transaksi", val: formatCurrency(totalRevenue) },
    {
      label: "Rata-rata Harian",
      val: formatCurrency(Math.round(totalRevenue / timeSeries.length)),
    },
  ];
}
