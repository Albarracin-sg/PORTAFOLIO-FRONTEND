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

export async function fetchPublicStats(): Promise<PublicStats> {
  const { apiRequest } = await import('./http');
  return apiRequest<PublicStats>('/public/stats');
}