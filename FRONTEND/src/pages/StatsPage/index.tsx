import { useLanguage } from '@/features/language';
import Statistics from '@/components/Statistics';

export function StatsPage() {
  const { translations } = useLanguage();
  return (
    <div className="min-h-screen">
      <Statistics translations={translations} />
    </div>
  );
}
