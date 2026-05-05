export interface PublicStats {
  totalRequests: number;
  requestsPerMinute: number;
  avgResponseTimeMs: number;
  uptime: string;
  endpoints: {
    path: string;
    method: string;
    totalRequests: number;
    avgResponseTime: number;
  }[];
  generatedAt: string;
}

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

export async function fetchPublicStats(): Promise<PublicStats> {
  const { apiRequest } = await import('./http');
  return apiRequest<PublicStats>('/public/stats');
}

export async function fetchAdminStats(token: string): Promise<AdminStats> {
  const { apiRequest } = await import('./http');
  return apiRequest<AdminStats>('/admin/stats', { token });
}