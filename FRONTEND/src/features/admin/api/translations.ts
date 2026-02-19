import { apiRequest } from '@/shared/api/http';

export type TranslationRecord = {
  id: string;
  lang: string;
  namespace: string;
  content: Record<string, unknown>;
};

export async function fetchTranslations(lang: string) {
  return apiRequest<TranslationRecord[]>(`/public/translations?lang=${lang}`);
}
