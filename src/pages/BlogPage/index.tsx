import { useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, BookOpen, ChevronDown, ChevronUp, Newspaper, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BLOG_SORT, fetchBlogArticles, fetchBlogTags, type BlogSort } from "@/shared/api/blog";
import { useLocalStorageSWR } from "@/shared/hooks/useLocalStorageSWR";
import { commonFormatters } from "@/shared/utils/formatters";
import { usePageSeo } from "@/shared/seo/usePageSeo";
import { usePrerenderReady } from "@/shared/seo/usePrerenderReady";

import type { BlogArticleSummary, BlogTagWithCount } from "@/shared/api/blog";

/** Resolve a bilingual field to the current locale, with fallback to any available value */
function resolveLocale(field: Record<string, string> | null | undefined, locale: string): string {
  if (!field) return '';
  return field[locale] ?? field['es'] ?? field['en'] ?? Object.values(field)[0] ?? '';
}

export function BlogPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sort, setSort] = useState<BlogSort>(BLOG_SORT.DISCOVER);
  const [expandedFilters, setExpandedFilters] = useState(false);

  const { data: articlesData, isLoading: articlesLoading } = useLocalStorageSWR(
    `blog-articles-${sort}-${page}-${selectedTag ?? "all"}`,
    useCallback(
      () => fetchBlogArticles(page, 12, selectedTag ?? undefined, undefined, sort),
      [page, selectedTag, sort],
    ),
  );

  const { data: tags, isLoading: tagsLoading } = useLocalStorageSWR<BlogTagWithCount[]>(
    "blog-tags-cache",
    fetchBlogTags,
  );

  const articles = articlesData?.data ?? [];
  const totalPages = articlesData?.meta?.totalPages ?? 1;

  const featuredArticle = useMemo(() => {
    if (selectedTag || page > 1) return null;
    return articles.find((a) => a.featured) ?? null;
  }, [articles, selectedTag, page]);

  const regularArticles = useMemo(() => {
    if (!featuredArticle) return articles;
    return articles.filter((a) => a.id !== featuredArticle.id);
  }, [articles, featuredArticle]);

  const formatDate = useCallback(
    (value: string | null) => {
      if (!value) return "";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "";
      return commonFormatters.longDate(i18n.language).format(date);
    },
    [i18n.language],
  );

  const handleTagToggle = useCallback((tagName: string) => {
    setSelectedTag((prev) => (prev === tagName ? null : tagName));
    setPage(1);
    setExpandedFilters(false);
  }, []);

  const TAG_LIMIT = 8;
  const sortedTags = useMemo(
    () => tags ? [...tags].sort((a, b) => b.articleCount - a.articleCount) : [],
    [tags],
  );
  const showAllTags = expandedFilters || sortedTags.length <= TAG_LIMIT;
  const visibleTags = showAllTags ? sortedTags : sortedTags.slice(0, TAG_LIMIT);
  const hiddenTagCount = sortedTags.length - TAG_LIMIT;
  const totalArticleCount = useMemo(
    () => sortedTags.reduce((sum, t) => sum + t.articleCount, 0),
    [sortedTags],
  );

  usePageSeo({
    title: "Blog de Juan Camilo Albarracin | Backend, IA y Microservicios",
    description:
      "Articulos tecnicos de Juan Camilo Albarracin sobre backend, microservicios, NestJS, arquitectura distribuida, integracion de IA, MCP y buenas practicas de software.",
    path: "/blog",
    keywords: [
      "blog juan camilo albarracin",
      "albarracin blog backend",
      "articulos microservicios nestjs",
      "blog arquitectura de software colombia",
    ],
  });

  usePrerenderReady(!articlesLoading && !tagsLoading, 250);

  return (
    <section className="min-h-screen px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
      {/* ── Header ── */}
      <div className="mb-8 sm:mb-12">
        <Button
          variant="ghost"
          asChild
          className="group mb-2 sm:mb-6 rounded-full border border-zinc-200 bg-white/80 px-4 py-2 text-black transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-900 dark:border-white/10 dark:bg-zinc-950 dark:text-white dark:hover:border-violet-400/30 dark:hover:bg-white/[0.06] dark:hover:text-violet-200"
        >
          <Link to="/">
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            {t("common.back")}
          </Link>
        </Button>

        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-600 dark:text-violet-400">
            {t("blog.explore", "Blog")}
          </p>
          <h1 className="mt-3 text-5xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-6xl">
            {t("blog.title", "Artículos")}
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-400 sm:text-base">
            {t("blog.subtitle", "Ideas, tutoriales y reflexiones sobre desarrollo de software.")}
          </p>
        </div>
      </div>

      {articlesLoading || tagsLoading ? (
        <BlogSkeleton />
      ) : (
        <>
          <div className="mb-4 flex justify-end">
            <label className="sr-only" htmlFor="blog-sort">{t("blogPage.sortBy")}</label>
            <select
              id="blog-sort"
              value={sort}
              onChange={(event) => { setSort(event.target.value as BlogSort); setPage(1); }}
              className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[11px] font-medium text-zinc-600 outline-none transition-colors hover:border-violet-300 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-400"
            >
              <option value={BLOG_SORT.DISCOVER}>{t("blogPage.sort.discover")}</option>
              <option value={BLOG_SORT.RECENT}>{t("blogPage.sort.recent")}</option>
            </select>
          </div>

          {/* ── Tags Filter ── */}
          {sortedTags.length > 0 && (
            <div className="mb-8 rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-white/10 dark:bg-zinc-950/75 sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  {t("blogPage.filterBy", "Filtrar por")}
                </span>
                {selectedTag && (
                  <button
                    onClick={() => { setSelectedTag(null); setPage(1); }}
                    className="group flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-[11px] font-medium text-violet-600 transition-colors hover:bg-violet-100 dark:bg-violet-500/10 dark:text-violet-400 dark:hover:bg-violet-500/15"
                    aria-label={t("blogPage.clearFilter", "Limpiar filtro")}
                  >
                    <X className="size-3 transition-transform group-hover:rotate-90" />
                    {selectedTag}
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("blogPage.filterBy", "Filtrar por")}>
                <button
                  role="radio"
                  aria-checked={!selectedTag}
                  onClick={() => { setSelectedTag(null); setPage(1); }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                    !selectedTag
                      ? "bg-zinc-900 text-white shadow-sm dark:bg-violet-500 dark:text-white"
                      : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-white/[0.06]"
                  }`}
                >
                  {t("blogPage.all", "Todos")}
                  <span className={`ml-1.5 text-[10px] ${
                    !selectedTag
                      ? "text-zinc-400 dark:text-zinc-500"
                      : "text-zinc-300 dark:text-zinc-600"
                  }`}>
                    {totalArticleCount}
                  </span>
                </button>

                {visibleTags.map((tag) => {
                  const isSelected = selectedTag === tag.name;
                  return (
                    <button
                      key={tag.id}
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => handleTagToggle(tag.name)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                        isSelected
                          ? "bg-violet-600 text-white shadow-sm shadow-violet-600/20 dark:bg-violet-500 dark:shadow-violet-500/20"
                           : "bg-white text-zinc-600 hover:bg-violet-50 hover:text-violet-700 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-violet-500/10 dark:hover:text-violet-300"
                      }`}
                    >
                      {tag.name}
                      <span className={`ml-1.5 text-[10px] ${
                        isSelected
                          ? "text-violet-300 dark:text-violet-300"
                          : "text-zinc-300 dark:text-zinc-600"
                      }`}>
                        {tag.articleCount}
                      </span>
                    </button>
                  );
                })}

                {!showAllTags && hiddenTagCount > 0 && (
                  <button
                    onClick={() => setExpandedFilters(true)}
                    className="flex items-center gap-1 rounded-lg border border-dashed border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-300 hover:text-zinc-600 dark:border-white/10 dark:text-zinc-500 dark:hover:border-white/20 dark:hover:text-zinc-300"
                    aria-label={t("blogPage.showMoreFilters", "Mostrar más filtros")}
                  >
                    <ChevronDown className="size-3" />
                    +{hiddenTagCount}
                  </button>
                )}

                {showAllTags && sortedTags.length > TAG_LIMIT && (
                  <button
                    onClick={() => setExpandedFilters(false)}
                    className="flex items-center gap-1 rounded-lg border border-dashed border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-300 hover:text-zinc-600 dark:border-white/10 dark:text-zinc-500 dark:hover:border-white/20 dark:hover:text-zinc-300"
                    aria-label={t("blogPage.showLessFilters", "Mostrar menos filtros")}
                  >
                    <ChevronUp className="size-3" />
                    {t("blogPage.less", "Menos")}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Featured Article ── */}
          {featuredArticle && (
            <button
              onClick={() => navigate(`/blog/${featuredArticle.slug}`)}
              className="group w-full text-left"
            >
              <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:shadow-lg hover:shadow-violet-500/5 dark:border-white/10 dark:bg-zinc-950/75 dark:hover:shadow-violet-500/10">
                {featuredArticle.coverImage && (
                  <div className="aspect-[21/9] w-full overflow-hidden">
                    <img
                      src={featuredArticle.coverImage}
                      alt={resolveLocale(featuredArticle.title, i18n.language)}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                    <Newspaper className="size-3.5" />
                    {t("blog.featured", "Destacado")}
                  </div>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
                    {resolveLocale(featuredArticle.title, i18n.language)}
                  </h2>
                  {featuredArticle.excerpt && (
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-400 sm:text-base">
                      {resolveLocale(featuredArticle.excerpt, i18n.language)}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span className="text-xs text-zinc-500 dark:text-zinc-500">
                      {formatDate(featuredArticle.publishedAt)}
                    </span>
                    {featuredArticle.tags.map((tag) => (
                      <Badge key={tag.id} variant="secondary" className="text-[10px]">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          )}

          {/* ── Articles Grid ── */}
          {regularArticles.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {regularArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  formatDate={formatDate}
                  onSelect={(slug) => navigate(`/blog/${slug}`)}
                />
              ))}
            </div>
          ) : (
            !featuredArticle && (
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-white/30 dark:border-white/10 dark:bg-zinc-950">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-950">
                  <BookOpen className="size-8 text-zinc-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
                  {t("blog.empty", "No hay artículos disponibles aún.")}
                </h3>
                <p className="mt-1 text-sm text-zinc-500">
                  {t("blog.emptyHint", "Próximamente compartiré contenido nuevo.")}
                </p>
              </div>
            )
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="mt-12 flex flex-col items-center gap-2">
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {t("blog.pagination.page", "Página {{current}} de {{total}}", { current: page, total: totalPages })}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-xl"
                >
                  {t("blog.pagination.prev", "Anterior")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-xl"
                >
                  {t("blog.pagination.next", "Siguiente")}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
      </div>
    </section>
  );
}

function ArticleCard({
  article,
  formatDate,
  onSelect,
}: {
  article: BlogArticleSummary;
  formatDate: (v: string | null) => string;
  onSelect: (slug: string) => void;
}) {
  const { i18n } = useTranslation();

  return (
    <button
      onClick={() => onSelect(article.slug)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white text-left transition-all hover:shadow-lg hover:shadow-violet-500/5 dark:border-white/10 dark:bg-zinc-950/75 dark:hover:bg-white/[0.06] dark:hover:shadow-violet-500/10"
    >
      {article.coverImage && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={article.coverImage}
            alt={resolveLocale(article.title, i18n.language)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-white line-clamp-2">
          {resolveLocale(article.title, i18n.language)}
        </h3>
        {article.excerpt && (
          <p className="mt-2 flex-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400 line-clamp-3">
            {resolveLocale(article.excerpt, i18n.language)}
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
            {formatDate(article.publishedAt)}
          </span>
          {article.tags.slice(0, 3).map((tag) => (
            <Badge key={tag.id} variant="secondary" className="text-[10px]">
              {tag.name}
            </Badge>
          ))}
        </div>
      </div>
    </button>
  );
}

function BlogSkeleton() {
  return (
    <>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>

      <Skeleton className="aspect-[21/9] w-full rounded-2xl" />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-700/50">
            <Skeleton className="aspect-video w-full" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-5 w-3/4 rounded-lg" />
              <Skeleton className="h-3 w-full rounded-lg" />
              <Skeleton className="h-3 w-2/3 rounded-lg" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
