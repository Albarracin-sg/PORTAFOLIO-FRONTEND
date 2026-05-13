import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { FileText, Loader2, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { AdminLoginModal } from "@/features/admin/AdminLoginModal";
import ThemeToggle from "../ThemeToggle";
import type { Language } from "@/features/language";

interface LanguageOption {
  value: Language;
  label: string;
  flag: string;
  shortLabel: string;
}

interface DesktopActionsProps {
  isDark: boolean;
  onThemeToggle: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  languageOptions: readonly LanguageOption[];
  currentLanguage: LanguageOption;
  isChangingLang?: boolean;
  token: string | null;
  logout: () => void;
  cvPdf: string;
  t: (key: string) => string;
}

export function DesktopActions({
  isDark,
  onThemeToggle,
  language,
  onLanguageChange,
  languageOptions,
  currentLanguage,
  isChangingLang,
  token,
  logout,
  cvPdf,
  t,
}: DesktopActionsProps) {
  return (
    <div className="hidden md:flex items-center gap-x-4">
      <ThemeToggle isDark={isDark} onToggle={onThemeToggle} />

      <Select value={language} onValueChange={onLanguageChange}>
        <SelectTrigger className="w-24 cursor-pointer rounded-2xl transition-all duration-300 hover:scale-105 border-zinc-200 dark:border-white/10">
          <SelectValue>
            {isChangingLang ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <span className="flex items-center gap-2 whitespace-nowrap">
                <span>{currentLanguage.flag}</span>
                <span>{currentLanguage.shortLabel}</span>
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {languageOptions.map((option) => (
            <SelectItem key={option.value} value={option.value} className="cursor-pointer">
              <span className="flex items-center gap-2 whitespace-nowrap">
                <span>{option.flag}</span>
                <span>{option.shortLabel}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {token ? (
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 cursor-pointer rounded-2xl transition-all duration-300 hover:scale-105 hover:border-violet-400 hover:text-violet-600 dark:hover:border-violet-500 dark:hover:text-violet-400" asChild>
            <Link to="/admin">Admin</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logout()}
            className="size-10 rounded-2xl text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-300 hover:scale-105"
            title="Logout"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      ) : (
        <AdminLoginModal 
          triggerLabel="Admin"
          triggerClassName="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium border border-zinc-200 bg-white text-zinc-700 rounded-2xl transition-all duration-300 hover:scale-105 hover:border-violet-400 hover:text-violet-600 dark:border-white/10 dark:bg-transparent dark:text-zinc-300 dark:hover:border-violet-500 dark:hover:text-violet-400" 
        />
      )}

      <Button variant="outline" className="gap-2 cursor-pointer rounded-2xl transition-all duration-300 hover:scale-105 hover:border-violet-400 hover:text-violet-600 dark:hover:border-violet-500 dark:hover:text-violet-400" asChild>
        <a href={cvPdf} target="_blank" rel="noreferrer">
          <FileText className="size-4" />
          {t("nav.downloadCV")}
        </a>
      </Button>
    </div>
  );
}
