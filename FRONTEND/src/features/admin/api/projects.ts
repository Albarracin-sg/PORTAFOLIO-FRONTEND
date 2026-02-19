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
};

export async function fetchProjects(token: string) {
  return apiRequest<Project[]>('/admin/projects', { token });
}
