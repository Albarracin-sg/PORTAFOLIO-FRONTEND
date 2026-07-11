import { useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { fetchPublicProjects } from '@/shared/api/public';
import { useLocalStorageSWR } from '@/shared/hooks/useLocalStorageSWR';
import { commonFormatters } from '@/shared/utils/formatters';
import { ProjectDetailSkeleton } from './components/ProjectDetailSkeleton';
import { ProjectHeader } from './components/ProjectHeader';
import { ProjectInfo } from './components/ProjectInfo';
import { ProjectContent } from './components/ProjectContent';
import { ProjectSidebar } from './components/ProjectSidebar';
import { usePageSeo } from '@/shared/seo/usePageSeo';
import { usePrerenderReady } from '@/shared/seo/usePrerenderReady';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const { data: projects, isLoading } = useLocalStorageSWR(
    'public-projects-cache',
    fetchPublicProjects,
  );

  // Encontrar proyecto por id (derivado del cache SWR)
  const project = useMemo(() => {
    if (!projects) return null;
    return projects.find((item) => item.id === id) ?? null;
  }, [projects, id]);

  // Redirect: sin id en la URL
  useEffect(() => {
    if (!id) {
      navigate('/projects', { replace: true });
    }
  }, [id, navigate]);

  // Redirect: proyecto no encontrado y ya cargó (cache miss o fetch falló)
  useEffect(() => {
    if (!isLoading && !project && id) {
      navigate('/projects', { replace: true });
    }
  }, [isLoading, project, id, navigate]);

  const formatDate = useCallback(
    (value: string) => {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '';
      return commonFormatters.longDate(i18n.language).format(date);
    },
    [i18n.language],
  );

  const getLocalizedValue = useCallback(
    (obj: Record<string, string> | string) => {
      if (typeof obj === 'string') return obj;
      if (!obj) return '';

      if (obj[i18n.language]) return obj[i18n.language];

      const baseLang = i18n.language.split('-')[0];
      if (obj[baseLang]) return obj[baseLang];

      return obj['es'] || Object.values(obj)[0] || '';
    },
    [i18n.language],
  );

  const seoDescription = project
    ? getLocalizedValue(project.description).slice(0, 180)
    : 'Proyecto del portafolio de Juan Camilo Albarracin.';

  usePageSeo({
    title: project ? `${project.title} | Proyecto de Juan Camilo Albarracin` : 'Proyecto | Juan Camilo Albarracin',
    description: seoDescription,
    path: id ? `/projects/${id}` : '/projects',
    keywords: project
      ? [
          `proyecto ${project.title}`,
          'juan camilo albarracin proyectos',
          ...project.technologies.map((item) => item.technology.name.toLowerCase()),
        ]
      : ['juan camilo albarracin proyectos'],
  });

  usePrerenderReady(!isLoading && !!project, 250);

  if (isLoading) return <ProjectDetailSkeleton />;
  if (!project) return null;

  return (
    <div className="min-h-screen pt-28 pb-24 selection:bg-violet-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ProjectHeader project={project} />

        <ProjectInfo
          project={project}
          formattedDate={formatDate(project.date)}
        />

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-8 min-w-0 w-full">
            <ProjectContent
              project={project}
              getLocalizedValue={getLocalizedValue}
            />
          </div>
          <div className="lg:col-span-4 min-w-0 w-full">
            <ProjectSidebar project={project} />
          </div>
        </div>
      </div>
    </div>
  );
}
