import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowLeft,
  Server,
  Activity,
  Clock,
  Zap,
  Shield,
  Globe,
  Bot,
  FolderOpen,
  Music,
  FolderGit2,
  BarChart3,
  RefreshCcw,
  TrendingUp,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useAdminAuth } from "@/features/admin/AdminAuthProvider";
import { fetchAdminStats, type AdminStats } from "@/shared/api/stats";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function AdminLogsPage() {
  const { t } = useTranslation();
  const { token } = useAdminAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (token) loadStats();
  }, [token]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAdminStats(token!);
      setStats(data);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBigNumber = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const endpointData = (stats?.endpoints ?? []).map((e) => ({
    path: e.path.replace("/api/v1/", ""),
    requests: e.totalRequests,
    avgTime: Math.round(e.avgResponseTime),
    method: e.method,
  }));

  // Derived health indicators
  const avgResponse = stats ? Math.round(stats.avgResponseTimeMs) : 0;
  const healthStatus =
    avgResponse < 100 ? "excellent" : avgResponse < 300 ? "good" : avgResponse < 600 ? "degraded" : "critical";
  const healthColors = {
    excellent: { text: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-400" },
    good: { text: "text-sky-500", bg: "bg-sky-500/10 border-sky-500/20", dot: "bg-sky-400" },
    degraded: { text: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20", dot: "bg-amber-400" },
    critical: { text: "text-red-500", bg: "bg-red-500/10 border-red-500/20", dot: "bg-red-400" },
  };
  const hc = healthColors[healthStatus];

  // Top 5 busiest endpoints
  const topEndpoints = [...endpointData].sort((a, b) => b.requests - a.requests).slice(0, 5);

  // Slowest endpoints
  const slowestEndpoints = [...endpointData].sort((a, b) => b.avgTime - a.avgTime).slice(0, 5);

  // Admin vs public split
  const adminRequests = endpointData.filter((e) => e.path.includes("admin")).reduce((s, e) => s + e.requests, 0);
  const publicRequests = endpointData.filter((e) => !e.path.includes("admin")).reduce((s, e) => s + e.requests, 0);
  const totalForRatio = adminRequests + publicRequests || 1;

  // Pagination for endpoint list
  const [endpointPage, setEndpointPage] = useState(0);
  const ENDPOINTS_PER_PAGE = 8;
  const totalPages = Math.ceil(endpointData.length / ENDPOINTS_PER_PAGE);
  const pagedEndpoints = endpointData.slice(
    endpointPage * ENDPOINTS_PER_PAGE,
    (endpointPage + 1) * ENDPOINTS_PER_PAGE,
  );

  const getEndpointIcon = (path: string) => {
    if (path.includes("spotify")) return Music;
    if (path.includes("github")) return FolderGit2;
    if (path.includes("stats")) return BarChart3;
    if (path.includes("projects")) return FolderOpen;
    if (path.includes("bot")) return Bot;
    if (path.includes("admin")) return Shield;
    return Globe;
  };

  const apiMetricCards = stats
    ? [
        {
          label: t("admin.logs.totalRequests"),
          value: formatBigNumber(stats.totalRequests),
          icon: Activity,
          color: "violet",
        },
        {
          label: t("admin.logs.requestsPerMin"),
          value: formatBigNumber(stats.requestsPerMinute),
          icon: Zap,
          color: "amber",
        },
        {
          label: t("admin.logs.avgResponse"),
          value: `${avgResponse}ms`,
          icon: Clock,
          color: avgResponse < 300 ? "emerald" : "red",
        },
        {
          label: t("admin.logs.uptime"),
          value: stats.uptime,
          icon: Server,
          color: "sky",
        },
        {
          label: t("admin.logs.restarts"),
          value: String(stats.restartCount),
          icon: RefreshCcw,
          color: stats.restartCount > 0 ? "red" : "emerald",
        },
        {
          label: t("admin.logs.endpointsCount"),
          value: String(endpointData.length),
          icon: Globe,
          color: "indigo",
        },
      ]
    : [];

  const colorMap: Record<string, { border: string; icon: string; badge: string }> = {
    violet: {
      border: "hover:border-violet-400/30 dark:hover:border-violet-500/30",
      icon: "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:bg-violet-500/15 dark:text-violet-400",
      badge: "text-violet-600 dark:text-violet-400",
    },
    amber: {
      border: "hover:border-amber-400/30 dark:hover:border-amber-500/30",
      icon: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400",
      badge: "text-amber-600 dark:text-amber-400",
    },
    emerald: {
      border: "hover:border-emerald-400/30 dark:hover:border-emerald-500/30",
      icon: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400",
      badge: "text-emerald-600 dark:text-emerald-400",
    },
    sky: {
      border: "hover:border-sky-400/30 dark:hover:border-sky-500/30",
      icon: "bg-sky-500/10 text-sky-600 border-sky-500/20 dark:bg-sky-500/15 dark:text-sky-400",
      badge: "text-sky-600 dark:text-sky-400",
    },
    red: {
      border: "hover:border-red-400/30 dark:hover:border-red-500/30",
      icon: "bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/15 dark:text-red-400",
      badge: "text-red-600 dark:text-red-400",
    },
    indigo: {
      border: "hover:border-indigo-400/30 dark:hover:border-indigo-500/30",
      icon: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:bg-indigo-500/15 dark:text-indigo-400",
      badge: "text-indigo-600 dark:text-indigo-400",
    },
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── Header ── */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          asChild
          className="group -ml-3 rounded-full text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-300 transition-all duration-200"
        >
          <Link to="/admin">
            <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-0.5" />
            {t("admin.logs.back")}
          </Link>
        </Button>

        <p className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-violet-500 dark:text-violet-400">
          <Sparkles className="h-3 w-3" />
          {t("admin.logs.liveInfra")}
        </p>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t("admin.logs.title")}
            </h1>
            <p className="mt-1.5 text-slate-500 dark:text-slate-400 text-base">
              {t("admin.logs.subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Health pill */}
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${hc.bg} ${hc.text}`}>
              <span className={`h-2 w-2 rounded-full animate-pulse ${hc.dot}`} />
              {t(`common.status.${healthStatus}`, { defaultValue: healthStatus })}
            </div>

            <Button
              onClick={loadStats}
              variant="outline"
              size="sm"
              className="h-9 rounded-2xl gap-2 border-slate-200 dark:border-white/10 hover:border-violet-300 hover:bg-violet-50 dark:hover:border-violet-500/30 dark:hover:bg-violet-900/10 transition-all duration-300 hover:scale-105"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              {t("admin.logs.refresh")}
            </Button>
          </div>
        </div>

        <p className="text-[10px] font-medium text-slate-400 dark:text-slate-600 uppercase tracking-widest">
          {t("common.lastUpdated", { defaultValue: "Last updated" })} · {formatTime(lastRefresh)}
        </p>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {apiMetricCards.map((card) => {
          const Icon = card.icon;
          const c = colorMap[card.color];
          return (
            <Card
              key={card.label}
              className={`border-slate-200 bg-white/70 dark:border-white/[0.07] dark:bg-white/[0.025] transition-all duration-200 ${c.border}`}
            >
              <CardContent className="pt-5 pb-4 px-4">
                <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl border ${c.icon}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className={`text-2xl font-bold tracking-tight text-slate-900 dark:text-white`}>
                  {card.value}
                </div>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600">
                  {card.label}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Traffic Overview ── */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Bar Chart — spans 2 cols */}
        <Card className="lg:col-span-2 border-slate-200 bg-white/70 dark:border-white/[0.07] dark:bg-white/[0.025]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">{t("admin.logs.trafficChart")}</CardTitle>
                <p className="text-xs text-slate-400 dark:text-slate-600 mt-0.5">{t("admin.logs.trafficPerRoute")}</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="h-2.5 w-2.5 rounded-sm bg-violet-500" /> {t("admin.logs.public")}
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" /> {t("admin.logs.admin")}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ requests: { label: t("admin.logs.requests"), color: "#8b5cf6" } }}
              className="aspect-video w-full"
            >
              <BarChart data={endpointData.slice(0, 15)} margin={{ bottom: 20 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.08} />
                <XAxis
                  dataKey="path"
                  tickLine={false}
                  axisLine={false}
                  tick={isMobile ? false : { fontSize: 10, fill: "currentColor", opacity: 0.4 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "currentColor", opacity: 0.4 }}
                />
                <ChartTooltip
                  cursor={{ fill: "rgba(139, 92, 246, 0.05)" }}
                  content={<ChartTooltipContent />}
                />
                <Bar dataKey="requests" radius={[6, 6, 0, 0]}>
                  {endpointData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
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
        <Card className="border-slate-200 bg-white/70 dark:border-white/[0.07] dark:bg-white/[0.025]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold">{t("admin.logs.trafficSplit")}</CardTitle>
            <p className="text-xs text-slate-400 dark:text-slate-600 mt-0.5">{t("admin.logs.publicVsAdmin")}</p>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            {/* Visual bar */}
            <div className="space-y-2">
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
                <div
                  className="bg-violet-500 transition-all duration-700"
                  style={{ width: `${(publicRequests / totalForRatio) * 100}%` }}
                />
                <div
                  className="bg-rose-500 transition-all duration-700"
                  style={{ width: `${(adminRequests / totalForRatio) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                <span>{t("admin.logs.public")} {Math.round((publicRequests / totalForRatio) * 100)}%</span>
                <span>{t("admin.logs.admin")} {Math.round((adminRequests / totalForRatio) * 100)}%</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-violet-500/15 bg-violet-500/5 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-violet-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("admin.logs.public")}</span>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{formatBigNumber(publicRequests)}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-rose-500/15 bg-rose-500/5 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-rose-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("admin.logs.admin")}</span>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{formatBigNumber(adminRequests)}</span>
              </div>
            </div>

            {/* Health summary */}
            <div className={`rounded-xl border px-4 py-3 ${hc.bg}`}>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className={`h-4 w-4 ${hc.text}`} />
                <span className={`text-xs font-bold uppercase tracking-widest ${hc.text}`}>
                  {t("admin.logs.apiHealth")}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("admin.logs.avgResponseText")} <strong className={hc.text}>{avgResponse}ms</strong> — {t("admin.logs.statusText")}{" "}
                <strong className={`capitalize ${hc.text}`}>{t(`common.status.${healthStatus}`, { defaultValue: healthStatus })}</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Top Endpoints + Slowest ── */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Busiest */}
        <Card className="border-slate-200 bg-white/70 dark:border-white/[0.07] dark:bg-white/[0.025]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-violet-500" />
              <CardTitle className="text-lg font-semibold">{t("admin.logs.busiestEndpoints")}</CardTitle>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-600">{t("admin.logs.highestVolume")}</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {topEndpoints.map((ep, i) => {
              const Icon = getEndpointIcon(ep.path);
              const isAdmin = ep.path.includes("admin");
              const pct = Math.round((ep.requests / (topEndpoints[0]?.requests || 1)) * 100);
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 ${isAdmin ? "bg-rose-500/10 text-rose-500" : "bg-violet-500/10 text-violet-500"}`}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-400 truncate">
                        /{ep.path}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white shrink-0 ml-2">
                      {formatBigNumber(ep.requests)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
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
        <Card className="border-slate-200 bg-white/70 dark:border-white/[0.07] dark:bg-white/[0.025]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <CardTitle className="text-lg font-semibold">{t("admin.logs.slowestEndpoints")}</CardTitle>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-600">{t("admin.logs.highestLatency")}</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {slowestEndpoints.map((ep, i) => {
              const Icon = getEndpointIcon(ep.path);
              const pct = Math.round((ep.avgTime / (slowestEndpoints[0]?.avgTime || 1)) * 100);
              const isSlow = ep.avgTime > 500;
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 ${isSlow ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"}`}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-400 truncate">
                        /{ep.path}
                      </span>
                    </div>
                    <span className={`text-xs font-bold shrink-0 ml-2 ${isSlow ? "text-red-500" : "text-amber-600 dark:text-amber-400"}`}>
                      {ep.avgTime}ms
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
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

      {/* ── Full Endpoint Table ── */}
      <Card className="border-slate-200 bg-white/70 dark:border-white/[0.07] dark:bg-white/[0.025]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">{t("admin.logs.allEndpoints")}</CardTitle>
              <p className="text-xs text-slate-400 dark:text-slate-600 mt-0.5">
                {endpointData.length} {t("admin.logs.routesTracked")}
              </p>
            </div>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-600 tabular-nums">
              {endpointPage + 1} / {totalPages}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {/* Table header */}
          <div className="grid grid-cols-12 px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">
            <span className="col-span-1">{t("admin.logs.method").substring(0, 1)}</span>
            <span className="col-span-7">Path</span>
            <span className="col-span-2 text-right">Req</span>
            <span className="col-span-2 text-right">{t("admin.logs.avg")}</span>
          </div>

          {pagedEndpoints.map((ep, i) => {
            const Icon = getEndpointIcon(ep.path);
            const isAdmin = ep.path.includes("admin");
            const isSlow = ep.avgTime > 500;
            return (
              <div
                key={i}
                className={`grid grid-cols-12 items-center rounded-xl border px-3 py-2.5 transition-all duration-150 ${
                  isAdmin
                    ? "border-rose-100 bg-rose-50/40 hover:bg-rose-50/70 dark:border-rose-500/10 dark:bg-rose-500/5 dark:hover:bg-rose-500/8"
                    : "border-slate-100 bg-white/50 hover:bg-slate-50/80 dark:border-white/[0.05] dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
                }`}
              >
                <div className="col-span-1">
                  <span className={`text-[9px] font-black uppercase tracking-wider ${isAdmin ? "text-rose-400" : "text-violet-400"}`}>
                    {ep.method}
                  </span>
                </div>
                <div className="col-span-7 flex items-center gap-2 min-w-0">
                  <div className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 ${isAdmin ? "bg-rose-500/10 text-rose-500" : "bg-violet-500/10 text-violet-500"}`}>
                    <Icon className="h-2.5 w-2.5" />
                  </div>
                  <span className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate">
                    /{ep.path}
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                    {formatBigNumber(ep.requests)}
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <span className={`text-xs font-semibold tabular-nums ${isSlow ? "text-red-500" : "text-slate-500 dark:text-slate-400"}`}>
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
                onClick={() => setEndpointPage((p) => Math.max(0, p - 1))}
                disabled={endpointPage === 0}
                className="h-9 rounded-2xl px-4 gap-1.5 text-sm hover:bg-violet-500/8 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200"
              >
                {t("common.pagination.previous")}
              </Button>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-600 tabular-nums">
                {endpointPage + 1} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEndpointPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={endpointPage === totalPages - 1}
                className="h-9 rounded-2xl px-4 gap-1.5 text-sm hover:bg-violet-500/8 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200"
              >
                {t("common.pagination.next")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
