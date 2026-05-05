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
import { useTranslation } from 'react-i18next';

export function AdminProjectsPage() {
  const { t } = useTranslation();
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
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700 max-w-6xl mx-auto px-4">
      {/* Super Compact Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-violet-600/10 flex items-center justify-center text-violet-600">
            <FolderKanban className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100 leading-none">
              {t('admin.projects.title')}
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mt-1">
              {t('admin.projects.manageMasterpieces')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-background/40 backdrop-blur-md p-1 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input 
              placeholder={t('admin.projects.searchPlaceholder')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 w-40 rounded-lg border-none bg-transparent text-xs focus-visible:ring-0"
            />
          </div>
          <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-1" />
          <Button variant="ghost" size="sm" onClick={handleSync} disabled={syncing} className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest px-2 gap-2">
            {syncing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Github className="h-3 w-3" />} {t('admin.projects.sync')}
          </Button>
          <Button size="sm" className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest px-3 bg-violet-600 hover:bg-violet-700">
            <Plus className="h-3 w-3 mr-1" /> {t('admin.projects.new')}
          </Button>
        </div>
      </div>

      {/* Projects List — Minimalist Rows */}
      <div className="space-y-1">
        {loading ? (
          <div className="py-12 text-center"><Loader2 className="h-8 w-8 animate-spin text-violet-600 mx-auto" /></div>
        ) : currentItems.length === 0 ? (
          <div className="py-12 text-center opacity-50 italic text-sm">{t('admin.projects.noResults')}</div>
        ) : (
          <>
            <div className="grid gap-1">
              {currentItems.map((project) => (
                <div 
                  key={project.id} 
                  className="group flex items-center justify-between py-2 px-4 rounded-xl border border-transparent hover:border-violet-500/10 bg-background/10 hover:bg-background/40 backdrop-blur-sm transition-all duration-300"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-violet-600/5 border border-violet-500/10 flex items-center justify-center text-violet-600 flex-shrink-0 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                      <FolderKanban className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">{project.title}</span>
                        {project.featured && <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />}
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-muted-foreground/60">
                        <span className="text-violet-600/80">{project.category}</span>
                        <span className="opacity-30">/</span>
                        <span>{project.status}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(project.id)} className="h-7 w-7 rounded-md hover:bg-violet-600 hover:text-white">
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    {project.githubUrl && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" asChild>
                        <a href={project.githubUrl} target="_blank" rel="noreferrer"><Github className="h-3.5 w-3.5" /></a>
                      </Button>
                    )}
                    {project.liveUrl && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" asChild>
                        <a href={project.liveUrl} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /></a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Compact Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <Button variant="ghost" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 rounded-lg px-2 text-[9px] font-black uppercase tracking-widest hover:bg-violet-500/10 hover:text-violet-600">
                  <ChevronLeft className="h-3 w-3 mr-1" /> {t('admin.projects.pagination.prev')}
                </Button>
                <div className="text-[9px] font-black tracking-widest uppercase opacity-40">{currentPage} / {totalPages}</div>
                <Button variant="ghost" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 rounded-lg px-2 text-[9px] font-black uppercase tracking-widest hover:bg-violet-500/10 hover:text-violet-600">
                  {t('admin.projects.pagination.next')} <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl rounded-[2rem] border-slate-200 dark:border-white/10 bg-background/80 backdrop-blur-2xl p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="p-6 border-b border-slate-200 dark:border-white/5 bg-slate-50/30 dark:bg-white/5">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-violet-600/10 text-violet-600"><Edit className="h-4 w-4" /></div>
              {t('admin.projects.modal.title')}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1"><label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t('admin.projects.modal.fields.title')}</label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-xl border-slate-200 dark:border-white/10 h-10 text-xs bg-background/50 focus:ring-violet-500" /></div>
              <div className="space-y-1"><label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t('admin.projects.modal.fields.category')}</label><Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}><SelectTrigger className="rounded-xl border-slate-200 dark:border-white/10 h-10 text-xs bg-background/50"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl">
                <SelectItem value="web">{t('admin.projects.modal.categories.web')}</SelectItem>
                <SelectItem value="fullstack">{t('admin.projects.modal.categories.fullstack')}</SelectItem>
                <SelectItem value="devops">{t('admin.projects.modal.categories.devops')}</SelectItem>
                <SelectItem value="ml">{t('admin.projects.modal.categories.ml')}</SelectItem>
                <SelectItem value="data">{t('admin.projects.modal.categories.data')}</SelectItem>
              </SelectContent></Select></div>
              <div className="space-y-1"><label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t('admin.projects.modal.fields.status')}</label><Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}><SelectTrigger className="rounded-xl border-slate-200 dark:border-white/10 h-10 text-xs bg-background/50"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl">
                <SelectItem value="production">{t('admin.projects.modal.status.production')}</SelectItem>
                <SelectItem value="development">{t('admin.projects.modal.status.development')}</SelectItem>
                <SelectItem value="prototype">{t('admin.projects.modal.status.prototype')}</SelectItem>
              </SelectContent></Select></div>
              <div className="space-y-1"><label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t('admin.projects.modal.fields.visibility')}</label><div className="flex items-center justify-between h-10 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white/40 dark:bg-black/20"><span className="text-[10px] font-bold uppercase tracking-widest opacity-70">{t('admin.projects.modal.fields.featured')}</span><Switch checked={form.featured} onCheckedChange={(checked) => setForm({ ...form, featured: checked })} /></div></div>
              <div className="space-y-1"><label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t('admin.projects.modal.fields.github')}</label><Input value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} className="rounded-xl border-slate-200 dark:border-white/10 h-10 text-xs bg-background/50" /></div>
              <div className="space-y-1"><label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t('admin.projects.modal.fields.live')}</label><Input value={form.liveUrl} onChange={(e) => setForm({ ...form, liveUrl: e.target.value })} className="rounded-xl border-slate-200 dark:border-white/10 h-10 text-xs bg-background/50" /></div>
            </div>
            <div className="space-y-1"><label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t('admin.projects.modal.fields.description')}</label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="rounded-2xl border-slate-200 dark:border-white/10 p-4 resize-none text-xs bg-background/50 focus:ring-violet-500" /></div>
            <div className="space-y-1"><label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t('admin.projects.modal.fields.techStack')}</label><Input value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} className="rounded-xl border-slate-200 dark:border-white/10 h-10 text-xs bg-background/50" /></div>
          </div>
          <div className="p-6 border-t border-slate-200 dark:border-white/5 flex justify-end gap-3 bg-slate-50/30 dark:bg-white/5">
            <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="rounded-xl px-4 font-bold uppercase tracking-widest text-[10px]">{t('admin.projects.modal.actions.cancel')}</Button>
            <Button onClick={handleSave} className="rounded-xl bg-violet-600 hover:bg-violet-700 px-6 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-violet-500/20">{t('admin.projects.modal.actions.save')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
