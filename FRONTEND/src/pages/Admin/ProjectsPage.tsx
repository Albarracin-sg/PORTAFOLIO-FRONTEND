import { useEffect, useState } from 'react';
import { fetchProjects, Project } from '@/features/admin/api/projects';
import { useAdminAuth } from '@/features/admin/AdminAuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function AdminProjectsPage() {
  const { token } = useAdminAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      setLoading(true);
      const data = await fetchProjects(token);
      setProjects(data);
      setLoading(false);
    };

    load();
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900 dark:text-gray-100">Projects</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage all portfolio projects.</p>
        </div>
        <Button variant="outline">Add project</Button>
      </div>

      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Projects list</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <p className="text-gray-500">Loading projects...</p>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{project.title}</div>
                  <div className="text-sm text-gray-500">{project.category} · {project.status}</div>
                </div>
                <div className="text-sm text-gray-500">Stars: {project.stars}</div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
