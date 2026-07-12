import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { FileText, LogOut, Moon, Settings, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { AdminLoginModal } from "@/features/admin/AdminLoginModal";
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
  isChangingLang,
  token,
  logout,
  cvPdf,
  t,
}: DesktopActionsProps) {
  return (
    <div className="hidden md:flex items-center gap-x-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="size-10 cursor-pointer rounded-2xl border-zinc-200 dark:border-white/10 transition-all duration-300 hover:scale-105 hover:border-violet-400 hover:text-violet-600 dark:hover:border-violet-500 dark:hover:text-violet-400"
            aria-label={t("nav.preferences")}
          >
            <Settings className="size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" sideOffset={8} className="w-48 rounded-xl border-zinc-200/70 bg-white/95 p-1.5 shadow-xl shadow-zinc-950/10 backdrop-blur dark:border-white/10 dark:bg-zinc-950/95 dark:shadow-black/30">
          <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2 pt-1.5 pb-1">
            {t("nav.preferences")}
          </DropdownMenuLabel>

          <button
            type="button"
            onClick={onThemeToggle}
            className={`mx-2 flex w-[calc(100%-1rem)] cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 transition-colors ${isDark ? "bg-white/[0.05] hover:bg-white/[0.08]" : "bg-zinc-100/80 hover:bg-zinc-200/80"}`}
          >
            <span className="text-xs font-medium text-muted-foreground">{t("nav.theme")}</span>
            <span className={`relative flex size-7 items-center justify-center overflow-hidden rounded-md ${isDark ? "bg-white/[0.08] text-violet-300" : "bg-white text-zinc-700 shadow-sm"}`}>
              <span
                className={`absolute inset-0 rounded-full transition-all duration-500 ease-in-out ${
                  isDark
                    ? "scale-100 bg-linear-to-br from-purple-500/20 to-blue-600/20"
                    : "scale-0 bg-linear-to-br from-orange-400/20 to-yellow-500/20"
                }`}
              />
              <Sun
                className={`absolute z-10 size-4 transition-all duration-500 ease-in-out ${
                  isDark ? "translate-y-7 rotate-90 opacity-0" : "translate-y-0 rotate-0 opacity-100"
                }`}
              />
              <Moon
                className={`absolute z-10 size-4 transition-all duration-500 ease-in-out ${
                  isDark ? "translate-y-0 rotate-0 opacity-100" : "-translate-y-7 -rotate-90 opacity-0"
                }`}
              />
            </span>
          </button>

          <div className={`mx-2 mt-1 flex items-center gap-1 rounded-lg p-1 ${isDark ? "bg-white/[0.05]" : "bg-zinc-100/80"}`}>
            {languageOptions.map((option) => {
              const isActive = language === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onLanguageChange(option.value)}
                  disabled={isChangingLang}
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? isDark
                        ? "bg-violet-500/20 text-violet-200 ring-1 ring-violet-400/40 shadow-sm"
                        : "bg-white text-violet-700 ring-1 ring-violet-200 shadow-sm"
                      : isDark
                        ? "text-white/60 hover:bg-white/[0.06] hover:text-white/80"
                        : "text-zinc-500 hover:bg-zinc-200/60 hover:text-zinc-700"
                  }`}
                  aria-pressed={isActive}
                >
                  <span>{option.flag}</span>
                  <span>{option.shortLabel}</span>
                </button>
              );
            })}
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2 pb-1">
            {t("nav.actions")}
          </DropdownMenuLabel>

          {token ? (
            <>
              <Link
                to="/admin"
                className={`mx-2 flex w-[calc(100%-1rem)] items-center gap-2 rounded-lg px-2.5 py-2 text-sm outline-hidden transition-colors ${isDark ? "bg-white/[0.05] hover:bg-white/[0.08]" : "bg-zinc-100/80 hover:bg-zinc-200/80"}`}
              >
                <span className="size-1.5 rounded-full bg-violet-500" />
                {t("nav.admin")}
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="mx-2 mt-1 flex w-[calc(100%-1rem)] cursor-pointer items-center gap-2 rounded-lg bg-red-500/10 px-2.5 py-2 text-sm text-red-500 outline-hidden transition-colors hover:bg-red-500/15 hover:text-red-600"
              >
                <LogOut className="size-4" />
                {t("nav.logout")}
              </button>
            </>
          ) : (
            <AdminLoginModal
              triggerLabel={t("nav.admin")}
              triggerClassName={`mx-2 flex w-[calc(100%-1rem)] items-center gap-2 rounded-lg px-2.5 py-2 text-sm outline-hidden transition-colors ${isDark ? "bg-white/[0.05] hover:bg-white/[0.08]" : "bg-zinc-100/80 hover:bg-zinc-200/80"}`}
            />
          )}

          <a
            href={cvPdf}
            target="_blank"
            rel="noreferrer"
            className={`mx-2 mt-1 flex w-[calc(100%-1rem)] items-center gap-2 rounded-lg px-2.5 py-2 text-sm outline-hidden transition-colors ${isDark ? "bg-white/[0.05] hover:bg-white/[0.08]" : "bg-zinc-100/80 hover:bg-zinc-200/80"}`}
          >
            <FileText className="size-4" />
            {t("nav.downloadCV")}
          </a>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
