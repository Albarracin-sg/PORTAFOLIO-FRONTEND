import { ReactNode, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Star,
  GitFork,
  Calendar,
  Target,
  Zap,
  CheckCircle2,
  Code2,
  Globe,
  Tag,
  Activity,
  Link2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchPublicProjects, PublicProject } from '@/shared/api/public';
import { SkillBubble } from '@/components/SkillBubble';

type DetailSectionProps = {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  withIndent?: boolean;
  className?: string;
};

function DetailSection({ 
  icon, 
  title, 
  children, 
  withIndent = false,
  className = "" 
}: DetailSectionProps) {
  return (
    <section className={["p-7 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] flex flex-col", className].join(' ')}>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-2 rounded-xl bg-slate-200/60 dark:bg-white/5">{icon}</div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-gray-100">
          {title}
        </h2>
      </div>

      <div
        className={[
          'text-sm leading-7 text-slate-600 dark:text-slate-400 flex-1',
          withIndent ? 'pl-[2.375rem]' : '',
        ].join(' ')}
      >
        {children}
      </div>
    </section>
  );
}

function ProjectDetailSkeleton() {
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

        <Skeleton className="h-12 w-2/3 rounded-2xl" />
        <Skeleton className="h-5 w-48 rounded-xl" />

        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-6">
            <Skeleton className="aspect-video w-full rounded-3xl" />
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-40 w-full rounded-3xl" />
          </div>

          <div className="lg:col-span-4">
            <Skeleton className="h-[480px] w-full rounded-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [project, setProject] = useState<PublicProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      navigate('/projects', { replace: true });
      return;
    }

    const loadProject = async () => {
      try {
        setIsLoading(true);

        const projects = await fetchPublicProjects();
        const found = projects.find((item) => item.id === id);

        if (!found) {
          navigate('/projects', { replace: true });
          return;
        }

        setProject(found);
      } catch {
        navigate('/projects', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [id, navigate]);

  const formatDate = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '';

    return new Intl.DateTimeFormat(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  if (isLoading) return <ProjectDetailSkeleton />;

  if (!project) return null;

  const projectYear = new Date(project.date).getFullYear();
  const safeProjectYear = Number.isNaN(projectYear) ? '' : projectYear;

  return (
    <div className="min-h-screen pt-28 pb-24 selection:bg-violet-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-12">
          <Button
            variant="ghost"
            asChild
            className="group rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-5 h-9 hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-slate-700 dark:text-slate-200 text-sm"
          >
            <Link to="/projects">
              <ArrowLeft className="h-3.5 w-3.5 mr-2 transition-transform group-hover:-translate-x-1 text-slate-500 dark:text-slate-400" />
              {t('common.back')}
            </Link>
          </Button>

          <div className="flex items-center gap-2.5">
            <Button
              size="sm"
              className="rounded-full bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 px-5 h-9 shadow-lg shadow-violet-600/20 text-white text-sm"
              asChild
            >
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                <Github className="w-3.5 h-3.5 mr-2" />
                GitHub
              </a>
            </Button>

            {project.liveUrl && (
              <Button
                size="sm"
                variant="outline"
                className="rounded-full border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 px-5 h-9 text-slate-700 dark:text-slate-200 text-sm"
                asChild
              >
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3.5 h-3.5 mr-2" />
                  Live Demo
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-semibold uppercase tracking-widest">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-500" />
            </span>
            {project.category}
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl leading-tight">
            {project.title}
          </h1>

          <div className="flex flex-wrap gap-2 text-sm pt-1">
            <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-xl">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="font-medium text-slate-900 dark:text-white">
                {project.stars}
              </span>
              <span className="text-slate-400 dark:text-slate-500">stars</span>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-xl">
              <GitFork className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="font-medium text-slate-900 dark:text-white">
                {project.forks}
              </span>
              <span className="text-slate-400 dark:text-slate-500">forks</span>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-xl">
              <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="text-slate-600 dark:text-slate-300">
                {formatDate(project.date)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-8 space-y-10">
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-blue-600 rounded-[32px] blur-2xl opacity-10 dark:opacity-15 group-hover:opacity-20 transition duration-700" />

              <div className="relative aspect-video rounded-[32px] overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl shadow-slate-200/50 dark:shadow-black/40 bg-slate-100 dark:bg-slate-900">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
              </div>
            </div>

            <div className="space-y-8">
              <DetailSection
                icon={<Globe className="w-5 h-5 text-violet-600 dark:text-violet-400" />}
                title={t('projects.detail.whatIs', '¿Qué es?')}
              >
                {project.description}
              </DetailSection>

              <DetailSection
                icon={<Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                title={t('projects.detail.problem', 'El Problema')}
              >
                {project.problem ||
                  t(
                    'projects.detail.problemFallback',
                    'Este proyecto nació de la necesidad de optimizar flujos complejos y modernizar la interacción del usuario en entornos críticos.',
                  )}
              </DetailSection>

              <DetailSection
                icon={
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                }
                title={t('projects.detail.solution', 'Solución')}
              >
                {project.solution ||
                  t(
                    'projects.detail.solutionFallback',
                    'Implementación de una arquitectura distribuida y reactiva que prioriza la mantenibilidad y la rapidez.',
                  )}
              </DetailSection>
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-28 space-y-6 flex flex-col">
              <div className="rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden shrink-0">
                <div className="p-6 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-2 mb-4">
                    <Code2 className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-gray-100 uppercase tracking-widest">
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

                <div className="p-6 border-b border-slate-100 dark:border-white/5">
                  <h4 className="text-[10px] uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500 font-semibold mb-4">
                    {t('projects.detail.summary', 'Resumen')}
                  </h4>

                  <div className="divide-y divide-slate-100 dark:divide-white/5">
                    <div className="flex items-center justify-between py-2.5 gap-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Tag className="w-3.5 h-3.5 shrink-0" />
                        {t('projects.detail.category', 'Categoría')}
                      </div>

                      <span className="text-sm text-slate-900 dark:text-gray-100 font-medium capitalize text-right">
                        {project.category}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2.5 gap-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Activity className="w-3.5 h-3.5 shrink-0" />
                        {t('projects.detail.status', 'Estado')}
                      </div>

                      <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium capitalize text-right">
                        {project.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2.5 gap-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Star className="w-3.5 h-3.5 shrink-0" />
                        Stars
                      </div>

                      <span className="text-sm text-slate-900 dark:text-gray-100 font-medium">
                        {project.stars}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2.5 gap-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <GitFork className="w-3.5 h-3.5 shrink-0" />
                        Forks
                      </div>

                      <span className="text-sm text-slate-900 dark:text-gray-100 font-medium">
                        {project.forks}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2.5 gap-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        {t('projects.detail.year', 'Año')}
                      </div>

                      <span className="text-sm text-slate-900 dark:text-gray-100 font-medium">
                        {safeProjectYear}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-b border-slate-100 dark:border-white/5">
                  <h4 className="text-[10px] uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500 font-semibold mb-3">
                    {t('projects.detail.links', 'Enlaces')}
                  </h4>

                  <div className="space-y-1.5">
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-violet-50 dark:hover:bg-violet-500/10 border border-transparent hover:border-violet-200 dark:hover:border-violet-500/20 transition-all group"
                    >
                      <Github className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 shrink-0 transition-colors" />

                      <span className="text-xs text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white truncate transition-colors">
                        {project.githubUrl.replace(/^https?:\/\//, '')}
                      </span>

                      <ExternalLink className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0 ml-auto" />
                    </a>

                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-violet-50 dark:hover:bg-violet-500/10 border border-transparent hover:border-violet-200 dark:hover:border-violet-500/20 transition-all group"
                      >
                        <Link2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 shrink-0 transition-colors" />

                        <span className="text-xs text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white truncate transition-colors">
                          {project.liveUrl.replace(/^https?:\/\//, '')}
                        </span>

                        <ExternalLink className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0 ml-auto" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="p-6 flex flex-col gap-2.5">
                  <Button
                    className="w-full rounded-xl bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 h-10 text-white text-sm shadow-md shadow-violet-600/10"
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
                      className="w-full rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 h-10 text-slate-700 dark:text-slate-200 text-sm"
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

              <DetailSection
                icon={<Zap className="w-5 h-5 text-amber-500 dark:text-amber-400" />}
                title={t('projects.detail.challenge', 'El Reto')}
                className="flex-1"
              >
                {project.challenge ||
                  t(
                    'projects.detail.challengeFallback',
                    'Superar las barreras de escalabilidad y garantizar performance excepcional bajo alta demanda.',
                  )}
              </DetailSection>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}