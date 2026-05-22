import Statistics from '@/components/Statistics';
import { fetchGithubStats, fetchApiStats } from '@/shared/api/public';
import { useLocalStorageSWR } from '@/shared/hooks/useLocalStorageSWR';

const GITHUB_CACHE_KEY = 'github-stats-cache';
const API_CACHE_KEY = 'api-stats-cache';

export function StatsPage() {
  const { data: githubStats, isLoading: ghLoading } = useLocalStorageSWR(
    GITHUB_CACHE_KEY,
    fetchGithubStats,
  );

  const { data: apiStats, isLoading: apiLoading } = useLocalStorageSWR(
    API_CACHE_KEY,
    fetchApiStats,
  );

  // isLoading = true SOLO si no tenemos datos (ni localStorage, ni server)
  const isLoading = !githubStats && !apiStats && (ghLoading || apiLoading);

  return (
    <Statistics
      githubStats={githubStats}
      apiStats={apiStats ?? null}
      isLoading={isLoading}
    />
  );
}
