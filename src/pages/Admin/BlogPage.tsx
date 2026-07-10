import { useEffect, useMemo, useReducer, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import {
  fetchAdminBlogArticles,
  deleteAdminBlogArticle,
  AdminBlogArticle,
} from '@/features/admin/api/blog';
import { useAdminAuth } from '@/features/admin/AdminAuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Newspaper,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Search,
  Plus,
  Loader2,
  Tag,
  Star,
  Calendar,
} from 'lucide-react';

interface BlogState {
  articles: AdminBlogArticle[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  searchQuery: string;
}

type BlogAction =
  | { type: 'SET_ARTICLES'; payload: { data: AdminBlogArticle[]; total: number } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_PAGE'; payload: number };

function blogReducer(state: BlogState, action: BlogAction): BlogState {
  switch (action.type) {
    case 'SET_ARTICLES':
      return { ...state, articles: action.payload.data, total: action.payload.total };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload, page: 1 };
    case 'SET_PAGE':
      return { ...state, page: action.payload };
    default:
      return state;
  }
}

function resolveLocale(field: Record<string, string> | null | undefined): string {
  if (!field) return '';
  const locale = i18next.language;
  return field[locale] ?? field['es'] ?? field['en'] ?? '';
}

export function BlogAdminPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token } = useAdminAuth();

  const [state, dispatch] = useReducer(blogReducer, {
    articles: [],
    total: 0,
    page: 1,
    limit: 10,
    loading: true,
    searchQuery: '',
  });

  const { articles, total, page, limit, loading, searchQuery } = state;
  const totalPages = Math.ceil(total / limit);

  const load = useCallback(async () => {
    if (!token) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await fetchAdminBlogArticles(token, page, limit);
      dispatch({ type: 'SET_ARTICLES', payload: { data: result.data, total: result.meta.total } });
    } catch (err) {
      console.error('Error loading blog articles:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [token, page, limit]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredArticles = useMemo(() => {
    if (!searchQuery) return articles;
    const q = searchQuery.toLowerCase();
    return articles.filter(
      (a) =>
        resolveLocale(a.title).toLowerCase().includes(q) ||
        a.slug.toLowerCase().includes(q) ||
        a.author.toLowerCase().includes(q),
    );
  }, [articles, searchQuery]);

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!window.confirm(t('admin.blog.confirmDelete'))) return;
    try {
      await deleteAdminBlogArticle(token, id);
      load();
    } catch (err) {
      console.error('Error deleting article:', err);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="mb-8 sm:mb-12">
        <Button
          variant="ghost"
          asChild
          className="group mb-2 sm:mb-6 rounded-full border border-zinc-200 bg-white/80 px-4 py-2 text-black transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-900 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:hover:border-violet-400/30 dark:hover:bg-violet-500/10 dark:hover:text-violet-200"
        >
          <Link to="/admin">
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            {t('common.back')}
          </Link>
        </Button>

        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-600 dark:text-violet-400">
            {t('admin.blog.subtitle')}
          </p>
          <div className="mt-3 flex items-center justify-center gap-4">
            <Newspaper className="size-10 text-violet-500 shrink-0 hidden sm:block" />
            <h1 className="text-5xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-6xl">
              {t('admin.blog.title')}
            </h1>
          </div>

          {/* Search + New button */}
          <div className="mt-8 flex items-center justify-center gap-2 w-full">
            <div className="flex items-center gap-2 px-3 h-9 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.04]">
              <Search className="size-3.5 text-zinc-500 shrink-0" />
              <Input
                placeholder={t('admin.projects.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
                className="h-auto w-24 sm:w-36 border-none bg-transparent text-xs p-0 focus-visible:ring-0 text-black dark:text-zinc-400"
              />
            </div>

            <Button
              size="sm"
              onClick={() => navigate('/admin/blog/new')}
              className="h-9 rounded-2xl px-3 sm:px-4 gap-2 text-sm bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-500/20 transition-all duration-300 hover:scale-105"
            >
              <Plus className="size-3.5" />
              <span className="font-medium hidden sm:inline">{t('admin.blog.newArticle')}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Articles list */}
      <div>
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="size-7 animate-spin text-violet-500" />
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="py-20 text-center text-sm text-zinc-500 dark:text-zinc-400 italic">
            {t('admin.blog.noArticles')}
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="group rounded-2xl border border-zinc-200 dark:border-white/[0.07] bg-white/70 dark:bg-white/[0.025] hover:border-violet-400/20 hover:bg-white dark:hover:bg-white/[0.04] transition-all duration-200 overflow-hidden"
              >
                <div className="px-5 py-3.5 flex items-center justify-between gap-4">
                  {/* Left: icon + info */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="size-9 rounded-xl bg-violet-500/8 border border-violet-500/15 flex items-center justify-center text-violet-500 shrink-0 group-hover:bg-violet-600 group-hover:text-white group-hover:border-transparent transition-all duration-200">
                      <Newspaper className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                          {resolveLocale(article.title)}
                        </p>
                        {article.published ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Publicado
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Borrador
                          </span>
                        )}
                        {article.featured && (
                          <Star className="size-3 fill-amber-400 text-amber-400 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                          /{article.slug}
                        </p>
                        {article.tags.length > 0 && (
                          <div className="flex items-center gap-1">
                            {article.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag.id}
                                className="inline-flex items-center gap-0.5 rounded-md bg-zinc-100 dark:bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-zinc-500 dark:text-zinc-400"
                              >
                                <Tag className="size-2" />
                                {tag.name}
                              </span>
                            ))}
                            {article.tags.length > 3 && (
                              <span className="text-[10px] text-zinc-400">+{article.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                        {article.project && (
                          <p className="text-xs text-violet-500 dark:text-violet-400 truncate">
                            {article.project.title}
                          </p>
                        )}
                        {article.publishedAt && (
                          <div className="flex items-center gap-1 text-xs text-zinc-400">
                            <Calendar className="size-2.5" />
                            {formatDate(article.publishedAt)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/admin/blog/${article.id}`)}
                      className="size-8 rounded-xl hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200"
                    >
                      <Edit className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(article.id)}
                      className="size-8 rounded-xl hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
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
                  onClick={() => dispatch({ type: 'SET_PAGE', payload: Math.max(1, page - 1) })}
                  disabled={page === 1}
                  className="size-8 sm:h-9 sm:w-auto rounded-xl sm:rounded-2xl p-0 sm:px-4 gap-1.5 text-sm hover:bg-violet-500/8 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200"
                >
                  <ChevronLeft className="size-4" />
                  <span className="hidden sm:inline">{t('admin.projects.pagination.prev')}</span>
                </Button>
                <span className="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400 tabular-nums bg-zinc-100/50 dark:bg-white/5 px-2 py-1 rounded-lg">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dispatch({ type: 'SET_PAGE', payload: Math.min(totalPages, page + 1) })}
                  disabled={page === totalPages}
                  className="size-8 sm:h-9 sm:w-auto rounded-xl sm:rounded-2xl p-0 sm:px-4 gap-1.5 text-sm hover:bg-violet-500/8 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200"
                >
                  <span className="hidden sm:inline">{t('admin.projects.pagination.next')}</span>
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BlogAdminPage;
