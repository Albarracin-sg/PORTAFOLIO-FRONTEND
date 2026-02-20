import { useEffect, useState } from 'react';
import { useLanguage } from '@/features/language';
import Statistics from '@/components/Statistics';
import { fetchPublicPage } from '@/shared/api/public';

export function StatsPage() {
  const { translations } = useLanguage();
  const [section, setSection] = useState<{ id: string; type: string; content: Record<string, unknown> } | undefined>(
    undefined,
  );

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        const page = await fetchPublicPage('stats');
        if (!isActive) return;
        const section = page.sections.find((item) => item.type === 'STATS');
        setSection(section ? { id: section.id, type: section.type, content: section.content } : undefined);
        if (import.meta.env.DEV) {
          console.debug('[StatsPage] section', section);
        }
      } catch {
        if (!isActive) return;
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Statistics translations={translations} section={section} />
    </div>
  );
}
