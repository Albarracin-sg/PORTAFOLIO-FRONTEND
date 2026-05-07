import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Globe, 
  Target, 
  Zap, 
  CheckCircle2, 
  Code2, 
  ExternalLink,
  Github,
  Calendar,
  Star,
  Image as ImageIcon,
  Languages,
  Eye
} from 'lucide-react';

import { useAdminAuth } from '@/features/admin/AdminAuthProvider';
import { fetchProjects, Project, updateProject } from '@/features/admin/api/projects';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

// SECCIÓN DE TRADUCCIÓN FUERA DEL COMPONENTE PRINCIPAL PARA EVITAR RE-MOUNTS
const TranslationFields = ({ 
  lang, 
  form, 
  onChange,
  t 
}: { 
  lang: 'Es' | 'En', 
  form: any, 
  onChange: (field: string, value: string) => void,
  t: any
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
          <Globe className="h-4 w-4" />
          <h4 className="text-sm font-bold uppercase tracking-widest">{t('admin.projects.edit.whatIs')}</h4>
        </div>
        <Textarea
          value={form[`description${lang}`]}
          onChange={(e) => onChange(`description${lang}`, e.target.value)}
          rows={5}
          placeholder={t('admin.projects.edit.placeholders.description')}
          className="rounded-2xl border-slate-200 dark:border-white/10 p-4 bg-white/50 dark:bg-black/20 focus:ring-violet-500/20 transition-all text-sm leading-relaxed"
        />
      </div>

      <Separator className="bg-slate-200/50 dark:bg-white/5" />

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <Target className="h-4 w-4" />
          <h4 className="text-sm font-bold uppercase tracking-widest">{t('admin.projects.edit.problem')}</h4>
        </div>
        <Textarea
          value={form[`problem${lang}`]}
          onChange={(e) => onChange(`problem${lang}`, e.target.value)}
          rows={5}
          placeholder={t('admin.projects.edit.placeholders.problem')}
          className="rounded-2xl border-slate-200 dark:border-white/10 p-4 bg-white/50 dark:bg-black/20 focus:ring-violet-500/20 transition-all text-sm leading-relaxed"
        />
      </div>

      <Separator className="bg-slate-200/50 dark:bg-white/5" />

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          <h4 className="text-sm font-bold uppercase tracking-widest">{t('admin.projects.edit.solution')}</h4>
        </div>
        <Textarea
          value={form[`solution${lang}`]}
          onChange={(e) => onChange(`solution${lang}`, e.target.value)}
          rows={5}
          placeholder={t('admin.projects.edit.placeholders.solution')}
          className="rounded-2xl border-slate-200 dark:border-white/10 p-4 bg-white/50 dark:bg-black/20 focus:ring-violet-500/20 transition-all text-sm leading-relaxed"
        />
      </div>

      <Separator className="bg-slate-200/50 dark:bg-white/5" />

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <Zap className="h-4 w-4" />
          <h4 className="text-sm font-bold uppercase tracking-widest">{t('admin.projects.edit.challenge')}</h4>
        </div>
        <Textarea
          value={form[`challenge${lang}`]}
          onChange={(e) => onChange(`challenge${lang}`, e.target.value)}
          rows={5}
          placeholder={t('admin.projects.edit.placeholders.challenge')}
          className="rounded-2xl border-slate-200 dark:border-white/10 p-4 bg-white/50 dark:bg-black/20 focus:ring-violet-500/20 transition-all text-sm leading-relaxed"
        />
      </div>
    </div>
  );
};

export function AdminProjectEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { token } = useAdminAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    descriptionEs: '',
    descriptionEn: '',
    problemEs: '',
    problemEn: '',
    challengeEs: '',
    challengeEn: '',
    solutionEs: '',
    solutionEn: '',
    category: 'web',
    status: 'production',
    featured: false,
    githubUrl: '',
    liveUrl: '',
    technologies: '',
    imageUrl: '',
    stars: 0,
    forks: 0,
    date: '',
  });

  useEffect(() => {
    const loadProject = async () => {
      if (!token || !id) return;
      setLoading(true);
      try {
        const projects = await fetchProjects(token);
        const found = projects.find((p) => p.id === id);
        
        if (!found) {
          navigate('/admin/projects');
          return;
        }

        setProject(found);
        
        const technologies = found.technologies
          ? Array.isArray(found.technologies)
            ? found.technologies
                .map((item: any) => item.technology?.name || item.name || '')
                .filter(Boolean)
                .join(', ')
            : String(found.technologies)
          : '';

        setForm({
          title: found.title ?? '',
          descriptionEs: found.description?.es ?? '',
          descriptionEn: found.description?.en ?? '',
          problemEs: found.problem?.es ?? '',
          problemEn: found.problem?.en ?? '',
          challengeEs: found.challenge?.es ?? '',
          challengeEn: found.challenge?.en ?? '',
          solutionEs: found.solution?.es ?? '',
          solutionEn: found.solution?.en ?? '',
          category: found.category ?? 'web',
          status: found.status ?? 'production',
          featured: found.featured ?? false,
          githubUrl: found.githubUrl ?? '',
          liveUrl: found.liveUrl ?? '',
          technologies,
          imageUrl: found.imageUrl ?? '',
          stars: found.stars ?? 0,
          forks: found.forks ?? 0,
          date: found.date ? new Date(found.date).toISOString().split('T')[0] : '',
        });
      } catch (err) {
        console.error('Error loading project:', err);
        navigate('/admin/projects');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [token, id, navigate]);

  const handleSave = async () => {
    if (!token || !id) return;
    
    const toastId = toast.loading(t('admin.projects.edit.saving'));
    setSaving(true);

    const technologies = form.technologies
      .split(',')
      .map((tech) => tech.trim())
      .filter(Boolean);

    try {
      await updateProject(token, id, {
        title: form.title,
        description: { es: form.descriptionEs, en: form.descriptionEn },
        problem: { es: form.problemEs, en: form.problemEn },
        challenge: { es: form.challengeEs, en: form.challengeEn },
        solution: { es: form.solutionEs, en: form.solutionEn },
        category: form.category,
        status: form.status,
        featured: form.featured,
        githubUrl: form.githubUrl || null,
        liveUrl: form.liveUrl || null,
        technologies,
        imageUrl: form.imageUrl,
        stars: Number(form.stars),
        forks: Number(form.forks),
        date: form.date ? new Date(form.date).toISOString() : undefined,
      });
      
      toast.success(t('admin.projects.edit.saveSuccess', 'Proyecto guardado correctamente'), { id: toastId });
      
      // Esperar un toque antes de navegar para que el usuario vea el éxito
      setTimeout(() => navigate('/admin/projects'), 1500);
    } catch (err) {
      console.error('Error updating project:', err);
      toast.error(t('admin.projects.edit.saveError', 'Error al guardar el proyecto'), { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-t-4 border-violet-500 animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Loader2 className="h-6 w-6 text-violet-500 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-transparent pb-20 selection:bg-violet-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* ── Top Navigation ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-2">
            <Button
              variant="ghost"
              asChild
              className="group -ml-2 rounded-full text-slate-500 hover:text-violet-600 transition-colors"
            >
              <Link to="/admin/projects">
                <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
                {t('admin.projects.edit.back')}
              </Link>
            </Button>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              {form.title || t('admin.projects.edit.title')}
            </h1>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="px-2 py-0.5 rounded-md bg-slate-200/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 uppercase tracking-tighter font-mono text-[10px]">
                ID: {id?.slice(0, 8)}...
              </span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <a 
                href={`/projects/${id}`} 
                target="_blank" 
                className="flex items-center hover:text-violet-500 transition-colors"
              >
                <Eye className="h-3 w-3 mr-1" /> {t('admin.projects.edit.viewOnSite')}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <Button
              variant="outline"
              onClick={() => navigate('/admin/projects')}
              className="rounded-2xl border-slate-200 dark:border-white/10 h-12 px-6 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            >
              {t('admin.projects.edit.cancel')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="rounded-2xl bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 px-8 h-12 shadow-xl shadow-violet-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {saving ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Save className="h-5 w-5 mr-2" />
              )}
              {saving ? t('admin.projects.edit.saving') : t('admin.projects.edit.save')}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* ── Main Content Area ── */}
          <div className="lg:col-span-8 space-y-8">
            <Tabs defaultValue="es" className="w-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                  <Languages className="h-5 w-5 text-violet-500" />
                  <h3 className="font-bold">{t('admin.projects.edit.narrativeContent')}</h3>
                </div>
                <TabsList className="bg-slate-200/50 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10">
                  <TabsTrigger value="es" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-violet-500 data-[state=active]:text-violet-600 dark:data-[state=active]:text-white transition-all">
                    Español
                  </TabsTrigger>
                  <TabsTrigger value="en" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-violet-500 data-[state=active]:text-violet-600 dark:data-[state=active]:text-white transition-all">
                    English
                  </TabsTrigger>
                </TabsList>
              </div>

              <Card className="rounded-[2.5rem] border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.02] backdrop-blur-xl shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                <CardContent className="p-8">
                  <TabsContent value="es" className="mt-0">
                    <TranslationFields lang="Es" form={form} onChange={handleFieldChange} t={t} />
                  </TabsContent>
                  <TabsContent value="en" className="mt-0">
                    <TranslationFields lang="En" form={form} onChange={handleFieldChange} t={t} />
                  </TabsContent>
                </CardContent>
              </Card>
            </Tabs>
          </div>

          {/* ── Sidebar ── */}
          <aside className="lg:col-span-4 space-y-8">
            
            {/* Metadata Card */}
            <Card className="rounded-[2rem] border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-sm sticky top-8">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  {t('admin.projects.edit.technicalDetails')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Image Preview */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">{t('admin.projects.edit.preview')}</label>
                  <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/5 relative group">
                    {form.imageUrl ? (
                      <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400 italic">
                        <ImageIcon className="h-8 w-8 mb-2 opacity-20" />
                        <span className="text-xs">{t('admin.projects.edit.noImage')}</span>
                      </div>
                    )}
                  </div>
                  <Input
                    value={form.imageUrl}
                    placeholder={t('admin.projects.edit.imageUrl')}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    className="rounded-xl border-slate-200 dark:border-white/10 h-10 text-xs bg-slate-50 dark:bg-black/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">{t('admin.projects.edit.fields.category')}</label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger className="rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-xs h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 dark:border-white/10">
                        <SelectItem value="web">{t('admin.projects.projects.modal.categories.web')}</SelectItem>
                        <SelectItem value="fullstack">{t('admin.projects.projects.modal.categories.fullstack')}</SelectItem>
                        <SelectItem value="devops">{t('admin.projects.projects.modal.categories.devops')}</SelectItem>
                        <SelectItem value="ml">{t('admin.projects.projects.modal.categories.ml')}</SelectItem>
                        <SelectItem value="data">{t('admin.projects.projects.modal.categories.data')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">{t('admin.projects.edit.fields.status')}</label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                      <SelectTrigger className="rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-xs h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 dark:border-white/10">
                        <SelectItem value="production">{t('admin.projects.projects.modal.status.production')}</SelectItem>
                        <SelectItem value="development">{t('admin.projects.projects.modal.status.development')}</SelectItem>
                        <SelectItem value="prototype">{t('admin.projects.projects.modal.status.prototype')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-violet-500/5 dark:bg-violet-500/10 border border-violet-500/10">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-bold">{t('admin.projects.edit.fields.featured')}</span>
                  </div>
                  <Switch
                    checked={form.featured}
                    onCheckedChange={(checked) => setForm({ ...form, featured: checked })}
                  />
                </div>

                <Separator className="bg-slate-200/50 dark:bg-white/5" />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">{t('admin.projects.edit.fields.github')}</label>
                    <div className="relative">
                      <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <Input
                        value={form.githubUrl}
                        onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                        className="rounded-xl border-slate-200 dark:border-white/10 pl-9 text-xs bg-slate-50 dark:bg-black/40 h-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">{t('admin.projects.edit.fields.live')}</label>
                    <div className="relative">
                      <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <Input
                        value={form.liveUrl}
                        onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
                        className="rounded-xl border-slate-200 dark:border-white/10 pl-9 text-xs bg-slate-50 dark:bg-black/40 h-10"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-200/50 dark:bg-white/5" />

                <div className="space-y-4">
                   <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                      <Calendar className="h-3 w-3" /> {t('admin.projects.edit.fields.date')}
                    </label>
                    <Input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="rounded-xl border-slate-200 dark:border-white/10 text-xs bg-slate-50 dark:bg-black/40 h-10"
                    />
                  </div>
                   <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                      <Code2 className="h-3 w-3" /> {t('admin.projects.edit.fields.techStack')}
                    </label>
                    <Textarea
                      value={form.technologies}
                      placeholder={t('admin.projects.edit.fields.techStack')}
                      onChange={(e) => setForm({ ...form, technologies: e.target.value })}
                      className="rounded-xl border-slate-200 dark:border-white/10 text-xs bg-slate-50 dark:bg-black/40 min-h-[100px] py-3 resize-none"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
