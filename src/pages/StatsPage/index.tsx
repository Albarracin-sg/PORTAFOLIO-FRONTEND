import { useEffect, useState } from 'react';
import Statistics from '@/components/Statistics';
import { fetchGithubStats, fetchPublicPage } from '@/shared/api/public';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Skeleton } from '@/components/ui/skeleton';

export function StatsPage() {
  const [section, setSection] = useState<{ id: string; type: string; content: Record<string, unknown> } | undefined>(
    undefined,
  );
  const [githubStats, setGithubStats] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        setIsLoading(true);
        const [pageResult, statsResult] = await Promise.allSettled([
          fetchPublicPage('stats'),
          fetchGithubStats(),
        ]);
        if (!isActive) return;
        if (pageResult.status === 'fulfilled') {
          const section = pageResult.value.sections.find((item) => item.type === 'STATS');
          setSection(section ? { id: section.id, type: section.type, content: section.content } : undefined);
        }
        if (statsResult.status === 'fulfilled') {
          setGithubStats(statsResult.value);
        }
      } catch {
        if (!isActive) return;
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-24 space-y-8 relative">
        {isLoading ? (
          <>
            <Skeleton className="h-12 w-64 rounded-lg" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
            
            <div className="relative min-h-[400px]">
              <LoadingScreen variant="inline" className="absolute inset-0 z-10 bg-background/5 border-none" />
              <Skeleton className="h-[400px] w-full rounded-3xl opacity-20" />
            </div>
          </>
        ) : (
          <Statistics section={section} githubStats={githubStats} />
        )}
      </div>
    </div>
  );
}


