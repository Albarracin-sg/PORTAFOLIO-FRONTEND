import { Star, GitFork, Eye, Calendar, Code, Github, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SkillBubble } from "@/components/SkillBubble";

interface ProjectCardProps {
  project: any;
  isListView?: boolean;
  formatDate: (value: string) => string;
  getStatusColor: (value: string) => string;
  getStatusLabel: (value: string) => string;
  onSelect: (project: any) => void;
  t: (key: string) => string;
  i18n: any;
}

export function ProjectCard({
  project,
  isListView = false,
  formatDate,
  getStatusColor,
  getStatusLabel,
  onSelect,
  t,
  i18n,
}: ProjectCardProps) {
  const effectiveStatus = project.liveDemo ? "production" : project.status;

  return (
    <Card
      className={`group overflow-hidden border-zinc-200 bg-white/85 transition-all duration-300 hover:border-violet-400/30 hover:bg-white dark:border-white/[0.07] dark:bg-white/[0.025] dark:hover:bg-white/[0.04] ${
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
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-violet-100 to-zinc-200 px-6 text-center text-sm font-medium text-zinc-600 dark:from-violet-500/10 dark:to-zinc-800 dark:text-zinc-300">
            {project.title}
          </div>
        )}
        {project.featured && (
          <div className="absolute left-3 top-3">
            <Badge className="bg-violet-600 text-white dark:bg-violet-500">
              <Star className="mr-1 size-3 fill-current" />
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
          <CardHeader className="mb-4 p-0 space-y-3">
            <div className="space-y-1">
              <CardTitle as="h3" className="line-clamp-1 text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                {project.title}
              </CardTitle>
              
              <div className="flex items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-x-1">
                  <Star className="size-3.5" />
                  <span>{project.stars}</span>
                </div>
                <div className="flex items-center gap-x-1">
                  <GitFork className="size-3.5" />
                  <span>{project.forks}</span>
                </div>
                <div className="flex items-center gap-x-1">
                  <Eye className="size-3.5" />
                  <span>{project.views}</span>
                </div>
              </div>
            </div>

            <div className="flex h-20 sm:h-16 flex-wrap content-start gap-1.5 overflow-hidden">
              {project.technologies.slice(0, 5).map((tech: string) => (
                <SkillBubble
                  key={tech}
                  name={tech}
                  showName={true}
                  size="sm"
                />
              ))}
              {project.technologies.length > 5 && (
                <div className="flex items-center justify-center rounded-full border border-zinc-200 bg-zinc-50/50 px-2 py-1 text-[10px] font-bold text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400">
                  +{project.technologies.length - 5}
                </div>
              )}
            </div>

            <div className="h-24 sm:h-20 overflow-hidden">
              <p className="line-clamp-4 sm:line-clamp-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {typeof project.description === 'object' 
                  ? (project.description[i18n.language] || project.description['es'] || '')
                  : project.description}
              </p>
            </div>
          </CardHeader>
        </div>

        <div className={`${isListView ? "mt-6 lg:mt-0 lg:w-64 lg:border-l lg:border-zinc-200 lg:pl-6 dark:lg:border-white/[0.07]" : "mt-4"}`}>
          <CardContent className="space-y-4 p-0">
            {!isListView && (
              <div className="flex items-center gap-x-1 text-xs text-zinc-600 dark:text-zinc-400">
                <Calendar className="size-3.5" />
                <span>
                  {t("projects.updatedOn")}: {formatDate(project.date)}
                </span>
              </div>
            )}
            
            {isListView && (
               <div className="flex items-center gap-x-1 text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                <Calendar className="size-3.5" />
                <span>
                  {t("projects.updatedOn")}: {formatDate(project.date)}
                </span>
              </div>
            )}

            <div className={`flex items-center gap-2 ${isListView ? "flex-col lg:flex-row" : "pt-2"}`}>
              <Button 
                size="sm" 
                onClick={() => onSelect(project)} 
                className={`bg-violet-600 font-medium text-white hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-700 ${isListView ? "w-full lg:flex-1" : "flex-1"}`}
              >
                <Code className="mr-2 size-4" />
                {t("projects.filters.viewDetails")}
              </Button>
              
              <div className={`flex items-center gap-2 ${isListView ? "w-full lg:w-auto" : ""}`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="size-9 p-0 border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
                  onClick={() => window.open(project.github, "_blank")}
                  title={t("projects.actions.github")}
                >
                  <Github className="size-4.5" />
                </Button>
                
                {project.liveDemo && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="size-9 p-0 border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
                    onClick={() => window.open(project.liveDemo, "_blank")}
                    title={t("projects.actions.live")}
                  >
                    <ExternalLink className="size-4.5" />
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
