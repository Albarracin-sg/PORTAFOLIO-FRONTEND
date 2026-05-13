import * as React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

// Lazy load recharts components
const BarChart = React.lazy(() => import("recharts").then(m => ({ default: m.BarChart })));
const Bar = React.lazy(() => import("recharts").then(m => ({ default: m.Bar })));
const CartesianGrid = React.lazy(() => import("recharts").then(m => ({ default: m.CartesianGrid })));
const XAxis = React.lazy(() => import("recharts").then(m => ({ default: m.XAxis })));
const YAxis = React.lazy(() => import("recharts").then(m => ({ default: m.YAxis })));

interface ProjectTimelineChartProps {
  data: any[];
  config: ChartConfig;
}

export function ProjectTimelineChart({ data, config }: ProjectTimelineChartProps) {
  const { t } = useTranslation();

  return (
    <Card className="border-zinc-200 bg-white/85 dark:border-white/[0.07] dark:bg-white/[0.025]">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          {t("stats.projectsTimeline")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-square h-64 sm:aspect-video sm:h-80 w-full">
          <React.Suspense fallback={<div className="flex h-full w-full items-center justify-center animate-pulse bg-zinc-100/50 dark:bg-zinc-800/50 rounded-lg" />}>
            <BarChart data={data} margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 12 }} width={30} />
              <ChartTooltip cursor={{ fill: "rgba(139, 92, 246, 0.1)" }} content={<ChartTooltipContent />} />
              <Bar dataKey="projects" fill="var(--color-projects)" radius={[10, 10, 0, 0]} isAnimationActive={false} className="cursor-pointer" />
            </BarChart>
          </React.Suspense>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
