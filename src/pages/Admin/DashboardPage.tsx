import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, FolderKanban, MessageSquare, ArrowRight } from 'lucide-react';

const dashboardItems = [
  { 
    title: 'Projects', 
    description: 'Update your portfolio projects and details.', 
    href: '/admin/projects',
    icon: FolderKanban,
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10'
  },
  { 
    title: 'Messages', 
    description: 'View and manage contact form submissions.', 
    href: '/admin/messages',
    icon: MessageSquare,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10'
  },
];

export function AdminDashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8 text-violet-600" />
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
          Centralized control for your portfolio content.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {dashboardItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.title} to={item.href} className="group">
              <Card className="h-full border-slate-200 dark:border-white/10 bg-background/60 backdrop-blur-md hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300 rounded-3xl overflow-hidden group-hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className={`p-3 rounded-2xl ${item.bgColor} ${item.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </CardHeader>
                <CardContent className="pt-4">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {item.title}
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Summary Card */}
      <Card className="border-slate-200 dark:border-white/10 bg-violet-600/5 backdrop-blur-md rounded-3xl p-8 border-dashed">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Welcome back, Admin</h3>
            <p className="text-muted-foreground">Everything looks great today. You have new messages waiting for review.</p>
          </div>
          <Button asChild className="rounded-2xl bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-500/20 px-8 h-12">
            <Link to="/admin/messages">View Messages</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
