import { useLanguage } from '@/features/language';
import AllProjects from '@/components/AllProjects';

export function AllProjectsPage() {
  const { translations } = useLanguage();
  return (
    <div className="min-h-screen">
      <AllProjects translations={translations} />
    </div>
  );
}
