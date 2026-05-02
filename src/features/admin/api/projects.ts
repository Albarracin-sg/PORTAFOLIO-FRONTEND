import { apiRequest } from '@/shared/api/http';

export type Project = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  featured: boolean;
  stars: number;
  forks: number;
  views: number;
  date: string;
  githubUrl?: string | null;
  liveUrl?: string | null;
  technologies?: { technology: { name: string } }[];
};

export async function fetchProjects(token: string) {
  return apiRequest<Project[]>('/admin/projects', { token });
}

export async function updateProject(token: string, id: string, payload: Partial<Project> & { technologies?: string[] }) {
  return apiRequest<Project>(`/admin/projects/${id}`, { method: 'PUT', token, body: payload });
}

export async function syncGithubProjects(token: string) {
  return apiRequest<{ total: number; created: number; updated: number }>(
    '/admin/projects/github-sync',
    { method: 'POST', token },
  );
}
