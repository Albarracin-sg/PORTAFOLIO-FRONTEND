import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const dashboardItems = [
  {
    title: 'Projects',
    description: 'Update your portfolio projects, descriptions, and tech stacks.',
    href: '/admin/projects',
    icon: FolderKanban,
    accent: 'violet',
  },
  {
    title: 'Messages',
    description: 'View and manage contact form submissions from your visitors.',
    href: '/admin/messages',
    icon: MessageSquare,
    accent: 'emerald',
  },
] as const;

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
};

export function AdminDashboardPage() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── Header ── */}
      <div className="space-y-4">
        <p className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-violet-400">
          <Sparkles className="h-3 w-3" />
          Control panel
        </p>
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-7 w-7 text-violet-500 shrink-0" />
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Admin Dashboard
          </h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-base max-w-xl leading-relaxed">
          Centralized control for your portfolio content. Manage projects, review messages, and keep everything up to date.
        </p>
      </div>

      {/* ── Quick stats row ── */}
      <div className="grid grid-cols-3 gap-3 max-w-sm">
        {[
          { label: 'Projects', value: '10+' },
          { label: 'Messages', value: '—' },
          { label: 'Status', value: '✓' },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 dark:border-white/[0.07] bg-white/70 dark:bg-white/[0.025] px-4 py-3 text-center"
          >
            <div className="text-xl font-semibold text-violet-600 dark:text-violet-400">{value}</div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-600 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Navigation cards ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        {dashboardItems.map((item) => {
          const Icon = item.icon;
          const a = accentMap[item.accent];
          return (
            <Link key={item.title} to={item.href} className="group">
              <div
                className={`relative h-full rounded-2xl border border-slate-200 dark:border-white/[0.07] bg-white/80 dark:bg-white/[0.025] p-6 transition-all duration-300 ${a.border} hover:bg-white dark:hover:bg-white/[0.045] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/5`}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className={`flex items-center justify-center h-11 w-11 rounded-2xl ${a.icon}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowRight
                    className={`h-4 w-4 text-slate-300 dark:text-slate-600 transition-all duration-300 -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 ${a.arrow}`}
                  />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1.5">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {item.description}
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
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Welcome back, Admin
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Everything looks great. You may have new messages waiting for review.
            </p>
          </div>
          <Button
            asChild
            className="shrink-0 rounded-2xl bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-500/20 px-6 h-10 text-sm font-medium"
          >
            <Link to="/admin/messages">
              <MessageSquare className="h-4 w-4 mr-2" />
              View Messages
            </Link>
          </Button>
        </div>
      </div>

    </div>
  );
}