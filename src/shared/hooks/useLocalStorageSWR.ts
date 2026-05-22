import { useEffect, useState, useRef, useCallback } from 'react';

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
 * Stale-While-Revalidate con localStorage.
 *
 * 1. Renderiza desde cache INSTANTÁNEO (0ms)
 * 2. Fetch en background
 * 3. Cuando el server responde → actualiza cache + UI
 *
 * El usuario SIEMPRE ve datos, incluso si Render está en cold start.
 */
export function useLocalStorageSWR<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  _ttlMs = 30 * 60 * 1000,
): SWRState<T> {
  const [state, setState] = useState<SWRState<T>>({
    data: null,
    isLoading: true,
    isFromCache: false,
  });
  const fetcherRef = useRef(fetcher);

  fetcherRef.current = fetcher;

  const loadFromCache = useCallback((): T | null => {
    try {
      const raw = localStorage.getItem(cacheKey);
      if (!raw) return null;
      const entry: CacheEntry<T> = JSON.parse(raw);
      // Si pasó TTL, igual servimos stale data — el fetch background lo refresca
      return entry.data;
    } catch {
      return null;
    }
  }, [cacheKey]);

  useEffect(() => {
    let cancelled = false;

    // 1. Carga instantánea desde localStorage
    const cached = loadFromCache();
    if (cached) {
      setState({ data: cached, isLoading: false, isFromCache: true });
    }

    // 2. Fetch en background (siempre, refresh)
    fetcherRef
      .current()
      .then((fresh) => {
        if (cancelled) return;
        // Guardar en localStorage
        const entry: CacheEntry<T> = { data: fresh, timestamp: Date.now() };
        localStorage.setItem(cacheKey, JSON.stringify(entry));
        setState({ data: fresh, isLoading: false, isFromCache: false });
      })
      .catch(() => {
        if (cancelled) return;
        // Si NO teníamos cache → mostrar loading paró acá
        // Si SÍ teníamos cache → ya mostramos datos, no hay problema
        if (!cached) {
          setState({ data: null, isLoading: false, isFromCache: false });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [cacheKey, loadFromCache]);

  return state;
}
