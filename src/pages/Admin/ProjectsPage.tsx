import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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
  FolderKanban,
  ChevronLeft,
  ChevronRight,
  Edit,
  Star,
  ExternalLink,
  Github,
  Search,
  Plus,
  Loader2,
  
  ArrowLeft,
} from 'lucide-react';
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
  const [itemsPerPage, setItemsPerPage] = useState(window.innerWidth < 640 ? 7 : 10);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth < 640 ? 7 : 10);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()),
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── Header ── */}
      <div className="mb-8 sm:mb-12">
        <Button
          variant="ghost"
          asChild
          className="group mb-2 sm:mb-6 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-slate-600 transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:border-violet-400/30 dark:hover:bg-violet-500/10 dark:hover:text-violet-200"
        >
          <Link to="/admin">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            {t("common.back")}
          </Link>
        </Button>

        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-600 dark:text-violet-400">
            {t('admin.projects.manageMasterpieces')}
          </p>
          <div className="mt-3 flex items-center justify-center gap-4">
            <FolderKanban className="h-10 w-10 text-violet-500 shrink-0 hidden sm:block" />
            <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
              {t('admin.projects.title')}
            </h1>
          </div>

          {/* Search + actions */}
          <div className="mt-8 flex items-center justify-center gap-2 w-full">
            <div className="flex items-center gap-2 px-3 h-9 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.04]">
              <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <Input
                placeholder={t('admin.projects.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-auto w-24 sm:w-36 border-none bg-transparent text-xs p-0 focus-visible:ring-0 text-slate-600 dark:text-slate-400"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={syncing}
              className="h-9 rounded-2xl px-3 sm:px-4 gap-2 text-sm border-slate-200 dark:border-white/10 hover:border-violet-300 hover:bg-violet-50 dark:hover:border-violet-500/30 dark:hover:bg-violet-900/10 transition-all duration-300 hover:scale-105"
            >
              {syncing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Github className="h-3.5 w-3.5" />
              )}
              <span className="font-medium hidden sm:inline">{t('admin.projects.sync')}</span>
            </Button>

            <Button
              size="sm"
              className="h-9 rounded-2xl px-3 sm:px-4 gap-2 text-sm bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-500/20 transition-all duration-300 hover:scale-105"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="font-medium hidden sm:inline">{t('admin.projects.new')}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ── Projects list ── */}
      <div>
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-violet-500" />
          </div>
        ) : currentItems.length === 0 ? (
          <div className="py-20 text-center text-sm text-slate-400 dark:text-slate-600 italic">
            {t('admin.projects.noResults')}
          </div>
        ) : (
          <div className="space-y-1.5">
            {currentItems.map((project) => (
              <div
                key={project.id}
                className="group rounded-2xl border border-slate-200 dark:border-white/[0.07] bg-white/70 dark:bg-white/[0.025] hover:border-violet-400/20 hover:bg-white dark:hover:bg-white/[0.04] transition-all duration-200 overflow-hidden"
              >
                <div className="px-5 py-3.5 flex items-center justify-between gap-4">
                  {/* Left: icon + info */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-9 w-9 rounded-xl bg-violet-500/8 border border-violet-500/15 flex items-center justify-center text-violet-500 shrink-0 group-hover:bg-violet-600 group-hover:text-white group-hover:border-transparent transition-all duration-200">
                      <FolderKanban className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {project.title}
                        </p>
                        {project.featured && (
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-600 truncate">
                        {project.category}
                        <span className="mx-1 opacity-40">/</span>
                        {project.status}
                      </p>
                    </div>
                  </div>

                  {/* Right: actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(project.id)}
                      className="h-8 w-8 rounded-xl hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    {project.githubUrl && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all duration-200" asChild>
                        <a href={project.githubUrl} target="_blank" rel="noreferrer">
                          <Github className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    )}
                    {project.liveUrl && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all duration-200" asChild>
                        <a href={project.liveUrl} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 sm:gap-4 pt-4 sm:pt-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 sm:h-9 sm:w-auto rounded-xl sm:rounded-2xl p-0 sm:px-4 gap-1.5 text-sm hover:bg-violet-500/8 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('admin.projects.pagination.prev')}</span>
                </Button>
                <span className="text-[10px] sm:text-xs font-medium text-slate-400 dark:text-slate-600 tabular-nums bg-slate-100/50 dark:bg-white/5 px-2 py-1 rounded-lg">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 sm:h-9 sm:w-auto rounded-xl sm:rounded-2xl p-0 sm:px-4 gap-1.5 text-sm hover:bg-violet-500/8 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200"
                >
                  <span className="hidden sm:inline">{t('admin.projects.pagination.next')}</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Edit Dialog ── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl rounded-[2rem] border-slate-200 dark:border-white/10 bg-background/80 backdrop-blur-2xl p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="p-6 border-b border-slate-200 dark:border-white/5 bg-slate-50/30 dark:bg-white/5">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-violet-600/10 text-violet-600">
                <Edit className="h-4 w-4" />
              </div>
              {t('admin.projects.modal.title')}
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground ml-1">
                  {t('admin.projects.modal.fields.title')}
                </label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="rounded-xl border-slate-200 dark:border-white/10 h-10 text-sm bg-background/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground ml-1">
                  {t('admin.projects.modal.fields.category')}
                </label>
                <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
                  <SelectTrigger className="rounded-xl border-slate-200 dark:border-white/10 h-10 text-sm bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="web">{t('admin.projects.modal.categories.web')}</SelectItem>
                    <SelectItem value="fullstack">{t('admin.projects.modal.categories.fullstack')}</SelectItem>
                    <SelectItem value="devops">{t('admin.projects.modal.categories.devops')}</SelectItem>
                    <SelectItem value="ml">{t('admin.projects.modal.categories.ml')}</SelectItem>
                    <SelectItem value="data">{t('admin.projects.modal.categories.data')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground ml-1">
                  {t('admin.projects.modal.fields.status')}
                </label>
                <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                  <SelectTrigger className="rounded-xl border-slate-200 dark:border-white/10 h-10 text-sm bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="production">{t('admin.projects.modal.status.production')}</SelectItem>
                    <SelectItem value="development">{t('admin.projects.modal.status.development')}</SelectItem>
                    <SelectItem value="prototype">{t('admin.projects.modal.status.prototype')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground ml-1">
                  {t('admin.projects.modal.fields.visibility')}
                </label>
                <div className="flex items-center justify-between h-10 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white/40 dark:bg-black/20">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {t('admin.projects.modal.fields.featured')}
                  </span>
                  <Switch
                    checked={form.featured}
                    onCheckedChange={(checked) => setForm({ ...form, featured: checked })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground ml-1">
                  {t('admin.projects.modal.fields.github')}
                </label>
                <Input
                  value={form.githubUrl}
                  onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                  className="rounded-xl border-slate-200 dark:border-white/10 h-10 text-sm bg-background/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground ml-1">
                  {t('admin.projects.modal.fields.live')}
                </label>
                <Input
                  value={form.liveUrl}
                  onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
                  className="rounded-xl border-slate-200 dark:border-white/10 h-10 text-sm bg-background/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground ml-1">
                {t('admin.projects.modal.fields.description')}
              </label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="rounded-2xl border-slate-200 dark:border-white/10 p-4 resize-none text-sm bg-background/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground ml-1">
                {t('admin.projects.modal.fields.techStack')}
              </label>
              <Input
                value={form.technologies}
                onChange={(e) => setForm({ ...form, technologies: e.target.value })}
                className="rounded-xl border-slate-200 dark:border-white/10 h-10 text-sm bg-background/50"
              />
            </div>
          </div>

          <div className="p-6 border-t border-slate-200 dark:border-white/5 flex justify-end gap-3 bg-slate-50/30 dark:bg-white/5">
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              className="rounded-2xl px-5 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all duration-200"
            >
              {t('admin.projects.modal.actions.cancel')}
            </Button>
            <Button
              onClick={handleSave}
              className="rounded-2xl bg-violet-600 hover:bg-violet-700 px-6 shadow-lg shadow-violet-500/20 transition-all duration-200 hover:scale-105"
            >
              {t('admin.projects.modal.actions.save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}