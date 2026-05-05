import { useEffect, useMemo, useState } from 'react';
import {
  fetchProjects,
  Project,
  syncGithubProjects,
  updateProject,
} from '@/features/admin/api/projects';
import { useAdminAuth } from '@/features/admin/AdminAuthProvider';
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
import { FolderKanban, ChevronLeft, ChevronRight, Edit, Star, ExternalLink, Github, Search, Plus, Loader2 } from 'lucide-react';
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

  const filteredProjects = useMemo(() => {
    return projects.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-6xl mx-auto px-4">
      {/* Header Section — Direct on background */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-[10px] font-bold uppercase tracking-widest mb-2">
            <FolderKanban className="h-3 w-3" />
            Management
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Portfolio Projects
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            Curate and manage your best work. Sync seamlessly with GitHub.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-violet-500 transition-colors" />
            <Input 
              placeholder="Search work..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 w-64 rounded-2xl border-slate-200 dark:border-white/10 bg-background/50 backdrop-blur-md focus:ring-violet-500 transition-all shadow-sm"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={handleSync} 
            disabled={syncing}
            className="h-12 rounded-2xl px-6 border-slate-200 dark:border-white/10 bg-background/30 backdrop-blur-sm hover:bg-violet-50 dark:hover:bg-violet-900/10"
          >
            {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Github className="h-4 w-4" />}
          </Button>
          <Button className="h-12 rounded-2xl px-6 bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-500/20">
            <Plus className="h-4 w-4 mr-2" /> New Project
          </Button>
        </div>
      </div>

      {/* Projects List — Floating items, no big container, no lines */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-violet-600 mx-auto" />
            <p className="text-muted-foreground mt-4 font-medium italic">Collecting your masterpieces...</p>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="py-20 text-center opacity-50">
            <p className="text-xl font-medium italic">No projects match your search.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-3">
              {currentItems.map((project) => (
                <div 
                  key={project.id} 
                  className="group relative flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-[2rem] border border-transparent hover:border-violet-500/20 bg-background/20 hover:bg-background/40 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:shadow-violet-500/5"
                >
                  <div className="flex items-center gap-6 min-w-0">
                    <div className="h-14 w-14 rounded-2xl bg-violet-600/5 border border-violet-500/10 flex items-center justify-center text-violet-600 flex-shrink-0 group-hover:scale-110 transition-transform duration-500 group-hover:bg-violet-600 group-hover:text-white">
                      <FolderKanban className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 truncate group-hover:text-violet-600 transition-colors">
                          {project.title}
                        </h3>
                        {project.featured && (
                          <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded-full border border-amber-500/20">
                            <Star className="h-2.5 w-3 fill-amber-600" /> Featured
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-muted-foreground uppercase tracking-widest">
                        <span className="text-violet-600/80">{project.category}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/20" />
                        <span>{project.status}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/20" />
                        <span className="flex items-center gap-1.5"><Star className="h-3 w-3" /> {project.stars}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0 md:opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEditClick(project.id)}
                      className="rounded-xl h-10 w-10 hover:bg-violet-600 hover:text-white shadow-none"
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
              ))}
            </div>

            {/* Aesthetic Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-8 pt-10">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-2xl h-11 px-6 gap-2 text-xs font-bold uppercase tracking-[0.2em] hover:bg-violet-500/10 hover:text-violet-600"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <div className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40">
                  {currentPage} <span className="mx-2">/</span> {totalPages}
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-2xl h-11 px-6 gap-2 text-xs font-bold uppercase tracking-[0.2em] hover:bg-violet-500/10 hover:text-violet-600"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modern Dialog Editor — Glassmorphism */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] border-slate-200 dark:border-white/10 bg-background/80 backdrop-blur-2xl p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="p-8 border-b border-slate-200 dark:border-white/5 bg-slate-50/30 dark:bg-white/5">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet-600/10 text-violet-600">
                <Edit className="h-6 w-6" />
              </div>
              Edit Project Details
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Title</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-2xl border-slate-200 dark:border-white/10 h-12 text-sm bg-background/50 focus:ring-violet-500" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Category</label>
                <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
                  <SelectTrigger className="rounded-2xl border-slate-200 dark:border-white/10 h-12 text-sm bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="web">Web Development</SelectItem>
                    <SelectItem value="fullstack">Full Stack</SelectItem>
                    <SelectItem value="devops">DevOps & Infra</SelectItem>
                    <SelectItem value="ml">Machine Learning</SelectItem>
                    <SelectItem value="data">Data Science</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Status</label>
                <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                  <SelectTrigger className="rounded-2xl border-slate-200 dark:border-white/10 h-12 text-sm bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="production">Production Ready</SelectItem>
                    <SelectItem value="development">In Development</SelectItem>
                    <SelectItem value="prototype">Prototype / MVP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Visibility</label>
                <div className="flex items-center justify-between h-12 px-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/40 dark:bg-black/20">
                  <span className="text-xs font-bold uppercase tracking-widest opacity-70">Featured Project</span>
                  <Switch checked={form.featured} onCheckedChange={(checked) => setForm({ ...form, featured: checked })} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">GitHub Repository</label>
                <Input value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} className="rounded-2xl border-slate-200 dark:border-white/10 h-12 text-sm bg-background/50" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Live Demo URL</label>
                <Input value={form.liveUrl} onChange={(e) => setForm({ ...form, liveUrl: e.target.value })} className="rounded-2xl border-slate-200 dark:border-white/10 h-12 text-sm bg-background/50" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Description</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} className="rounded-[2rem] border-slate-200 dark:border-white/10 p-5 resize-none text-sm bg-background/50 focus:ring-violet-500" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Tech Stack (comma separated)</label>
              <Input value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} className="rounded-2xl border-slate-200 dark:border-white/10 h-12 text-sm bg-background/50" />
            </div>
          </div>

          <div className="p-8 border-t border-slate-200 dark:border-white/5 flex justify-end gap-4 bg-slate-50/30 dark:bg-white/5">
            <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="rounded-2xl px-6 font-bold uppercase tracking-widest text-xs">Cancel</Button>
            <Button onClick={handleSave} className="rounded-2xl bg-violet-600 hover:bg-violet-700 px-10 font-bold uppercase tracking-widest text-xs shadow-lg shadow-violet-500/20">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
