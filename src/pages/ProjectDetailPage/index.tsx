import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Star,
  GitFork,
  Calendar,
  Target,
  Rocket,
  Lightbulb,
  Code2,
  Globe,
  Tag,
  Activity,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchPublicProjects, PublicProject } from '@/shared/api/public';
import { SkillBubble } from '@/components/SkillBubble';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [project, setProject] = useState<PublicProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProject = async () => {
      try {
        setIsLoading(true);
        const projects = await fetchPublicProjects();
        const found = projects.find((p) => p.id === id);
        if (found) {
          setProject(found);
        } else {
          navigate('/projects');
        }
      } catch {
        navigate('/projects');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) loadProject();
  }, [id, navigate]);

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(value));

  /* ─── Loading skeleton ─── */
  if (isLoading) {
    return (
      <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-32 rounded-full" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-28 rounded-full" />
              <Skeleton className="h-10 w-28 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-16 w-2/3 rounded-2xl" />
          <Skeleton className="h-6 w-48 rounded-xl" />
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-8">
              <Skeleton className="aspect-video w-full rounded-3xl" />
              <Skeleton className="h-64 w-full rounded-3xl" />
            </div>
            <div className="lg:col-span-4">
              <Skeleton className="h-96 w-full rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen bg-background text-foreground pt-28 pb-24 selection:bg-violet-500/30">
      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 -right-32 w-[480px] h-[480px] bg-violet-600/10 dark:bg-violet-600/6 blur-[140px] rounded-full" />
        <div className="absolute -bottom-32 -left-32 w-[480px] h-[480px] bg-blue-600/8 dark:bg-blue-600/5 blur-[140px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Top navigation ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-14">
          <Button
            variant="ghost"
            asChild
            className="group rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-5 h-10 hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-slate-700 dark:text-slate-200"
          >
            <Link to="/projects">
              <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1 text-slate-500 dark:text-slate-400" />
              {t('common.back')}
            </Link>
          </Button>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              className="rounded-full bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 px-5 h-9 shadow-lg shadow-violet-600/20 text-white"
              asChild
            >
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </a>
            </Button>
            {project.liveUrl && (
              <Button
                size="sm"
                variant="outline"
                className="rounded-full border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 px-5 h-9 text-slate-700 dark:text-slate-200"
                asChild
              >
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Live Demo
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* ── Hero identity ── */}
        <div className="mb-16 space-y-6">
          {/* Category pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-semibold uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
            </span>
            {project.category}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-900 dark:text-gray-100 leading-[1.1]">
            {project.title}
          </h1>

          {/* Meta chips */}
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 rounded-2xl">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="font-semibold text-slate-900 dark:text-white">{project.stars}</span>
              <span className="text-slate-500 dark:text-slate-400">stars</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 rounded-2xl">
              <GitFork className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              <span className="font-semibold text-slate-900 dark:text-white">{project.forks}</span>
              <span className="text-slate-500 dark:text-slate-400">forks</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 rounded-2xl">
              <Calendar className="w-4 h-4 text-violet-500 dark:text-violet-400" />
              <span className="text-slate-700 dark:text-slate-300">{formatDate(project.date)}</span>
            </div>
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">

          {/* Left: narrative */}
          <div className="lg:col-span-8 space-y-8">

            {/* Hero image — taller */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-blue-600 rounded-[28px] blur-2xl opacity-10 dark:opacity-15 group-hover:opacity-20 dark:group-hover:opacity-25 transition duration-700" />
              <div className="relative w-full rounded-[28px] overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl shadow-slate-200/60 dark:shadow-black/30 bg-slate-100 dark:bg-slate-900" style={{ aspectRatio: '16/9' }}>
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
            </div>

            {/* What is it */}
            <section className="p-8 md:p-10 rounded-3xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-2xl bg-violet-500/10">
                  <Globe className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-gray-100">
                  {t('projects.detail.whatIs', '¿Qué es?')}
                </h2>
              </div>
              <p className="text-base leading-7 text-slate-600 dark:text-slate-400">
                {project.description}
              </p>
            </section>

            {/* Problem — full width, more padding */}
            <section className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-red-500/5 to-transparent border border-red-200 dark:border-red-500/10 hover:border-red-300 dark:hover:border-red-500/20 transition-colors">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-2xl bg-red-500/10">
                  <Target className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-gray-100">
                  {t('projects.detail.problem', 'El Problema')}
                </h2>
              </div>
              <p className="text-base leading-8 text-slate-600 dark:text-slate-400 italic border-l-2 border-red-300 dark:border-red-500/30 pl-5">
                {project.problem ||
                  t(
                    'projects.detail.problemFallback',
                    'Este proyecto nació de la necesidad de optimizar flujos complejos y modernizar la interacción del usuario en entornos críticos.',
                  )}
              </p>
            </section>

            {/* Challenge + Solution — equal height, more content */}
            <div className="grid sm:grid-cols-2 gap-6">
              <section className="p-8 rounded-3xl bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-200 dark:border-amber-500/10 hover:border-amber-300 dark:hover:border-amber-500/20 transition-colors flex flex-col">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 rounded-2xl bg-amber-500/10">
                    <Rocket className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-gray-100">
                    {t('projects.detail.challenge', 'El Reto')}
                  </h2>
                </div>
                <p className="text-sm leading-7 text-slate-600 dark:text-slate-400 flex-1">
                  {project.challenge ||
                    t(
                      'projects.detail.challengeFallback',
                      'Superar las barreras de escalabilidad y garantizar performance excepcional bajo alta demanda.',
                    )}
                </p>
              </section>

              <section className="p-8 rounded-3xl bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-200 dark:border-emerald-500/10 hover:border-emerald-300 dark:hover:border-emerald-500/20 transition-colors flex flex-col">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/10">
                    <Lightbulb className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-gray-100">
                    {t('projects.detail.solution', 'Solución')}
                  </h2>
                </div>
                <p className="text-sm leading-7 text-slate-600 dark:text-slate-400 flex-1">
                  {project.solution ||
                    t(
                      'projects.detail.solutionFallback',
                      'Implementación de una arquitectura distribuida y reactiva que prioriza la mantenibilidad y la rapidez.',
                    )}
                </p>
              </section>
            </div>
          </div>

          {/* Right: sidebar — single unified card */}
          <aside className="lg:col-span-4">
            <div className="sticky top-28 rounded-3xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">

              {/* Stack técnico */}
              <div className="p-8 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3 mb-6">
                  <Code2 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-gray-100 uppercase tracking-wide">
                    {t('projects.detail.techStack', 'Stack Técnico')}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <SkillBubble
                      key={tech.technology.name}
                      name={tech.technology.name}
                      showName
                      size="sm"
                    />
                  ))}
                </div>
              </div>

              {/* Resumen */}
              <div className="p-8 border-b border-slate-100 dark:border-white/5">
                <h4 className="text-[10px] uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500 font-semibold mb-5">
                  {t('projects.detail.summary', 'Resumen del Proyecto')}
                </h4>
                <div className="space-y-1">
                  <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Tag className="w-3.5 h-3.5 shrink-0" />
                      {t('projects.detail.category', 'Categoría')}
                    </div>
                    <span className="text-sm text-slate-900 dark:text-gray-100 font-medium capitalize">
                      {project.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Activity className="w-3.5 h-3.5 shrink-0" />
                      {t('projects.detail.status', 'Estado')}
                    </div>
                    <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium capitalize">
                      {project.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Star className="w-3.5 h-3.5 shrink-0" />
                      Stars
                    </div>
                    <span className="text-sm text-slate-900 dark:text-gray-100 font-medium">
                      {project.stars}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <GitFork className="w-3.5 h-3.5 shrink-0" />
                      Forks
                    </div>
                    <span className="text-sm text-slate-900 dark:text-gray-100 font-medium">
                      {project.forks}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      {t('projects.detail.year', 'Año')}
                    </div>
                    <span className="text-sm text-slate-900 dark:text-gray-100 font-medium">
                      {new Date(project.date).getFullYear()}
                    </span>
                  </div>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="p-8 flex flex-col gap-3">
                <Button
                  className="w-full rounded-2xl bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 h-11 text-white shadow-md shadow-violet-600/10"
                  asChild
                >
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Github className="w-4 h-4 mr-2" />
                    {t('projects.detail.exploreCode', 'Explorar Código')}
                  </a>
                </Button>
                {project.liveUrl && (
                  <Button
                    variant="outline"
                    className="w-full rounded-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 h-11 text-slate-700 dark:text-slate-200"
                    asChild
                  >
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {t('projects.detail.visitProject', 'Visitar Proyecto')}
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}