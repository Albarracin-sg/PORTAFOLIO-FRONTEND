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
import { ArrowLeft, FolderGit2, GitBranch, Star, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "./ui/chart";
import type { GithubStats } from "@/shared/api/public";

interface StatisticsProps {
  section?: { id: string; type: string; content: Record<string, unknown> };
  githubStats?: GithubStats | null;
}

type StatsCard = {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

export default function Statistics({ section, githubStats }: StatisticsProps) {
  const { t, i18n } = useTranslation();
  const isSpanish = i18n.language.startsWith("es");
  const statsContent = section?.content ?? {};
  const chartData = (statsContent.charts as Record<string, unknown>) ?? {};

  const languageData =
    (githubStats?.languageData as Array<Record<string, unknown>>) ??
    (chartData.languageData as Array<Record<string, unknown>>) ??
    [];

  const projectsData =
    (githubStats?.projectsData as Array<Record<string, unknown>>) ??
    (chartData.projectsData as Array<Record<string, unknown>>) ??
    [];

  const githubActivity =
    (githubStats?.githubActivity as Array<Record<string, unknown>>) ??
    (chartData.githubActivity as Array<Record<string, unknown>>) ??
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

  const languageChartConfig = {
    value: {
      label: isSpanish ? "Uso" : "Usage",
      color: "#8b5cf6",
    },
    ...Object.fromEntries(
      languageData.map((item) => [
        String(item.name),
        {
          label: String(item.name),
          color: String(item.color ?? "#8b5cf6"),
        },
      ]),
    ),
  } satisfies ChartConfig;

  const projectChartConfig = {
    projects: {
      label: t("stats.projectsTimeline"),
      color: "#8b5cf6",
    },
  } satisfies ChartConfig;

  const activityChartConfig = {
    commits: {
      label: t("stats.githubActivity"),
      color: "#8b5cf6",
    },
  } satisfies ChartConfig;

  return (
    <section className="px-4 py-12 sm:py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            asChild
            className="group rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-slate-600 transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:border-violet-400/30 dark:hover:bg-violet-500/10 dark:hover:text-violet-200"
          >
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              <span>{t("common.back")}</span>
            </Link>
          </Button>
        </div>

        <div className="mx-auto mb-10 sm:mb-14 max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            {t("stats.title")}
          </h1>
          <p className="mx-auto mt-4 sm:mt-5 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
            {t("stats.subtitle")}
          </p>
        </div>

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
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={languageData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="60%"
                    outerRadius="90%"
                    paddingAngle={4}
                  >
                    {languageData.map((entry, index) => (
                      <Cell key={`language-${index}`} fill={String(entry.color ?? "#8b5cf6")} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="mt-4 sm:mt-5 flex flex-wrap gap-2 sm:gap-3">
                {languageData.map((entry, index) => (
                  <div
                    key={`language-legend-${index}`}
                    className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
                  >
                    <span
                      className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full"
                      style={{ backgroundColor: String(entry.color ?? "#8b5cf6") }}
                    />
                    <span>{String(entry.name)}</span>
                    <span className="text-slate-400 dark:text-slate-500">{String(entry.value)}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white/85 dark:border-white/[0.07] dark:bg-white/[0.025]">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {t("stats.projectsTimeline")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={projectChartConfig} className="aspect-square h-64 sm:aspect-video sm:h-80 w-full">
                <BarChart data={projectsData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="projects" fill="var(--color-projects)" radius={[10, 10, 0, 0]} />
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
                <LineChart data={githubActivity}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                  <Line
                    type="monotone"
                    dataKey="commits"
                    stroke="var(--color-commits)"
                    strokeWidth={2.5}
                    dot={{ fill: "var(--color-commits)", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 sm:mt-12 grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-3">
          {factualMetrics.map((metric) => (
            <MetricCard key={metric.label} label={metric.label} value={metric.value} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-slate-200 bg-white/85 dark:border-white/[0.07] dark:bg-white/[0.025]">
      <CardContent className="pt-4 sm:pt-6">
        <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
          {value}
        </div>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-slate-600 dark:text-slate-400">{label}</p>
      </CardContent>
    </Card>
  );
}
