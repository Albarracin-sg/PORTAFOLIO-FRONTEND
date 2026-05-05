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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Projects</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage all portfolio projects and sync with GitHub.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleSync} 
            disabled={syncing}
            className="rounded-2xl border-slate-200 dark:border-white/10 bg-background/50 backdrop-blur-sm h-11 px-6 hover:bg-violet-50 dark:hover:bg-violet-900/10 hover:text-violet-600 transition-all"
          >
            {syncing ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-violet-600/30 border-t-violet-600 rounded-full animate-spin" />
                Syncing...
              </span>
            ) : 'Sync GitHub'}
          </Button>

          <Button className="rounded-2xl bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-500/20 h-11 px-6 transition-all active:scale-95">
            Add project
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr,2fr]">
        <Card className="border-slate-200 dark:border-white/10 bg-background/60 backdrop-blur-md rounded-3xl overflow-hidden h-fit sticky top-24">
          <CardHeader className="border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
            <CardTitle className="text-lg font-bold">Projects List</CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <span className="h-6 w-6 border-2 border-violet-600/30 border-t-violet-600 rounded-full animate-spin inline-block" />
                <p className="text-sm text-muted-foreground mt-2">Loading projects...</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-white/10 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProjectId(project.id)}
                    className={`w-full text-left px-6 py-4 transition-all duration-200 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 flex items-center justify-between group ${
                      selectedProjectId === project.id
                        ? 'bg-violet-50 dark:bg-violet-900/20 border-l-4 border-violet-600'
                        : ''
                    }`}
                  >
                    <div className="min-w-0 pr-4">
                      <div className={`font-semibold truncate transition-colors ${selectedProjectId === project.id ? 'text-violet-600' : 'text-gray-900 dark:text-gray-100'}`}>
                        {project.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wider font-bold">
                        {project.category} · {project.status}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-xs font-medium text-muted-foreground bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                        {project.stars} ⭐
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {selectedProject ? (
            <Card className="border-slate-200 dark:border-white/10 bg-background/60 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl animate-in zoom-in-95 duration-300">
              <CardHeader className="border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold">
                  Edit: {selectedProject.title}
                </CardTitle>
                {selectedProject.featured && (
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-amber-500/10 text-amber-600 rounded-lg border border-amber-500/20">
                    Featured
                  </span>
                )}
              </CardHeader>

              <CardContent className="p-6 md:p-8 space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Title</label>
                    <Input
                      value={form.title}
                      onChange={(event) =>
                        setForm({ ...form, title: event.target.value })
                      }
                      className="rounded-2xl border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 h-11 focus:ring-violet-500"
                    />
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Category</label>
                    <Select
                      value={form.category}
                      onValueChange={(value) => setForm({ ...form, category: value })}
                    >
                      <SelectTrigger className="rounded-2xl border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 h-11">
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

                  <div className="space-y-2.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Status</label>
                    <Select
                      value={form.status}
                      onValueChange={(value) => setForm({ ...form, status: value })}
                    >
                      <SelectTrigger className="rounded-2xl border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 h-11">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="production">Production</SelectItem>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="prototype">Prototype</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Visibility</label>
                    <div className="flex items-center gap-4 h-11 px-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20">
                      <span className="text-sm font-medium">Featured Project</span>
                      <Switch
                        checked={form.featured}
                        onCheckedChange={(checked) =>
                          setForm({ ...form, featured: checked })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">GitHub URL</label>
                    <Input
                      value={form.githubUrl}
                      onChange={(event) =>
                        setForm({ ...form, githubUrl: event.target.value })
                      }
                      className="rounded-2xl border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 h-11"
                    />
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Live URL</label>
                    <Input
                      value={form.liveUrl}
                      onChange={(event) =>
                        setForm({ ...form, liveUrl: event.target.value })
                      }
                      className="rounded-2xl border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Description</label>
                  <Textarea
                    value={form.description}
                    onChange={(event) =>
                      setForm({ ...form, description: event.target.value })
                    }
                    rows={6}
                    className="rounded-3xl border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 p-4 focus:ring-violet-500 resize-none"
                  />
                </div>

                <div className="space-y-2.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                    Tags (comma separated)
                  </label>
                  <Input
                    value={form.technologies}
                    onChange={(event) =>
                      setForm({ ...form, technologies: event.target.value })
                    }
                    className="rounded-2xl border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 h-11"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={handleSave}
                    className="rounded-2xl bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-500/20 h-12 px-10 font-bold transition-all active:scale-95"
                  >
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-200 dark:border-white/10 bg-background/40 backdrop-blur-md rounded-3xl p-20 border-dashed flex flex-col items-center justify-center text-center">
              <div className="p-6 rounded-3xl bg-slate-100 dark:bg-white/5 mb-4">
                <FolderKanban className="h-12 w-12 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">No Project Selected</h3>
              <p className="text-muted-foreground max-w-xs mt-2">Select a project from the left sidebar to edit its details and visibility.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}