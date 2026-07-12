import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, Cell, CartesianGrid, XAxis, YAxis } from "recharts";

interface ApiTrafficChartProps {
  data: any[];
  isMobile: boolean;
}

export function ApiTrafficChart({ data, isMobile }: ApiTrafficChartProps) {
  const { t } = useTranslation();

  const chartConfig = useMemo(() => ({
    requests: { label: t("stats.apiTotalRequests"), color: "#8b5cf6" },
  }), [t]);

  return (
    <Card className="mt-6 sm:mt-8 border-zinc-200 bg-white/85 dark:bg-zinc-950/75 dark:border-white/10">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          {t("stats.apiTrafficByEndpoint")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full">
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
            <ChartTooltip cursor={{ fill: "rgba(139, 92, 246, 0.1)" }} content={<ChartTooltipContent />} />
            <Bar
              dataKey="requests"
              fill="var(--color-requests)"
              radius={[8, 8, 0, 0]}
              isAnimationActive={false}
              className="cursor-pointer"
            >
              {data.map((entry, idx) => (
                <Cell
                  key={`cell-${idx}`}
                  fill={String(entry.path ?? "").includes("spotify") ? "#10b981" : "var(--color-requests)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
