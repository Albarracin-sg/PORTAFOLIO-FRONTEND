import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  ArrowRight,
  Activity,
  Bot,
  Newspaper,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/features/admin/AdminAuthProvider';
import { fetchAdminStats, type AdminStats } from '@/shared/api/stats';

interface DashboardItem {
  title: string;
  description: string;
  isKey: boolean;
  href: string;
  icon: any;
  accent: 'violet' | 'emerald' | 'blue' | 'orange' | 'purple';
}

const dashboardItems: DashboardItem[] = [
  {
    title: 'admin.dashboard.projects',
    description: 'admin.dashboard.projectsDesc',
    isKey: true,
    href: '/admin/projects',
    icon: FolderKanban,
    accent: 'violet',
  },
  {
    title: 'admin.dashboard.messages',
    description: 'admin.dashboard.messagesDesc',
    isKey: true,
    href: '/admin/messages',
    icon: MessageSquare,
    accent: 'emerald',
  },
  {
    title: 'Bot Messages',
    description: 'View and manage bot conversations',
    isKey: false,
    href: '/admin/bot-messages',
    icon: Bot,
    accent: 'blue',
  },
  {
    title: 'Blog',
    description: 'Manage blog articles and content',
    isKey: false,
    href: '/admin/blog',
    icon: Newspaper,
    accent: 'purple',
  },
  {
    title: 'Server Logs',
    description: 'Real-time server performance and logs',
    isKey: false,
    href: '/admin/logs',
    icon: Activity,
    accent: 'orange',
  },
];

const accentMap = {
  violet: {
    icon: 'bg-violet-500/10 text-violet-500 dark:text-violet-400',
    border: 'hover:border-violet-400/30',
    arrow: 'group-hover:text-violet-500',
    badge: 'bg-violet-500/8 border-violet-400/25 text-violet-400',
  },
  emerald: {
    icon: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400',
    border: 'hover:border-emerald-400/30',
    arrow: 'group-hover:text-emerald-500',
    badge: 'bg-emerald-500/8 border-emerald-400/25 text-emerald-400',
  },
  blue: {
    icon: 'bg-blue-500/10 text-blue-500 dark:text-blue-400',
    border: 'hover:border-blue-400/30',
    arrow: 'group-hover:text-blue-500',
    badge: 'bg-blue-500/8 border-blue-400/25 text-blue-400',
  },
  orange: {
    icon: 'bg-orange-500/10 text-orange-500 dark:text-orange-400',
    border: 'hover:border-orange-400/30',
    arrow: 'group-hover:text-orange-500',
    badge: 'bg-orange-500/8 border-orange-400/25 text-orange-400',
  },
  purple: {
    icon: 'bg-purple-500/10 text-purple-500 dark:text-purple-400',
    border: 'hover:border-purple-400/30',
    arrow: 'group-hover:text-purple-500',
    badge: 'bg-purple-500/8 border-purple-400/25 text-purple-400',
  },
};

export function AdminDashboardPage() {
  const { t } = useTranslation();
  const { token } = useAdminAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!token) return;
      try {
        const data = await fetchAdminStats(token);
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [token]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── Header ── */}
      <div className="mb-8 sm:mb-12">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-600 dark:text-violet-400">
            Control panel
          </p>
          <div className="mt-3 flex items-center justify-center gap-4">
            <LayoutDashboard className="size-10 text-violet-500 shrink-0 hidden sm:block" />
            <h1 className="text-5xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-6xl">
              {t('admin.dashboard.title')}
            </h1>
          </div>
          <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-400 sm:text-base">
            {t('admin.dashboard.subtitle')}
          </p>
        </div>
      </div>

      {/* ── Quick stats row ── */}
      <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
        {[
          { label: t('admin.dashboard.projects'), value: loading ? '…' : String(stats?.totalProjects ?? '0') },
          { label: t('admin.dashboard.messages'), value: loading ? '…' : String(stats?.totalContactMessages ?? '0') },
          { label: 'Uptime', value: loading ? '…' : stats?.uptime ?? '—' },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-2xl border border-zinc-200 dark:border-white/[0.07] bg-white/70 dark:bg-white/[0.025] px-4 py-3 text-center"
          >
            <div className="text-xl font-semibold text-violet-600 dark:text-violet-400">{value}</div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-600 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Navigation cards ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        {dashboardItems.map((item) => {
          const Icon = item.icon;
          const a = accentMap[item.accent];
          return (
            <Link key={item.href} to={item.href} className="group">
              <div
                className={`relative h-full rounded-2xl border border-zinc-200 dark:border-white/[0.07] bg-white/80 dark:bg-white/[0.025] p-6 transition-all duration-300 ${a.border} hover:bg-white dark:hover:bg-white/[0.045] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/5`}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className={`flex items-center justify-center size-11 rounded-2xl ${a.icon}`}>
                    <Icon className="size-5" />
                  </div>
                  <ArrowRight
                    className={`size-4 text-white dark:text-zinc-600 transition-all duration-300 -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 ${a.arrow}`}
                  />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1.5">
                  {item.isKey ? t(item.title) : item.title}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {item.isKey ? t(item.description) : item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Welcome banner ── */}
      <div className="rounded-2xl border border-dashed border-violet-300/40 dark:border-violet-500/20 bg-violet-500/[0.04] dark:bg-violet-500/[0.06] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {t('admin.dashboard.welcome')}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {t('admin.dashboard.summary')}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              asChild
              variant="outline"
              className="shrink-0 rounded-2xl px-6 h-10 text-sm font-medium"
            >
              <Link to="/admin/logs">
                <Activity className="size-4 mr-2" />
                System Logs
              </Link>
            </Button>
            <Button
              asChild
              className="shrink-0 rounded-2xl bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-500/20 px-6 h-10 text-sm font-medium"
            >
              <Link to="/admin/messages">
                <MessageSquare className="size-4 mr-2" />
                {t('admin.dashboard.viewMessages')}
              </Link>
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}
