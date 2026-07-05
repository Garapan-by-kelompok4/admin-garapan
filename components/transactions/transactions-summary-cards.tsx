import {
  TrendingUp,
  Wallet,
  DollarSign,
  Undo2,
} from "lucide-react";
import { TransactionsSummaryStats } from "@/hooks/use-transactions-summary-stats";
import { formatCurrency } from "@/lib/utils";

interface TransactionsSummaryCardsProps {
  stats: TransactionsSummaryStats | undefined;
}

export function TransactionsSummaryCards({
  stats,
}: TransactionsSummaryCardsProps) {
  const cards = [
    {
      label: "Volume Transaksi (GTV)",
      val: formatCurrency(stats?.totalVolume ?? 0),
      icon: TrendingUp,
      color: "text-success-500 bg-success-50 border-success-100",
    },
    {
      label: "Escrow Ditahan",
      val: formatCurrency(stats?.heldVolume ?? 0),
      icon: Wallet,
      color: "text-warn-500 bg-warn-50 border-warn-100",
    },
    {
      label: "Dana Dicairkan",
      val: formatCurrency(stats?.releasedVolume ?? 0),
      icon: DollarSign,
      color: "text-brand-500 bg-brand-50 border-brand-100",
    },
    {
      label: "Total Pengembalian (Refund)",
      val: formatCurrency(stats?.refundVolume ?? 0),
      icon: Undo2,
      color: "text-danger-500 bg-danger-50 border-danger-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((item, idx) => (
        <div
          key={idx}
          className="bg-white border border-border rounded-xl p-5 flex items-center gap-4 shadow-sh-1"
        >
          <div
            className={`h-11 w-11 rounded-lg flex items-center justify-center border ${item.color.split(" ")[1]} ${item.color.split(" ")[2]} flex-shrink-0`}
          >
            <item.icon className={`h-5 w-5 ${item.color.split(" ")[0]}`} />
          </div>
          <div>
            <div className="text-xs text-ink-400 font-semibold">
              {item.label}
            </div>
            <div className="text-xl font-extrabold text-ink-900 mt-1 leading-none tracking-tight">
              {item.val}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
