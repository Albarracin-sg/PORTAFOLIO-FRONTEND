import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, FolderOpen, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/features/language';
import { useTranslation } from 'react-i18next';
import InteractiveParticles from '@/components/InteractiveParticles';

export function NotFoundPage() {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const isEs = language === 'es';

  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0">
        <InteractiveParticles />
      </div>

      <div className="relative z-10 text-center max-w-2xl bg-white/5 dark:bg-gray-900/20 backdrop-blur-sm p-8 rounded-3xl border border-gray-200/20 dark:border-gray-700/30 shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-violet-100 dark:bg-violet-900/30 rounded-2xl ring-1 ring-violet-200 dark:ring-violet-500/20">
            <AlertCircle className="h-12 w-12 text-violet-600 dark:text-violet-400 animate-pulse" />
          </div>
        </div>

        <h1 className="text-9xl font-black bg-gradient-to-b from-violet-400 to-violet-700 bg-clip-text text-transparent mb-2 select-none">
          404
        </h1>
        
        <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100 tracking-tight">
          {isEs ? '¿Te perdiste en el espacio?' : 'Lost in space?'}
        </h2>
        
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-md mx-auto">
          {isEs
            ? 'La ruta que buscas no existe. Parece que un agujero negro se la tragó.'
            : 'The page you are looking for does not exist. It seems a black hole swallowed it.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="gap-2 bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20 px-8">
            <Link to="/">
              <Home className="h-5 w-5" />
              {isEs ? 'Volver al inicio' : 'Back to home'}
            </Link>
          </Button>
          <Button variant="outline" asChild size="lg" className="gap-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 px-8">
            <Link to="/projects">
              <FolderOpen className="h-5 w-5" />
              {t('nav.projects')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Decorative Orbs */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl" />
    </div>
  );
}
