import type { LucideIcon } from "lucide-react";

export interface PageSummaryStatCard {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconClassName: string;
  hint?: string;
}

interface PageSummaryStatCardsProps {
  cards: PageSummaryStatCard[];
}

export function PageSummaryStatCards({ cards }: PageSummaryStatCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {cards.map((item) => (
        <div
          key={item.label}
          className="flex flex-col overflow-hidden rounded-xl border border-border bg-white p-3 shadow-sh-1 transition-all hover:shadow-sh-2 sm:p-4 lg:p-5"
        >
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border lg:h-9 lg:w-9 ${item.iconClassName}`}
          >
            <item.icon className="h-4 w-4 lg:h-4.5 lg:w-4.5" />
          </div>
          <div className="mt-2.5 lg:mt-4">
            <div
              className="text-[10.5px] font-semibold leading-snug text-ink-450 sm:text-[12.5px]"
              title={item.hint}
            >
              {item.label}
            </div>
            <div className="mt-1 font-heading text-base font-extrabold leading-tight tracking-tight text-ink-900 tabular-nums sm:mt-1.5 sm:text-xl lg:text-2xl">
              {item.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
