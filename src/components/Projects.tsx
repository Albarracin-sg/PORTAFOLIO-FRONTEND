import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "./ui/carousel";
import { ArrowRight, ExternalLink, GitFork, Star } from "lucide-react";
import { EditableText } from "@/features/admin/InlineEdit";
import { useSectionEditor } from "@/features/admin/hooks/useSectionEditor";
import { useTranslation } from "react-i18next";
import { SkillBubble } from "./SkillBubble";

interface ProjectsProps {
  projects?: any[];
  section?: { id: string; type: string; content: Record<string, unknown> };
}

const AUTOPLAY_INTERVAL = 5000; // 5 segundos por slide

export default function Projects({ projects, section }: ProjectsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [api, setApi] = useState<CarouselApi>();
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const carouselProjects = Array.isArray(projects) ? projects : [];
  const { draft, updateField } = useSectionEditor(section as any);

  // Efecto para el Autoplay y la barra de progreso
  useEffect(() => {
    if (!api || isPaused) return;

    const step = 100 / (AUTOPLAY_INTERVAL / 50);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          api.scrollNext();
          return 0;
        }
        return prev + step;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [api, isPaused]);

  // Manejar el reinicio de la barra y la pausa por interacción
  useEffect(() => {
    if (!api) return;
    
    const onSelect = () => {
      setProgress(0);
    };

    const onPointerDown = () => setIsPaused(true);
    const onPointerUp = () => setIsPaused(false);

    api.on("select", onSelect);
    api.on("reInit", onSelect);
    api.on("pointerDown", onPointerDown);
    api.on("pointerUp", onPointerUp);
    
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
      api.off("pointerDown", onPointerDown);
      api.off("pointerUp", onPointerUp);
    };
  }, [api]);

  const handleViewMore = (project: any) => {
    navigate(`/projects/${project.id}`);
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

        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <Carousel
            setApi={setApi}
            opts={{ 
              align: "center", 
              loop: true,
              duration: 50
            }}
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
                    className="pl-4 basis-[85%] md:basis-[65%] lg:basis-[48%] xl:basis-[38%] 2xl:basis-[32%]"
                  >
                    <Card className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-slate-950/90 dark:shadow-black/20">
                      <div className="relative h-36 sm:h-44 overflow-hidden bg-slate-100 dark:bg-slate-900">
                        <img
                          src={project.image}
                          alt={project.name}
                          className="h-full w-full object-cover"
                        />
                        {/* Separador elegante más visible y asertivo */}
                        <div className="absolute bottom-0 left-0 h-[2px] w-full bg-linear-to-r from-transparent via-slate-400/80 to-transparent dark:via-violet-500/40 z-10" />
                      </div>

                      <CardHeader className="space-y-4 bg-white pb-2 text-slate-900 dark:bg-slate-950/95 dark:text-white">
                        <div className="space-y-1">
                          <CardTitle className="font-display line-clamp-1 text-2xl font-bold leading-tight text-slate-900 dark:text-white">
                            {project.name}
                          </CardTitle>
                          
                          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5" />
                              <span>{project.stats?.stars ?? 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <GitFork className="h-3.5 w-3.5" />
                              <span>{project.stats?.forks ?? 0}</span>
                            </div>
                            <div className="ml-auto font-semibold uppercase tracking-wider text-violet-500/80">
                              {project.category || 'Full Stack'}
                            </div>
                          </div>
                        </div>

                        <div className="flex h-20 sm:h-16 flex-wrap content-start gap-1.5 overflow-hidden">
                          {technologies.slice(0, 5).map((tech) => (
                            <SkillBubble
                              key={tech}
                              name={tech}
                              showName={true}
                              size="sm"
                            />
                          ))}
                          {technologies.length > 5 && (
                            <div className="flex items-center justify-center rounded-full border border-slate-200 bg-slate-50/50 px-2 py-1 text-[10px] font-bold text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                              +{technologies.length - 5}
                            </div>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="flex flex-1 flex-col bg-white pt-0 text-slate-700 dark:bg-slate-950/95 dark:text-slate-200">
                        <div className="h-24 sm:h-20 overflow-hidden">
                          <p className="line-clamp-4 sm:line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                            {project.description}
                          </p>
                        </div>
                      </CardContent>

                      <CardFooter className="mt-auto flex items-center gap-2 border-t border-slate-200 bg-white p-4 pt-4 dark:border-white/10 dark:bg-slate-950/95">
                        <Button
                          className="h-10 flex-1 bg-violet-600 font-medium text-white hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-700"
                          onClick={() => handleViewMore(project)}
                        >
                          {t('projects.filters.viewDetails')}
                        </Button>
                        
                        {project.githubUrl && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 shrink-0 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                            asChild
                          >
                            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" title={t('projects.actions.github')}>
                              <GitFork className="h-4.5 w-4.5" />
                            </a>
                          </Button>
                        )}

                        {project.liveUrl && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 shrink-0 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                            asChild
                          >
                            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" title={t('projects.modal.viewLive')}>
                              <ExternalLink className="h-4.5 w-4.5" />
                            </a>
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  </CarouselItem>
                );
              })}
            </CarouselContent>

            <div className="mt-8 flex items-center justify-center gap-4 px-4 relative z-40">
              <CarouselPrevious 
                className="static h-12 w-12 shrink-0 translate-y-0 border-slate-200 bg-white/95 text-slate-700 shadow-md hover:bg-violet-600 hover:text-white dark:border-white/10 dark:bg-slate-950/90 dark:text-white" 
              />

              <div className="relative h-1.5 flex-1 max-w-xs overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div 
                  className="absolute left-0 top-0 h-full bg-violet-500 transition-all duration-50 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <CarouselNext 
                className="static h-12 w-12 shrink-0 translate-y-0 border-slate-200 bg-white/95 text-slate-700 shadow-md hover:bg-violet-600 hover:text-white dark:border-white/10 dark:bg-slate-950/90 dark:text-white" 
              />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
}
