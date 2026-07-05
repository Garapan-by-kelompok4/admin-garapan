import { CHART_PERIODS, type ChartPeriod } from "./types";

interface ChartPeriodToggleProps {
  period: ChartPeriod;
  onPeriodChange: (period: ChartPeriod) => void;
}

export function ChartPeriodToggle({
  period,
  onPeriodChange,
}: ChartPeriodToggleProps) {
  return (
    <div className="flex bg-surface-3 p-0.5 rounded-lg border border-border/40 select-none">
      {CHART_PERIODS.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onPeriodChange(t)}
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
  );
}
