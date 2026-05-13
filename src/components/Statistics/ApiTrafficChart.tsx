import * as React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

// Lazy load recharts components
const BarChart = React.lazy(() => import("recharts").then(m => ({ default: m.BarChart })));
const Bar = React.lazy(() => import("recharts").then(m => ({ default: m.Bar })));
const Cell = React.lazy(() => import("recharts").then(m => ({ default: m.Cell })));
const CartesianGrid = React.lazy(() => import("recharts").then(m => ({ default: m.CartesianGrid })));
const XAxis = React.lazy(() => import("recharts").then(m => ({ default: m.XAxis })));
const YAxis = React.lazy(() => import("recharts").then(m => ({ default: m.YAxis })));

interface ApiTrafficChartProps {
  data: any[];
  isMobile: boolean;
}

export function ApiTrafficChart({ data, isMobile }: ApiTrafficChartProps) {
  const { t } = useTranslation();

  return (
    <Card className="mt-6 sm:mt-8 border-zinc-200 bg-white/85 dark:border-white/[0.07] dark:bg-white/[0.025]">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          {t("stats.apiTrafficByEndpoint")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            requests: { label: "Requests", color: "#8b5cf6" },
            avgTime: { label: "Avg (ms)", color: "#06b6d4" },
          }}
          className="aspect-square h-64 sm:aspect-video sm:h-80 w-full"
        >
          <React.Suspense fallback={<div className="flex h-full w-full items-center justify-center animate-pulse bg-zinc-100/50 dark:bg-zinc-800/50 rounded-lg" />}>
            <BarChart data={data} margin={{ left: 0, right: 10, top: 0, bottom: 25 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="path"
                tickLine={false}
                axisLine={false}
                tick={isMobile ? false : { fontSize: 10, fill: "currentColor", opacity: 0.7 }}
                interval={isMobile ? "preserveStartEnd" : 0}
                height={isMobile ? 10 : 40}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                tick={{ fontSize: 12 }}
                width={40}
              />
              <ChartTooltip
                cursor={{ fill: "rgba(139, 92, 246, 0.1)" }}
                content={<ChartTooltipContent />}
              />
              <Bar
                dataKey="requests"
                fill="var(--color-requests)"
                radius={[8, 8, 0, 0]}
                isAnimationActive={false}
                className="cursor-pointer"
              >
                {data.map((entry) => (
                  <Cell
                    key={`cell-${entry.path}-${entry.method}`}
                    fill={entry.path.includes("spotify") ? "#10b981" : "var(--color-requests)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </React.Suspense>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
