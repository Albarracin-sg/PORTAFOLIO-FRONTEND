import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const dashboardItems = [
  { title: 'Content', description: 'Pages, sections, hero, about', href: '/admin/content' },
  { title: 'Projects', description: 'Projects list and details', href: '/admin/projects' },
  { title: 'Messages', description: 'Contact form messages', href: '/admin/messages' },
];

export function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage what the public site shows.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {dashboardItems.map((item) => (
          <Link key={item.title} to={item.href}>
            <Card className="border-gray-200 dark:border-gray-700 hover:border-violet-500/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
