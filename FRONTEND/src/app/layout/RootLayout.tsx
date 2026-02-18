import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import DynamicBackground from '@/components/DynamicBackground';
import FloatingContactButton from '@/components/FloatingContactButton';
import { Toaster } from '@/components/ui/sonner';
import { useLanguage } from '@/features/language';
import { useTheme } from '@/features/theme';

function getCurrentPage(pathname: string, hash: string): string {
  if (pathname === '/stats') return 'stats';
  if (pathname === '/projects') return 'all-projects';
  if (pathname === '/') {
    const h = hash.replace('#', '');
    return h && ['home', 'about', 'projects', 'contact'].includes(h) ? h : 'home';
  }
  return 'home';
}

export function RootLayout() {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, translations } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  const currentPage = getCurrentPage(pathname, hash);

  const onPageChange = (page: string) => {
    if (page === 'stats') {
      navigate('/stats');
      return;
    }
    if (page === 'projects' || page === 'all-projects') {
      if (pathname !== '/') navigate('/projects');
      return;
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-950 relative text-foreground">
      <DynamicBackground />
      <Navbar
        currentPage={currentPage}
        onPageChange={onPageChange}
        language={language}
        onLanguageChange={setLanguage}
        translations={translations}
        isDark={isDark}
        onThemeToggle={toggleTheme}
      />
      <main>
        <Outlet />
      </main>
      <FloatingContactButton />
      <footer className="border-t border-border dark:border-gray-800 py-8 px-4 sm:px-6 lg:px-8 bg-card/50 dark:bg-transparent">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground">
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
