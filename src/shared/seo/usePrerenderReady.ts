import { useEffect, useRef } from 'react';

export function usePrerenderReady(ready: boolean, delayMs = 150) {
  const dispatchedRef = useRef(false);

  useEffect(() => {
    if (!ready || dispatchedRef.current) return;

    const timer = window.setTimeout(() => {
      document.dispatchEvent(new Event('app-rendered'));
      dispatchedRef.current = true;
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [delayMs, ready]);
}
