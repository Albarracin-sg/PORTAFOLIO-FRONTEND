import type { PublicStats } from './stats';

export interface RecentRequest {
  id: string;
  method: string;
  path: string;
  status: number;
  responseTime: number;
  ip: string | null;
  userAgent: string | null;
  timestamp: string;
}

export interface AdminStats extends PublicStats {
  restartCount: number;
  totalProjects: number;
  totalContactMessages: number;
  requestsPer5Minutes: number;
  requestsPerHour: number;
  recentRequests: RecentRequest[];
}

export async function fetchAdminStats(token: string): Promise<AdminStats> {
  const { apiRequest } = await import('./http');
  return apiRequest<AdminStats>('/admin/stats', { token });
}
