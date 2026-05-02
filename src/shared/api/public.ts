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

export type GithubStats = {
  username: string;
  totalRepos: number;
  publicRepos: number;
  privateRepos: number;
  pullRequests: number;
  followers: number;
  following: number;
  stars: number;
  forks: number;
  languageData: Array<{ name: string; value: number; color: string }>;
  projectsData: Array<{ month: string; projects: number }>;
  githubActivity: Array<{ day: string; commits: number }>;
};

export async function fetchPublicPage(slug: string) {
  return apiRequest<PublicPage>(`/public/pages/${slug}`, { cache: 'no-store' });
}

export async function fetchPublicProjects() {
  return apiRequest<PublicProject[]>('/public/projects', { cache: 'no-store' });
}

export async function sendContactMessage(payload: {
  name: string;
  email: string;
  message: string;
}) {
  return apiRequest('/public/contact', { method: 'POST', body: payload });
}

export async function fetchGithubStats() {
  return apiRequest<GithubStats>('/public/github/stats', { cache: 'no-store' });
}
