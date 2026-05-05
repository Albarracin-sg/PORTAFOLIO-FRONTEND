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
import {
  FolderKanban, ChevronLeft, ChevronRight, Edit, Star,
  ExternalLink, Github, Search, Loader2, Sparkles,
} from 'lucide-react';
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
    () => projects.find((p) => p.id === selectedProjectId) ?? null,
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

  useEffect(() => { load(); }, [token]);

  useEffect(() => {
    if (!selectedProject) return;
    const technologies = selectedProject.technologies
      ? Array.isArray(selectedProject.technologies)
        ? selectedProject.technologies.map((i: any) => i.technology?.name || i.name || '').filter(Boolean).join(', ')
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
    try { await syncGithubProjects(token); await load(); } finally { setSyncing(false); }
  };

  const handleSave = async () => {
    if (!token || !selectedProject) return;
    const technologies = form.technologies.split(',').map((t) => t.trim()).filter(Boolean);
    try {
      await updateProject(token, selectedProject.id, {
        title: form.title,
        description: form.description,
        category: form.category,
        status: form.status,
        featured: form.featured,
        githubUrl: form.githubUrl || null,
        liveUrl: form.liveUrl || null,
        technologies,
      });
      setIsEditOpen(false);
      await load();
    } catch (err) { console.error(err); }
  };

  const filteredProjects = useMemo(() =>
    projects.filter(p =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    ), [projects, searchQuery]);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProjects.slice(start, start + itemsPerPage);
  }, [filteredProjects, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const handleEditClick = (id: string) => {
    setSelectedProjectId(id);
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── Header ── */}
      <div className="space-y-4">
        <p className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-violet-400">
          <Sparkles className="h-3 w-3" />
          Portfolio content
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <FolderKanban className="h-7 w-7 text-violet-500 shrink-0" />
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Projects
            </h1>
          </div>

          {/* Search + actions */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 w-44 rounded-2xl border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.04] text-sm focus-visible:ring-violet-500"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={syncing}
              className="h-9 rounded-2xl border-slate-200 dark:border-white/10 gap-2 text-sm font-medium transition-all duration-300 hover:scale-105 hover:border-violet-400 hover:text-violet-600 dark:hover:border-violet-500/40 dark:hover:text-violet-400"
            >
              {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Github className="h-3.5 w-3.5" />}
              Sync
            </Button>
          </div>
        </div>
      </div>

      {/* ── Project list ── */}
      <div>
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-violet-500" />
          </div>
        ) : currentItems.length === 0 ? (
          <div className="py-20 text-center text-sm text-slate-400 dark:text-slate-600 italic">
            No projects found.
          </div>
        ) : (
          <div className="space-y-1.5">
            {currentItems.map((project) => (
              <div
                key={project.id}
                className="group flex items-center justify-between px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-white/[0.07] bg-white/70 dark:bg-white/[0.025] hover:border-violet-400/30 hover:bg-white dark:hover:bg-white/[0.045] transition-all duration-200"
              >
                {/* Left */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-9 w-9 rounded-xl bg-violet-500/8 border border-violet-500/15 flex items-center justify-center text-violet-500 shrink-0 group-hover:bg-violet-600 group-hover:text-white group-hover:border-violet-600 transition-all duration-200">
                    <FolderKanban className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {project.title}
                      </span>
                      {project.featured && (
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] font-medium text-violet-500 dark:text-violet-400">
                        {project.category}
                      </span>
                      <span className="text-slate-300 dark:text-white/20 text-[11px]">/</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-600">
                        {project.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick(project.id)}
                    className="h-8 w-8 rounded-xl hover:bg-violet-600 hover:text-white transition-all duration-200"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  {project.githubUrl && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" asChild>
                      <a href={project.githubUrl} target="_blank" rel="noreferrer">
                        <Github className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                  {project.liveUrl && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" asChild>
                      <a href={project.liveUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-9 rounded-2xl px-4 gap-1.5 text-sm hover:bg-violet-500/8 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200"
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-600 tabular-nums">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-9 rounded-2xl px-4 gap-1.5 text-sm hover:bg-violet-500/8 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Edit dialog ── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl rounded-3xl border-slate-200 dark:border-white/[0.07] bg-white/90 dark:bg-gray-950/90 backdrop-blur-2xl p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="px-6 pt-6 pb-5 border-b border-slate-200 dark:border-white/[0.07]">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2.5 text-slate-900 dark:text-white">
              <div className="h-8 w-8 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                <Edit className="h-4 w-4" />
              </div>
              Edit Project
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title">
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-xl border-slate-200 dark:border-white/10 h-10 text-sm bg-white/60 dark:bg-white/[0.04] focus-visible:ring-violet-500" />
              </Field>
              <Field label="Category">
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="rounded-xl border-slate-200 dark:border-white/10 h-10 text-sm bg-white/60 dark:bg-white/[0.04]"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="web">Web Development</SelectItem>
                    <SelectItem value="fullstack">Full Stack</SelectItem>
                    <SelectItem value="devops">DevOps & Infra</SelectItem>
                    <SelectItem value="ml">Machine Learning</SelectItem>
                    <SelectItem value="data">Data Science</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Status">
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="rounded-xl border-slate-200 dark:border-white/10 h-10 text-sm bg-white/60 dark:bg-white/[0.04]"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="development">In Development</SelectItem>
                    <SelectItem value="prototype">Prototype</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Featured">
                <div className="flex items-center justify-between h-10 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.04]">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Show as featured</span>
                  <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
                </div>
              </Field>
              <Field label="GitHub URL">
                <Input value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} className="rounded-xl border-slate-200 dark:border-white/10 h-10 text-sm bg-white/60 dark:bg-white/[0.04] focus-visible:ring-violet-500" />
              </Field>
              <Field label="Live URL">
                <Input value={form.liveUrl} onChange={(e) => setForm({ ...form, liveUrl: e.target.value })} className="rounded-xl border-slate-200 dark:border-white/10 h-10 text-sm bg-white/60 dark:bg-white/[0.04] focus-visible:ring-violet-500" />
              </Field>
            </div>
            <Field label="Description">
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="rounded-2xl border-slate-200 dark:border-white/10 text-sm bg-white/60 dark:bg-white/[0.04] resize-none focus-visible:ring-violet-500" />
            </Field>
            <Field label="Tech Stack (comma separated)">
              <Input value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} className="rounded-xl border-slate-200 dark:border-white/10 h-10 text-sm bg-white/60 dark:bg-white/[0.04] focus-visible:ring-violet-500" />
            </Field>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 dark:border-white/[0.07] flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="rounded-2xl px-5 text-sm font-medium">
              Cancel
            </Button>
            <Button onClick={handleSave} className="rounded-2xl bg-violet-600 hover:bg-violet-700 px-6 text-sm font-medium shadow-lg shadow-violet-500/20 transition-all duration-300 hover:scale-105">
              Save changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1">{label}</label>
      {children}
    </div>
  );
}