import { useEffect, useState, useRef } from "react";
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

const AUTOPLAY_INTERVAL = 5000;

function ProgressBar({ api, interval }: { api: CarouselApi | undefined; interval: number }) {
  const barRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (!api) return;

    const onPointerDown = () => { pausedRef.current = true; };
    const onPointerUp = () => { pausedRef.current = false; };
    api.on("pointerDown", onPointerDown);
    api.on("pointerUp", onPointerUp);

    return () => {
      api.off("pointerDown", onPointerDown);
      api.off("pointerUp", onPointerUp);
    };
  }, [api]);

  useEffect(() => {
    if (!api) return;

    let startTime = Date.now();
    let rafId: number;

    const tick = () => {
      if (pausedRef.current) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / interval) * 100, 100);

      if (barRef.current) barRef.current.style.width = `${pct}%`;

      if (pct >= 100) {
        api.scrollNext();
        startTime = Date.now();
      }

      rafId = requestAnimationFrame(tick);
    };

    const onSelect = () => { startTime = Date.now(); };
    api.on("select", onSelect);
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      api.off("select", onSelect);
    };
  }, [api, interval]);

  return <div ref={barRef} className="absolute left-0 top-0 h-full bg-violet-500" />;
}

export default function Projects({ projects, section }: ProjectsProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [api, setApi] = useState<CarouselApi>();

  const carouselProjects = Array.isArray(projects) ? projects : [];
  const { draft, updateField } = useSectionEditor(section as any);

  const handleViewMore = (project: any) => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl text-center lg:text-left">
            <h2 className="mb-4 text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
              <EditableText
                value={String(draft.title ?? t('projects.title'))}
                displayValue={String(t('projects.title'))}
                onSave={(value) => updateField("title", value)}
              />
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-400 sm:text-base">
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
              <ArrowRight className="ml-2 size-5" />
            </Link>
          </Button>
        </div>

        <div>
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
                    className="pl-4 basis-[85%] md:basis-[65%] lg:basis-[48%] xl:basis-[38%] 2xl:basis-[32%] will-change-transform"
                  >
                    <Card className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/85 shadow-lg shadow-zinc-200/60 transition-transform duration-300 hover:-translate-y-1 dark:border-white/10 dark:bg-zinc-950/75 dark:shadow-black/20">
                      <div className="relative h-36 sm:h-44 overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                        <img
                          src={project.image}
                          alt={project.name}
                          className="size-full object-cover"
                        />
                        {/* Separador elegante más visible y asertivo */}
                        <div className="absolute bottom-0 left-0 h-[2px] w-full bg-linear-to-r from-transparent via-zinc-400/80 to-transparent dark:via-violet-500/40 z-10" />
                      </div>

                      <CardHeader className="space-y-4 bg-transparent pb-2 text-zinc-900 dark:bg-transparent dark:text-white">
                        <div className="space-y-1">
                          <CardTitle className="font-display line-clamp-1 text-2xl font-semibold leading-tight text-zinc-900 dark:text-white">
                            {project.name}
                          </CardTitle>
                          
                          <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                            <div className="flex items-center gap-1">
                              <Star className="size-3.5" />
                              <span>{project.stats?.stars ?? 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <GitFork className="size-3.5" />
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
                            <div className="flex items-center justify-center rounded-full border border-zinc-200 bg-zinc-50/50 px-2 py-1 text-[10px] font-bold text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400">
                              +{technologies.length - 5}
                            </div>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="flex flex-1 flex-col bg-transparent pt-0 text-black dark:bg-transparent dark:text-white">
                        <div className="h-24 sm:h-20 overflow-hidden">
                          <p className="line-clamp-4 sm:line-clamp-3 text-sm leading-6 text-zinc-600 dark:text-white">
                            {typeof project.description === 'object' 
                              ? (project.description[i18n.language] || project.description['es'])
                              : project.description}
                          </p>
                        </div>
                      </CardContent>

                      <CardFooter className="mt-auto flex items-center gap-2 border-t border-zinc-200 bg-transparent p-4 pt-4 dark:border-white/10 dark:bg-transparent">
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
                            className="size-10 shrink-0 border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
                            asChild
                          >
                            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" title={t('projects.actions.github')}>
                              <GitFork className="size-4.5" />
                            </a>
                          </Button>
                        )}

                        {project.liveUrl && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-10 shrink-0 border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
                            asChild
                          >
                            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" title={t('projects.modal.viewLive')}>
                              <ExternalLink className="size-4.5" />
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
                className="static size-12 shrink-0 translate-y-0 border-zinc-200 bg-white/95 text-black shadow-md hover:bg-violet-600 hover:text-white dark:border-white/10 dark:bg-zinc-950/90 dark:text-white" 
              />

              <div className="relative h-1.5 flex-1 max-w-xs overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <ProgressBar api={api} interval={AUTOPLAY_INTERVAL} />
              </div>

              <CarouselNext 
                className="static size-12 shrink-0 translate-y-0 border-zinc-200 bg-white/95 text-black shadow-md hover:bg-violet-600 hover:text-white dark:border-white/10 dark:bg-zinc-950/90 dark:text-white" 
              />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
}
