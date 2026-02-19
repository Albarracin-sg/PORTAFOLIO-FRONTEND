import { useEffect, useState } from 'react';
import { useLanguage } from '@/features/language';
import Statistics from '@/components/Statistics';
import { fetchPublicPage } from '@/shared/api/public';

export function StatsPage() {
  const { translations } = useLanguage();
  const [content, setContent] = useState<Record<string, unknown> | undefined>(undefined);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        const page = await fetchPublicPage('stats');
        if (!isActive) return;
        const section = page.sections.find((item) => item.type === 'STATS');
        setContent(section?.content ?? undefined);
      } catch {
        if (!isActive) return;
        setContent(undefined);
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Statistics translations={translations} content={content} />
    </div>
  );
}
