import { useEffect, useMemo, useState } from 'react';
import {
  fetchProjects,
  Project,
  syncGithubProjects,
  updateProject,
} from '@/features/admin/api/projects';
import { useAdminAuth } from '@/features/admin/AdminAuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

type ProjectUpdatePayload = {
  title: string;
  description: string;
  category: string;
  status: string;
  featured: boolean;
  githubUrl: string | null;
  liveUrl: string | null;
  technologies: string[];
};

export function AdminProjectsPage() {
  const { token } = useAdminAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'web',
    status: 'production',
    featured: false,
    githubUrl: '',
    liveUrl: '',
    technologies: '',
  });

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      setLoading(true);

      try {
        const data = await fetchProjects(token);
        setProjects(data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  useEffect(() => {
    if (!selectedProject) return;

    const technologies = selectedProject.technologies
      ? Array.isArray(selectedProject.technologies)
        ? selectedProject.technologies
            .map((item: any) => item.technology?.name || item.name || '')
            .filter(Boolean)
            .join(', ')
        : String(selectedProject.technologies)
      : '';

    setForm({
      title: selectedProject.title ?? '',
      description: selectedProject.description ?? '',
      category: selectedProject.category ?? 'web',
      status: selectedProject.status ?? 'production',
      featured: selectedProject.featured ?? false,
      githubUrl: selectedProject.githubUrl ?? '',
      liveUrl: selectedProject.liveUrl ?? '',
      technologies,
    });
  }, [selectedProject]);

  const handleSync = async () => {
    if (!token) return;

    setSyncing(true);

    try {
      await syncGithubProjects(token);
      const data = await fetchProjects(token);
      setProjects(data);
    } finally {
      setSyncing(false);
    }
  };

  const handleSave = async () => {
    if (!token || !selectedProject) return;

    const technologies = form.technologies
      .split(',')
      .map((tech) => tech.trim())
      .filter(Boolean);

    const payload: ProjectUpdatePayload = {
      title: form.title,
      description: form.description,
      category: form.category,
      status: form.status,
      featured: form.featured,
      githubUrl: form.githubUrl || null,
      liveUrl: form.liveUrl || null,
      technologies,
    };

    await updateProject(token, selectedProject.id, payload);

    const data = await fetchProjects(token);
    setProjects(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900 dark:text-gray-100">Projects</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all portfolio projects.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleSync} disabled={syncing}>
            {syncing ? 'Syncing GitHub...' : 'Sync GitHub'}
          </Button>

          <Button variant="outline">Add project</Button>
        </div>
      </div>

      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">
            Projects list
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          {loading ? (
            <p className="text-gray-500">Loading projects...</p>
          ) : (
            projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className={`w-full text-left flex items-center justify-between border-b border-gray-200/60 pb-2 transition-colors ${
                  selectedProjectId === project.id
                    ? 'text-violet-600'
                    : 'text-gray-900 dark:text-gray-100'
                }`}
              >
                <div>
                  <div className="font-medium">{project.title}</div>
                  <div className="text-sm text-gray-500">
                    {project.category} · {project.status}
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  Stars: {project.stars}
                </div>
              </button>
            ))
          )}
        </CardContent>
      </Card>

      {selectedProject && (
        <Card className="border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">
              Edit project
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-gray-500">Title</label>
                <Input
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-500">Category</label>
                <Select
                  value={form.category}
                  onValueChange={(value) => setForm({ ...form, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="web">Web</SelectItem>
                    <SelectItem value="fullstack">Full Stack</SelectItem>
                    <SelectItem value="devops">DevOps</SelectItem>
                    <SelectItem value="ml">Machine Learning</SelectItem>
                    <SelectItem value="data">Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-500">Status</label>
                <Select
                  value={form.status}
                  onValueChange={(value) => setForm({ ...form, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="prototype">Prototype</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-500">Featured</label>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.featured}
                    onCheckedChange={(checked) =>
                      setForm({ ...form, featured: checked })
                    }
                  />

                  <span className="text-sm text-gray-500">
                    {form.featured ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-500">GitHub URL</label>
                <Input
                  value={form.githubUrl}
                  onChange={(event) =>
                    setForm({ ...form, githubUrl: event.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-500">Live URL</label>
                <Input
                  value={form.liveUrl}
                  onChange={(event) =>
                    setForm({ ...form, liveUrl: event.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-500">Description</label>
              <Textarea
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-500">
                Tags (comma separated)
              </label>
              <Input
                value={form.technologies}
                onChange={(event) =>
                  setForm({ ...form, technologies: event.target.value })
                }
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave}>Save changes</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}