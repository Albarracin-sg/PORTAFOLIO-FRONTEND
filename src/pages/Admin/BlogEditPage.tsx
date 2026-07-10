import { useEffect, useReducer } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useAdminAuth } from '@/features/admin/AdminAuthProvider';
import {
  fetchAdminBlogArticle,
  createAdminBlogArticle,
  updateAdminBlogArticle,
  I18nText,
} from '@/features/admin/api/blog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface BlogFormState {
  loading: boolean;
  saving: boolean;
  slug: string;
  titleEs: string;
  titleEn: string;
  excerptEs: string;
  excerptEn: string;
  contentEs: string;
  contentEn: string;
  metaTitleEs: string;
  metaTitleEn: string;
  metaDescriptionEs: string;
  metaDescriptionEn: string;
  coverImage: string;
  author: string;
  published: boolean;
  featured: boolean;
  tags: string;
  projectId: string;
}

type BlogFormAction =
  | { type: 'START_LOAD' }
  | { type: 'FINISH_LOAD'; payload: Partial<BlogFormState> }
  | { type: 'START_SAVE' }
  | { type: 'FINISH_SAVE' }
  | { type: 'UPDATE_FIELD'; payload: { field: keyof BlogFormState; value: string | boolean } };

function blogFormReducer(state: BlogFormState, action: BlogFormAction): BlogFormState {
  switch (action.type) {
    case 'START_LOAD':
      return { ...state, loading: true };
    case 'FINISH_LOAD':
      return { ...state, loading: false, ...action.payload };
    case 'START_SAVE':
      return { ...state, saving: true };
    case 'FINISH_SAVE':
      return { ...state, saving: false };
    case 'UPDATE_FIELD':
      return { ...state, [action.payload.field]: action.payload.value };
    default:
      return state;
  }
}

const initialState: BlogFormState = {
  loading: false,
  saving: false,
  slug: '',
  titleEs: '',
  titleEn: '',
  excerptEs: '',
  excerptEn: '',
  contentEs: '',
  contentEn: '',
  metaTitleEs: '',
  metaTitleEn: '',
  metaDescriptionEs: '',
  metaDescriptionEn: '',
  coverImage: '',
  author: '',
  published: false,
  featured: false,
  tags: '',
  projectId: '',
};

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function BlogEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { token } = useAdminAuth();
  const isEdit = !!id && id !== 'new';

  const [state, dispatch] = useReducer(blogFormReducer, initialState);
  const { loading, saving } = state;

  useEffect(() => {
    if (!isEdit || !token || !id) return;
    const load = async () => {
      dispatch({ type: 'START_LOAD' });
      try {
        const article = await fetchAdminBlogArticle(token, id);
        dispatch({
          type: 'FINISH_LOAD',
          payload: {
            slug: article.slug,
            titleEs: article.title['es'] ?? '',
            titleEn: article.title['en'] ?? '',
            excerptEs: article.excerpt?.['es'] ?? '',
            excerptEn: article.excerpt?.['en'] ?? '',
            contentEs: article.content['es'] ?? '',
            contentEn: article.content['en'] ?? '',
            metaTitleEs: article.metaTitle?.['es'] ?? '',
            metaTitleEn: article.metaTitle?.['en'] ?? '',
            metaDescriptionEs: article.metaDescription?.['es'] ?? '',
            metaDescriptionEn: article.metaDescription?.['en'] ?? '',
            coverImage: article.coverImage ?? '',
            author: article.author,
            published: article.published,
            featured: article.featured,
            tags: article.tags.map((t) => t.name).join(', '),
            projectId: article.projectId ?? '',
          },
        });
      } catch (err) {
        console.error('Error loading article:', err);
        toast.error('Error loading article');
        navigate('/admin/blog');
      }
    };
    load();
  }, [id, isEdit, token, navigate]);

  const update = <K extends keyof BlogFormState>(
    field: K,
    value: BlogFormState[K],
  ) => {
    dispatch({ type: 'UPDATE_FIELD', payload: { field, value } });
  };

  const handleTitleEsChange = (value: string) => {
    update('titleEs', value);
    if (!isEdit) {
      update('slug', generateSlug(value));
    }
  };

  const handleSave = async () => {
    if (!token) return;
    dispatch({ type: 'START_SAVE' });
    try {
      const data = {
        slug: state.slug,
        title: { es: state.titleEs, en: state.titleEn } as I18nText,
        excerpt: state.excerptEs || state.excerptEn
          ? ({ es: state.excerptEs, en: state.excerptEn } as I18nText)
          : null,
        content: { es: state.contentEs, en: state.contentEn } as I18nText,
        metaTitle: state.metaTitleEs || state.metaTitleEn
          ? ({ es: state.metaTitleEs, en: state.metaTitleEn } as I18nText)
          : null,
        metaDescription: state.metaDescriptionEs || state.metaDescriptionEn
          ? ({ es: state.metaDescriptionEs, en: state.metaDescriptionEn } as I18nText)
          : null,
        coverImage: state.coverImage || null,
        author: state.author,
        published: state.published,
        featured: state.featured,
        tags: state.tags
          ? state.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
        projectId: state.projectId || null,
      };

      if (isEdit && id) {
        await updateAdminBlogArticle(token, id, data);
        toast.success(t('admin.blog.saved'));
      } else {
        await createAdminBlogArticle(token, data);
        toast.success(t('admin.blog.saved'));
      }
      navigate('/admin/blog');
    } catch (err) {
      console.error('Error saving article:', err);
      toast.error('Error saving article');
    } finally {
      dispatch({ type: 'FINISH_SAVE' });
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="size-7 animate-spin text-violet-500" />
      </div>
    );
  }

  const sectionClass =
    'rounded-2xl border border-zinc-200 dark:border-white/[0.07] bg-white/80 dark:bg-white/[0.025] p-5';
  const labelClass = 'text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 block';
  const inputClass =
    'h-9 rounded-xl border border-zinc-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.04] text-sm px-3 text-zinc-900 dark:text-white focus-visible:ring-0 focus-visible:border-violet-400 dark:focus-visible:border-violet-500/50 transition-all';
  const textareaClass =
    'min-h-[120px] rounded-xl border border-zinc-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.04] text-sm px-3 py-2 text-zinc-900 dark:text-white focus-visible:ring-0 focus-visible:border-violet-400 dark:focus-visible:border-violet-500/50 transition-all resize-y';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="mb-8 sm:mb-12">
        <Button
          variant="ghost"
          asChild
          className="group mb-2 sm:mb-6 rounded-full border border-zinc-200 bg-white/80 px-4 py-2 text-black transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-900 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:hover:border-violet-400/30 dark:hover:bg-violet-500/10 dark:hover:text-violet-200"
        >
          <Link to="/admin/blog">
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            {t('admin.projects.edit.back')}
          </Link>
        </Button>

        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-600 dark:text-violet-400">
            {isEdit ? t('admin.blog.editArticle') : t('admin.blog.newArticle')}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
            {isEdit ? t('admin.blog.editArticle') : t('admin.blog.newArticle')}
          </h1>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Title */}
        <div className={sectionClass}>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
            {t('admin.projects.edit.fields.title')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>ES</label>
              <Input
                value={state.titleEs}
                onChange={(e) => handleTitleEsChange(e.target.value)}
                placeholder="Título en español"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>EN</label>
              <Input
                value={state.titleEn}
                onChange={(e) => update('titleEn', e.target.value)}
                placeholder="Title in English"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Slug */}
        <div className={sectionClass}>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Slug</h2>
          <Input
            value={state.slug}
            onChange={(e) => update('slug', e.target.value)}
            placeholder="mi-articulo"
            className={inputClass}
          />
        </div>

        {/* Excerpt */}
        <div className={sectionClass}>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Excerpt</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>ES</label>
              <textarea
                value={state.excerptEs}
                onChange={(e) => update('excerptEs', e.target.value)}
                placeholder="Resumen en español"
                className={textareaClass}
                rows={3}
              />
            </div>
            <div>
              <label className={labelClass}>EN</label>
              <textarea
                value={state.excerptEn}
                onChange={(e) => update('excerptEn', e.target.value)}
                placeholder="Excerpt in English"
                className={textareaClass}
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={sectionClass}>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Content</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>ES</label>
              <textarea
                value={state.contentEs}
                onChange={(e) => update('contentEs', e.target.value)}
                placeholder="Contenido en español (Markdown)"
                className={textareaClass}
                rows={10}
              />
            </div>
            <div>
              <label className={labelClass}>EN</label>
              <textarea
                value={state.contentEn}
                onChange={(e) => update('contentEn', e.target.value)}
                placeholder="Content in English (Markdown)"
                className={textareaClass}
                rows={10}
              />
            </div>
          </div>
        </div>

        {/* Meta Title */}
        <div className={sectionClass}>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Meta Title</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>ES</label>
              <Input
                value={state.metaTitleEs}
                onChange={(e) => update('metaTitleEs', e.target.value)}
                placeholder="Meta título ES"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>EN</label>
              <Input
                value={state.metaTitleEn}
                onChange={(e) => update('metaTitleEn', e.target.value)}
                placeholder="Meta title EN"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Meta Description */}
        <div className={sectionClass}>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
            Meta Description
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>ES</label>
              <Input
                value={state.metaDescriptionEs}
                onChange={(e) => update('metaDescriptionEs', e.target.value)}
                placeholder="Meta descripción ES"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>EN</label>
              <Input
                value={state.metaDescriptionEn}
                onChange={(e) => update('metaDescriptionEn', e.target.value)}
                placeholder="Meta description EN"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Cover Image + Author */}
        <div className={sectionClass}>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Cover Image URL</label>
              <Input
                value={state.coverImage}
                onChange={(e) => update('coverImage', e.target.value)}
                placeholder="https://..."
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Author</label>
              <Input
                value={state.author}
                onChange={(e) => update('author', e.target.value)}
                placeholder="Author name"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Tags + Project ID */}
        <div className={sectionClass}>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Taxonomy</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tags (comma separated)</label>
              <Input
                value={state.tags}
                onChange={(e) => update('tags', e.target.value)}
                placeholder="typescript, react, nestjs"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Project ID (optional)</label>
              <Input
                value={state.projectId}
                onChange={(e) => update('projectId', e.target.value)}
                placeholder="Project UUID"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className={sectionClass}>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={state.published}
                onChange={(e) => update('published', e.target.checked)}
                className="size-4 rounded border-zinc-300 dark:border-white/20 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm font-medium text-zinc-900 dark:text-white">Published</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={state.featured}
                onChange={(e) => update('featured', e.target.checked)}
                className="size-4 rounded border-zinc-300 dark:border-white/20 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm font-medium text-zinc-900 dark:text-white">Featured</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/blog')}
            className="rounded-2xl border-zinc-200 dark:border-white/10 px-6 h-10 text-sm font-medium"
          >
            {t('admin.projects.edit.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="rounded-2xl bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-500/20 px-6 h-10 text-sm font-medium"
          >
            {saving ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <Save className="size-4 mr-2" />
            )}
            {saving ? t('admin.projects.edit.saving') : t('admin.projects.edit.save')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default BlogEditPage;
