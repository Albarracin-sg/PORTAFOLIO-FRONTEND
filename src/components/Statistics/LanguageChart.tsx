import * as React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

// Lazy load recharts components
const PieChart = React.lazy(() => import("recharts").then(m => ({ default: m.PieChart })));
const Pie = React.lazy(() => import("recharts").then(m => ({ default: m.Pie })));
const Cell = React.lazy(() => import("recharts").then(m => ({ default: m.Cell })));

interface LanguageChartProps {
  data: any[];
  config: ChartConfig;
}

export function LanguageChart({ data, config }: LanguageChartProps) {
  const { t } = useTranslation();

  return (
    <Card className="border-zinc-200 bg-white/85 dark:border-white/[0.07] dark:bg-white/[0.025]">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          {t("stats.languagesUsed")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-square h-64 sm:aspect-video sm:h-80 w-full">
          <React.Suspense fallback={<div className="flex h-full w-full items-center justify-center animate-pulse bg-zinc-100/50 dark:bg-zinc-800/50 rounded-lg" />}>
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} trigger="hover" />
              <Pie data={data} dataKey="value" nameKey="name" innerRadius="60%" outerRadius="90%" paddingAngle={4} isAnimationActive={false}>
                {data.map((entry) => (
                  <Cell key={`language-${entry.name}`} fill={String(entry.color ?? "#8b5cf6")} className="cursor-pointer outline-none" />
                ))}
              </Pie>
            </PieChart>
          </React.Suspense>
        </ChartContainer>
        <div className="mt-4 sm:mt-5 flex flex-wrap gap-2 sm:gap-3">
          {data.map((entry) => (
            <div key={`language-legend-${entry.name}`} className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs text-zinc-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-100">
              <span className="size-2 sm:size-2.5 rounded-full" style={{ backgroundColor: String(entry.color ?? "#8b5cf6") }} />
              <span>{String(entry.name)}</span>
              <span className="text-zinc-400 dark:text-zinc-500">{String(entry.value)}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
