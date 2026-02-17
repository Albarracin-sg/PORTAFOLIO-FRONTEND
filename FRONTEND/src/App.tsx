import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { RootLayout } from '@/app/layout/RootLayout';
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

export default function App() {
  return (
    <Routes>
      <Route path="*" element={<RootLayout />}>
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
      </Route>
    </Routes>
  );
}
