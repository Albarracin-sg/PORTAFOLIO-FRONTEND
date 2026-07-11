import Statistics from '@/components/Statistics';
import { fetchGithubStats, fetchApiStats } from '@/shared/api/public';
import { useLocalStorageSWR } from '@/shared/hooks/useLocalStorageSWR';
import { usePageSeo } from '@/shared/seo/usePageSeo';
import { usePrerenderReady } from '@/shared/seo/usePrerenderReady';

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

  usePageSeo({
    title: 'Estadisticas | Juan Camilo Albarracin',
    description:
      'Metricas y estadisticas del portafolio de Juan Camilo Albarracin: actividad en GitHub, repositorios, tecnologias y rendimiento de APIs.',
    path: '/stats',
    keywords: ['estadisticas juan camilo albarracin', 'github stats portfolio', 'metricas backend portfolio'],
  });

  usePrerenderReady(!isLoading, 250);

  return (
    <Statistics
      githubStats={githubStats}
      apiStats={apiStats ?? null}
      isLoading={isLoading}
    />
  );
}
