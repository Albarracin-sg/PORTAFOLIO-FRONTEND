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

export async function fetchBlogArticles(page = 1, limit = 12, tag?: string, projectId?: string) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (tag) params.set('tag', tag);
  if (projectId) params.set('projectId', projectId);
  return apiRequest<BlogArticlesResponse>(`/public/blog/articles?${params}`);
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
