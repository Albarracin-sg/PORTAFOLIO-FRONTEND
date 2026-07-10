import { Link } from "react-router-dom";
import { Check, FileText, Loader2, LogOut, Moon, Sun, X } from "lucide-react";
import { AdminLoginModal } from "@/features/admin/AdminLoginModal";
import type { Language } from "@/features/language";

interface NavItem {
  key: string;
  label: string;
  isRoute?: boolean;
}

interface LanguageOption {
  value: Language;
  label: string;
  flag: string;
  shortLabel: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  navItems: NavItem[];
  currentPage: string;
  onPageChange: (page: string) => void;
  logo: string;
  logoClassName?: string;
  onThemeToggle: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  languageOptions: readonly LanguageOption[];
  isChangingLang?: boolean;
  token: string | null;
  logout: () => void;
  cvPdf: string;
  t: (key: string) => string;
}

export function MobileMenu({
  isOpen,
  onClose,
  isDark,
  navItems,
  currentPage,
  onPageChange,
  logo,
  logoClassName = "h-9 w-auto",
  onThemeToggle,
  language,
  onLanguageChange,
  languageOptions,
  isChangingLang,
  token,
  logout,
  cvPdf,
  t,
}: MobileMenuProps) {
  const themeLabel = language === "es" ? "Tema" : "Theme";
  const themeModeLabel = isDark
    ? language === "es" ? "Claro" : "Light"
    : language === "es" ? "Oscuro" : "Dark";
  const themeAriaLabel = isDark
    ? language === "es" ? "Cambiar a modo claro" : "Switch to light mode"
    : language === "es" ? "Cambiar a modo oscuro" : "Switch to dark mode";

  const mobileSurfaceClass = isDark
    ? "bg-background text-white border-white/10"
    : "bg-background text-zinc-900 border-zinc-200";
  const mobileMutedClass = isDark ? "text-white/70" : "text-zinc-500";
  const mobileActionButtonClass = isDark
    ? "bg-white/[0.04] text-white/80 hover:bg-white/[0.08]"
    : "bg-zinc-50 text-zinc-700 hover:bg-zinc-100";
  const mobileActiveButtonClass = isDark
    ? "bg-violet-500/15 text-violet-300 shadow-[0_0_0_1px_rgba(139,92,246,0.22)]"
    : "bg-violet-50 text-violet-700 shadow-[0_0_0_1px_rgba(139,92,246,0.12)]";

  const handleNavClick = (key: string) => {
    onPageChange(key);
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-[70] md:hidden ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <button
        type="button"
        className={`absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-label="Close menu"
      />
      <aside
        className={`absolute inset-y-0 right-0 flex h-[100dvh] w-full flex-col border-l shadow-2xl transition-transform duration-300 ${mobileSurfaceClass} ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ overscrollBehavior: "contain" }}
      >
        <div className={`flex items-center justify-between border-b px-5 py-4 ${mobileSurfaceClass}`}>
          <Link
            to="/"
            className="cursor-pointer"
            onClick={() => handleNavClick("home")}
          >
            <img src={logo} alt="Juan Albarracín" className={logoClassName} />
          </Link>
          <button
            onClick={onClose}
            className={`size-9 flex items-center justify-center rounded-xl transition-colors cursor-pointer bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 ${mobileMutedClass}`}
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto px-5 py-6 custom-scrollbar"
          style={{ overscrollBehavior: "contain" }}
        >
          <div className="space-y-1.5">
            {navItems.map((item, index) => (
              <Link
                key={item.key}
                to={item.isRoute ? `/${item.key}` : item.key === "stats" ? "/stats" : `/#${item.key}`}
                onClick={() => handleNavClick(item.key)}
                className={`block w-full rounded-2xl p-4 text-left text-base font-medium transition-all duration-300 cursor-pointer ${
                  currentPage === item.key || (currentPage === 'home' && item.key === 'home')
                    ? mobileActiveButtonClass
                    : mobileActionButtonClass
                }`}
                style={{
                  transform: isOpen ? "translateY(0)" : "translateY(10px)",
                  opacity: isOpen ? 1 : 0,
                  transitionDelay: isOpen ? `${index * 40}ms` : "0ms",
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mt-6 space-y-2">
            <button
              type="button"
              onClick={onThemeToggle}
              className={`flex w-full items-center justify-between rounded-2xl p-4 text-left text-base font-medium transition-all duration-300 cursor-pointer ${mobileActionButtonClass}`}
              aria-label={themeAriaLabel}
            >
              <span className="flex items-center gap-3">
                {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
                <span>{themeLabel}</span>
              </span>
              <span className={`text-sm ${mobileMutedClass}`}>{themeModeLabel}</span>
            </button>

            {languageOptions.map((option) => {
              const isActive = language === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onLanguageChange(option.value)}
                  className={`flex w-full items-center justify-between rounded-2xl p-4 text-left text-base font-medium transition-all duration-300 cursor-pointer ${
                    isActive ? mobileActiveButtonClass : mobileActionButtonClass
                  }`}
                  aria-pressed={isActive}
                  disabled={isChangingLang}
                >
                  <span className="flex items-center gap-3">
                    {isChangingLang && isActive ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <span>{option.flag}</span>
                    )}
                    <span>{option.label}</span>
                  </span>
                  {isChangingLang && isActive ? (
                    <span className={`text-sm ${mobileMutedClass}`}>Loading…</span>
                  ) : isActive ? (
                    <Check className="size-4" />
                  ) : (
                    <span className={`text-sm ${mobileMutedClass}`}>{option.shortLabel}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className={`h-px flex-1 ${isDark ? "bg-white/10" : "bg-zinc-200"}`} />
              <span className={`text-[10px] font-bold uppercase tracking-wider ${mobileMutedClass}`}>
                {language === "es" ? "Acciones" : "Actions"}
              </span>
              <div className={`h-px flex-1 ${isDark ? "bg-white/10" : "bg-zinc-200"}`} />
            </div>

            <div className="space-y-2">
              {token ? (
                <div className="space-y-2">
                  <Link
                    to="/admin"
                    onClick={() => handleNavClick("admin")}
                    className={`flex w-full items-center justify-center gap-3 rounded-2xl p-4 text-center text-base font-medium transition-all duration-300 cursor-pointer ${mobileActiveButtonClass}`}
                  >
                    <span className="flex size-5 items-center justify-center">
                      <span className="size-2 rounded-full bg-violet-500" />
                    </span>
                    Admin
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      onClose();
                    }}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl p-4 text-center text-base font-medium transition-all duration-300 cursor-pointer bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="size-5" />
                    Logout
                  </button>
                </div>
              ) : (
                <AdminLoginModal
                  triggerLabel="Admin"
                  onTriggerClick={onClose}
                  triggerClassName={`flex w-full items-center justify-center gap-3 rounded-2xl p-4 text-center text-base font-medium transition-all duration-300 cursor-pointer ${mobileActiveButtonClass}`}
                />
              )}

              <a
                href={cvPdf}
                target="_blank"
                rel="noreferrer"
                className={`flex w-full items-center justify-center gap-3 rounded-2xl p-4 text-center text-base font-medium transition-all duration-300 cursor-pointer ${mobileActiveButtonClass}`}
              >
                <FileText className="size-5" />
                {t("nav.downloadCV")}
              </a>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
