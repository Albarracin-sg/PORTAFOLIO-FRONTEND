import * as React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

// Lazy load recharts components
const LineChart = React.lazy(() => import("recharts").then(m => ({ default: m.LineChart })));
const Line = React.lazy(() => import("recharts").then(m => ({ default: m.Line })));
const CartesianGrid = React.lazy(() => import("recharts").then(m => ({ default: m.CartesianGrid })));
const XAxis = React.lazy(() => import("recharts").then(m => ({ default: m.XAxis })));
const YAxis = React.lazy(() => import("recharts").then(m => ({ default: m.YAxis })));

interface GithubActivityChartProps {
  data: any[];
  config: ChartConfig;
}

export function GithubActivityChart({ data, config }: GithubActivityChartProps) {
  const { t } = useTranslation();

  return (
    <Card className="border-zinc-200 bg-white/85 dark:border-white/[0.07] dark:bg-white/[0.025] lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          {t("stats.githubActivity")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-square h-64 sm:aspect-video sm:h-80 w-full">
          <React.Suspense fallback={<div className="flex h-full w-full items-center justify-center animate-pulse bg-zinc-100/50 dark:bg-zinc-800/50 rounded-lg" />}>
            <LineChart data={data} margin={{ left: 0, right: 10 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 12 }} width={30} />
              <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
              <Line type="monotone" dataKey="commits" stroke="var(--color-commits)" strokeWidth={2.5} dot={{ fill: "var(--color-commits)", r: 4 }} activeDot={{ r: 6, className: "cursor-pointer" }} isAnimationActive={false} />
            </LineChart>
          </React.Suspense>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
