import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EndpointTableProps {
  endpointData: any[];
  pagedEndpoints: any[];
  endpointPage: number;
  totalPages: number;
  setEndpointPage: (p: any) => void;
  getEndpointIcon: (path: string) => any;
  formatBigNumber: (n: number) => string;
}

export function EndpointTable({
  endpointData,
  pagedEndpoints,
  endpointPage,
  totalPages,
  setEndpointPage,
  getEndpointIcon,
  formatBigNumber,
}: EndpointTableProps) {
  const { t } = useTranslation();

  return (
    <Card className="border-zinc-200 bg-white/70 dark:border-white/[0.07] dark:bg-white/[0.025]">
      <CardHeader className="pb-3 px-4 sm:px-6 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-semibold">{t("admin.logs.allEndpoints")}</CardTitle>
          <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-0.5">
            {endpointData.length} {t("admin.logs.routesTracked")}
          </p>
        </div>
        <span className="text-xs font-medium text-zinc-400 dark:text-zinc-600 tabular-nums">
          {endpointPage + 1} / {totalPages}
        </span>
      </CardHeader>
      <CardContent className="space-y-1.5 px-4 sm:px-6 pb-6">
        {/* Table header */}
        <div className="grid grid-cols-12 px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
          <span className="col-span-1">{t("admin.logs.method").substring(0, 1)}</span>
          <span className="col-span-7">Path</span>
          <span className="col-span-2 text-right">Req</span>
          <span className="col-span-2 text-right">{t("admin.logs.avg")}</span>
        </div>

        {pagedEndpoints.map((ep) => {
          const Icon = getEndpointIcon(ep.path);
          const isAdmin = ep.path.includes("admin");
          const isSlow = ep.avgTime > 500;
          return (
            <div
              key={`${ep.method}-${ep.path}`}
              className={`grid grid-cols-12 items-center rounded-xl border px-3 py-2.5 transition-all duration-150 ${
                isAdmin
                  ? "border-rose-100 bg-rose-50/40 hover:bg-rose-50/70 dark:border-rose-500/10 dark:bg-rose-500/5 dark:hover:bg-rose-500/8"
                  : "border-zinc-100 bg-white/50 hover:bg-zinc-50/80 dark:border-white/[0.05] dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
              }`}
            >
              <div className="col-span-1">
                <span className={`text-[9px] font-semibold uppercase tracking-wider ${isAdmin ? "text-rose-400" : "text-violet-400"}`}>
                  {ep.method}
                </span>
              </div>
              <div className="col-span-7 flex items-center gap-2 min-w-0">
                <div className={`size-5 rounded-md flex items-center justify-center shrink-0 ${isAdmin ? "bg-rose-500/10 text-rose-500" : "bg-violet-500/10 text-violet-500"}`}>
                  <Icon className="size-2.5" />
                </div>
                <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300 truncate">
                  /{ep.path}
                </span>
              </div>
              <div className="col-span-2 text-right">
                <span className="text-sm font-bold text-zinc-900 dark:text-white tabular-nums">
                  {formatBigNumber(ep.requests)}
                </span>
              </div>
              <div className="col-span-2 text-right">
                <span className={`text-xs font-semibold tabular-nums ${isSlow ? "text-red-500" : "text-zinc-500 dark:text-zinc-400"}`}>
                  {ep.avgTime}ms
                </span>
              </div>
            </div>
          );
        })}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEndpointPage((p: number) => Math.max(0, p - 1))}
              disabled={endpointPage === 0}
              className="h-9 rounded-2xl px-4 gap-1.5 text-sm hover:bg-violet-500/8 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200"
            >
              {t("common.pagination.previous")}
            </Button>
            <span className="text-xs font-medium text-zinc-400 dark:text-zinc-600 tabular-nums">
              {endpointPage + 1} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEndpointPage((p: number) => Math.min(totalPages - 1, p + 1))}
              disabled={endpointPage === totalPages - 1}
              className="h-9 rounded-2xl px-4 gap-1.5 text-sm hover:bg-violet-500/8 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200"
            >
              {t("common.pagination.next")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
