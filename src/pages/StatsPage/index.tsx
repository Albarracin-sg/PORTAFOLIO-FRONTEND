import { useEffect, useState } from 'react';
import Statistics from '@/components/Statistics';
import { fetchGithubStats, fetchApiStats, type ApiStats } from '@/shared/api/public';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Skeleton } from '@/components/ui/skeleton';

export function StatsPage() {
  const [githubStats, setGithubStats] = useState<any | null>(null);
  const [apiStats, setApiStats] = useState<ApiStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        setIsLoading(true);
        const [statsResult, apiResult] = await Promise.allSettled([
          fetchGithubStats(),
          fetchApiStats(),
        ]);
        if (!isActive) return;

        if (statsResult.status === 'fulfilled') {
          setGithubStats(statsResult.value);
        }
        if (apiResult.status === 'fulfilled') {
          setApiStats(apiResult.value);
        }
      } catch {
        if (!isActive) return;
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    load();
    return () => { isActive = false; };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
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
        </div>
      </div>
    );
  }

  return <Statistics githubStats={githubStats} apiStats={apiStats} />;
}