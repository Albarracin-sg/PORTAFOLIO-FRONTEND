import { useEffect, useCallback, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Calendar, User, ExternalLink, ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Markdown } from "@/components/ui/markdown";
import { fetchBlogArticleBySlug } from "@/shared/api/blog";
import { fetchDiagramsByProject, type Diagram } from "@/shared/api/diagrams";
import { useLocalStorageSWR } from "@/shared/hooks/useLocalStorageSWR";
import { commonFormatters } from "@/shared/utils/formatters";

import DiagramViewer from "@/components/DiagramViewer";
import type { BlogArticleDetail } from "@/shared/api/blog";

function resolveLocale(field: Record<string, string> | null | undefined, locale: string): string {
  if (!field) return '';
  return field[locale] ?? field['es'] ?? field['en'] ?? Object.values(field)[0] ?? '';
}

const DIAGRAM_HEADING = /^#{1,3}\s+(Arquitectura|Architecture)\s*$/im;
const HEADING_SPLIT = /^#{1,3}\s+/m;

function splitContentAtArchitecture(content: string): { before: string; after: string; atEnd: boolean } {
  const match = content.match(DIAGRAM_HEADING);
  if (!match) return { before: content, after: '', atEnd: true };

  const idx = match.index!;
  const nextHeading = content.slice(idx + match[0].length).search(HEADING_SPLIT);
  const afterIdx = nextHeading !== -1 ? idx + match[0].length + nextHeading : content.length;
  const afterContent = nextHeading !== -1 ? content.slice(afterIdx) : '';

  return {
    before: content.slice(0, afterIdx),
    after: afterContent,
    atEnd: false,
  };
}

function ArticleWithDiagrams({
  content,
  diagrams,
  locale,
}: {
  content: string;
  diagrams: Diagram[];
  locale: string;
}) {
  const { before, after } = useMemo(() => splitContentAtArchitecture(content), [content]);

  return (
    <>
      <article
        className="prose prose-base max-w-none dark:prose-invert mt-10
          prose-p:leading-relaxed prose-p:my-3
          prose-ul:my-3 prose-ol:my-3 prose-li:my-1
          prose-headings:my-4 prose-headings:font-semibold
          prose-a:text-violet-600 prose-a:underline prose-a:underline-offset-2
          prose-strong:font-bold
          prose-code:text-violet-600 prose-code:dark:text-violet-400
          prose-code:bg-zinc-100 prose-code:dark:bg-zinc-800
          prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-normal
          prose-pre:bg-zinc-900 prose-pre:dark:bg-zinc-950 prose-pre:rounded-xl prose-pre:border prose-pre:border-zinc-200 prose-pre:dark:border-zinc-800
          prose-blockquote:border-l-violet-500 prose-blockquote:pl-4 prose-blockquote:italic
          prose-img:rounded-xl prose-img:border prose-img:border-zinc-200 prose-img:dark:border-zinc-800"
      >
        <Markdown>{before}</Markdown>
      </article>

      {diagrams.length > 0 && (
        <div className="mt-8 space-y-6">
          {diagrams.map((diagram) => (
            <DiagramViewer
              key={diagram.id}
              title={diagram.title}
              description={diagram.description}
              source={diagram.source}
              locale={locale}
            />
          ))}
        </div>
      )}

      {after && (
        <article
          className="prose prose-base max-w-none dark:prose-invert mt-10
            prose-p:leading-relaxed prose-p:my-3
            prose-ul:my-3 prose-ol:my-3 prose-li:my-1
            prose-headings:my-4 prose-headings:font-semibold
            prose-a:text-violet-600 prose-a:underline prose-a:underline-offset-2
            prose-strong:font-bold
            prose-code:text-violet-600 prose-code:dark:text-violet-400
            prose-code:bg-zinc-100 prose-code:dark:bg-zinc-800
            prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-normal
            prose-pre:bg-zinc-900 prose-pre:dark:bg-zinc-950 prose-pre:rounded-xl prose-pre:border prose-pre:border-zinc-200 prose-pre:dark:border-zinc-800
            prose-blockquote:border-l-violet-500 prose-blockquote:pl-4 prose-blockquote:italic
            prose-img:rounded-xl prose-img:border prose-img:border-zinc-200 prose-img:dark:border-zinc-800"
        >
          <Markdown>{after}</Markdown>
        </article>
      )}
    </>
  );
}

export function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const { data: article, isLoading } = useLocalStorageSWR<BlogArticleDetail | null>(
    slug ? `blog-article-${slug}` : "blog-article-empty",
    useCallback(() => (slug ? fetchBlogArticleBySlug(slug) : Promise.resolve(null)), [slug]),
  );

  const [diagrams, setDiagrams] = useState<Diagram[]>([]);

  const formatDate = useCallback(
    (value: string | null) => {
      if (!value) return "";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "";
      return commonFormatters.longDate(i18n.language).format(date);
    },
    [i18n.language],
  );

  useEffect(() => {
    if (!slug) {
      navigate("/blog", { replace: true });
    }
  }, [slug, navigate]);

  useEffect(() => {
    if (!isLoading && !article && slug) {
      navigate("/blog", { replace: true });
    }
  }, [isLoading, article, slug, navigate]);

  useEffect(() => {
    if (!article) return;

    const title = resolveLocale(article.metaTitle, i18n.language) || resolveLocale(article.title, i18n.language);
    document.title = `${title} | Juan Albarracín`;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    const description = resolveLocale(article.metaDescription, i18n.language) || resolveLocale(article.excerpt, i18n.language) || "";
    metaDesc.setAttribute("content", description);

    return () => {
      document.title = "Juan Albarracín | Portfolio";
      metaDesc?.removeAttribute("content");
    };
  }, [article, i18n.language]);

  useEffect(() => {
    if (article?.projectId) {
      fetchDiagramsByProject(article.projectId)
        .then(setDiagrams)
        .catch(() => {});
    }
  }, [article?.projectId]);

  const articleContent = useMemo(() => {
    if (!article?.content) return null;
    return resolveLocale(article.content, i18n.language);
  }, [article?.content, i18n.language]);

  if (isLoading) return <BlogDetailSkeleton />;
  if (!article) return null;

  return (
    <div className="min-h-screen pt-28 pb-24 selection:bg-violet-500/30">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 relative z-10">
        <Button
          variant="ghost"
          onClick={() => navigate("/blog")}
          className="group mb-8 rounded-full border border-zinc-200 bg-white px-4 py-2 text-black transition-all hover:bg-violet-50 hover:text-violet-950 hover:border-violet-300 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:hover:bg-violet-500/10 dark:hover:text-violet-200"
        >
          <span className="inline-flex items-center gap-2">
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            {t("blog.explore")}
          </span>
        </Button>

        {article.coverImage && (
          <div className="mb-8 overflow-hidden rounded-2xl">
            <img
              src={article.coverImage}
              alt={resolveLocale(article.title, i18n.language)}
              className="aspect-[21/9] w-full object-cover"
            />
          </div>
        )}

        {article.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-xs">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-4xl lg:text-5xl">
          {resolveLocale(article.title, i18n.language)}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
          {article.author && (
            <span className="inline-flex items-center gap-1.5">
              <User className="size-3.5" />
              {article.author}
            </span>
          )}
          {article.publishedAt && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              {formatDate(article.publishedAt)}
            </span>
          )}
        </div>

        {article.excerpt && (
          <p className="mt-6 text-base leading-7 text-zinc-600 dark:text-zinc-400 sm:text-lg">
            {resolveLocale(article.excerpt, i18n.language)}
          </p>
        )}

        {/* Article content with inline architecture diagrams */}
        {articleContent && (
          <ArticleWithDiagrams
            content={articleContent}
            diagrams={diagrams}
            locale={i18n.language || 'es'}
          />
        )}

        {article.project && (
          <div className="mt-12 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-700/50 dark:bg-zinc-800/30">
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
              {t("blog.relatedProject")}
            </p>
            <div className="mt-3 flex items-center gap-4">
              {article.project.imageUrl && (
                <img
                  src={article.project.imageUrl}
                  alt={article.project.title}
                  className="size-12 shrink-0 rounded-xl object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="truncate text-base font-semibold text-zinc-900 dark:text-white">
                  {article.project.title}
                </h3>
              </div>
              <Link to={`/projects/${article.project.id}`}>
                <Button variant="outline" size="sm" className="shrink-0 rounded-xl">
                  <ExternalLink className="size-3.5" />
                  {t("blog.viewProject")}
                  <ArrowUpRight className="size-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <Link to="/blog">
            <Button
              variant="ghost"
              className="rounded-full border border-zinc-200 bg-white px-5 py-2 text-black transition-all hover:bg-violet-50 hover:text-violet-950 hover:border-violet-300 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:hover:bg-violet-500/10 dark:hover:text-violet-200"
            >
              <ArrowLeft className="size-4" />
              {t("blog.backToBlog")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function BlogDetailSkeleton() {
  return (
    <div className="min-h-screen pt-28 pb-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6">
        <Skeleton className="h-10 w-32 rounded-full" />
        <Skeleton className="aspect-[21/9] w-full rounded-2xl" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-12 w-3/4 rounded-lg" />
        <div className="flex gap-4">
          <Skeleton className="h-5 w-32 rounded-lg" />
          <Skeleton className="h-5 w-40 rounded-lg" />
        </div>
        <Skeleton className="h-6 w-full rounded-lg" />
        <Skeleton className="h-6 w-5/6 rounded-lg" />
        <div className="space-y-3 pt-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
