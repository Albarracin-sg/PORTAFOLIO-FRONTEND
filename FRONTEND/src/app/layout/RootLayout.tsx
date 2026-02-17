import { Outlet } from 'react-router-dom';
import { Navbar } from '@/features/navigation/Navbar';
import DynamicBackground from '@/components/DynamicBackground';
import FloatingContactButton from '@/components/FloatingContactButton';
import { Toaster } from '@/components/ui/sonner';
import { useLanguage } from '@/features/language';

export function RootLayout() {
  const { language, translations } = useLanguage();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 relative">
      <DynamicBackground />
      <Navbar translations={translations} />
      <main>
        <Outlet />
      </main>
      <FloatingContactButton />
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-gray-500 dark:text-gray-400">
          <p>
            © 2024 Juan Pérez.{' '}
            {language === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}
          </p>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}
