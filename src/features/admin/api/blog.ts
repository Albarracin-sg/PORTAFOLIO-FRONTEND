import { apiRequest } from '@/shared/api/http';

export type I18nText = Record<string, string>;

export type AdminBlogArticle = {
  id: string;
  slug: string;
  title: I18nText;
  excerpt: I18nText | null;
  content: I18nText;
  metaTitle: I18nText | null;
  metaDescription: I18nText | null;
  coverImage: string | null;
  author: string;
  published: boolean;
  featured: boolean;
  publishedAt: string | null;
  tags: { id: string; name: string }[];
  project: { id: string; title: string; imageUrl: string } | null;
  projectId: string | null;
};

export type CreateBlogArticlePayload = {
  slug: string;
  title: I18nText;
  excerpt?: I18nText | null;
  content: I18nText;
  metaTitle?: I18nText | null;
  metaDescription?: I18nText | null;
  coverImage?: string | null;
  author: string;
  published?: boolean;
  featured?: boolean;
  tags?: string[];
  projectId?: string | null;
};

export type UpdateBlogArticlePayload = Partial<CreateBlogArticlePayload>;

export type BlogArticlesPage = {
  data: AdminBlogArticle[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export async function fetchAdminBlogArticles(
  token: string,
  page = 1,
  limit = 20,
): Promise<BlogArticlesPage> {
  return apiRequest<BlogArticlesPage>(
    `/admin/blog/articles?page=${page}&limit=${limit}`,
    { token },
  );
}

export async function fetchAdminBlogArticle(
  token: string,
  id: string,
): Promise<AdminBlogArticle> {
  return apiRequest<AdminBlogArticle>(`/admin/blog/articles/${id}`, { token });
}

export async function createAdminBlogArticle(
  token: string,
  data: CreateBlogArticlePayload,
): Promise<AdminBlogArticle> {
  return apiRequest<AdminBlogArticle>('/admin/blog/articles', {
    method: 'POST',
    token,
    body: data,
  });
}

export async function updateAdminBlogArticle(
  token: string,
  id: string,
  data: UpdateBlogArticlePayload,
): Promise<AdminBlogArticle> {
  return apiRequest<AdminBlogArticle>(`/admin/blog/articles/${id}`, {
    method: 'PUT',
    token,
    body: data,
  });
}

export async function deleteAdminBlogArticle(
  token: string,
  id: string,
): Promise<void> {
  return apiRequest<void>(`/admin/blog/articles/${id}`, {
    method: 'DELETE',
    token,
  });
}
