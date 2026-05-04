import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import '@/i18n';
import { RootLayout } from './app/layout/RootLayout';
import { AdminLayout } from './app/layout/AdminLayout';
import { RequireAdmin } from '@/features/admin/RequireAdmin';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { AdminLoginPage } from '@/pages/Admin/LoginPage';
import { AdminDashboardPage } from '@/pages/Admin/DashboardPage';
import { AdminContentPage } from '@/pages/Admin/ContentPage';
import { AdminProjectsPage } from '@/pages/Admin/ProjectsPage';
import { AdminMessagesPage } from '@/pages/Admin/MessagesPage';
import { AdminLiveEditorPage } from '@/pages/Admin/LiveEditorPage';
import ScrollToTop from './components/ui/ScrollToTop';

const StatsPage = lazy(() => import('@/pages/StatsPage/index').then(m => ({ default: m.StatsPage })));
const AllProjectsPage = lazy(() => import('@/pages/AllProjectsPage').then(m => ({ default: m.AllProjectsPage })));
const ProjectDetailPage = lazy(() => import('@/pages/ProjectDetailPage').then(m => ({ default: m.ProjectDetailPage })));
const BotChatPage = lazy(() => import('@/pages/BotChatPage').then(m => ({ default: m.BotChatPage })));

function PageFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-pulse text-gray-500 dark:text-gray-400">Cargando...</div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route path="admin/login" element={<AdminLoginPage />} />
      <Route
        path="admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="live" element={<AdminLiveEditorPage />} />
        <Route path="content" element={<AdminContentPage />} />
        <Route path="projects" element={<AdminProjectsPage />} />
        <Route path="messages" element={<AdminMessagesPage />} />
      </Route>
      <Route path="*" element={<RootLayout />}>
        <Route path="projects" element={
          <Suspense fallback={<PageFallback />}>
            <AllProjectsPage />
          </Suspense>
        } />
        <Route path="projects/:id" element={
          <Suspense fallback={<PageFallback />}>
            <ProjectDetailPage />
          </Suspense>
        } />
        <Route path="stats" element={
          <Suspense fallback={<PageFallback />}>
            <StatsPage />
          </Suspense>
        } />
        <Route path="chatbot" element={
          <Suspense fallback={<PageFallback />}>
            <BotChatPage />
          </Suspense>
        } />
        <Route index element={<HomePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
    </>
  );
}
