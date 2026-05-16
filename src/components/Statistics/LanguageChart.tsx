import { useMemo } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { useTranslation } from "react-i18next";

interface Props {
  data: Array<Record<string, unknown>>;
  config: ChartConfig;
}

export function LanguageChart({ data, config }: Props) {
  const { i18n } = useTranslation();
  const isSpanish = i18n.language?.startsWith("es");

  const chartData = useMemo(
    () =>
      data.length > 0
        ? data.map((d) => ({
            name: String(d.name ?? ""),
            value: Number(d.value ?? 0),
            color: (d.color as string) ?? undefined,
          }))
        : [{ name: isSpanish ? "Sin datos" : "No data", value: 1, color: "#e4e4e7" }],
    [data, isSpanish],
  );

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {isSpanish ? "Distribución de Lenguajes" : "Language Distribution"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center text-sm text-zinc-400">
            {isSpanish ? "No hay datos de lenguajes" : "No language data available"}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isSpanish ? "Distribución de Lenguajes" : "Language Distribution"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="w-full">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius="60%"
              outerRadius="90%"
              paddingAngle={4}
              isAnimationActive={false}
            >
              {chartData.map((entry) => (
                <Cell
                  key={`lang-${entry.name}`}
                  fill={entry.color ?? "#8b5cf6"}
                />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
