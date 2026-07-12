import { Menu } from "lucide-react";
import { useEffect, useRef, useReducer } from "react";
import { useAdminAuth } from "@/features/admin/AdminAuthProvider";
import { useTranslation } from "react-i18next";
import logoImg from "@/assets/logo.webp";
import cvPdf from "@/assets/cv/JUAN_ALBARRACIN_CV.pdf";
import type { Language } from "@/features/language";

// Sub-components
import { NavBrand } from "./Navbar/NavBrand";
import { NavLinks } from "./Navbar/NavLinks";
import { DesktopActions } from "./Navbar/DesktopActions";
import { MobileMenu } from "./Navbar/MobileMenu";

interface NavbarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isDark: boolean;
  onThemeToggle: () => void;
  isChangingLang?: boolean;
}

interface NavbarState {
  isMobileMenuOpen: boolean;
  isVisible: boolean;
}

type NavbarAction =
  | { type: "TOGGLE_MOBILE_MENU"; payload: boolean }
  | { type: "SET_VISIBLE"; payload: boolean };

function navbarReducer(state: NavbarState, action: NavbarAction): NavbarState {
  switch (action.type) {
    case "TOGGLE_MOBILE_MENU":
      return { ...state, isMobileMenuOpen: action.payload };
    case "SET_VISIBLE":
      return { ...state, isVisible: action.payload };
    default:
      return state;
  }
}

export default function Navbar({
  currentPage,
  onPageChange,
  language,
  onLanguageChange,
  isDark,
  onThemeToggle,
  isChangingLang,
}: NavbarProps) {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(navbarReducer, {
    isMobileMenuOpen: false,
    isVisible: true,
  });

  const { isMobileMenuOpen, isVisible } = state;
  const lastScrollY = useRef(0);
  const visibleAnchorY = useRef(0);
  const lockedScrollY = useRef(0);
  const { token, logout } = useAdminAuth();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 24) {
        dispatch({ type: "SET_VISIBLE", payload: true });
        visibleAnchorY.current = currentScrollY;
      } else if (currentScrollY < lastScrollY.current) {
        dispatch({ type: "SET_VISIBLE", payload: true });
        visibleAnchorY.current = currentScrollY;
      } else if (currentScrollY - visibleAnchorY.current > 48) {
        dispatch({ type: "SET_VISIBLE", payload: false });
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      const previousScrollY = lockedScrollY.current;
      Object.assign(document.documentElement.style, { overflow: "" });
      Object.assign(document.body.style, {
        overflow: "",
        position: "",
        top: "",
        left: "",
        right: "",
        width: ""
      });
      if (previousScrollY) window.scrollTo(0, previousScrollY);
      return;
    }
    lockedScrollY.current = window.scrollY;
    Object.assign(document.documentElement.style, { overflow: "hidden" });
    Object.assign(document.body.style, {
      overflow: "hidden",
      position: "fixed",
      top: `-${lockedScrollY.current}px`,
      left: "0",
      right: "0",
      width: "100%"
    });
    return () => {
      const previousScrollY = lockedScrollY.current;
      Object.assign(document.documentElement.style, { overflow: "" });
      Object.assign(document.body.style, {
        overflow: "",
        position: "",
        top: "",
        left: "",
        right: "",
        width: ""
      });
      if (previousScrollY) window.scrollTo(0, previousScrollY);
    };
  }, [isMobileMenuOpen]);

  const navItems = [
    { key: "home", label: t("nav.home") },
    { key: "about", label: t("nav.about") },
    { key: "projects", label: t("nav.projects") },
    { key: "blog", label: t("nav.blog") },
    { key: "stats", label: t("nav.stats") },
    { key: "contact", label: t("nav.contact") },
  ];

  const languageOptions = [
    { value: "es", label: "Español", flag: "🇨🇴", shortLabel: "ES" },
    { value: "en", label: "English", flag: "🇺🇸", shortLabel: "EN" },
  ] as const;

  const activeLogo = isDark ? "/logoNigth.webp" : logoImg;
const logoSizes = isDark ? "h-16 w-auto" : "h-14 w-auto";

  const scrollToSection = (sectionId: string) => {
    if (sectionId === "home") {
      onPageChange("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
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
        className={`fixed inset-x-0 top-0 z-50 bg-background/95 dark:bg-transparent backdrop-blur supports-[backdrop-filter]:bg-background/80 dark:supports-[backdrop-filter]:bg-transparent transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 min-h-[4.5rem]">
            <NavBrand logo={activeLogo} onClick={() => scrollToSection("home")} className={logoSizes} />

            <NavLinks items={navItems} currentPage={currentPage} />

            <DesktopActions
              isDark={isDark}
              onThemeToggle={onThemeToggle}
              language={language}
              onLanguageChange={onLanguageChange}
              languageOptions={languageOptions}
              isChangingLang={isChangingLang}
              token={token}
              logout={logout}
              cvPdf={cvPdf}
              t={t}
            />

            <div className="md:hidden">
              <button
                aria-label="Open menu"
                onClick={() => dispatch({ type: "TOGGLE_MOBILE_MENU", payload: true })}
                className={`rounded-xl border p-2.5 shadow-sm transition-all duration-300 cursor-pointer ${
                  isDark
                    ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                    : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                <Menu className="size-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => dispatch({ type: "TOGGLE_MOBILE_MENU", payload: false })}
        isDark={isDark}
        navItems={navItems}
        currentPage={currentPage}
        onPageChange={onPageChange}
        logo={activeLogo}
        logoClassName={logoSizes}
        onThemeToggle={onThemeToggle}
        language={language}
        onLanguageChange={onLanguageChange}
        languageOptions={languageOptions}
        isChangingLang={isChangingLang}
        token={token}
        logout={logout}
        cvPdf={cvPdf}
        t={t}
      />
    </>
  );
}
