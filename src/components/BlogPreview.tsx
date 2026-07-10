import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Clock, Tag } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { fetchBlogArticles } from '@/shared/api/blog';
import { useLocalStorageSWR } from '@/shared/hooks/useLocalStorageSWR';
import type { I18nText } from '@/shared/api/blog';

function resolveLocale(field: I18nText | null | undefined, locale: string): string {
  if (!field) return '';
  return field[locale] ?? field['es'] ?? field['en'] ?? Object.values(field)[0] ?? '';
}

function formatDate(dateStr: string | null, locale: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(locale === 'es' ? 'es-CO' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function BlogPreview() {
  const { t, i18n } = useTranslation();
  const { data: articlesData } = useLocalStorageSWR(
    'blog-latest-preview',
    () => fetchBlogArticles(1, 3),
  );

  const articles = articlesData?.data;
  if (!articles || articles.length === 0) return null;

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header — matches Projects section pattern */}
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl text-center lg:text-left">
            <h2 className="mb-4 text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
              {t('blogPreview.title', 'Blog')}
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-400 sm:text-base">
              {t('blogPreview.subtitle', 'Ideas, tutoriales y Deep Dives técnicos sobre arquitectura de software, microservicios e inteligencia artificial.')}
            </p>
          </div>

          <Button
            size="lg"
            className="self-center bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 lg:self-auto"
            asChild
          >
            <Link to="/blog">
              {t('blogPreview.viewAll', 'Ver todos los artículos')}
              <ArrowRight className="ml-2 size-5" />
            </Link>
          </Button>
        </div>

        {/* Latest articles grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link key={article.id} to={`/blog/${article.slug}`} className="group">
              <Card className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/85 shadow-lg shadow-zinc-200/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-zinc-950/75 dark:shadow-black/20">
                {/* Cover image */}
                {article.coverImage && (
                  <div className="relative h-44 overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                    <img
                      src={article.coverImage}
                      alt={resolveLocale(article.title, i18n.language)}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 left-0 h-[2px] w-full bg-linear-to-r from-transparent via-zinc-400/80 to-transparent dark:via-violet-500/40" />
                  </div>
                )}

                <CardHeader className="space-y-2 bg-transparent pb-2">
                  <CardTitle as="h3" className="line-clamp-2 text-xl font-semibold leading-tight text-zinc-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    {resolveLocale(article.title, i18n.language)}
                  </CardTitle>

                  <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                    {article.publishedAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatDate(article.publishedAt, i18n.language)}
                      </span>
                    )}
                    {article.tags.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Tag className="size-3" />
                        {article.tags[0].name}
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col bg-transparent pt-0">
                  {article.excerpt && (
                    <p className="line-clamp-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                      {resolveLocale(article.excerpt, i18n.language)}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
