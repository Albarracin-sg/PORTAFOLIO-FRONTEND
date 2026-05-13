import { useEffect, useReducer } from 'react';
import Statistics from '@/components/Statistics';
import { fetchGithubStats, fetchApiStats, type ApiStats } from '@/shared/api/public';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Skeleton } from '@/components/ui/skeleton';

interface StatsState {
  githubStats: any | null;
  apiStats: ApiStats | null;
  isLoading: boolean;
}

type StatsAction = 
  | { type: 'START_LOAD' }
  | { type: 'SET_DATA'; payload: { github?: any; api?: ApiStats } }
  | { type: 'FINISH_LOAD' };

function statsReducer(state: StatsState, action: StatsAction): StatsState {
  switch (action.type) {
    case 'START_LOAD':
      return { ...state, isLoading: true };
    case 'SET_DATA':
      return { 
        ...state, 
        githubStats: action.payload.github ?? state.githubStats,
        apiStats: action.payload.api ?? state.apiStats 
      };
    case 'FINISH_LOAD':
      return { ...state, isLoading: false };
    default:
      return state;
  }
}

export function StatsPage() {
  const [state, dispatch] = useReducer(statsReducer, {
    githubStats: null,
    apiStats: null,
    isLoading: true,
  });

  const { githubStats, apiStats, isLoading } = state;

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      dispatch({ type: 'START_LOAD' });
      try {
        const [statsResult, apiResult] = await Promise.allSettled([
          fetchGithubStats(),
          fetchApiStats(),
        ]);
        if (!isActive) return;

        const payload: { github?: any; api?: ApiStats } = {};
        if (statsResult.status === 'fulfilled') payload.github = statsResult.value;
        if (apiResult.status === 'fulfilled') payload.api = apiResult.value;
        
        dispatch({ type: 'SET_DATA', payload });
      } catch {
        // Error handling if needed
      } finally {
        if (isActive) dispatch({ type: 'FINISH_LOAD' });
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