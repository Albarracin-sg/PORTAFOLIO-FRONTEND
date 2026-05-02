import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import { ArrowRight, ExternalLink, GitFork, Star } from "lucide-react";
import ProjectModal from "./ProjectModal";
import { EditableText } from "@/features/admin/InlineEdit";
import { useSectionEditor } from "@/features/admin/hooks/useSectionEditor";
import { useTranslation } from "react-i18next";

interface ProjectsProps {
  projects?: any[];
  section?: { id: string; type: string; content: Record<string, unknown> };
}

export default function Projects({ projects, section }: ProjectsProps) {
  const { t } = useTranslation();
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const carouselProjects = Array.isArray(projects) ? projects : [];
  const { draft, updateField } = useSectionEditor(section as any);

  const handleViewMore = (project: any) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl text-center lg:text-left">
            <h2 className="mb-4 text-4xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
              <EditableText
                value={String(draft.title ?? t('projects.title'))}
                displayValue={String(t('projects.title'))}
                onSave={(value) => updateField("title", value)}
              />
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-gray-600 dark:text-gray-400 sm:text-base">
              <EditableText
                value={String(draft.subtitle ?? t('projects.subtitle'))}
                displayValue={String(t('projects.subtitle'))}
                onSave={(value) => updateField("subtitle", value)}
                multiline
              />
            </p>
          </div>

          <Button
            size="lg"
            className="self-center bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 lg:self-auto"
            asChild
          >
            <Link to="/projects">
              <EditableText
                value={String(draft.cta ?? t('projects.allProjects'))}
                displayValue={String(t('projects.allProjects'))}
                onSave={(value) => updateField("cta", value)}
              />
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>

        <Carousel
          opts={{ align: "start", dragFree: true, loop: true }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {carouselProjects.map((project) => {
              const technologies = Array.isArray(project.technologies)
                ? (project.technologies as string[])
                : [];

              return (
                <CarouselItem
                  key={project.id}
                  className="pl-4 md:basis-[65%] lg:basis-[48%] xl:basis-[38%] 2xl:basis-[32%]"
                >
                  <Card className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-slate-950/90 dark:shadow-black/20">
                    <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-900">
                      <img
                        src={project.image}
                        alt={project.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-900/5 to-transparent dark:from-slate-950/70 dark:via-slate-950/10 dark:to-transparent" />
                      {project.featured ? (
                        <div className="absolute left-4 top-4">
                          <Badge className="rounded-full border-0 bg-violet-600 px-3 py-1 text-xs font-semibold text-white">
                            <Star className="mr-1 h-3 w-3 fill-current" />
                            Featured
                          </Badge>
                        </div>
                      ) : null}
                    </div>

                    <CardHeader className="space-y-4 bg-white text-slate-900 dark:bg-slate-950/95 dark:text-white">
                      <div className="space-y-3">
                        <CardTitle className="font-display text-3xl leading-tight text-slate-900 dark:text-white">
                          {project.name}
                        </CardTitle>
                        <p className="line-clamp-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                          {project.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-5 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Star className="h-4 w-4" />
                          <span>{project.stats?.stars ?? 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <GitFork className="h-4 w-4" />
                          <span>{project.stats?.forks ?? 0}</span>
                        </div>
                        <div className="ml-auto text-xs font-semibold uppercase tracking-[0.22em] text-violet-400">
                          GitHub
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="flex flex-1 flex-col gap-4 bg-white pt-0 text-slate-700 dark:bg-slate-950/95 dark:text-slate-200">
                      <div className="flex flex-wrap gap-2">
                        {technologies.slice(0, 4).map((tech) => (
                          <Badge
                            key={tech}
                            variant="secondary"
                            className="rounded-full border border-slate-200 bg-slate-100 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>

                    <CardFooter className="mt-auto flex-col gap-3 border-t border-slate-200 bg-white pt-5 dark:border-white/10 dark:bg-slate-950/95">
                      <Button
                        variant="outline"
                        className="h-11 w-full border-slate-300 bg-transparent text-slate-900 hover:bg-slate-50 dark:border-white/15 dark:text-white dark:hover:bg-white/5"
                        onClick={() => handleViewMore(project)}
                      >
                        {t('projects.filters.viewDetails')}
                      </Button>
                      {project.liveUrl ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-full justify-center text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                          asChild
                        >
                          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                            {t('projects.modal.viewLive')}
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      ) : null}
                    </CardFooter>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          <CarouselPrevious className="left-2 top-1/2 h-12 w-12 -translate-y-1/2 border-slate-200 bg-white/95 text-slate-700 shadow-lg shadow-slate-200/70 hover:bg-violet-600 hover:text-white disabled:opacity-40 dark:border-white/10 dark:bg-slate-950/90 dark:text-white dark:shadow-black/20 md:-left-4 lg:-left-6" />
          <CarouselNext className="right-2 top-1/2 h-12 w-12 -translate-y-1/2 border-slate-200 bg-white/95 text-slate-700 shadow-lg shadow-slate-200/70 hover:bg-violet-600 hover:text-white disabled:opacity-40 dark:border-white/10 dark:bg-slate-950/90 dark:text-white dark:shadow-black/20 md:-right-4 lg:-right-6" />
        </Carousel>
      </div>

      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}
