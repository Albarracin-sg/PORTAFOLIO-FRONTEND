import { useEffect, useState } from 'react';
import { BarChart3, Clock, Zap, Activity, Server, Globe } from 'lucide-react';
import { fetchPublicStats, type PublicStats } from '@/shared/api/stats';

export default function StatsPage() {
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Fetching stats...');
    fetchPublicStats()
      .then((data) => {
        console.log('Stats received:', data);
        setStats(data);
      })
      .catch((err) => {
        console.error('Stats error:', err);
        setError('Stats temporarily unavailable');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">{error || 'No data available'}</p>
        </div>
      </div>
    );
  }

  const formatUptime = (uptime: string) => {
    if (uptime.includes('d')) return uptime.replace('d', ' días');
    if (uptime.includes('h')) return uptime.replace('h', 'h');
    if (uptime.includes('m')) return uptime.replace('m', 'min');
    return uptime;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-500/20 mb-4">
            <BarChart3 className="w-8 h-8 text-violet-600 dark:text-violet-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Portfolio Stats
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Metrics and performance data for this portfolio
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-violet-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Total Requests</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalRequests.toLocaleString()}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Requests/min</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.requestsPerMinute}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-emerald-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Avg Response</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.avgResponseTimeMs}ms
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <Server className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Uptime</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatUptime(stats.uptime)}
            </p>
          </div>
        </div>

        {/* Endpoints Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-violet-500" />
              API Endpoints
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Endpoint
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Requests
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Avg Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {stats.endpoints.map((endpoint, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-mono">
                      {endpoint.path}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        endpoint.method === 'GET' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400'
                          : endpoint.method === 'POST'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400'
                      }`}>
                        {endpoint.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 text-right font-medium">
                      {endpoint.totalRequests.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 text-right">
                      {endpoint.avgResponseTime}ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date(stats.generatedAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
}