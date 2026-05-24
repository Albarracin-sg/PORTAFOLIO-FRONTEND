import { ArrowRight, Mail, Download } from "lucide-react";
import { useState } from "react";
import { EditableImage } from "@/features/admin/InlineEdit";
import { useSectionEditor } from "@/features/admin/hooks/useSectionEditor";
import { useAdminAuth } from "@/features/admin/AdminAuthProvider";
import { useEditMode } from "@/features/admin/EditModeProvider";
import { uploadMedia } from "@/features/admin/api/media";
import { useTheme } from "@/features/theme";
import { useTranslation } from "react-i18next";
import logoImg from "@/assets/logo.webp";
import cvPdf from "@/assets/cv/JUAN_ALBARRACIN_CV.pdf";
import { SpotifyNowPlayingCard } from "./SpotifyNowPlayingCard";
import { SkillBubble } from "./SkillBubble";

interface HeroProps {
  scrollY?: number;
  section?: { id: string; type: string; content: Record<string, unknown> };
}

export default function Hero({ section }: HeroProps) {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [isImageHovered, setIsImageHovered] = useState(false);
  const { updateField } = useSectionEditor(section as any);
  const { token } = useAdminAuth();
  const { isEditMode } = useEditMode();
  const [uploading, setUploading] = useState<'primary' | 'secondary' | null>(null);
  const activeLogo = isDark ? '/logoNigth.webp' : logoImg;
  const primaryImage = activeLogo;
  const canEditImages = isEditMode && !!token && window.location.pathname.startsWith('/admin/live');

  const handleImageChange = (kind: 'primary' | 'secondary') => async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.[0] || !token) return;
    setUploading(kind);
    try {
      const result = await uploadMedia(token, event.target.files[0]);
      updateField(kind === 'primary' ? 'primaryImage' : 'secondaryImage', result.url);
    } finally {
      setUploading(null);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 pt-48 pb-20 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32 lg:pb-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
            <div className="max-w-3xl mx-auto lg:mx-0 space-y-4 sm:space-y-5">
              <h1 className="text-3xl font-semibold leading-tight tracking-tight text-zinc-900 dark:text-white sm:text-5xl lg:text-6xl break-words">
                {t('hero.greeting')}
              </h1>
              <div className="max-w-full text-xl font-semibold leading-tight tracking-tight text-violet-600 dark:text-violet-400 sm:text-3xl lg:text-4xl break-words">
                {t('hero.role')}
              </div>
              <p className="max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-base break-words">
                {t('hero.subtitle')}
              </p>
            </div>

            {/* CTA Buttons - Navbar Mobile Menu Aesthetic */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <button
                onClick={() => {
                  const element = document.getElementById("projects");
                  if (element) {
                    element.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
                className="group flex items-center justify-center gap-3 rounded-2xl px-6 py-3.5 text-sm font-medium transition-all duration-300 bg-violet-600 text-white shadow-lg shadow-violet-500/20 hover:bg-violet-700 hover:scale-105 active:scale-95 dark:bg-violet-500 dark:hover:bg-violet-600"
              >
                {t('hero.viewProjects')}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => {
                  const element = document.getElementById("contact");
                  if (element) {
                    element.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
                className="flex items-center justify-center gap-3 rounded-2xl px-6 py-3.5 text-sm font-medium transition-all duration-300 border border-zinc-200 bg-white text-zinc-700 shadow-sm hover:bg-white hover:border-violet-300 hover:text-violet-600 hover:scale-105 active:scale-95 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/80 dark:hover:bg-white/[0.08] dark:hover:border-violet-500/30 dark:hover:text-violet-400"
              >
                <Mail className="size-4" />
                {t('hero.contactMe')}
              </button>

              <a
                href={cvPdf}
                download="JUAN_ALBARRACIN_CV.pdf"
                className="flex sm:hidden items-center justify-center gap-3 rounded-2xl px-6 py-3.5 text-sm font-medium transition-all duration-300 border border-violet-200 bg-violet-50 text-violet-700 shadow-sm hover:bg-violet-100 hover:border-violet-300 hover:scale-105 active:scale-95 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20"
              >
                <Download className="size-4" />
                {t('nav.downloadCV')}
              </a>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-8 pt-8 border-t border-border dark:border-zinc-700">
              <div className="text-center">
                <div className="font-display text-xl sm:text-2xl mb-1 font-semibold text-violet-700 dark:text-violet-400">
                  1+
                </div>
                <div className="text-[10px] sm:text-sm text-muted-foreground dark:text-zinc-400 leading-tight">
                  {t('hero.yearsExperience')}
                </div>
              </div>
              <div className="text-center">
                <div className="font-display text-xl sm:text-2xl mb-1 font-semibold text-violet-700 dark:text-violet-400">
                  10+
                </div>
                <div className="text-[10px] sm:text-sm text-muted-foreground dark:text-zinc-400 leading-tight">
                  {t('hero.projectsCompleted')}
                </div>
              </div>
              <div className="text-center">
                <div className="font-display text-xl sm:text-2xl mb-1 font-semibold text-violet-700 dark:text-violet-400">
                  30+
                </div>
                <div className="text-[10px] sm:text-sm text-muted-foreground dark:text-zinc-400 leading-tight">
                  {t('hero.technologies')}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Image — centered on mobile, right-aligned on desktop */}
          <div className="flex flex-col items-center lg:items-end mt-8 lg:mt-0">
            <div className="relative w-full max-w-[280px] sm:max-w-xs lg:max-w-none px-2 sm:px-4 lg:p-0">
              {canEditImages && (
                <div className="absolute top-0 right-3 z-20 flex gap-2">
                  <label className="rounded-md bg-black/60 px-2.5 py-1 text-xs text-white cursor-pointer">
                    {uploading === 'primary' ? 'Subiendo…' : 'Base'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange('primary')} />
                  </label>
                  <label className="rounded-md bg-black/60 px-2.5 py-1 text-xs text-white cursor-pointer">
                    {uploading === 'secondary' ? 'Subiendo…' : 'Hover'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange('secondary')} />
                  </label>
                </div>
              )}
              <div
                className="group relative size-full lg:h-[32rem] lg:w-[32rem] cursor-pointer overflow-visible flex items-center justify-center focus:outline-hidden"
                onMouseEnter={() => setIsImageHovered(true)}
                onMouseLeave={() => setIsImageHovered(false)}
                onClick={() => setIsImageHovered(!isImageHovered)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsImageHovered(!isImageHovered);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={t('hero.imageInteraction', { defaultValue: 'Toggle image hover effect' })}
              >
                {/* Logo Image with smooth scale on hover */}
                <div
                  className={`transition-all duration-700 transform ${
                    isImageHovered ? "scale-[1.05]" : "scale-100"
                  } relative lg:absolute lg:inset-0`}
                >
                  <EditableImage
                    src={primaryImage}
                    alt="Developer Illustration"
                    onSave={(value) => updateField('primaryImage', value)}
                    className={`w-full h-auto max-h-[45vh] lg:max-h-full object-contain ${isDark ? "scale-110" : ""}`}
                  />
                </div>

                {/* Skill Bubbles */}
                <SkillBubble
                  name="React"
                  size="md"
                  className={`absolute right-0 top-2 sm:right-4 sm:top-10 z-10 pointer-events-none transition-all duration-500 transform scale-75 lg:scale-100 ${
                    isImageHovered
                      ? "translate-x-0 translate-y-0 scale-90 lg:scale-110 opacity-100"
                      : "translate-x-4 -translate-y-4 scale-50 opacity-0"
                  }`}
                />
                <SkillBubble
                  name="Node.js"
                  size="md"
                  className={`absolute left-0 top-8 sm:left-4 sm:top-20 z-10 pointer-events-none transition-all duration-500 transform scale-75 lg:scale-100 ${
                    isImageHovered
                      ? "translate-x-0 translate-y-0 scale-90 lg:scale-110 opacity-100"
                      : "-translate-x-4 -translate-y-4 scale-50 opacity-0"
                  }`}
                />
                <SkillBubble
                  name="TypeScript"
                  size="md"
                  className={`absolute left-0 bottom-16 sm:left-8 sm:bottom-32 z-10 pointer-events-none transition-all duration-700 transform scale-75 lg:scale-100 ${
                    isImageHovered
                      ? "opacity-100 scale-90 lg:scale-110 translate-x-0"
                      : "opacity-0 scale-50 -translate-x-8"
                  }`}
                />
                <SkillBubble
                  name="Nest.js"
                  size="md"
                  className={`absolute right-0 top-1/2 z-10 pointer-events-none transition-all duration-500 delay-100 transform scale-75 lg:scale-100 ${
                    isImageHovered
                      ? "opacity-100 scale-90 lg:scale-110 translate-y-0"
                      : "opacity-0 scale-50 translate-y-8"
                  }`}
                />
                <SkillBubble
                  name="PostgreSQL"
                  size="md"
                  className={`absolute right-0 bottom-8 sm:right-8 sm:bottom-20 z-10 pointer-events-none transition-all duration-700 delay-200 transform scale-75 lg:scale-100 ${
                    isImageHovered
                      ? "opacity-100 scale-90 lg:scale-110 rotate-0"
                      : "opacity-0 scale-50 rotate-12 translate-y-8"
                  }`}
                />
              </div>
            </div>
            <div className="w-full max-w-sm lg:max-w-none relative z-20">
              <SpotifyNowPlayingCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
