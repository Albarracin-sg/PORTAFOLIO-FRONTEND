import { useState, useEffect } from 'react';
import { Globe, Target, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PublicProject } from '@/shared/api/public';
import { fetchDiagramsByProject, type Diagram } from '@/shared/api/diagrams';
import { DetailSection } from './DetailSection';
import DiagramViewer from '@/components/DiagramViewer';

interface ProjectContentProps {
  project: PublicProject;
  getLocalizedValue: (obj: Record<string, string> | string) => string;
}

export function ProjectContent({ project, getLocalizedValue }: ProjectContentProps) {
  const { t, i18n } = useTranslation();
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);

  useEffect(() => {
    if (project.id) {
      fetchDiagramsByProject(project.id)
        .then(setDiagrams)
        .catch(() => {});
    }
  }, [project.id]);

  return (
    <div className="lg:col-span-8 space-y-10 w-full max-w-full overflow-hidden">
      <div className="group relative w-full">
        <div className="absolute inset-0 sm:-inset-1 bg-gradient-to-r from-violet-600 to-blue-600 rounded-2xl sm:rounded-[32px] blur-2xl opacity-10 dark:opacity-15 group-hover:opacity-20 transition duration-700" />

        <div className="relative w-full aspect-video rounded-2xl sm:rounded-[32px] overflow-hidden border border-zinc-200 dark:border-white/10 shadow-2xl shadow-zinc-200/50 dark:shadow-black/40 bg-zinc-100 dark:bg-zinc-900">
          <img
            src={project.imageUrl}
            alt={project.title}
            loading="lazy"
            className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
        </div>
      </div>

      <div className="space-y-8">
        <DetailSection
          icon={<Globe className="size-5 text-violet-600 dark:text-violet-400" />}
          title={t('projects.detail.whatIs')}
        >
          {project.description[i18n.language] || project.description['es']}
        </DetailSection>

        <DetailSection
          icon={<Target className="size-5 text-blue-600 dark:text-blue-400" />}
          title={t('projects.detail.problem')}
        >
          {getLocalizedValue(project.problem)}
        </DetailSection>

        <DetailSection
          icon={
            <CheckCircle2 className="size-5 text-emerald-500 dark:text-emerald-400" />
          }
          title={t('projects.detail.solution')}
        >
          {project.solution[i18n.language] || project.solution['es']}
        </DetailSection>
      </div>

      {/* Interactive Architecture Diagrams */}
      {diagrams.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {t('projects.detail.architecture', 'Architecture')}
          </h3>
          {diagrams.map((diagram) => (
            <DiagramViewer
              key={diagram.id}
              title={diagram.title}
              description={diagram.description}
              source={diagram.source}
              locale={i18n.language || 'es'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
