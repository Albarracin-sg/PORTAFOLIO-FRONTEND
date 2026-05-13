import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
}

const colorMap: Record<string, { border: string; icon: string; badge: string }> = {
  violet: {
    border: "hover:border-violet-400/30 dark:hover:border-violet-500/30",
    icon: "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:bg-violet-500/15 dark:text-violet-400",
    badge: "text-violet-600 dark:text-violet-400",
  },
  amber: {
    border: "hover:border-amber-400/30 dark:hover:border-amber-500/30",
    icon: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400",
    badge: "text-amber-600 dark:text-amber-400",
  },
  emerald: {
    border: "hover:border-emerald-400/30 dark:hover:border-emerald-500/30",
    icon: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400",
    badge: "text-emerald-600 dark:text-emerald-400",
  },
  sky: {
    border: "hover:border-sky-400/30 dark:hover:border-sky-500/30",
    icon: "bg-sky-500/10 text-sky-600 border-sky-500/20 dark:bg-sky-500/15 dark:text-sky-400",
    badge: "text-sky-600 dark:text-sky-400",
  },
  red: {
    border: "hover:border-red-400/30 dark:hover:border-red-500/30",
    icon: "bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/15 dark:text-red-400",
    badge: "text-red-600 dark:text-red-400",
  },
  indigo: {
    border: "hover:border-indigo-400/30 dark:hover:border-indigo-500/30",
    icon: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:bg-indigo-500/15 dark:text-indigo-400",
    badge: "text-indigo-600 dark:text-indigo-400",
  },
};

export function LogMetricCards({ metrics }: { metrics: MetricCardProps[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {metrics.map((card) => {
        const Icon = card.icon;
        const c = colorMap[card.color] || colorMap.violet;
        return (
          <Card
            key={card.label}
            className={`border-zinc-200 bg-white/70 dark:border-white/[0.07] dark:bg-white/[0.025] transition-all duration-200 ${c.border}`}
          >
            <CardContent className="pt-4 sm:pt-5 pb-3 sm:pb-4 px-3 sm:px-4 text-center sm:text-left">
              <div className={`mb-2 sm:mb-3 mx-auto sm:mx-0 flex size-8 sm:size-9 items-center justify-center rounded-xl border ${c.icon}`}>
                <Icon className="size-3.5 sm:size-4" />
              </div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {card.value}
              </div>
              <p className="mt-0.5 sm:mt-1 text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600 truncate">
                {card.label}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
