import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const lastPathname = useRef(pathname);

  useEffect(() => {
    // Caso 1: Cambio de página real sin ancla específica
    if (pathname !== lastPathname.current && !hash) {
      window.scrollTo(0, 0);
    }
    
    // Caso 2: Cambio de página con ancla (ej: de Proyectos a /#contact)
    // O cambio de ancla en la misma página
    if (hash) {
      // Dejamos un pequeño delay para que React termine de renderizar el DOM
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Si el elemento no existe todavía (por lazy loading), reintentamos un toque después
        const timeoutId = setTimeout(() => {
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return () => clearTimeout(timeoutId);
      }
    }

    lastPathname.current = pathname;
  }, [pathname, hash]);

  return null;
}
