import { apiRequest } from '@/shared/api/http';

export type Page = {
  id: string;
  slug: string;
  title: string;
  isPublished: boolean;
  updatedAt: string;
};

export type Section = {
  id: string;
  pageId: string;
  type: string;
  order: number;
  content: Record<string, unknown>;
};

export async function fetchPages(token: string) {
  return apiRequest<Page[]>('/admin/pages', { token });
}

export async function fetchSections(token: string, pageId?: string) {
  const query = pageId ? `?pageId=${pageId}` : '';
  return apiRequest<Section[]>(`/admin/sections${query}`, { token });
}

export async function updatePage(
  token: string,
  id: string,
  payload: Partial<Pick<Page, 'slug' | 'title' | 'isPublished'>>,
) {
  return apiRequest<Page>(`/admin/pages/${id}`, {
    token,
    method: 'PUT',
    body: payload,
  });
}

export async function updateSection(
  token: string,
  id: string,
  payload: Partial<Pick<Section, 'pageId' | 'type' | 'order' | 'content'>>,
) {
  return apiRequest<Section>(`/admin/sections/${id}`, {
    token,
    method: 'PUT',
    body: payload,
  });
}
