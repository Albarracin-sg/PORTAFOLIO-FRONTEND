import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, FolderOpen } from 'lucide-react';
import { useLanguage } from '@/features/language';
import { useTranslation } from 'react-i18next';

export function NotFoundPage() {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const isEs = language === 'es';

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-bold text-violet-600 dark:text-violet-400 mb-2">404</h1>
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          {isEs ? 'Página no encontrada' : 'Page not found'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {isEs
            ? 'La ruta que buscas no existe o ha sido movida.'
            : 'The page you are looking for does not exist or has been moved.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              {isEs ? 'Volver al inicio' : 'Back to home'}
            </Link>
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link to="/projects">
              <FolderOpen className="h-4 w-4" />
              {t('nav.projects')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
