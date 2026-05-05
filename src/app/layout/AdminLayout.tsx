import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/features/admin/AdminAuthProvider';
import DynamicBackground from '@/components/DynamicBackground';
import ThemeToggle from '@/components/ThemeToggle';
import { useLanguage } from '@/features/language';
import { useTheme } from '@/features/theme';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LayoutDashboard, Edit, FileText, FolderKanban, MessageSquare, LogOut, Loader2, Globe } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Live Editor', href: '/admin/live', icon: Edit },
  { label: 'Content', href: '/admin/content', icon: FileText },
  { label: 'Projects', href: '/admin/projects', icon: FolderKanban },
  { label: 'Messages', href: '/admin/messages', icon: MessageSquare },
];

export function AdminLayout() {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { language, setLanguage, isChangingLang } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const languageOptions = [
    { value: 'es', label: 'Español', flag: '🇨🇴', shortLabel: 'ES' },
    { value: 'en', label: 'English', flag: '🇺🇸', shortLabel: 'EN' },
  ] as const;

  const currentLanguage = languageOptions.find((opt) => opt.value === language) ?? languageOptions[0];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      <DynamicBackground />
      
      {/* Top Header */}
      <header className="h-16 border-b border-slate-200 dark:border-white/10 bg-background/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="font-bold text-xl bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Admin Panel
          </Link>
          <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-2 hidden md:block" />
          <span className="text-sm text-muted-foreground hidden md:block">
            {navItems.find(item => item.href === pathname)?.label || 'Admin'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />

          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-24 cursor-pointer rounded-xl h-9 border-slate-200 dark:border-white/10">
              <SelectValue>
                {isChangingLang ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
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
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl"
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 relative z-10">
        {/* Sidebar */}
        <aside className="w-64 hidden lg:flex flex-col border-r border-slate-200 dark:border-white/10 bg-background/40 backdrop-blur-sm p-4 sticky top-16 h-[calc(100vh-4rem)]">
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                      : 'text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/5 hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          
          <div className="pt-4 border-t border-slate-200 dark:border-white/10 mt-4">
            <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              System Health: Good
            </div>
          </div>
        </aside>

        {/* Mobile Nav Bar (Bottom) */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 h-16 border-t border-slate-200 dark:border-white/10 bg-background/80 backdrop-blur-md z-50 flex items-center justify-around px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                  isActive ? 'text-violet-600' : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 pb-24 lg:pb-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
