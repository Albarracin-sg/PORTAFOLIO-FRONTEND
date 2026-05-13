import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Activity, User, Globe, AlertCircle, Clock } from "lucide-react";

interface LogEntry {
  id: string;
  method: string;
  path: string;
  statusCode: number;
  ip: string;
  userAgent: string;
  responseTime: number;
  createdAt: string;
}

interface RecentActivityTableProps {
  pagedRecent: LogEntry[];
  recentPage: number;
  recentTotalPages: number;
  setRecentPage: (p: number) => void;
}

export function RecentActivityTable({ 
  pagedRecent, 
  recentPage, 
  recentTotalPages, 
  setRecentPage 
}: RecentActivityTableProps) {
  const { t } = useTranslation();

  return (
    <Card className="rounded-3xl border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] backdrop-blur-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-500">
            <Activity className="size-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold">{t("admin.logs.recentActivity")}</CardTitle>
            <CardDescription>{t("admin.logs.recentActivitySubtitle")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pagedRecent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-zinc-400">
              <AlertCircle className="size-8 opacity-20" />
              <p className="text-sm italic">{t("admin.logs.noActivity")}</p>
            </div>
          ) : (
            pagedRecent.map((log) => (
              <div
                key={log.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-zinc-100 dark:border-white/5 bg-white/40 dark:bg-white/[0.01] hover:bg-white dark:hover:bg-white/[0.03] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl font-mono text-[10px] font-bold ${
                    log.statusCode < 300 ? 'bg-emerald-500/10 text-emerald-500' :
                    log.statusCode < 400 ? 'bg-blue-500/10 text-blue-500' :
                    'bg-red-500/10 text-red-500'
                  }`}>
                    {log.method}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-white font-mono">
                        {log.path.replace("/api/v1/", "/")}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        log.statusCode < 300 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {log.statusCode}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[10px] text-zinc-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Globe className="size-3" /> {log.ip}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" /> {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="size-3" /> {log.responseTime}ms
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:self-center">
                  <div className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-white/5 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 truncate max-w-[150px] sm:max-w-[200px]">
                    {log.userAgent}
                  </div>
                  <div className="size-8 rounded-xl bg-violet-500/5 flex items-center justify-center text-violet-500">
                    <User className="size-4" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {recentTotalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRecentPage(Math.max(0, recentPage - 1))}
              disabled={recentPage === 0}
              className="h-8 rounded-xl px-4 text-xs hover:bg-violet-500/8 transition-all"
            >
              {t("common.pagination.previous")}
            </Button>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              {recentPage + 1} / {recentTotalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRecentPage(Math.min(recentTotalPages - 1, recentPage + 1))}
              disabled={recentPage === recentTotalPages - 1}
              className="h-8 rounded-xl px-4 text-xs hover:bg-violet-500/8 transition-all"
            >
              {t("common.pagination.next")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
