import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Check, FileText, Menu, Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLoginModal } from "@/features/admin/AdminLoginModal";
import { useAdminAuth } from "@/features/admin/AdminAuthProvider";
import ThemeToggle from "./ThemeToggle";
import { useTranslation } from "react-i18next";
import logoImg from "@/assets/logo.png";
import cvPdf from "@/assets/cv/JUAN_ALBARRACIN_CV.pdf";
import type { Language } from "@/features/language";

interface NavbarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isDark: boolean;
  onThemeToggle: () => void;
}

export default function Navbar({
  currentPage,
  onPageChange,
  language,
  onLanguageChange,
  isDark,
  onThemeToggle,
}: NavbarProps) {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const lockedScrollY = useRef(0);
  const { token } = useAdminAuth();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 24) {
        setIsVisible(true);
      } else if (currentScrollY < lastScrollY.current) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        setIsVisible(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      const previousScrollY = lockedScrollY.current;

      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";

      if (previousScrollY) {
        window.scrollTo(0, previousScrollY);
      }

      return;
    }

    lockedScrollY.current = window.scrollY;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${lockedScrollY.current}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    return () => {
      const previousScrollY = lockedScrollY.current;

      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";

      if (previousScrollY) {
        window.scrollTo(0, previousScrollY);
      }
    };
  }, [isMobileMenuOpen]);

  const navItems = [
    { key: "home", label: t("nav.home") },
    { key: "about", label: t("nav.about") },
    { key: "projects", label: t("nav.projects") },
    { key: "stats", label: t("nav.stats") },
    { key: "contact", label: t("nav.contact") },
  ];

  const languageOptions = [
    { value: "es", label: "Español", flag: "🇨🇴", shortLabel: "ES" },
    { value: "en", label: "English", flag: "🇺🇸", shortLabel: "EN" },
  ] as const;

  const currentLanguage =
    languageOptions.find((option) => option.value === language) ?? languageOptions[0];

  const themeLabel = language === "es" ? "Tema" : "Theme";

  const themeModeLabel = isDark
    ? language === "es"
      ? "Claro"
      : "Light"
    : language === "es"
      ? "Oscuro"
      : "Dark";

  const themeAriaLabel = isDark
    ? language === "es"
      ? "Cambiar a modo claro"
      : "Switch to light mode"
    : language === "es"
      ? "Cambiar a modo oscuro"
      : "Switch to dark mode";

  const activeLogo = isDark ? "/logoNigth.png" : logoImg;

  const mobileSurfaceClass = isDark
    ? "bg-background text-white border-white/10"
    : "bg-background text-slate-900 border-slate-200";

  const mobileMutedClass = isDark ? "text-white/70" : "text-slate-500";

  const mobileActionButtonClass = isDark
    ? "bg-white/[0.04] text-white/80 hover:bg-white/[0.08]"
    : "bg-slate-50 text-slate-700 hover:bg-slate-100";

  const mobileActiveButtonClass = isDark
    ? "bg-violet-500/15 text-violet-300 shadow-[0_0_0_1px_rgba(139,92,246,0.22)]"
    : "bg-violet-50 text-violet-700 shadow-[0_0_0_1px_rgba(139,92,246,0.12)]";

  const scrollToSection = (sectionId: string) => {
    if (sectionId === "stats") {
      onPageChange("stats");
      return;
    }

    if (sectionId === "home") {
      onPageChange("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (currentPage === "stats" || currentPage === "all-projects") {
      onPageChange(sectionId);

      setTimeout(() => {
        const element = document.getElementById(sectionId);

        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);

      return;
    }

    const element = document.getElementById(sectionId);

    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      onPageChange(sectionId);
    }
  };

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 min-h-[4.5rem]">
            <div className="flex-shrink-0">
              <Link
                to="/"
                onClick={() => scrollToSection("home")}
                className="cursor-pointer bg-transparent border-none p-0 block"
              >
                <img src={activeLogo} alt="Juan Albarracín" className="h-12 w-auto" />
              </Link>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {navItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => scrollToSection(item.key)}
                    className={`relative px-3 py-2 text-sm transition-colors after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-[calc(100%-1.5rem)] after:-translate-x-1/2 after:rounded-full after:bg-violet-500 after:transition-transform after:duration-300 ${
                      currentPage === item.key
                        ? "text-primary after:scale-x-100"
                        : "text-muted-foreground after:scale-x-0 hover:text-primary hover:after:scale-x-100"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <ThemeToggle isDark={isDark} onToggle={onThemeToggle} />

              <Select value={language} onValueChange={onLanguageChange}>
                <SelectTrigger className="w-24 cursor-pointer">
                  <SelectValue>
                    <span className="flex items-center gap-2 whitespace-nowrap">
                      <span>{currentLanguage.flag}</span>
                      <span>{currentLanguage.shortLabel}</span>
                    </span>
                  </SelectValue>
                </SelectTrigger>

                <SelectContent>
                  {languageOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="cursor-pointer"
                    >
                      <span className="flex items-center gap-2 whitespace-nowrap">
                        <span>{option.flag}</span>
                        <span>{option.shortLabel}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {token ? (
                <Button variant="outline" className="gap-2" asChild>
                  <Link to="/admin">Admin</Link>
                </Button>
              ) : (
                <AdminLoginModal />
              )}

              <Button variant="outline" className="gap-2" asChild>
                <a href={cvPdf} target="_blank" rel="noreferrer">
                  <FileText className="h-4 w-4" />
                  {t("nav.downloadCV")}
                </a>
              </Button>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={`rounded-xl border p-2.5 shadow-sm transition-all duration-300 ${
                  isDark
                    ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-[70] bg-background transition-opacity md:hidden ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <aside
          className={`absolute inset-0 flex h-full w-full max-w-none flex-col border-l shadow-2xl opacity-100 transition-transform duration-300 ${mobileSurfaceClass} ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{ overscrollBehavior: "contain" }}
        >
          <div className={`flex items-center justify-between border-b px-5 py-5 ${mobileSurfaceClass}`}>
            <Link
              to="/"
              onClick={() => {
                scrollToSection("home");
                setIsMobileMenuOpen(false);
              }}
            >
              <img src={activeLogo} alt="Juan Albarracín" className="h-10 w-auto" />
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-sm font-medium transition-colors ${mobileMutedClass}`}
            >
              Cerrar
            </button>
          </div>

          <div
            className="flex-1 overflow-y-auto bg-background px-5 py-5"
            style={{ overscrollBehavior: "contain" }}
          >
            <div className="space-y-2">
              {navItems.map((item, index) => (
                <button
                  key={item.key}
                  onClick={() => {
                    scrollToSection(item.key);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full rounded-2xl px-4 py-4 text-left text-base font-medium transition-all duration-300 ${
                    currentPage === item.key
                      ? isDark
                        ? "bg-violet-500/15 text-violet-300 shadow-[0_0_0_1px_rgba(139,92,246,0.22)]"
                        : "bg-violet-50 text-violet-700 shadow-[0_0_0_1px_rgba(139,92,246,0.12)]"
                      : isDark
                        ? "bg-white/[0.04] text-white/80 hover:bg-white/[0.08]"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                  style={{
                    transform: isMobileMenuOpen ? "translateY(0)" : "translateY(10px)",
                    opacity: isMobileMenuOpen ? 1 : 0,
                    transitionDelay: isMobileMenuOpen ? `${index * 40}ms` : "0ms",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-2">
              <button
                type="button"
                onClick={onThemeToggle}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left text-base font-medium transition-all duration-300 ${mobileActionButtonClass}`}
                aria-label={themeAriaLabel}
              >
                <span className="flex items-center gap-3">
                  {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
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
                    className={`flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left text-base font-medium transition-all duration-300 ${
                      isActive ? mobileActiveButtonClass : mobileActionButtonClass
                    }`}
                    aria-pressed={isActive}
                  >
                    <span className="flex items-center gap-3">
                      <span>{option.flag}</span>
                      <span>{option.label}</span>
                    </span>

                    {isActive ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className={`text-sm ${mobileMutedClass}`}>
                        {option.shortLabel}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`border-t px-5 py-5 ${mobileSurfaceClass}`}>
            <div className="space-y-3">
              {token ? (
                <Button
                  variant="outline"
                  className={`w-full gap-2 ${
                    isDark
                      ? "border-white/10 bg-[#13253a] text-white hover:bg-[#17304a]"
                      : "border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100"
                  }`}
                  asChild
                >
                  <Link to="/admin">Admin</Link>
                </Button>
              ) : (
                <AdminLoginModal triggerLabel="Admin" triggerClassName="w-full" />
              )}

              <Button
                variant="outline"
                className={`w-full gap-2 ${
                  isDark
                    ? "border-white/10 bg-[#13253a] text-white hover:bg-[#17304a]"
                    : "border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100"
                }`}
                asChild
              >
                <a href={cvPdf} target="_blank" rel="noreferrer">
                  <FileText className="h-4 w-4" />
                  {t("nav.downloadCV")}
                </a>
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}