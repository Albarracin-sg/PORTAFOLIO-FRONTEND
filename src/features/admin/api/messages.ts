import { apiRequest } from '@/shared/api/http';

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  createdAt: string;
};

export async function fetchMessages(token: string) {
  return apiRequest<ContactMessage[]>('/admin/messages', { token });
}
