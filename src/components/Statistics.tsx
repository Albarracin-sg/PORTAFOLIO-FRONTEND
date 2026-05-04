import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowLeft, FolderGit2, GitBranch, Star, Users, Server, Activity, Clock, Zap, Music, BarChart3, Bot, FolderOpen, Shield, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { GithubStats, ApiStats } from "@/shared/api/public";

interface StatsCard {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface StatisticsProps {
  githubStats?: GithubStats | null;
  apiStats?: ApiStats | null;
}

export default function Statistics({ githubStats, apiStats }: StatisticsProps) {
  const { t, i18n } = useTranslation();
  const isSpanish = i18n.language.startsWith("es");

  const languageData =
    (githubStats?.languageData as Array<Record<string, unknown>>) ??
    [];

  const projectsData =
    (githubStats?.projectsData as Array<Record<string, unknown>>) ??
    [];

  const githubActivity =
    (githubStats?.githubActivity as Array<Record<string, unknown>>) ??
    [];

  const cards: StatsCard[] = githubStats
    ? [
        {
          title: t("stats.totalRepos"),
          value: String(githubStats.totalRepos),
          description:
            githubStats.privateRepos > 0
              ? t("stats.totalReposDescription", {
                  public: githubStats.publicRepos,
                  private: githubStats.privateRepos,
                })
              : t("stats.publicReposDescription", { public: githubStats.publicRepos }),
          icon: FolderGit2,
        },
        {
          title: t("stats.totalStars"),
          value: String(githubStats.stars),
          description: t("stats.totalStarsDescription"),
          icon: Star,
        },
        {
          title: t("stats.totalForks"),
          value: String(githubStats.forks),
          description: t("stats.totalForksDescription"),
          icon: GitBranch,
        },
        {
          title: t("stats.followers"),
          value: String(githubStats.followers),
          description: t("stats.followersDescription"),
          icon: Users,
        },
      ]
    : [];

  const factualMetrics = githubStats
    ? [
        { label: t("stats.pullRequests"), value: String(githubStats.pullRequests) },
        { label: t("stats.following"), value: String(githubStats.following) },
        { label: t("stats.languagesTracked"), value: String(languageData.length) },
      ]
    : [
        { label: t("stats.languagesTracked"), value: String(languageData.length) },
        { label: t("stats.projectsTimeline"), value: String(projectsData.length) },
        { label: t("stats.githubCommits"), value: String(githubActivity.length) },
      ];

  // ——— API Stats derived data ———
  const formatUptime = (raw: string) => {
    if (!raw) return "—";
    const totalMinutes = raw.match(/(\d+)\s*(?:min|m)\b/);
    if (/\d+\s*d\b/.test(raw)) {
      if (!isSpanish) return raw;
      return raw
        .replace(/(\d+)d\b/g, "$1 d")
        .replace(/(\d+)h\b/g, "$1 h")
        .replace(/(\d+)m\b/g, "$1 min")
        .replace(/(\d+)s\b/g, "$1 s");
    }
    if (totalMinutes && parseInt(totalMinutes[1]) > 60) {
      const mins = parseInt(totalMinutes[1]);
      if (mins >= 1440) {
        const d = Math.floor(mins / 1440);
        const h = Math.floor((mins % 1440) / 60);
        return `${d}d ${h}h`;
      }
      if (mins >= 60) {
        const h = Math.floor(mins / 60);
        const m = Math.floor(mins % 60);
        return `${h}h ${m}min`;
      }
    }
    if (!isSpanish) return raw;
    return raw
      .replace(/(\d+)d\b/g, "$1 d")
      .replace(/(\d+)h\b/g, "$1 h")
      .replace(/(\d+)m\b/g, "$1 min")
      .replace(/(\d+)s\b/g, "$1 s");
  };

  const formatBigNumber = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
  };

  const endpointChartData = (apiStats?.endpoints ?? [])
    .map(e => ({
      path: e.path.replace("/api/v1/", ""),
      requests: e.totalRequests,
      avgTime: Math.round(e.avgResponseTime),
      method: e.method,
    }))
    .filter(e => !e.path.includes("admin") && !e.path.includes("docs") && !e.path.includes("swagger"));

  const apiMetricCards = apiStats ? [
    { label: t("stats.apiTotalRequests"), value: formatBigNumber(apiStats.totalRequests), icon: Activity },
    { label: t("stats.apiRequestsPerMin"), value: formatBigNumber(apiStats.requestsPerMinute), icon: Zap },
    { label: t("stats.apiAvgResponse"), value: `${Math.round(apiStats.avgResponseTimeMs)}ms`, icon: Clock },
    { label: t("stats.apiUptime"), value: formatUptime(apiStats.uptime), icon: Server },
  ] : [];

  const getEndpointIcon = (path: string) => {
    if (path.includes("spotify")) return Music;
    if (path.includes("github")) return FolderGit2;
    if (path.includes("stats")) return BarChart3;
    if (path.includes("projects")) return FolderOpen;
    if (path.includes("bot")) return Bot;
    if (path.includes("admin")) return Shield;
    return Globe;
  };

  // Pagination for endpoint list
  const [endpointPage, setEndpointPage] = useState(0);
  const ENDPOINTS_PER_PAGE = 5;
  const totalPages = Math.ceil(endpointChartData.length / ENDPOINTS_PER_PAGE);
  const pagedEndpoints = endpointChartData.slice(
    endpointPage * ENDPOINTS_PER_PAGE,
    (endpointPage + 1) * ENDPOINTS_PER_PAGE,
  );

  const languageChartConfig = {
    value: { label: isSpanish ? "Uso" : "Usage", color: "#8b5cf6" },
    ...Object.fromEntries(
      languageData.map((item) => [
        String(item.name),
        { label: String(item.name), color: String(item.color ?? "#8b5cf6") },
      ]),
    ),
  } satisfies ChartConfig;

  const projectChartConfig = {
    projects: { label: t("stats.projectsTimeline"), color: "#8b5cf6" },
  } satisfies ChartConfig;

  const activityChartConfig = {
    commits: { label: t("stats.githubActivity"), color: "#8b5cf6" },
  } satisfies ChartConfig;

  return (
    <section className="min-h-screen px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header — idéntico a AllProjects */}
        <div className="mb-8 sm:mb-12">
          <Button
            variant="ghost"
            asChild
            className="group mb-2 sm:mb-6 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-slate-600 transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:border-violet-400/30 dark:hover:bg-violet-500/10 dark:hover:text-violet-200"
          >
            <Link to="/">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              {t("common.back")}
            </Link>
          </Button>

          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-600 dark:text-violet-400">
              {t("stats.title")}
            </p>
            <h1 className="mt-3 text-5xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
              {t("stats.title")}
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
              {t("stats.subtitle")}
            </p>
          </div>
        </div>

        {/* Stats cards */}
        <div className="mb-8 sm:mb-12 grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.title}
                className="border-slate-200 bg-white/85 transition-colors hover:border-violet-400/30 hover:bg-white dark:border-white/[0.07] dark:bg-white/[0.025] dark:hover:bg-white/[0.04]"
              >
                <CardHeader className="pb-2 sm:pb-3">
                  <div className="mb-2 sm:mb-3 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl border border-slate-200 bg-violet-50 text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-sm sm:text-base font-semibold tracking-tight text-slate-900 dark:text-white">
                    {stat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                    {stat.value}
                  </div>
                  <p className="mt-1 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-slate-600 dark:text-slate-400">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
          <Card className="border-slate-200 bg-white/85 dark:border-white/[0.07] dark:bg-white/[0.025]">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {t("stats.languagesUsed")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={languageChartConfig} className="aspect-square h-64 sm:aspect-video sm:h-80 w-full">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} trigger="hover" />
                  <Pie data={languageData} dataKey="value" nameKey="name" innerRadius="60%" outerRadius="90%" paddingAngle={4} isAnimationActive={false}>
                    {languageData.map((entry, index) => (
                      <Cell key={`language-${index}`} fill={String(entry.color ?? "#8b5cf6")} className="cursor-pointer outline-none" />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="mt-4 sm:mt-5 flex flex-wrap gap-2 sm:gap-3">
                {languageData.map((entry, index) => (
                  <div key={`language-legend-${index}`} className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                    <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full" style={{ backgroundColor: String(entry.color ?? "#8b5cf6") }} />
                    <span>{String(entry.name)}</span>
                    <span className="text-slate-400 dark:text-slate-500">{String(entry.value)}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bar — proyectos por mes: margin 0 para no cortar eje Y */}
          <Card className="border-slate-200 bg-white/85 dark:border-white/[0.07] dark:bg-white/[0.025]">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {t("stats.projectsTimeline")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={projectChartConfig} className="aspect-square h-64 sm:aspect-video sm:h-80 w-full">
                <BarChart data={projectsData} margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 12 }} width={30} />
                  <ChartTooltip cursor={{ fill: "rgba(139, 92, 246, 0.1)" }} content={<ChartTooltipContent />} />
                  <Bar dataKey="projects" fill="var(--color-projects)" radius={[10, 10, 0, 0]} isAnimationActive={false} className="cursor-pointer" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white/85 dark:border-white/[0.07] dark:bg-white/[0.025] lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {t("stats.githubActivity")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={activityChartConfig} className="aspect-square h-64 sm:aspect-video sm:h-80 w-full">
                <LineChart data={githubActivity} margin={{ left: 0, right: 10 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 12 }} width={30} />
                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                  <Line type="monotone" dataKey="commits" stroke="var(--color-commits)" strokeWidth={2.5} dot={{ fill: "var(--color-commits)", r: 4 }} activeDot={{ r: 6, className: "cursor-pointer" }} isAnimationActive={false} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Metric cards */}
        <div className="mt-8 sm:mt-12 grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-3">
          {factualMetrics.map((metric) => (
            <MetricCard key={metric.label} label={metric.label} value={metric.value} />
          ))}
        </div>

        {/* Divider — estilo footer con gradiente violeta */}
        <div className="relative mt-24 sm:mt-32 pb-16 sm:pb-20">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
        </div>

        {/* API Stats section */}
        {apiStats && (
          <div>
            <div className="mb-6 sm:mb-8 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-600 dark:text-violet-400">
                {t("stats.apiPerformance")}
              </p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                {t("stats.apiPerformance")}
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
                {t("stats.apiPerformanceSubtitle")}
              </p>
              <a
                href="https://backend-portafolio-f6gx.onrender.com/api/v1/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 transition-colors"
              >
                {t("stats.viewApiDocs")}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0 0L11 19" />
                </svg>
              </a>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {t("stats.docsCredentials")} <span className="font-medium text-violet-600 dark:text-violet-400">{t("stats.docsUsername")} / {t("stats.docsPassword")}</span>
              </p>
            </div>

            {/* API metric cards with icons */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {apiMetricCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Card
                    key={card.label}
                    className="border-slate-200 bg-white/85 transition-colors hover:border-violet-400/30 hover:bg-white dark:border-white/[0.07] dark:bg-white/[0.025] dark:hover:bg-white/[0.04]"
                  >
                    <CardHeader className="pb-2 sm:pb-3">
                      <div className="mb-2 sm:mb-3 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl border border-slate-200 bg-violet-50 text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-sm sm:text-base font-semibold tracking-tight text-slate-900 dark:text-white">
                        {card.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                        {card.value}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Endpoint traffic chart */}
            {endpointChartData.length > 0 && (
              <Card className="mt-6 sm:mt-8 border-slate-200 bg-white/85 dark:border-white/[0.07] dark:bg-white/[0.025]">
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                    {t("stats.apiTrafficByEndpoint")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      requests: { label: "Requests", color: "#8b5cf6" },
                      avgTime: { label: "Avg (ms)", color: "#06b6d4" },
                    }}
                    className="aspect-square h-64 sm:aspect-video sm:h-80 w-full"
                  >
                    <BarChart data={endpointChartData} margin={{ left: 0, right: 10, top: 0, bottom: 25 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="path"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 10, fill: "currentColor", opacity: 0.7 }}
                        interval={0}
                        height={40}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                        tick={{ fontSize: 12 }}
                        width={40}
                      />
                      <ChartTooltip
                        cursor={{ fill: "rgba(139, 92, 246, 0.1)" }}
                        content={<ChartTooltipContent />}
                      />
                      <Bar
                        dataKey="requests"
                        fill="var(--color-requests)"
                        radius={[8, 8, 0, 0]}
                        isAnimationActive={false}
                        className="cursor-pointer"
                      >
                        {endpointChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.path.includes("spotify") ? "#10b981" : "var(--color-requests)"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>

                  {/* Paginated endpoint list — shows traffic + latency */}
                  <div className="mt-4 sm:mt-6 grid gap-2 sm:gap-3">
                    {pagedEndpoints.map((ep, index) => {
                      const EndpointIcon = getEndpointIcon(ep.path);
                      const isSpotify = ep.path.includes("spotify");
                      return (
                      <div
                        key={`endpoint-${endpointPage}-${index}`}
                        className={`flex items-center justify-between rounded-lg border px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm ${
                          isSpotify
                            ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10"
                            : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.04]"
                        }`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <EndpointIcon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 ${isSpotify ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}`} />
                          <span className={`inline-flex items-center justify-center rounded-md px-1.5 py-0.5 text-[10px] sm:text-xs font-mono font-semibold ${
                            isSpotify
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                              : "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
                          }`}>
                            {ep.method}
                          </span>
                          <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[150px] sm:max-w-none">
                            {ep.path}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4 text-slate-600 dark:text-slate-400">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {formatBigNumber(ep.requests)} req
                          </span>
                          <span className="text-xs sm:text-sm">
                            {ep.avgTime}ms
                          </span>
                        </div>
                      </div>
                    );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t("stats.endpointsPage")} {endpointPage + 1} {t("stats.of")} {totalPages}
                      </p>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEndpointPage(p => Math.max(0, p - 1))}
                          disabled={endpointPage === 0}
                          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08]"
                        >
                          {t("stats.prev")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEndpointPage(p => Math.min(totalPages - 1, p + 1))}
                          disabled={endpointPage === totalPages - 1}
                          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08]"
                        >
                          {t("stats.next")}
                        </button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-slate-200 bg-white/85 dark:border-white/[0.07] dark:bg-white/[0.025]">
      <CardContent className="pt-4 sm:pt-6">
        <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{value}</div>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-slate-600 dark:text-slate-400">{label}</p>
      </CardContent>
    </Card>
  );
}