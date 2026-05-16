import { useEffect, useState } from 'react';
import Statistics from '@/components/Statistics';
import { fetchGithubStats, fetchApiStats, type ApiStats } from '@/shared/api/public';

export function StatsPage() {
  const [githubStats, setGithubStats] = useState<any | null>(null);
  const [apiStats, setApiStats] = useState<ApiStats | null>(null);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      const [statsResult, apiResult] = await Promise.allSettled([
        fetchGithubStats(),
        fetchApiStats(),
      ]);
      if (!isActive) return;

      if (statsResult.status === 'fulfilled') setGithubStats(statsResult.value);
      if (apiResult.status === 'fulfilled') setApiStats(apiResult.value);
    };

    load();
    return () => { isActive = false; };
  }, []);

  return <Statistics githubStats={githubStats} apiStats={apiStats} />;
}