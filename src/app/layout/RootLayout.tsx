import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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
  const { language, setLanguage, isChangingLang } = useLanguage();
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

  const isChatbot = pathname === '/chatbot';

  return (
    <div className="min-h-screen bg-background dark:bg-gray-950 relative text-foreground flex flex-col">
      {/* Skip link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-violet-600 focus:px-4 focus:py-2 focus:text-white focus:font-medium focus:outline-none focus:ring-2 focus:ring-violet-300"
      >
        Saltar al contenido principal
      </a>
      <DynamicBackground />
      <Navbar
        currentPage={currentPage}
        onPageChange={onPageChange}
        language={language}
        onLanguageChange={setLanguage}
        isDark={isDark}
        onThemeToggle={toggleTheme}
        isChangingLang={isChangingLang}
      />
      <main id="main-content" className="flex-grow outline-none flex flex-col" tabIndex={-1}>
        <Outlet />
      </main>
      {!isChatbot && (
        <>
          <Footer
            isDark={isDark}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
          <FloatingContactButton />
        </>
      )}
      <Toaster />
    </div>
  );
}
