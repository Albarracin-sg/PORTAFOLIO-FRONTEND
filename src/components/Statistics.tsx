import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FolderGit2, Star, GitBranch, Users, Activity, Zap, Clock, Server, Music, BarChart3, FolderOpen, Bot, Shield, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { type GithubStats, type ApiStats } from "@/shared/api/public";
import { type ChartConfig } from "@/components/ui/chart";
import { getNumberFormatter } from "@/shared/utils/formatters";

// Sub-components
import { StatsCard } from "./Statistics/StatsCard";
import { MetricCard } from "./Statistics/MetricCard";
import { EndpointList } from "./Statistics/EndpointList";

// Lazy-loaded chart components
const LanguageChart = lazy(() => import("./Statistics/LanguageChart").then(m => ({ default: m.LanguageChart })));
const ProjectTimelineChart = lazy(() => import("./Statistics/ProjectTimelineChart").then(m => ({ default: m.ProjectTimelineChart })));
const GithubActivityChart = lazy(() => import("./Statistics/GithubActivityChart").then(m => ({ default: m.GithubActivityChart })));
const ApiTrafficChart = lazy(() => import("./Statistics/ApiTrafficChart").then(m => ({ default: m.ApiTrafficChart })));

function ChartFallback() {
  return (
    <div className="flex h-64 sm:h-80 w-full items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-zinc-50/50 dark:border-white/10 dark:bg-white/[0.02]">
      <div className="flex flex-col items-center gap-2">
        <Activity className="size-8 text-violet-500/20 animate-pulse" />
      </div>
    </div>
  );
}

interface StatisticsProps {
  githubStats?: GithubStats | null;
  apiStats?: ApiStats | null;
}

export default function Statistics({ githubStats, apiStats }: StatisticsProps) {
  const { t, i18n } = useTranslation();
  const isSpanish = i18n.language.startsWith("es");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const languageData = (githubStats?.languageData as Array<Record<string, unknown>>) ?? [];
  const projectsData = (githubStats?.projectsData as Array<Record<string, unknown>>) ?? [];
  const githubActivity = (githubStats?.githubActivity as Array<Record<string, unknown>>) ?? [];

  const cards = useMemo(() => githubStats ? [
    { title: t("stats.totalRepos"), value: String(githubStats.totalRepos), description: githubStats.privateRepos > 0 ? t("stats.totalReposDescription", { public: githubStats.publicRepos, private: githubStats.privateRepos }) : t("stats.publicReposDescription", { public: githubStats.publicRepos }), icon: FolderGit2 },
    { title: t("stats.totalStars"), value: String(githubStats.stars), description: t("stats.totalStarsDescription"), icon: Star },
    { title: t("stats.totalForks"), value: String(githubStats.forks), description: t("stats.totalForksDescription"), icon: GitBranch },
    { title: t("stats.followers"), value: String(githubStats.followers), description: t("stats.followersDescription"), icon: Users },
  ] : [], [githubStats, t]);

  const factualMetrics = useMemo(() => githubStats
    ? [
        { label: t("stats.pullRequests"), value: String(githubStats.pullRequests) },
        { label: t("stats.following"), value: String(githubStats.following) },
        { label: t("stats.languagesTracked"), value: String(languageData.length) },
      ]
    : [
        { label: t("stats.languagesTracked"), value: String(languageData.length) },
        { label: t("stats.projectsTimeline"), value: String(projectsData.length) },
        { label: t("stats.githubCommits"), value: String(githubActivity.length) },
      ], [githubStats, languageData.length, projectsData.length, githubActivity.length, t]);

  const formatUptime = (raw: string) => {
    if (!raw) return "—";
    if (!isSpanish) return raw;
    return raw.replace(/(\d+)d\b/g, "$1 d").replace(/(\d+)h\b/g, "$1 h").replace(/(\d+)m\b/g, "$1 min").replace(/(\d+)s\b/g, "$1 s");
  };

  const formatBigNumber = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
    return getNumberFormatter(i18n.language).format(n);
  };

  const endpointChartData = useMemo(() => (apiStats?.endpoints ?? [])
    .reduce((acc, e) => {
      if (!e.path.includes("admin") && !e.path.includes("docs") && !e.path.includes("swagger")) {
        acc.push({
          path: e.path.replace("/api/v1/", ""),
          requests: e.totalRequests,
          avgTime: Math.round(e.avgResponseTime),
          method: e.method
        });
      }
      return acc;
    }, [] as any[]), [apiStats]);

  const barChartData = useMemo(() => {
    const nonSpotify = endpointChartData.filter(e => !e.path.includes("spotify"));
    const spotify = endpointChartData.find(e => e.path.includes("spotify"));
    if (!spotify) return endpointChartData;
    const maxOthers = Math.max(...nonSpotify.map(e => e.requests), 0);
    return spotify.requests < maxOthers * 5 ? endpointChartData : nonSpotify;
  }, [endpointChartData]);

  const apiMetricCards = useMemo(() => apiStats ? [
    { label: t("stats.apiTotalRequests"), value: formatBigNumber(apiStats.totalRequests), icon: Activity },
    { label: t("stats.apiRequestsPerMin"), value: formatBigNumber(apiStats.requestsPerMinute), icon: Zap },
    { label: t("stats.apiAvgResponse"), value: `${Math.round(apiStats.avgResponseTimeMs)}ms`, icon: Clock },
    { label: t("stats.apiUptime"), value: formatUptime(apiStats.uptime), icon: Server },
  ] : [], [apiStats, t]);

  const getEndpointIcon = (path: string) => {
    if (path.includes("spotify")) return Music;
    if (path.includes("github")) return FolderGit2;
    if (path.includes("stats")) return BarChart3;
    if (path.includes("projects")) return FolderOpen;
    if (path.includes("bot")) return Bot;
    if (path.includes("admin")) return Shield;
    return Globe;
  };

  const [endpointPage, setEndpointPage] = useState(0);
  const ENDPOINTS_PER_PAGE = 5;
  const totalPages = Math.ceil(endpointChartData.length / ENDPOINTS_PER_PAGE);
  const pagedEndpoints = endpointChartData.slice(endpointPage * ENDPOINTS_PER_PAGE, (endpointPage + 1) * ENDPOINTS_PER_PAGE);

  const languageChartConfig = useMemo(() => ({
    value: { label: isSpanish ? "Uso" : "Usage", color: "#8b5cf6" },
    ...Object.fromEntries(languageData.map((item) => [String(item.name), { label: String(item.name), color: String(item.color ?? "#8b5cf6") }])),
  }), [languageData, isSpanish]) satisfies ChartConfig;

  return (
    <section className="min-h-screen px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 sm:mb-12">
          <Button variant="ghost" asChild className="group mb-2 sm:mb-6 rounded-full border border-zinc-200 bg-white/80 px-4 py-2 text-black transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-900 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:hover:border-violet-400/30 dark:hover:bg-violet-500/10 dark:hover:text-violet-200">
            <Link to="/"><ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />{t("common.back")}</Link>
          </Button>
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-600 dark:text-violet-400">{t("stats.title")}</p>
            <h1 className="mt-3 text-5xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-6xl">{t("stats.title")}</h1>
            <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-400 sm:text-base">{t("stats.subtitle")}</p>
          </div>
        </div>

        <div className="mb-8 sm:mb-12 grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((stat) => <StatsCard key={stat.title} {...stat} />)}
        </div>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
          <Suspense fallback={<ChartFallback />}>
            <LanguageChart data={languageData} config={languageChartConfig} />
          </Suspense>
          <Suspense fallback={<ChartFallback />}>
            <ProjectTimelineChart data={projectsData} config={{ projects: { label: t("stats.projectsTimeline"), color: "#8b5cf6" } }} />
          </Suspense>
          <Suspense fallback={<ChartFallback />}>
            <GithubActivityChart data={githubActivity} config={{ commits: { label: t("stats.githubActivity"), color: "#8b5cf6" } }} />
          </Suspense>
        </div>

        <div className="mt-8 sm:mt-12 grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-3">
          {factualMetrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
        </div>

        <div className="relative mt-24 sm:mt-32 pb-16 sm:pb-20"><div className="w-full h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" /></div>

        {apiStats && (
          <div>
            <div className="mb-6 sm:mb-8 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-600 dark:text-violet-400">{t("stats.apiPerformance")}</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white">{t("stats.apiPerformance")}</h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">{t("stats.apiPerformanceSubtitle")}</p>
              <a href="https://backend-portafolio-f6gx.onrender.com/api/v1/docs" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 transition-colors">
                {t("stats.viewApiDocs")}<svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0 0L11 19" /></svg>
              </a>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{t("stats.docsCredentials")} <span className="font-medium text-violet-600 dark:text-violet-400">{t("stats.docsUsername")} / {t("stats.docsPassword")}</span></p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {apiMetricCards.map((card) => <StatsCard key={card.label} title={card.label} value={card.value} description="" icon={card.icon} />)}
            </div>
            {barChartData.length > 0 && (
              <>
                <Suspense fallback={<ChartFallback />}>
                  <ApiTrafficChart data={barChartData} isMobile={isMobile} />
                </Suspense>
                <EndpointList endpoints={pagedEndpoints} page={endpointPage} totalPages={totalPages} onPageChange={setEndpointPage} getIcon={getEndpointIcon} formatNumber={formatBigNumber} />
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
