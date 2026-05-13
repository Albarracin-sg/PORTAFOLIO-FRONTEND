import { useEffect, useReducer, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Eye,
  Languages
} from 'lucide-react';

import { useAdminAuth } from '@/features/admin/AdminAuthProvider';
import { fetchProjects, updateProject } from '@/features/admin/api/projects';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

// Sub-components
import { TranslationFields } from './components/ProjectEdit/TranslationFields';
import { ProjectMetadataSidebar } from './components/ProjectEdit/ProjectMetadataSidebar';

interface ProjectEditState {
  loading: boolean;
  saving: boolean;
  form: any;
}

type ProjectEditAction =
  | { type: 'START_LOAD' }
  | { type: 'FINISH_LOAD'; payload: any }
  | { type: 'START_SAVE' }
  | { type: 'FINISH_SAVE' }
  | { type: 'SET_FORM'; payload: any }
  | { type: 'UPDATE_FIELD'; payload: { field: string; value: any } };

function projectEditReducer(state: ProjectEditState, action: ProjectEditAction): ProjectEditState {
  switch (action.type) {
    case 'START_LOAD':
      return { ...state, loading: true };
    case 'FINISH_LOAD':
      return { ...state, loading: false, form: action.payload };
    case 'START_SAVE':
      return { ...state, saving: true };
    case 'FINISH_SAVE':
      return { ...state, saving: false };
    case 'SET_FORM':
      return { ...state, form: action.payload };
    case 'UPDATE_FIELD':
      return { ...state, form: { ...state.form, [action.payload.field]: action.payload.value } };
    default:
      return state;
  }
}

export function AdminProjectEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { token } = useAdminAuth();

  const [state, dispatch] = useReducer(projectEditReducer, {
    loading: true,
    saving: false,
    form: {
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
    },
  });

  const { loading, saving, form } = state;

  useEffect(() => {
    const loadProject = async () => {
      if (!token || !id) return;
      dispatch({ type: 'START_LOAD' });
      try {
        const projects = await fetchProjects(token);
        const found = projects.find((p) => p.id === id);
        
        if (!found) {
          navigate('/admin/projects');
          return;
        }

        const technologies = found.technologies
          ? Array.isArray(found.technologies)
            ? found.technologies
                .flatMap((item: any) => {
                   const name = item.technology?.name || item.name || '';
                   return name ? [name] : [];
                })
                .join(', ')
            : String(found.technologies)
          : '';

        dispatch({
          type: 'FINISH_LOAD',
          payload: {
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
          },
        });
      } catch (err) {
        console.error('Error loading project:', err);
        navigate('/admin/projects');
      }
    };

    loadProject();
  }, [token, id, navigate]);

  const handleSave = async () => {
    if (!token || !id) return;
    
    const toastId = toast.loading(t('admin.projects.edit.saving'));
    dispatch({ type: 'START_SAVE' });

    const technologies = form.technologies
      .split(',')
      .flatMap((tech: string) => {
        const trimmed = tech.trim();
        return trimmed ? [trimmed] : [];
      });

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
      
      toast.success(t('admin.projects.edit.saveSuccess'), { id: toastId });
      setTimeout(() => navigate('/admin/projects'), 1500);
    } catch (err) {
      console.error('Error updating project:', err);
      toast.error(t('admin.projects.edit.saveError'), { id: toastId });
    } finally {
      dispatch({ type: 'FINISH_SAVE' });
    }
  };

  const handleFieldChange = useCallback((field: string, value: any) => {
    dispatch({ type: 'UPDATE_FIELD', payload: { field, value } });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="relative">
          <div className="size-16 rounded-full border-t-4 border-violet-500 animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Loader2 className="size-6 text-violet-500 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-transparent pb-20 selection:bg-violet-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* ── Top Navigation ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-2">
            <Button
              variant="ghost"
              asChild
              className="group -ml-2 rounded-full text-zinc-500 hover:text-violet-600 transition-colors"
            >
              <Link to="/admin/projects">
                <ArrowLeft className="size-4 mr-2 transition-transform group-hover:-translate-x-1" />
                {t('admin.projects.edit.back')}
              </Link>
            </Button>
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white">
              {form.title || t('admin.projects.edit.title')}
            </h1>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <span className="px-2 py-0.5 rounded-md bg-zinc-200/50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 uppercase tracking-tighter font-mono text-[10px]">
                ID: {id?.slice(0, 8)}…
              </span>
              <span className="text-white dark:text-zinc-700">|</span>
              <a 
                href={`/projects/${id}`} 
                target="_blank" 
                className="flex items-center hover:text-violet-500 transition-colors"
              >
                <Eye className="size-3 mr-1" /> {t('admin.projects.edit.viewOnSite')}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <Button
              variant="outline"
              onClick={() => navigate('/admin/projects')}
              className="rounded-2xl border-zinc-200 dark:border-white/10 h-12 px-6 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
            >
              {t('admin.projects.edit.cancel')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="rounded-2xl bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 px-8 h-12 shadow-xl shadow-violet-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {saving ? (
                <Loader2 className="size-5 animate-spin mr-2" />
              ) : (
                <Save className="size-5 mr-2" />
              )}
              {saving ? t('admin.projects.edit.saving') : t('admin.projects.edit.save')}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <Tabs defaultValue="es" className="w-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3 text-zinc-900 dark:text-white">
                  <Languages className="size-5 text-violet-500" />
                  <h3 className="font-semibold">{t('admin.projects.edit.narrativeContent')}</h3>
                </div>
                <TabsList className="bg-zinc-200/50 dark:bg-white/5 p-1 rounded-xl border border-zinc-200 dark:border-white/10">
                  <TabsTrigger value="es" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-violet-500 data-[state=active]:text-violet-600 dark:data-[state=active]:text-white transition-all">
                    Español
                  </TabsTrigger>
                  <TabsTrigger value="en" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-violet-500 data-[state=active]:text-violet-600 dark:data-[state=active]:text-white transition-all">
                    English
                  </TabsTrigger>
                </TabsList>
              </div>

              <Card className="rounded-[2.5rem] border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.02] backdrop-blur-xl shadow-2xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
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

          <ProjectMetadataSidebar 
            form={form} 
            setForm={(val) => {
              if (typeof val === 'function') {
                dispatch({ type: 'SET_FORM', payload: val(form) });
              } else {
                dispatch({ type: 'SET_FORM', payload: val });
              }
            }} 
            t={t} 
          />
        </div>
      </div>
    </div>
  );
}
