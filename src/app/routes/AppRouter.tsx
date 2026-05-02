import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

const StatsPage = lazy(() => import('@/pages/StatsPage').then((m) => ({ default: m.StatsPage })));
const AllProjectsPage = lazy(() => import('@/pages/AllProjectsPage').then((m) => ({ default: m.AllProjectsPage })));

function PageFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-pulse text-gray-500 dark:text-gray-400">Cargando...</div>
    </div>
  );
}

/** Rutas hijas para usar dentro de <Route element={<RootLayout />}> */
export function AppRouter() {
  return (
    <>
      <Route index element={<HomePage />} />
      <Route
        path="stats"
        element={
          <Suspense fallback={<PageFallback />}>
            <StatsPage />
          </Suspense>
        }
      />
      <Route
        path="projects"
        element={
          <Suspense fallback={<PageFallback />}>
            <AllProjectsPage />
          </Suspense>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </>
  );
}
