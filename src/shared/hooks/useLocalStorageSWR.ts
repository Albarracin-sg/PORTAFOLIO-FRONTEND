import { useEffect, useState, useRef, useCallback } from 'react';

const CACHE_VERSION = 'v2';

export function buildCacheKey(key: string): string {
  return `${CACHE_VERSION}:${key}`;
}

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

type SWRState<T> = {
  data: T | null;
  isLoading: boolean;
  isFromCache: boolean;
};

/**
 * Stale-While-Revalidate con localStorage y versioning.
 *
 * 1. Renderiza desde cache INSTANTÁNEO (0ms) si existe y TTL no expiró.
 * 2. Si TTL expiró, sirve stale y fetch en background.
 * 3. Si no hay cache, muestra loading hasta que el fetch responda.
 * 4. Cache version prefix permite invalidar globalmente.
 */
export function useLocalStorageSWR<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  _ttlMs = 10 * 60 * 1000,
): SWRState<T> {
  const [state, setState] = useState<SWRState<T>>({
    data: null,
    isLoading: true,
    isFromCache: false,
  });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const storageKey = buildCacheKey(cacheKey);

  const loadFromCache = useCallback((): { data: T | null; withinTTL: boolean } => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return { data: null, withinTTL: false };
      const entry: CacheEntry<T> = JSON.parse(raw);
      const elapsed = Date.now() - entry.timestamp;
      const withinTTL = elapsed < _ttlMs;
      return { data: entry.data, withinTTL };
    } catch {
      return { data: null, withinTTL: false };
    }
  }, [storageKey, _ttlMs]);

  useEffect(() => {
    let cancelled = false;

    const cached = loadFromCache();

    if (cached.data && cached.withinTTL) {
      setState({ data: cached.data, isLoading: false, isFromCache: true });
      return;
    }

    if (cached.data && !cached.withinTTL) {
      setState({ data: cached.data, isLoading: false, isFromCache: true });
    }

    fetcherRef
      .current()
      .then((fresh) => {
        if (cancelled) return;
        const entry: CacheEntry<T> = { data: fresh, timestamp: Date.now() };
        localStorage.setItem(storageKey, JSON.stringify(entry));
        setState({ data: fresh, isLoading: false, isFromCache: false });
      })
      .catch(() => {
        if (cancelled) return;
        if (!cached.data) {
          setState({ data: null, isLoading: false, isFromCache: false });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [storageKey, loadFromCache, _ttlMs]);

  return state;
}
