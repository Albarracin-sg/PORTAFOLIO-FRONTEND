import { Star, GitFork, Calendar } from 'lucide-react';
import { PublicProject } from '@/shared/api/public';

interface ProjectInfoProps {
  project: PublicProject;
  formattedDate: string;
}

export function ProjectInfo({ project, formattedDate }: ProjectInfoProps) {
  return (
    <div className="mb-10 space-y-4">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-semibold uppercase tracking-widest">
        <span className="relative flex size-1.5">
          <span className="animate-ping absolute inline-flex size-full rounded-full bg-violet-400 opacity-75" />
          <span className="relative inline-flex rounded-full size-1.5 bg-violet-500" />
        </span>
        {project.category}
      </div>

      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl leading-tight break-words">
        {project.title}
      </h1>

      <div className="flex flex-wrap gap-2 text-sm pt-1">
        <div className="inline-flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 px-3 py-1.5 rounded-xl shrink-0">
          <Star className="size-3.5 text-amber-500 fill-amber-500" />
          <span className="font-medium text-zinc-900 dark:text-white">
            {project.stars}
          </span>
          <span className="text-zinc-400 dark:text-zinc-500">stars</span>
        </div>

        <div className="inline-flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 px-3 py-1.5 rounded-xl shrink-0">
          <GitFork className="size-3.5 text-zinc-500 dark:text-zinc-400" />
          <span className="font-medium text-zinc-900 dark:text-white">
            {project.forks}
          </span>
          <span className="text-zinc-400 dark:text-zinc-500">forks</span>
        </div>

        <div className="inline-flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 px-3 py-1.5 rounded-xl">
          <Calendar className="size-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
          <span className="text-zinc-600 dark:text-zinc-300">
            {formattedDate}
          </span>
        </div>
      </div>
    </div>
  );
}
