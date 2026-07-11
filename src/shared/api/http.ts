const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  import.meta.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3000/api/v1';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  token?: string | null;
  cache?: RequestCache;
};

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token, cache } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    cache,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    window.dispatchEvent(new CustomEvent('admin-unauthorized'));
    throw new UnauthorizedError('Unauthorized');
  }

  if (response.status === 429) {
    const errorText = await response.text();
    throw new RateLimitError(errorText || 'Too many requests');
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const responseText = await response.text();

  if (!responseText) {
    return undefined as T;
  }

  return JSON.parse(responseText) as T;
}
