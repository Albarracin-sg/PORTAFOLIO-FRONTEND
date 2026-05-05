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
import { FolderKanban, ChevronLeft, ChevronRight, Edit, Star, ExternalLink, Github, Search, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await fetchProjects(token);
      setProjects(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
      await load();
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

    try {
      await updateProject(token, selectedProject.id, payload);
      setIsEditOpen(false);
      await load();
    } catch (err) {
      console.error('Error updating project:', err);
    }
  };

  // Filtering & Search
  const filteredProjects = useMemo(() => {
    return projects.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProjects.slice(start, start + itemsPerPage);
  }, [filteredProjects, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleEditClick = (id: string) => {
    setSelectedProjectId(id);
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <FolderKanban className="h-8 w-8 text-violet-600" />
            Projects
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your portfolio work and sync with GitHub.
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
            <Plus className="h-4 w-4 mr-2" /> Add project
          </Button>
        </div>
      </div>

      {/* Search & Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-3 border-slate-200 dark:border-white/10 bg-background/60 backdrop-blur-md rounded-3xl">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search projects by title or category..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 rounded-2xl border-none bg-transparent h-12 focus-visible:ring-0"
              />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-white/10 bg-background/60 backdrop-blur-md rounded-3xl p-4 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-violet-600">{projects.length}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Projects</div>
          </div>
        </Card>
      </div>

      {/* Projects Grid/Table */}
      <div className="grid gap-4">
        {loading ? (
          <div className="p-20 text-center">
            <span className="h-8 w-8 border-2 border-violet-600/30 border-t-violet-600 rounded-full animate-spin inline-block" />
            <p className="text-muted-foreground mt-4 font-medium">Loading projects...</p>
          </div>
        ) : currentItems.length === 0 ? (
          <Card className="border-slate-200 dark:border-white/10 bg-background/40 backdrop-blur-md rounded-3xl p-20 border-dashed flex flex-col items-center justify-center text-center">
            <div className="p-6 rounded-3xl bg-slate-100 dark:bg-white/5 mb-4">
              <FolderKanban className="h-12 w-12 text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">No projects found</h3>
            <p className="text-muted-foreground max-w-xs mt-2">Try syncing with GitHub or adding a new project.</p>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
              {currentItems.map((project) => (
                <Card key={project.id} className="border-slate-200 dark:border-white/10 bg-background/60 backdrop-blur-md rounded-3xl overflow-hidden hover:border-violet-500/30 transition-all duration-300 group">
                  <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-6 min-w-0">
                      <div className="h-16 w-16 rounded-2xl bg-violet-600/10 flex items-center justify-center text-violet-600 flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                        <FolderKanban className="h-8 w-8" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 truncate">{project.title}</h3>
                          {project.featured && (
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded-lg border border-amber-500/20">
                              <Star className="h-3 w-3 fill-amber-600" /> Featured
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="font-medium text-violet-600/80 uppercase tracking-tighter text-xs">{project.category}</span>
                          <span className="opacity-30">|</span>
                          <span>{project.status}</span>
                          <span className="opacity-30">|</span>
                          <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5" /> {project.stars} stars</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 lg:self-center">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditClick(project.id)}
                        className="rounded-xl h-10 w-10 hover:bg-violet-600 hover:text-white transition-all"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {project.githubUrl && (
                        <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10" asChild>
                          <a href={project.githubUrl} target="_blank" rel="noreferrer"><Github className="h-4 w-4" /></a>
                        </Button>
                      )}
                      {project.liveUrl && (
                        <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10" asChild>
                          <a href={project.liveUrl} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl border-slate-200 dark:border-white/10 h-10 w-10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="text-sm font-bold tracking-widest uppercase">
                  Page <span className="text-violet-600">{currentPage}</span> of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-xl border-slate-200 dark:border-white/10 h-10 w-10"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl rounded-3xl border-slate-200 dark:border-white/10 bg-background/95 backdrop-blur-xl p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="p-6 md:p-8 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <Edit className="h-6 w-6 text-violet-600" />
              Edit Project
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Title</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="rounded-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Category</label>
                <Select
                  value={form.category}
                  onValueChange={(value) => setForm({ ...form, category: value })}
                >
                  <SelectTrigger className="rounded-2xl border-slate-200 dark:border-white/10 h-11">
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
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Status</label>
                <Select
                  value={form.status}
                  onValueChange={(value) => setForm({ ...form, status: value })}
                >
                  <SelectTrigger className="rounded-2xl border-slate-200 dark:border-white/10 h-11">
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
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Visibility</label>
                <div className="flex items-center justify-between h-11 px-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20">
                  <span className="text-sm font-medium">Featured Project</span>
                  <Switch
                    checked={form.featured}
                    onCheckedChange={(checked) => setForm({ ...form, featured: checked })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">GitHub URL</label>
                <Input
                  value={form.githubUrl}
                  onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                  className="rounded-2xl border-slate-200 dark:border-white/10 h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Live URL</label>
                <Input
                  value={form.liveUrl}
                  onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
                  className="rounded-2xl border-slate-200 dark:border-white/10 h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Description</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="rounded-3xl border-slate-200 dark:border-white/10 p-4 resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Tags (comma separated)</label>
              <Input
                value={form.technologies}
                onChange={(e) => setForm({ ...form, technologies: e.target.value })}
                className="rounded-2xl border-slate-200 dark:border-white/10 h-11"
              />
            </div>
          </div>

          <div className="p-6 md:p-8 border-t border-slate-200 dark:border-white/10 flex justify-end gap-3 bg-slate-50/50 dark:bg-white/5">
            <Button variant="outline" onClick={() => setIsEditOpen(false)} className="rounded-2xl px-6">Cancel</Button>
            <Button onClick={handleSave} className="rounded-2xl bg-violet-600 hover:bg-violet-700 px-8">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
