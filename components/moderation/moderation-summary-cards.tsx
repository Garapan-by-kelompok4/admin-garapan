import { AlertTriangle, CheckCircle, Trash2 } from "lucide-react";
import { FlaggedContent } from "@/lib/api/content";

interface ModerationSummaryCardsProps {
  totalItems: number;
  pendingItems: number;
  items: FlaggedContent[] | undefined;
}

export function ModerationSummaryCards({
  totalItems,
  pendingItems,
  items,
}: ModerationSummaryCardsProps) {
  const cards = [
    {
      label: "Perlu Ditinjau",
      val: pendingItems,
      icon: AlertTriangle,
      color: "text-warn-500 bg-warn-50 border-warn-100",
    },
    {
      label: "Total Flagged",
      val: totalItems,
      icon: AlertTriangle,
      color: "text-brand-500 bg-brand-50 border-brand-100",
    },
    {
      label: "Ditandai Aman",
      val: items?.filter((c) => c.status === "Aman").length ?? 0,
      icon: CheckCircle,
      color: "text-success-500 bg-success-50 border-success-100",
    },
    {
      label: "Dihapus / Sembunyi",
      val:
        items?.filter(
          (c) => c.status === "Dihapus" || c.status === "Disembunyikan",
        ).length ?? 0,
      icon: Trash2,
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
            <div className="text-2xl font-extrabold text-ink-900 mt-1 leading-none tracking-tight">
              {item.val}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
