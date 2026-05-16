import { useTranslation } from "react-i18next";
import { Globe, Shield, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, Cell, CartesianGrid, XAxis, YAxis } from "recharts";

interface TrafficChartsProps {
  chartData: any[];
  publicRequests: number;
  adminRequests: number;
  totalForRatio: number;
  avgResponse: number;
  healthStatus: string;
  hc: any;
  formatBigNumber: (n: number) => string;
}

export function TrafficCharts({
  chartData,
  publicRequests,
  adminRequests,
  totalForRatio,
  avgResponse,
  healthStatus,
  hc,
  formatBigNumber,
}: TrafficChartsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Bar Chart — spans 2 cols */}
      <Card className="lg:col-span-2 border-zinc-200 bg-white/70 dark:border-white/[0.07] dark:bg-white/[0.025]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">{t("admin.logs.trafficChart")}</CardTitle>
              <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-0.5">{t("admin.logs.trafficPerRoute")}</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-zinc-500">
                <span className="size-2.5 rounded-sm bg-violet-500" /> {t("admin.logs.public")}
              </span>
              <span className="flex items-center gap-1.5 text-zinc-500">
                <span className="size-2.5 rounded-sm bg-rose-500" /> {t("admin.logs.admin")}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{ requests: { label: t("admin.logs.requests"), color: "#8b5cf6" } }}
            className="w-full"
          >
            <BarChart data={chartData.slice(0, 15)} margin={{ bottom: 20 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.08} />
              <XAxis dataKey="path" tickLine={false} axisLine={false} tick={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "currentColor", opacity: 0.4 }}
              />
              <ChartTooltip cursor={{ fill: "rgba(139, 92, 246, 0.05)" }} content={<ChartTooltipContent />} />
              <Bar dataKey="requests" radius={[6, 6, 0, 0]}>
                {chartData.slice(0, 15).map((entry) => (
                  <Cell
                    key={entry.path}
                    fill={entry.path.includes("admin") ? "#f43f5e" : "#8b5cf6"}
                    opacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Traffic split */}
      <Card className="border-zinc-200 bg-white/70 dark:border-white/[0.07] dark:bg-white/[0.025]">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold">{t("admin.logs.trafficSplit")}</CardTitle>
          <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-0.5">{t("admin.logs.publicVsAdmin")}</p>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          <div className="space-y-2">
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-white/5">
              <div
                className="bg-violet-500 transition-all duration-700"
                style={{ width: `${(publicRequests / totalForRatio) * 100}%` }}
              />
              <div
                className="bg-rose-500 transition-all duration-700"
                style={{ width: `${(adminRequests / totalForRatio) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
              <span>{t("admin.logs.public")} {Math.round((publicRequests / totalForRatio) * 100)}%</span>
              <span>{t("admin.logs.admin")} {Math.round((adminRequests / totalForRatio) * 100)}%</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-violet-500/15 bg-violet-500/5 px-4 py-3">
              <div className="flex items-center gap-2">
                <Globe className="size-4 text-violet-500" />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("admin.logs.public")}</span>
              </div>
              <span className="text-sm font-bold text-zinc-900 dark:text-white">{formatBigNumber(publicRequests)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-rose-500/15 bg-rose-500/5 px-4 py-3">
              <div className="flex items-center gap-2">
                <Shield className="size-4 text-rose-500" />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("admin.logs.admin")}</span>
              </div>
              <span className="text-sm font-bold text-zinc-900 dark:text-white">{formatBigNumber(adminRequests)}</span>
            </div>
          </div>

          <div className={`rounded-xl border px-4 py-3 ${hc.bg}`}>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className={`size-4 ${hc.text}`} />
              <span className={`text-xs font-bold uppercase tracking-widest ${hc.text}`}>
                {t("admin.logs.apiHealth")}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t("admin.logs.avgResponseText")} <strong className={hc.text}>{avgResponse}ms</strong> - {t("admin.logs.statusText")}{" "}
              <strong className={`capitalize ${hc.text}`}>{t(`common.status.${healthStatus}`, { defaultValue: healthStatus })}</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
