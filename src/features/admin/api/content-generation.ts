import { apiRequest } from '@/shared/api/http';

export type GenerationResult = {
  project: { id: string; title: string };
  diagram: { id: string; title: string } | null;
  article: { id: string; slug: string; title: string } | null;
  errors: string[];
};

export async function generateContentForProject(
  token: string,
  projectId: string,
): Promise<GenerationResult> {
  return apiRequest<GenerationResult>(
    `/admin/content-generation/generate/${projectId}`,
    { token, method: 'POST' },
  );
}

export async function generateAllMissingContent(
  token: string,
): Promise<GenerationResult[]> {
  return apiRequest<GenerationResult[]>(
    '/admin/content-generation/generate-all',
    { token, method: 'POST' },
  );
}
