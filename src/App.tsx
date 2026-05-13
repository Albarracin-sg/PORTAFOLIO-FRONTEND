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
import ScrollToTop from './components/ui/ScrollToTop';
import { Toaster } from '@/components/ui/sonner';

const StatsPage = lazy(() => import('./pages/StatsPage/index').then(m => ({ default: m.StatsPage })));
const AllProjectsPage = lazy(() => import('./pages/AllProjectsPage/index').then(m => ({ default: m.AllProjectsPage })));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage/index').then(m => ({ default: m.ProjectDetailPage })));
const BotChatPage = lazy(() => import('./pages/BotChatPage/index').then(m => ({ default: m.BotChatPage })));
const AdminLogsPage = lazy(() => import('./pages/Admin/AdminLogsPage'));
const BotMessagesPage = lazy(() => import('./pages/Admin/BotMessagesPage'));
const AdminProjectsPage = lazy(() => import('./pages/Admin/ProjectsPage').then(m => ({ default: m.AdminProjectsPage })));
const AdminMessagesPage = lazy(() => import('./pages/Admin/MessagesPage').then(m => ({ default: m.AdminMessagesPage })));
const AdminProjectEditPage = lazy(() => import('./pages/Admin/ProjectEditPage').then(m => ({ default: m.AdminProjectEditPage })));

function PageFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-pulse text-zinc-500 dark:text-zinc-400">Cargando…</div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Toaster position="top-center" richColors />
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
        <Route path="projects" element={
          <Suspense fallback={<PageFallback />}>
            <AdminProjectsPage />
          </Suspense>
        } />
        <Route path="projects/:id" element={
          <Suspense fallback={<PageFallback />}>
            <AdminProjectEditPage />
          </Suspense>
        } />
        <Route path="messages" element={
          <Suspense fallback={<PageFallback />}>
            <AdminMessagesPage />
          </Suspense>
        } />
        <Route path="logs" element={
          <Suspense fallback={<PageFallback />}>
            <AdminLogsPage />
          </Suspense>
        } />
        <Route path="bot-messages" element={
          <Suspense fallback={<PageFallback />}>
            <BotMessagesPage />
          </Suspense>
        } />
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
