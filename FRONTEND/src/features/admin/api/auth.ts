import { apiRequest } from '@/shared/api/http';

export type LoginResponse = { accessToken: string };

export async function login(email: string, password: string) {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}
