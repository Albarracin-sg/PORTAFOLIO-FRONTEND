import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";

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
        <ChartContainer config={config} className="w-full">
          <BarChart data={data} margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 12 }} width={30} />
            <ChartTooltip cursor={{ fill: "rgba(139, 92, 246, 0.1)" }} content={<ChartTooltipContent />} />
            <Bar dataKey="projects" fill="var(--color-projects)" radius={[10, 10, 0, 0]} isAnimationActive={false} className="cursor-pointer" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
