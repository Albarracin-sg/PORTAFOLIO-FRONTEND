import { apiRequest } from './http';

export type PublicSection = {
  id: string;
  type: string;
  order: number;
  content: Record<string, unknown>;
};

export type PublicPage = {
  id: string;
  slug: string;
  title: string;
  sections: PublicSection[];
};

export type PublicProject = {
  id: string;
  title: string;
  description: string;
  problem: string;
  challenge: string;
  solution: string;
  imageUrl: string;
  githubUrl: string;
  liveUrl?: string | null;
  category: string;
  status: string;
  featured: boolean;
  stars: number;
  forks: number;
  views: number;
  date: string;
  technologies: { technology: { name: string } }[];
};

export type PublicTranslationRecord = {
  id: string;
  lang: string;
  namespace: string;
  content: Record<string, unknown>;
};

export async function fetchPublicPage(slug: string) {
  return apiRequest<PublicPage>(`/public/pages/${slug}`);
}

export async function fetchPublicProjects() {
  return apiRequest<PublicProject[]>('/public/projects');
}

export async function sendContactMessage(payload: {
  name: string;
  email: string;
  message: string;
}) {
  return apiRequest('/public/contact', { method: 'POST', body: payload });
}

export async function fetchPublicTranslations(lang: string) {
  return apiRequest<PublicTranslationRecord[]>(`/public/translations?lang=${lang}`);
}
