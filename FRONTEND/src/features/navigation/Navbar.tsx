import { useState, type MouseEvent } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Menu, X } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { useTheme } from '@/features/theme';
import { useLanguage } from '@/features/language';
import type { Language } from '@/features/language';

interface NavbarProps {
  translations: {
    nav: {
      home: string;
      about: string;
      projects: string;
      stats: string;
      contact: string;
      downloadCV: string;
    };
  };
}

export function Navbar({ translations }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  const isHome = location.pathname === '/';

  const navItems = [
    { key: 'home', path: '/', label: translations.nav.home },
    { key: 'about', path: '/#about', label: translations.nav.about },
    { key: 'projects', path: '/projects', label: translations.nav.projects },
    { key: 'stats', path: '/stats', label: translations.nav.stats },
    { key: 'contact', path: '/#contact', label: translations.nav.contact },
  ] as const;

  const handleNavClick = (path: string) => {
    setIsMobileMenuOpen(false);
    if (path.startsWith('/#')) {
      const hash = path.slice(2);
      if (location.pathname === '/') {
        const el = document.getElementById(hash);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 text-sm transition-colors hover:text-violet-600 dark:hover:text-violet-400 ${
      isActive ? 'text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400' : 'text-gray-500 dark:text-gray-400'
    }`;

  return (
    <nav className="bg-white/95 dark:bg-gray-950/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="shrink-0">
            <Link to="/" className="text-violet-600 dark:text-violet-400 font-semibold hover:opacity-90">
              Portfolio
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              {navItems.map((item) => {
                if (item.path.startsWith('/#')) {
                  const isActive = isHome && location.hash === `#${item.key}`;
                  return (
                    <Link
                      key={item.key}
                      to={item.path}
                      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                        if (location.pathname === '/') {
                          e.preventDefault();
                          document.getElementById(item.key)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                        handleNavClick(item.path);
                      }}
                      className={linkClass({ isActive })}
                    >
                      {item.label}
                    </Link>
                  );
                }
                return (
                  <NavLink
                    key={item.key}
                    to={item.path}
                    end={item.path === '/'}
                    className={linkClass}
                  >
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
            <Select value={language} onValueChange={(v: string) => setLanguage(v as Language)}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">ES</SelectItem>
                <SelectItem value="en">EN</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              {translations.nav.downloadCV}
            </Button>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200 dark:border-gray-800">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  to={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`block px-3 py-2 text-base w-full text-left transition-colors hover:text-violet-600 dark:hover:text-violet-400 ${
                    (item.path === '/' && location.pathname === '/') || (item.path !== '/' && location.pathname === item.path)
                      ? 'text-violet-600 dark:text-violet-400 bg-gray-100 dark:bg-gray-800'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Theme:</span>
                  <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
                </div>
                <Select value={language} onValueChange={(v: string) => setLanguage(v as Language)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="gap-2 w-full">
                  <FileText className="h-4 w-4" />
                  {translations.nav.downloadCV}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
