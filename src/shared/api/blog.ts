import { apiRequest } from './http';

export type I18nText = Record<string, string>;

export type BlogTag = {
  id: string;
  name: string;
  articleCount?: number;
};

export type BlogArticleSummary = {
  id: string;
  slug: string;
  title: I18nText;
  excerpt: I18nText | null;
  content: I18nText;
  coverImage: string | null;
  author: string;
  published: boolean;
  featured: boolean;
  publishedAt: string | null;
  tags: BlogTag[];
  project: { id: string; title: string; imageUrl: string } | null;
};

export type BlogArticleDetail = BlogArticleSummary & {
  metaTitle: I18nText | null;
  metaDescription: I18nText | null;
  projectId: string | null;
};

export type BlogArticlesResponse = {
  data: BlogArticleSummary[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type BlogTagWithCount = {
  id: string;
  name: string;
  articleCount: number;
};

export const BLOG_SORT = {
  DISCOVER: 'discover',
  RECENT: 'recent',
} as const;

export type BlogSort = (typeof BLOG_SORT)[keyof typeof BLOG_SORT];

export const ARTICLE_INTERACTION = {
  OPEN: 'open',
  QUALIFIED_READ: 'qualified-read',
} as const;

export type ArticleInteraction = (typeof ARTICLE_INTERACTION)[keyof typeof ARTICLE_INTERACTION];

export async function fetchBlogArticles(
  page = 1,
  limit = 12,
  tag?: string,
  projectId?: string,
  sort: BlogSort = BLOG_SORT.DISCOVER,
) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (tag) params.set('tag', tag);
  if (projectId) params.set('projectId', projectId);
  params.set('sort', sort);
  return apiRequest<BlogArticlesResponse>(`/public/blog/articles?${params}`);
}

export async function fetchBlogHomeArticles() {
  return apiRequest<BlogArticleSummary[]>('/public/blog/articles/home');
}

export async function fetchBlogFeatured() {
  return apiRequest<BlogArticleSummary[]>('/public/blog/articles/featured');
}

export async function fetchBlogArticleBySlug(slug: string) {
  return apiRequest<BlogArticleDetail>(`/public/blog/articles/${slug}`);
}

export async function fetchBlogTags() {
  return apiRequest<BlogTagWithCount[]>('/public/blog/tags');
}

export async function trackBlogInteraction(
  articleId: string,
  type: ArticleInteraction,
  readDurationSeconds?: number,
) {
  return apiRequest<void>(`/public/blog/articles/${articleId}/interactions`, {
    method: 'POST',
    body: { type, readDurationSeconds },
  });
}
