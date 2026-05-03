import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Code,
  ExternalLink,
  Eye,
  Github,
  GitFork,
  Grid3X3,
  List,
  Search,
  Star,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import ProjectModal from "./ProjectModal";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { mapPublicProjectToList } from "@/shared/api/mappers";
import { fetchPublicProjects } from "@/shared/api/public";
import { LoadingScreen } from "./ui/LoadingScreen";
import { Skeleton } from "./ui/skeleton";
import { SkillBubble } from "./SkillBubble";

type ProjectItem = ReturnType<typeof mapPublicProjectToList>;

export default function AllProjects() {
  const { t, i18n } = useTranslation();
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTech, setSelectedTech] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [allProjects, setAllProjects] = useState<ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pageSize = 9;

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        setIsLoading(true);
        const projects = await fetchPublicProjects();
        if (!isActive) return;
        setAllProjects(projects.map(mapPublicProjectToList));
      } catch {
        if (!isActive) return;
        setAllProjects([]);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedTech, sortBy, sortOrder]);

  const categories = [
    { value: "all", label: t("projects.categories.all") },
    { value: "fullstack", label: t("projects.categories.fullstack") },
    { value: "web", label: t("projects.categories.web") },
    { value: "devops", label: t("projects.categories.devops") },
    { value: "ml", label: t("projects.categories.ml") },
    { value: "blockchain", label: t("projects.categories.blockchain") },
    { value: "data", label: t("projects.categories.data") },
  ];

  const technologies = useMemo(() => {
    const allTechs = allProjects.flatMap((project) => project.technologies);
    const uniqueTechs = [...new Set(allTechs)].sort();

    return [
      { value: "all", label: t("projects.allTech") },
      ...uniqueTechs.map((tech) => ({ value: tech, label: tech })),
    ];
  }, [allProjects, t]);

  const filteredAndSortedProjects = useMemo(() => {
    const filtered = allProjects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.technologies.some((tech) => tech.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === "all" || project.category === selectedCategory;
      const matchesTech = selectedTech === "all" || project.technologies.includes(selectedTech);

      return matchesSearch && matchesCategory && matchesTech;
    });

    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case "date":
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case "stars":
          aValue = a.stars;
          bValue = b.stars;
          break;
        case "name":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "views":
          aValue = a.views;
          bValue = b.views;
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      }

      return aValue < bValue ? 1 : -1;
    });

    return filtered;
  }, [allProjects, searchTerm, selectedCategory, selectedTech, sortBy, sortOrder]);

  const featuredCount = useMemo(
    () => filteredAndSortedProjects.filter((project) => project.featured).length,
    [filteredAndSortedProjects],
  );

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedProjects.length / pageSize));
  const paginatedProjects = filteredAndSortedProjects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const trackedTechnologies = useMemo(
    () => new Set(filteredAndSortedProjects.flatMap((project) => project.technologies)).size,
    [filteredAndSortedProjects],
  );

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(i18n.language, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(value));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "production":
        return "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300";
      case "development":
        return "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300";
      case "prototype":
        return "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300";
      default:
        return "border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-300";
    }
  };

  const getStatusLabel = (status: string) => {
    const normalized = status?.toLowerCase?.() ?? "unknown";
    return String(
      t(`projects.status.${normalized}` as never, {
        defaultValue: t("projects.status.unknown"),
      }),
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedTech("all");
  };

  const projectCountLabel = (t("projects.filters.showing") as string)
    .replace("{count}", String(filteredAndSortedProjects.length))
    .replace("{total}", String(allProjects.length));

  return (
    <section className="min-h-screen px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12">
          <Button
            variant="ghost"
            asChild
            className="group mb-6 rounded-full border border-slate-200 bg-white/80 px-4 text-slate-600 transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:border-violet-400/30 dark:hover:bg-violet-500/10 dark:hover:text-violet-200"
          >
            <Link to="/">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              {t("common.back")}
            </Link>
          </Button>

          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-600 dark:text-violet-400">
              {t("projects.title")}
            </p>
            <h1 className="mt-3 text-5xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
              {t("projects.allProjects")}
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
              {t("projects.description")}
            </p>
          </div>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-3">
          {isLoading ? (
            <>
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-28 w-full rounded-xl" />
            </>
          ) : (
            <>
              <SummaryCard label={t("projects.totalProjects")} value={String(filteredAndSortedProjects.length)} />
              <SummaryCard label={t("projects.featuredProjects")} value={String(featuredCount)} />
              <SummaryCard label={t("projects.technologiesTracked")} value={String(trackedTechnologies)} />
            </>
          )}
        </div>

        <Card className="mb-8 border-slate-200 bg-white/85 dark:border-white/[0.07] dark:bg-white/[0.025]">
          <CardContent className="p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
                  {t("projects.filters.searchLabel")}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <Input
                    placeholder={t("projects.filters.searchPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-10 rounded-lg border-slate-200 bg-slate-50/80 pl-10 focus-visible:ring-violet-500/50 dark:border-gray-600 dark:bg-gray-800/50"
                  />
                </div>
              </div>

              <FilterSelect
                label={t("projects.filters.category")}
                value={selectedCategory}
                onChange={setSelectedCategory}
                options={categories}
              />

              <FilterSelect
                label={t("projects.filters.technology")}
                value={selectedTech}
                onChange={setSelectedTech}
                options={technologies}
              />

              <FilterSelect
                label={t("projects.filters.sortBy")}
                value={`${sortBy}-${sortOrder}`}
                onChange={(value) => {
                  const [newSortBy, newSortOrder] = value.split("-");
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}
                options={[
                  { value: "date-desc", label: t("projects.sortOptions.dateDesc") },
                  { value: "date-asc", label: t("projects.sortOptions.dateAsc") },
                  { value: "stars-desc", label: t("projects.sortOptions.starsDesc") },
                  { value: "stars-asc", label: t("projects.sortOptions.starsAsc") },
                  { value: "views-desc", label: t("projects.sortOptions.viewsDesc") },
                  { value: "name-asc", label: t("projects.sortOptions.nameAsc") },
                  { value: "name-desc", label: t("projects.sortOptions.nameDesc") },
                ]}
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 dark:border-white/[0.07]">
              <p className="text-sm text-slate-600 dark:text-slate-400">{projectCountLabel}</p>
              <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-gray-800/60">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 rounded-md"
                  title={t("projects.filters.viewGrid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 rounded-md"
                  title={t("projects.filters.viewList")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="relative min-h-[400px]">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/5 backdrop-blur-[1px]">
              <LoadingScreen variant="inline" className="max-w-md border-none bg-transparent" />
            </div>
          )}

          {isLoading ? (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3 opacity-10">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden border-slate-200 bg-white/85 dark:border-white/[0.07] dark:bg-white/[0.025]">
                  <Skeleton className="aspect-video w-full rounded-none" />
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4 rounded-md" />
                    <Skeleton className="h-16 w-full rounded-md" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredAndSortedProjects.length === 0 ? (
          <Card className="border-slate-200 bg-white/85 text-center dark:border-white/[0.07] dark:bg-white/[0.025]">
            <CardContent className="py-12">
              <p className="mb-4 text-slate-600 dark:text-slate-400">{t("projects.noProjects")}</p>
              <Button variant="outline" onClick={clearFilters}>
                {t("projects.filters.clearFilters")}
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {paginatedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                formatDate={formatDate}
                getStatusColor={getStatusColor}
                getStatusLabel={getStatusLabel}
                onSelect={setSelectedProject}
                t={t}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {paginatedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isListView
                formatDate={formatDate}
                getStatusColor={getStatusColor}
                getStatusLabel={getStatusLabel}
                onSelect={setSelectedProject}
                t={t}
              />
            ))}
          </div>
        )}
        </div>

        {filteredAndSortedProjects.length > pageSize && (
          <div className="mt-10 flex flex-col items-center gap-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {String(t("projects.pagination.page"))
                .replace("{current}", String(currentPage))
                .replace("{total}", String(totalPages))}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                {t("projects.pagination.previous")}
              </Button>
              {Array.from({ length: totalPages }).map((_, index) => {
                const page = index + 1;
                return (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="min-w-9"
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
              >
                {t("projects.pagination.next")}
              </Button>
            </div>
          </div>
        )}

        {selectedProject && (
          <ProjectModal
            project={{
              id: selectedProject.id,
              name: selectedProject.title ?? selectedProject.name,
              description: selectedProject.description,
              technologies: selectedProject.technologies,
              image: selectedProject.image,
              problem: selectedProject.problem ?? "",
              challenge: selectedProject.challenge ?? "",
              solution: selectedProject.solution ?? "",
              githubUrl: selectedProject.github ?? selectedProject.githubUrl ?? "",
              liveUrl: selectedProject.liveDemo ?? selectedProject.liveUrl,
            }}
            isOpen={!!selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </div>
    </section>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
        {label}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-slate-50/80 dark:border-gray-600 dark:bg-gray-800/50">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ProjectCard({
  project,
  isListView = false,
  formatDate,
  getStatusColor,
  getStatusLabel,
  onSelect,
  t,
}: {
  project: ProjectItem;
  isListView?: boolean;
  formatDate: (value: string) => string;
  getStatusColor: (value: string) => string;
  getStatusLabel: (value: string) => string;
  onSelect: (project: ProjectItem) => void;
  t: (key: string) => string;
}) {
  const effectiveStatus = project.liveDemo ? "production" : project.status;

  return (
    <Card
      className={`group overflow-hidden border-slate-200 bg-white/85 transition-all duration-300 hover:border-violet-400/30 hover:bg-white dark:border-white/[0.07] dark:bg-white/[0.025] dark:hover:bg-white/[0.04] ${
        isListView ? "flex flex-col lg:flex-row" : ""
      }`}
    >
      <div
        className={`${isListView ? "h-56 shrink-0 lg:h-auto lg:w-72 xl:w-80" : "aspect-video"} relative overflow-hidden`}
      >
        {project.image ? (
          <img
            src={project.image}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-100 to-slate-200 px-6 text-center text-sm font-medium text-slate-600 dark:from-violet-500/10 dark:to-slate-800 dark:text-slate-300">
            {project.title}
          </div>
        )}
        {project.featured && (
          <div className="absolute left-3 top-3">
            <Badge className="bg-violet-600 text-white dark:bg-violet-500">
              <Star className="mr-1 h-3 w-3 fill-current" />
              {t("projects.badges.featured")}
            </Badge>
          </div>
        )}
        <div className="absolute right-3 top-3">
          <Badge className={getStatusColor(effectiveStatus)}>{getStatusLabel(effectiveStatus)}</Badge>
        </div>
      </div>

      <div className={`${isListView ? "flex flex-1 flex-col p-6 lg:flex-row lg:gap-6" : "p-6"}`}>
        <div className={`${isListView ? "min-w-0 flex-1" : ""}`}>
          <CardHeader className="mb-4 p-0">
            <CardTitle className="mb-2 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
              {project.title}
            </CardTitle>
            <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">{project.description}</p>
          </CardHeader>

          <CardContent className="space-y-4 p-0">
            <div className="flex flex-wrap gap-2">
              {project.technologies.slice(0, isListView ? 8 : 4).map((tech) => (
                <SkillBubble
                  key={tech}
                  name={tech}
                  showName={true}
                  size="sm"
                />
              ))}
              {project.technologies.length > (isListView ? 8 : 4) && (
                <div className="flex items-center justify-center rounded-full border border-slate-200 bg-white/85 px-2 py-1 text-[10px] font-medium text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
                  +{project.technologies.length - (isListView ? 8 : 4)}
                </div>
              )}
            </div>
          </CardContent>
        </div>

        <div className={`${isListView ? "mt-6 lg:mt-0 lg:w-64 lg:border-l lg:border-slate-200 lg:pl-6 dark:lg:border-white/[0.07]" : "mt-4"}`}>
          <CardContent className="space-y-4 p-0">
            <div className={`text-sm text-slate-600 dark:text-slate-400 ${isListView ? "space-y-3" : "flex items-center justify-between"}`}>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4" />
                  <span>{project.stars}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <GitFork className="h-4 w-4" />
                  <span>{project.forks}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{project.views}</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {t("projects.updatedOn")}: {formatDate(project.date)}
                </span>
              </div>
            </div>

            <div className={`flex ${isListView ? "flex-col gap-2" : "space-x-2 pt-2"}`}>
              <Button size="sm" onClick={() => onSelect(project)} className={isListView ? "w-full" : "flex-1"}>
                <Code className="mr-2 h-4 w-4" />
                {t("projects.filters.viewDetails")}
              </Button>
              <div className={`flex gap-2 ${isListView ? "w-full" : ""}`}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(project.github, "_blank")}
                  aria-label={t("projects.actions.github")}
                  className={isListView ? "flex-1" : ""}
                >
                  <Github className="h-4 w-4" />
                </Button>
                {project.liveDemo && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(project.liveDemo, "_blank")}
                    aria-label={t("projects.actions.live")}
                    className={isListView ? "flex-1" : ""}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-slate-200 bg-white/85 dark:border-white/[0.07] dark:bg-white/[0.025]">
      <CardContent className="pt-6 text-center">
        <div className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{value}</div>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{label}</p>
      </CardContent>
    </Card>
  );
}
