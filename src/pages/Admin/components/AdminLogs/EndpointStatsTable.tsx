import { useTranslation } from "react-i18next";
import { TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EndpointStatsTableProps {
  topEndpoints: any[];
  slowestEndpoints: any[];
  getEndpointIcon: (path: string) => any;
  formatBigNumber: (n: number) => string;
}

export function EndpointStatsTable({
  topEndpoints,
  slowestEndpoints,
  getEndpointIcon,
  formatBigNumber,
}: EndpointStatsTableProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Busiest */}
      <Card className="border-zinc-200 bg-white/70 dark:border-white/[0.07] dark:bg-white/[0.025]">
        <CardHeader className="pb-3 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-violet-500 shrink-0" />
            <CardTitle className="text-base sm:text-lg font-semibold truncate">{t("admin.logs.busiestEndpoints")}</CardTitle>
          </div>
          <p className="text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-600">{t("admin.logs.highestVolume")}</p>
        </CardHeader>
        <CardContent className="space-y-5 px-4 sm:px-6">
          {topEndpoints.map((ep) => {
            const Icon = getEndpointIcon(ep.path);
            const isAdmin = ep.path.includes("admin");
            const pct = Math.round((ep.requests / (topEndpoints[0]?.requests || 1)) * 100);
            return (
              <div key={ep.path} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className={`size-6 rounded-lg flex items-center justify-center shrink-0 ${isAdmin ? "bg-rose-500/10 text-rose-500" : "bg-violet-500/10 text-violet-500"}`}>
                      <Icon className="size-3" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-mono text-zinc-600 dark:text-zinc-400 truncate block">
                      /{ep.path}
                    </span>
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-zinc-900 dark:text-white shrink-0 tabular-nums">
                    {formatBigNumber(ep.requests)}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${isAdmin ? "bg-rose-400" : "bg-violet-400"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Slowest */}
      <Card className="border-zinc-200 bg-white/70 dark:border-white/[0.07] dark:bg-white/[0.025]">
        <CardHeader className="pb-3 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-amber-500 shrink-0" />
            <CardTitle className="text-base sm:text-lg font-semibold truncate">{t("admin.logs.slowestEndpoints")}</CardTitle>
          </div>
          <p className="text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-600">{t("admin.logs.highestLatency")}</p>
        </CardHeader>
        <CardContent className="space-y-5 px-4 sm:px-6">
          {slowestEndpoints.map((ep) => {
            const Icon = getEndpointIcon(ep.path);
            const pct = Math.round((ep.avgTime / (slowestEndpoints[0]?.avgTime || 1)) * 100);
            const isSlow = ep.avgTime > 500;
            return (
              <div key={ep.path} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className={`size-6 rounded-lg flex items-center justify-center shrink-0 ${isSlow ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"}`}>
                      <Icon className="size-3" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-mono text-zinc-600 dark:text-zinc-400 truncate block">
                      /{ep.path}
                    </span>
                  </div>
                  <span className={`text-[11px] sm:text-xs font-bold shrink-0 tabular-nums ${isSlow ? "text-red-500" : "text-amber-600 dark:text-amber-400"}`}>
                    {ep.avgTime}ms
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${isSlow ? "bg-red-400" : "bg-amber-400"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
