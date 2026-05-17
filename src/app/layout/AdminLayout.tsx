import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/features/admin/AdminAuthProvider';
import DynamicBackground from '@/components/DynamicBackground';
import ThemeToggle from '@/components/ThemeToggle';
import { useLanguage } from '@/features/language';
import { useTheme } from '@/features/theme';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LayoutDashboard, FolderKanban, MessageSquare, LogOut, Loader2, Menu, Moon, Sun, X, Activity, Bot } from 'lucide-react';
import { useState } from 'react';
import logoImg from '@/assets/logo.webp';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Projects', href: '/admin/projects', icon: FolderKanban },
  { label: 'Messages', href: '/admin/messages', icon: MessageSquare },
  { label: 'Bot', href: '/admin/bot-messages', icon: Bot },
  { label: 'Logs', href: '/admin/logs', icon: Activity },
];

export function AdminLayout() {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { language, setLanguage, isChangingLang } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    navigate('/', { replace: true });
    // Usamos un pequeño delay para asegurar que la navegación empiece antes de limpiar el estado
    setTimeout(() => {
      logout();
    }, 0);
  };

  const languageOptions = [
    { value: 'es', label: 'Español', flag: '🇨🇴', shortLabel: 'ES' },
    { value: 'en', label: 'English', flag: '🇺🇸', shortLabel: 'EN' },
  ] as const;

  const currentLanguage = languageOptions.find((opt) => opt.value === language) ?? languageOptions[0];
  const activeLogo = isDark ? '/logoNigth.webp' : logoImg;

  const mobileSurfaceClass = isDark
    ? 'bg-background text-white border-white/10'
    : 'bg-background text-zinc-900 border-zinc-200';
  const mobileMutedClass = isDark ? 'text-white/70' : 'text-zinc-500';
  const mobileActionButtonClass = isDark
    ? 'bg-white/[0.04] text-white/80 hover:bg-white/[0.08]'
    : 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100';
  const mobileActiveButtonClass = isDark
    ? 'bg-violet-500/15 text-violet-300 shadow-[0_0_0_1px_rgba(139,92,246,0.22)]'
    : 'bg-violet-50 text-violet-700 shadow-[0_0_0_1px_rgba(139,92,246,0.12)]';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      <DynamicBackground />

      {/* ── Header ── */}
      <header className="fixed inset-x-0 top-0 z-50 bg-background/95 dark:bg-transparent backdrop-blur supports-[backdrop-filter]:bg-background/80 dark:supports-[backdrop-filter]:bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[4.5rem]">

            {/* Left: logo + nav items desktop */}
            <div className="flex items-center gap-8">
              <Link to="/" className="shrink-0 block">
                <img src={activeLogo} alt="Juan Albarracín" className="h-11 w-auto" />
              </Link>

              <nav className="hidden md:flex items-baseline gap-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`relative flex items-center gap-2 px-3 py-2 text-sm transition-colors
                        after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-[calc(100%-1.5rem)]
                        after:-translate-x-1/2 after:rounded-full after:bg-violet-500 after:transition-transform after:duration-300
                        ${isActive
                          ? 'text-foreground after:scale-x-100'
                          : 'text-muted-foreground after:scale-x-0 hover:text-foreground hover:after:scale-x-100'
                        }`}
                    >
                      <Icon className="size-3.5 shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right: controls desktop */}
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle isDark={isDark} onToggle={toggleTheme} />

              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-24 cursor-pointer rounded-2xl transition-all duration-300 hover:scale-105 border-zinc-200 dark:border-white/10 h-9 text-sm">
                  <SelectValue>
                    {isChangingLang ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2">
                        <span>{currentLanguage.flag}</span>
                        <span>{currentLanguage.shortLabel}</span>
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center gap-2">
                        <span>{option.flag}</span>
                        <span>{option.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2 rounded-2xl transition-all duration-300 hover:scale-105 text-red-500 border-zinc-200 dark:border-white/10 hover:border-red-300 hover:bg-red-50 dark:hover:border-red-500/30 dark:hover:bg-red-900/10 dark:hover:text-red-400"
              >
                <LogOut className="size-4" />
                <span className="text-sm font-medium">Logout</span>
              </Button>
            </div>

            {/* Hamburger mobile */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={`rounded-xl border p-2.5 shadow-sm transition-all duration-300 cursor-pointer ${
                  isDark
                    ? 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <Menu className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 pt-[4.5rem] md:pt-[5.5rem] px-4 sm:px-6 lg:px-8 pb-28 md:pb-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* ── Mobile pill nav (bottom) ── */}
      <nav className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-2 py-1.5 rounded-2xl bg-background/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-xl shadow-black/10 border border-zinc-200/80 dark:border-white/[0.08]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/30'
                  : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.06]'
              }`}
            >
              <Icon className="size-4 shrink-0" />
              {isActive && <span className="text-xs font-semibold">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* ── Mobile slide-in menu ── */}
      <div className={`fixed inset-0 z-[70] md:hidden ${isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <button
          type="button"
          className={`absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close menu"
        />
        <aside
          className={`absolute inset-y-0 right-0 flex w-full flex-col border-l shadow-2xl transition-transform duration-300 ${mobileSurfaceClass} ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ overscrollBehavior: 'contain' }}
        >
          {/* Header del drawer */}
          <div className={`flex items-center justify-between border-b px-5 py-4 ${mobileSurfaceClass}`}>
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
              <img src={activeLogo} alt="Juan Albarracín" className="h-9 w-auto" />
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className={`size-9 flex items-center justify-center rounded-xl transition-colors cursor-pointer bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 ${mobileMutedClass}`}
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
          </div>

          <div
            className="flex-1 overflow-y-auto px-5 py-6"
            style={{ overscrollBehavior: 'contain' }}
          >
            {/* Nav items */}
            <div className="space-y-1.5">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 w-full rounded-2xl p-4 text-base font-medium transition-all duration-300 cursor-pointer ${
                      isActive ? mobileActiveButtonClass : mobileActionButtonClass
                    }`}
                    style={{
                      transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(10px)',
                      opacity: isMobileMenuOpen ? 1 : 0,
                      transitionDelay: isMobileMenuOpen ? `${index * 40}ms` : '0ms',
                    }}
                  >
                    <Icon className="size-5 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Theme + language */}
            <div className="mt-6 space-y-2">
              <button
                type="button"
                onClick={toggleTheme}
                className={`flex w-full items-center justify-between rounded-2xl p-4 text-base font-medium transition-all duration-300 cursor-pointer ${mobileActionButtonClass}`}
              >
                <span className="flex items-center gap-3">
                  {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
                  <span>{language === 'es' ? 'Tema' : 'Theme'}</span>
                </span>
                <span className={`text-sm ${mobileMutedClass}`}>
                  {isDark
                    ? language === 'es' ? 'Claro' : 'Light'
                    : language === 'es' ? 'Oscuro' : 'Dark'}
                </span>
              </button>

              {languageOptions.map((option) => {
                const isActive = language === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setLanguage(option.value)}
                    disabled={isChangingLang}
                    className={`flex w-full items-center justify-between rounded-2xl p-4 text-base font-medium transition-all duration-300 cursor-pointer ${
                      isActive ? mobileActiveButtonClass : mobileActionButtonClass
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      {isChangingLang && isActive
                        ? <Loader2 className="size-5 animate-spin" />
                        : <span>{option.flag}</span>
                      }
                      <span>{option.label}</span>
                    </span>
                    {isChangingLang && isActive
                      ? <span className={`text-sm ${mobileMutedClass}`}>…</span>
                      : isActive
                        ? <span className="size-4 rounded-full bg-violet-500 block" />
                        : <span className={`text-sm ${mobileMutedClass}`}>{option.shortLabel}</span>
                    }
                  </button>
                );
              })}
            </div>

            {/* Logout */}
            <div className="mt-6">
              <div className="flex items-center gap-3 px-2 mb-4">
                <div className={`h-px flex-1 ${isDark ? 'bg-white/10' : 'bg-zinc-200'}`} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${mobileMutedClass}`}>
                  {language === 'es' ? 'Cuenta' : 'Account'}
                </span>
                <div className={`h-px flex-1 ${isDark ? 'bg-white/10' : 'bg-zinc-200'}`} />
              </div>
              <button
                type="button"
                onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                className="flex w-full items-center justify-center gap-3 rounded-2xl p-4 text-base font-medium transition-all duration-300 cursor-pointer bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <LogOut className="size-5" />
                Logout
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
