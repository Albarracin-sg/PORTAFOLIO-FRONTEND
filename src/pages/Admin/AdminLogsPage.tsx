import { useEffect, useCallback, useReducer, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  LayoutDashboard,
  Server,
  Clock,
  Activity
} from "lucide-react";

import { useAdminAuth } from "@/features/admin/AdminAuthProvider";
import { fetchAdminStats, type AdminStats } from "@/shared/api/admin";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { getNumberFormatter } from "@/shared/utils/formatters";

// Subcomponents
import { LogMetricCards } from "./components/AdminLogs/LogMetricCards";
import { TrafficCharts } from "./components/AdminLogs/TrafficCharts";
import { EndpointStatsTable } from "./components/AdminLogs/EndpointStatsTable";
import { RecentActivityTable } from "./components/AdminLogs/RecentActivityTable";
import { EndpointTable } from "./components/AdminLogs/EndpointTable";

interface LogsState {
  stats: AdminStats | null;
  isLoading: boolean;
  recentPage: number;
  endpointPage: number;
}

type LogsAction = 
  | { type: 'SET_STATS'; payload: AdminStats }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_RECENT_PAGE'; payload: number }
  | { type: 'SET_ENDPOINT_PAGE'; payload: number };

function logsReducer(state: LogsState, action: LogsAction): LogsState {
  switch (action.type) {
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_RECENT_PAGE':
      return { ...state, recentPage: action.payload };
    case 'SET_ENDPOINT_PAGE':
      return { ...state, endpointPage: action.payload };
    default:
      return state;
  }
}

export default function AdminLogsPage() {
  const { t, i18n } = useTranslation();
  const { token } = useAdminAuth();
  
  const [state, dispatch] = useReducer(logsReducer, {
    stats: null,
    isLoading: true,
    recentPage: 1,
    endpointPage: 1,
  });

  const { stats, isLoading, recentPage, endpointPage } = state;

  const recentItemsPerPage = 8;

  const loadData = useCallback(async () => {
    if (!token) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const adminStats = await fetchAdminStats(token);
      dispatch({ type: 'SET_STATS', payload: adminStats });
    } catch (err) {
      console.error("Error loading logs:", err);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatBigNumber = (num: number) => {
    return getNumberFormatter(i18n.language).format(num);
  };

  const avgResponse = stats ? Math.round(stats.avgResponseTimeMs) : 0;

  // ── Recent activity ──
  const pagedRecent = stats 
    ? stats.recentRequests.slice((recentPage - 1) * recentItemsPerPage, recentPage * recentItemsPerPage)
    : [];
  const recentTotalPages = stats ? Math.ceil(stats.recentRequests.length / recentItemsPerPage) : 0;

  // ── Endpoints from API ──
  const endpoints = useMemo(() => (stats?.endpoints ?? []).map(e => ({
    path: e.path,
    method: e.method,
    requests: e.totalRequests,
    avgTime: Math.round(e.avgResponseTime),
  })), [stats]);

  const chartData = useMemo(() => {
    const RATIO = 5;
    let remaining = [...endpoints];
    for (;;) {
      if (remaining.length <= 1) break;
      const sorted = [...remaining].sort((a, b) => b.requests - a.requests);
      if (sorted[0].requests > sorted[1].requests * RATIO) {
        const dom = sorted[0];
        remaining = remaining.filter(
          (e) => !(e.path === dom.path && e.method === dom.method),
        );
      } else break;
    }
    return remaining;
  }, [endpoints]);

  const publicRequests = endpoints
    .filter(e => !e.path.includes("admin"))
    .reduce((s, e) => s + e.requests, 0);
  const adminRequests = endpoints
    .filter(e => e.path.includes("admin"))
    .reduce((s, e) => s + e.requests, 0);

  const topEndpoints = useMemo(
    () => [...endpoints].sort((a, b) => b.requests - a.requests).slice(0, 5),
    [endpoints],
  );
  const slowestEndpoints = useMemo(
    () => [...endpoints].sort((a, b) => b.avgTime - a.avgTime).slice(0, 5),
    [endpoints],
  );

  // ── Endpoint table pagination ──
  const ENDPOINT_ITEMS_PER_PAGE = 10;
  const totalEndpointPages = Math.ceil(endpoints.length / ENDPOINT_ITEMS_PER_PAGE);
  const pagedEndpoints = endpoints.slice(
    endpointPage * ENDPOINT_ITEMS_PER_PAGE,
    (endpointPage + 1) * ENDPOINT_ITEMS_PER_PAGE,
  );

  const healthColor = avgResponse < 500 ? "emerald" : "red";

  if (isLoading && !stats) return <LoadingScreen />;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── Header ── */}
      <div className="mb-8 sm:mb-12">
        <Button
          variant="ghost"
          asChild
          className="group mb-2 sm:mb-6 rounded-full border border-zinc-200 bg-white px-4 py-2 text-black transition-all hover:bg-violet-700 hover:text-white hover:border-violet-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:hover:bg-violet-600 dark:hover:text-white"
        >
          <Link to="/admin">
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            {t("admin.logs.back")}
          </Link>
        </Button>

        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-600 dark:text-violet-400">
            {t("admin.logs.liveInfra")}
          </p>
          <div className="mt-3 flex items-center justify-center gap-4">
            <LayoutDashboard className="size-10 text-violet-500 shrink-0 hidden sm:block" />
            <h1 className="text-5xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-6xl">
              {t("admin.logs.title")}
            </h1>
          </div>
          <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-400 sm:text-base">
            {t("admin.logs.subtitle")}
          </p>
        </div>
      </div>

      <LogMetricCards 
        metrics={[
          { label: t("admin.logs.uptime"), value: stats?.uptime || "", icon: Server, color: "sky" },
          { label: t("admin.logs.avgResponse"), value: `${avgResponse}ms`, icon: Clock, color: avgResponse < 300 ? "emerald" : "red" },
        ]}
      />

      <TrafficCharts
        chartData={chartData}
        publicRequests={publicRequests}
        adminRequests={adminRequests}
        totalForRatio={publicRequests + adminRequests || 1}
        avgResponse={avgResponse}
        healthStatus={healthColor === "emerald" ? "healthy" : "degraded"}
        hc={{
          bg: `bg-${healthColor}-500/10 border-${healthColor}-500/20`,
          text: `text-${healthColor}-500`,
        }}
        formatBigNumber={formatBigNumber}
      />

      <EndpointStatsTable
        topEndpoints={topEndpoints}
        slowestEndpoints={slowestEndpoints}
        getEndpointIcon={() => Activity}
        formatBigNumber={formatBigNumber}
      />

      <RecentActivityTable
        pagedRecent={pagedRecent.map(req => ({
          id: req.id,
          method: req.method,
          path: req.path,
          timestamp: req.timestamp,
          statusCode: req.status,
          createdAt: req.timestamp,
          ip: req.ip ?? "0.0.0.0",
          userAgent: req.userAgent ?? "System",
          responseTime: req.responseTime,
        }))}
        recentPage={recentPage}
        recentTotalPages={recentTotalPages}
        setRecentPage={(p) => dispatch({ type: "SET_RECENT_PAGE", payload: p })}
      />

      <EndpointTable
        endpointData={endpoints}
        pagedEndpoints={pagedEndpoints}
        endpointPage={endpointPage}
        totalPages={totalEndpointPages}
        setEndpointPage={(p) => dispatch({ type: "SET_ENDPOINT_PAGE", payload: p })}
        getEndpointIcon={() => Activity}
        formatBigNumber={formatBigNumber}
      />

    </div>
  );
}
