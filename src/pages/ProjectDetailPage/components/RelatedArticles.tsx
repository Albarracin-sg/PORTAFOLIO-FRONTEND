import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, ArrowRight } from 'lucide-react';
import { useLocalStorageSWR } from '@/shared/hooks/useLocalStorageSWR';
import { fetchBlogArticles } from '@/shared/api/blog';
import type { BlogArticleSummary } from '@/shared/api/blog';

interface RelatedArticlesProps {
  projectId: string;
}

/** Resolve a bilingual field to the current locale */
function resolveLocale(field: Record<string, string> | null | undefined, locale: string): string {
  if (!field) return '';
  return field[locale] ?? field['es'] ?? field['en'] ?? Object.values(field)[0] ?? '';
}

export function RelatedArticles({ projectId }: RelatedArticlesProps) {
  const { t, i18n } = useTranslation();

  const { data } = useLocalStorageSWR(
    `blog-articles-project-${projectId}`,
    () => fetchBlogArticles(1, 5, undefined, projectId),
  );

  const articles = data?.data;
  if (!articles || articles.length === 0) return null;

  return (
    <div className="rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-zinc-100 dark:border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="size-4 text-violet-600 dark:text-violet-400 shrink-0" />
          <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">
            {t('projects.detail.relatedArticles', 'Artículos')}
          </h3>
        </div>

        <div className="space-y-3">
          {articles.map((article: BlogArticleSummary) => (
            <Link
              key={article.id}
              to={`/blog/${article.slug}`}
              className="group flex items-start gap-3 p-3 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-500/10 border border-transparent hover:border-violet-200 dark:hover:border-violet-500/20 transition-all"
            >
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 line-clamp-2 transition-colors">
                  {resolveLocale(article.title, i18n.language)}
                </h4>
                {article.excerpt && (
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {resolveLocale(article.excerpt, i18n.language)}
                  </p>
                )}
              </div>
              <ArrowRight className="size-4 text-zinc-400 dark:text-zinc-500 group-hover:text-violet-500 shrink-0 mt-0.5 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
