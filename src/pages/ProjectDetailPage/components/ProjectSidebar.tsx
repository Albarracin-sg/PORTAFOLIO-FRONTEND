import { Code2, Tag, Activity, Star, GitFork, Calendar, Github, Link2, ExternalLink, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { SkillBubble } from '@/components/SkillBubble';
import { PublicProject } from '@/shared/api/public';
import { DetailSection } from './DetailSection';

interface ProjectSidebarProps {
  project: PublicProject;
}

export function ProjectSidebar({ project }: ProjectSidebarProps) {
  const { t, i18n } = useTranslation();
  const projectYear = new Date(project.date).getFullYear();
  const safeProjectYear = Number.isNaN(projectYear) ? '' : projectYear;

  return (
    <aside className="lg:col-span-4">
      <div className="sticky top-28 gap-y-6 flex flex-col">
        <div className="rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 shadow-sm overflow-hidden shrink-0">
          <div className="p-6 border-b border-zinc-100 dark:border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <Code2 className="size-4 text-violet-600 dark:text-violet-400 shrink-0" />
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">
                {t('projects.detail.techStack')}
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

          <div className="p-6 border-b border-zinc-100 dark:border-white/5">
            <h4 className="text-[10px] uppercase tracking-[0.28em] text-zinc-400 dark:text-zinc-500 font-semibold mb-4">
              {t('projects.detail.summary')}
            </h4>

            <div className="divide-y divide-zinc-100 dark:divide-white/5">
              <div className="flex items-center justify-between py-2.5 gap-4">
                <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                  <Tag className="size-3.5 shrink-0" />
                  {t('projects.detail.category')}
                </div>

                <span className="text-sm text-zinc-900 dark:text-zinc-100 font-medium capitalize text-right">
                  {project.category}
                </span>
              </div>

              <div className="flex items-center justify-between py-2.5 gap-4">
                <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                  <Activity className="size-3.5 shrink-0" />
                  {t('projects.detail.status')}
                </div>

                <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium capitalize text-right">
                  {project.status}
                </span>
              </div>

              <div className="flex items-center justify-between py-2.5 gap-4">
                <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                  <Star className="size-3.5 shrink-0" />
                  {t('projects.stars', 'Stars')}
                </div>

                <span className="text-sm text-zinc-900 dark:text-zinc-100 font-medium">
                  {project.stars}
                </span>
              </div>

              <div className="flex items-center justify-between py-2.5 gap-4">
                <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                  <GitFork className="size-3.5 shrink-0" />
                  {t('projects.forks', 'Forks')}
                </div>

                <span className="text-sm text-zinc-900 dark:text-zinc-100 font-medium">
                  {project.forks}
                </span>
              </div>

              <div className="flex items-center justify-between py-2.5 gap-4">
                <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                  <Calendar className="size-3.5 shrink-0" />
                  {t('projects.detail.year')}
                </div>

                <span className="text-sm text-zinc-900 dark:text-zinc-100 font-medium" suppressHydrationWarning>
                  {safeProjectYear}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-zinc-100 dark:border-white/5">
            <h4 className="text-[10px] uppercase tracking-[0.28em] text-zinc-400 dark:text-zinc-500 font-semibold mb-3">
              {t('projects.detail.links')}
            </h4>

            <div className="space-y-1.5">
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-violet-50 dark:hover:bg-violet-500/10 border border-transparent hover:border-violet-200 dark:hover:border-violet-500/20 transition-all group"
              >
                <Github className="size-3.5 text-zinc-500 dark:text-zinc-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 shrink-0 transition-colors" />

                <span className="text-xs text-zinc-600 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white truncate transition-colors">
                  {project.githubUrl.replace(/^https?:\/\//, '')}
                </span>

                <ExternalLink className="size-3 text-zinc-400 dark:text-zinc-500 shrink-0 ml-auto" />
              </a>

              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-violet-50 dark:hover:bg-violet-500/10 border border-transparent hover:border-violet-200 dark:hover:border-violet-500/20 transition-all group"
                >
                  <Link2 className="size-3.5 text-zinc-500 dark:text-zinc-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 shrink-0 transition-colors" />

                  <span className="text-xs text-zinc-600 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white truncate transition-colors">
                    {project.liveUrl.replace(/^https?:\/\//, '')}
                  </span>

                  <ExternalLink className="size-3 text-zinc-400 dark:text-zinc-500 shrink-0 ml-auto" />
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
                <Github className="size-4 mr-2" />
                {t('projects.detail.exploreCode')}
              </a>
            </Button>

            {project.liveUrl && (
              <Button
                variant="outline"
                className="w-full rounded-xl border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-zinc-50 dark:hover:bg-white/10 h-10 text-zinc-700 dark:text-zinc-200 text-sm"
                asChild
              >
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4 mr-2" />
                  {t('projects.detail.visitProject')}
                </a>
              </Button>
            )}
          </div>
        </div>

        <DetailSection
          icon={<Zap className="size-5 text-amber-500 dark:text-amber-400" />}
          title={t('projects.detail.challenge')}
          className="flex-1"
        >
          {project.challenge[i18n.language] || project.challenge['es']}
        </DetailSection>
      </div>
    </aside>
  );
}
