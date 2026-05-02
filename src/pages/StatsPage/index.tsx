import { useEffect, useState } from 'react';
import Statistics from '@/components/Statistics';
import { fetchGithubStats, fetchPublicPage } from '@/shared/api/public';

export function StatsPage() {
  const [section, setSection] = useState<{ id: string; type: string; content: Record<string, unknown> } | undefined>(
    undefined,
  );
  const [githubStats, setGithubStats] = useState<any | null>(null);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
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
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Statistics section={section} githubStats={githubStats} />
    </div>
  );
}
