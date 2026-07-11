import { useEffect, useMemo, useReducer, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FolderKanban } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { mapPublicProjectToList } from "@/shared/api/mappers";
import { fetchPublicProjects } from "@/shared/api/public";
import { useLocalStorageSWR } from "@/shared/hooks/useLocalStorageSWR";
import { commonFormatters } from "@/shared/utils/formatters";
import { usePageSeo } from "@/shared/seo/usePageSeo";
import { usePrerenderReady } from "@/shared/seo/usePrerenderReady";

// Sub-components
import { SummaryCard } from "./AllProjects/SummaryCard";
import { ProjectFilters } from "./AllProjects/ProjectFilters";
import { ProjectCard } from "./AllProjects/ProjectCard";
import { ProjectPagination } from "./AllProjects/ProjectPagination";

type ProjectItem = ReturnType<typeof mapPublicProjectToList>;

interface ProjectsState {
  projects: ProjectItem[];
  loading: boolean;
  currentPage: number;
  filterTech: string;
  filterStatus: string;
  searchQuery: string;
  sortBy: "date-desc" | "date-asc" | "views-desc";
  pageSize: number;
}

type ProjectsAction =
  | { type: "SET_PROJECTS"; payload: ProjectItem[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_FILTER_TECH"; payload: string }
  | { type: "SET_FILTER_STATUS"; payload: string }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_SORT_BY"; payload: ProjectsState["sortBy"] }
  | { type: "SET_PAGE_SIZE"; payload: number };

function projectsReducer(state: ProjectsState, action: ProjectsAction): ProjectsState {
  switch (action.type) {
    case "SET_PROJECTS":
      return { ...state, projects: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_PAGE":
      return { ...state, currentPage: action.payload };
    case "SET_FILTER_TECH":
      return { ...state, filterTech: action.payload, currentPage: 1 };
    case "SET_FILTER_STATUS":
      return { ...state, filterStatus: action.payload, currentPage: 1 };
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload, currentPage: 1 };
    case "SET_SORT_BY":
      return { ...state, sortBy: action.payload, currentPage: 1 };
    case "SET_PAGE_SIZE":
      return { ...state, pageSize: action.payload, currentPage: 1 };
    default:
      return state;
  }
}

export default function AllProjects() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [state, dispatch] = useReducer(projectsReducer, {
    projects: [],
    loading: true,
    currentPage: 1,
    filterTech: "all",
    filterStatus: "all",
    searchQuery: "",
    sortBy: "date-desc",
    pageSize: 6,
  });

  const {
    projects,
    loading,
    currentPage,
    filterTech,
    filterStatus,
    searchQuery,
    sortBy,
    pageSize,
  } = state;

  const { data: rawProjects, isLoading: swrLoading } = useLocalStorageSWR(
    'public-projects-cache',
    fetchPublicProjects,
  );

  useEffect(() => {
    if (rawProjects) {
      const mapped = rawProjects.map(mapPublicProjectToList);
      dispatch({ type: "SET_PROJECTS", payload: mapped });
    }
    dispatch({ type: "SET_LOADING", payload: swrLoading });
  }, [rawProjects, swrLoading]);

  const filteredAndSortedProjects = useMemo(() => {
    return projects
      .filter((p) => {
        const matchTech = filterTech === "all" || p.technologies.includes(filterTech);
        const matchStatus = filterStatus === "all" || p.status === filterStatus;
        const matchSearch =
          !searchQuery ||
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.technologies.some((tech) => tech.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchTech && matchStatus && matchSearch;
      })
      .toSorted((a, b) => {
        if (sortBy === "date-desc")
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === "date-asc")
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        return b.views - a.views;
      });
  }, [projects, filterTech, filterStatus, searchQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedProjects.length / pageSize));
  const paginatedProjects = filteredAndSortedProjects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const trackedTechnologies = useMemo(
    () => new Set(filteredAndSortedProjects.flatMap((project) => project.technologies)).size,
    [filteredAndSortedProjects],
  );

  const formatDate = useCallback((value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : commonFormatters.shortDate(i18n.language).format(date);
  }, [i18n.language]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "production":
        return "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300";
      case "development":
        return "border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300";
      case "prototype":
        return "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300";
      default:
        return "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400";
    }
  }, []);

  const getStatusLabel = useCallback((status: string) => {
    switch (status) {
      case "production": return t("projects.status.production");
      case "development": return t("projects.status.development");
      case "prototype": return t("projects.status.prototype");
      default: return status;
    }
  }, [t]);

  const techOptions = [
    { value: "all", label: t("projects.filters.all") },
    ...Array.from(new Set(projects.flatMap((p) => p.technologies)))
      .sort()
      .map((tech) => ({ value: tech, label: tech })),
  ];

  usePageSeo({
    title: "Proyectos de Juan Camilo Albarracin | Portafolio",
    description:
      "Explora los proyectos de Juan Camilo Albarracin: backend, microservicios, automatizacion, IA aplicada, arquitectura distribuida y productos full-stack.",
    path: "/projects",
    keywords: [
      "proyectos juan camilo albarracin",
      "albarracin proyectos",
      "portafolio de proyectos backend",
      "microservicios nestjs portfolio",
    ],
  });

  usePrerenderReady(!loading, 250);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 px-4 sm:px-6 lg:px-8 pt-24 pb-16 sm:pb-20 mx-auto max-w-7xl">
      {/* ── Header ── */}
      <div className="mb-8 sm:mb-12">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="group mb-2 sm:mb-6 rounded-full border border-zinc-200 bg-white px-4 py-2 text-black transition-all hover:bg-violet-50 hover:text-violet-950 hover:border-violet-300 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:hover:bg-violet-500/10 dark:hover:text-violet-200"
        >
          <span className="inline-flex items-center gap-2">
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            {t("nav.back")}
          </span>
        </Button>

        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-600 dark:text-violet-400">
            {t("projects.explore")}
          </p>
          <h1 className="mt-3 text-5xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-6xl">
            {t("projects.title")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-400 sm:text-base">
            {t("projects.subtitle")}
          </p>
        </div>
      </div>

      {loading ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>

          <div className="flex flex-col gap-8">
            <div className="flex gap-4">
              <Skeleton className="h-10 w-48 rounded-xl" />
              <Skeleton className="h-10 w-32 rounded-xl" />
              <Skeleton className="ml-auto h-10 w-40 rounded-xl" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <Skeleton className="aspect-video w-full rounded-3xl" />
              <Skeleton className="aspect-video w-full rounded-3xl" />
              <Skeleton className="aspect-video w-full rounded-3xl" />
              <Skeleton className="aspect-video w-full rounded-3xl" />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <SummaryCard
              label={t("projects.totalProjects")}
              value={String(filteredAndSortedProjects.length)}
            />
            <SummaryCard
              label={t("projects.technologiesTracked")}
              value={String(trackedTechnologies)}
            />
          </div>

          <div className="flex flex-col gap-8">
            <ProjectFilters
              searchTerm={searchQuery}
              onSearchChange={(query: string) => dispatch({ type: "SET_SEARCH_QUERY", payload: query })}
              selectedCategory="all"
              onCategoryChange={() => {}} // Not used yet
              selectedTech={filterTech}
              onTechChange={(tech: string) => dispatch({ type: "SET_FILTER_TECH", payload: tech })}
              sortBy={sortBy.split("-")[0]}
              sortOrder={sortBy.split("-")[1] as "asc" | "desc"}
              onSortChange={(s: string, o: string) => dispatch({ type: "SET_SORT_BY", payload: `${s}-${o}` as any })}
              categories={[{ value: "all", label: t("projects.filters.all") }]}
              technologies={techOptions}
               projectCountLabel={`${filteredAndSortedProjects.length} ${t("projects.filters.resultsFound")}`}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            <div className="flex-1 space-y-10">
              <div className={viewMode === "grid" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : "grid gap-6"}>
                {paginatedProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    formatDate={formatDate}
                    getStatusColor={getStatusColor}
                    getStatusLabel={getStatusLabel}
                    onSelect={(p: any) => navigate(`/projects/${p.id}`)}
                    t={t}
                    i18n={i18n}
                    isListView={viewMode === "list"}
                  />
                ))}
              </div>

              {filteredAndSortedProjects.length === 0 && (
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-white/30 dark:border-white/10 dark:bg-white/[0.01]">
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-white/5">
                    <FolderKanban className="size-8 text-zinc-400" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
                    {t("projects.noResults")}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">{t("projects.tryAdjusting")}</p>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      dispatch({ type: "SET_FILTER_TECH", payload: "all" });
                      dispatch({ type: "SET_FILTER_STATUS", payload: "all" });
                      dispatch({ type: "SET_SEARCH_QUERY", payload: "" });
                    }}
                    className="mt-6 rounded-xl hover:bg-violet-500/10 hover:text-violet-600"
                  >
                    {t("projects.clearFilters")}
                  </Button>
                </div>
              )}

              {totalPages > 1 && (
                <ProjectPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page: number) => dispatch({ type: "SET_PAGE", payload: page })}
                  t={t}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
