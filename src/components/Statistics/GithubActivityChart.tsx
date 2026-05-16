import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts";

interface GithubActivityChartProps {
  data: any[];
  config: ChartConfig;
}

export function GithubActivityChart({ data, config }: GithubActivityChartProps) {
  const { t } = useTranslation();

  return (
    <Card className="border-zinc-200 bg-white/85 dark:border-white/[0.07] dark:bg-white/[0.025]">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          {t("stats.githubActivity")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="w-full">
          <LineChart data={data} margin={{ left: 0, right: 10 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 12 }} width={30} />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            <Line type="monotone" dataKey="commits" stroke="var(--color-commits)" strokeWidth={2.5} dot={{ fill: "var(--color-commits)", r: 4 }} activeDot={{ r: 6, className: "cursor-pointer" }} isAnimationActive={false} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
