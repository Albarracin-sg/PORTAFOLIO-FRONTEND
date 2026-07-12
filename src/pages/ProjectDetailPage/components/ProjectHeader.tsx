import { Link } from 'react-router-dom';
import { ArrowLeft, Github, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { PublicProject } from '@/shared/api/public';

interface ProjectHeaderProps {
  project: PublicProject;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
      <Button
        variant="ghost"
        asChild
        className="group rounded-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 px-5 h-9 hover:bg-zinc-200 dark:hover:bg-white/[0.06] transition-all text-zinc-700 dark:text-zinc-200 text-sm w-fit"
      >
        <Link to="/projects">
          <ArrowLeft className="size-3.5 mr-2 transition-transform group-hover:-translate-x-1 text-zinc-500 dark:text-zinc-400" />
          {t('common.back')}
        </Link>
      </Button>

      <div className="flex flex-wrap items-center gap-3">
        {project.githubUrl && <Button
          size="sm"
          className="flex-1 sm:flex-none rounded-full bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 px-5 h-9 shadow-lg shadow-violet-600/20 text-white text-sm"
          asChild
        >
          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
            <Github className="size-3.5 mr-2" />
            GitHub
          </a>
        </Button>}

        {project.liveUrl && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1 sm:flex-none rounded-full border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-white/[0.06] px-5 h-9 text-zinc-700 dark:text-zinc-200 text-sm"
            asChild
          >
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-3.5 mr-2" />
              Live Demo
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
