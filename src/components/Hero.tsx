import { ArrowRight, Mail, Download } from "lucide-react";
import { useState } from "react";
import { EditableImage } from "@/features/admin/InlineEdit";
import { useSectionEditor } from "@/features/admin/hooks/useSectionEditor";
import { useAdminAuth } from "@/features/admin/AdminAuthProvider";
import { useEditMode } from "@/features/admin/EditModeProvider";
import { uploadMedia } from "@/features/admin/api/media";
import { useTheme } from "@/features/theme";
import { useTranslation } from "react-i18next";
import logoImg from "@/assets/logo.png";
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
  const activeLogo = isDark ? '/logoNigth.png' : logoImg;
  const primaryImage = activeLogo;
  const secondaryImage = activeLogo;
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
    <section className="min-h-[calc(100vh-4rem)] flex items-center px-4 pb-8 pt-28 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32 lg:pb-16 relative">
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 text-center lg:text-left pt-16 lg:pt-0">
            <div className="max-w-3xl mx-auto lg:mx-0 space-y-5">
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl lg:text-6xl">
                {t('hero.greeting')}
              </h1>
              <div className="max-w-3xl text-2xl font-semibold leading-tight tracking-tight text-violet-600 dark:text-violet-400 sm:text-3xl lg:text-4xl">
                {t('hero.role')}
              </div>
              <p className="max-w-3xl text-sm leading-7 text-gray-600 dark:text-gray-400 sm:text-base">
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
                className="group flex items-center justify-center gap-3 rounded-2xl px-6 py-3 text-sm font-medium transition-all duration-300 bg-violet-600 text-white shadow-lg shadow-violet-500/20 hover:bg-violet-700 hover:scale-[1.02] active:scale-95 dark:bg-violet-500 dark:hover:bg-violet-600"
              >
                {t('hero.viewProjects')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
                className="flex items-center justify-center gap-3 rounded-2xl px-6 py-3 text-sm font-medium transition-all duration-300 border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:scale-[1.02] active:scale-95 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/80 dark:hover:bg-white/[0.08]"
              >
                <Mail className="h-4 w-4" />
                {t('hero.contactMe')}
              </button>

              <a
                href={cvPdf}
                download="JUAN_ALBARRACIN_CV.pdf"
                className="flex sm:hidden items-center justify-center gap-3 rounded-2xl px-6 py-3 text-sm font-medium transition-all duration-300 border border-violet-200 bg-violet-50 text-violet-700 shadow-sm hover:bg-violet-100 hover:scale-[1.02] active:scale-95 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20"
              >
                <Download className="h-4 w-4" />
                {t('nav.downloadCV')}
              </a>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border dark:border-gray-700">
              <div className="text-center">
                <div className="font-display text-2xl mb-1 font-semibold text-violet-700 dark:text-violet-400">
                  1+
                </div>
                <div className="text-sm text-muted-foreground dark:text-gray-400">
                  {t('hero.yearsExperience')}
                </div>
              </div>
              <div className="text-center">
                <div className="font-display text-2xl mb-1 font-semibold text-violet-700 dark:text-violet-400">
                  10+
                </div>
                <div className="text-sm text-muted-foreground dark:text-gray-400">
                  {t('hero.projectsCompleted')}
                </div>
              </div>
              <div className="text-center">
                <div className="font-display text-2xl mb-1 font-semibold text-violet-700 dark:text-violet-400">
                  30+
                </div>
                <div className="text-sm text-muted-foreground dark:text-gray-400">
                  {t('hero.technologies')}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Image — centered on mobile, right-aligned on desktop */}
          <div className="flex justify-center lg:justify-end mt-12 lg:mt-0">
            <div className="relative w-full max-w-sm sm:max-w-xs lg:max-w-none px-2 sm:px-4 lg:p-0">
              {canEditImages && (
                <div className="absolute top-0 right-3 z-20 flex gap-2">
                  <label className="rounded-md bg-black/60 px-2.5 py-1 text-xs text-white cursor-pointer">
                    {uploading === 'primary' ? 'Subiendo...' : 'Base'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange('primary')} />
                  </label>
                  <label className="rounded-md bg-black/60 px-2.5 py-1 text-xs text-white cursor-pointer">
                    {uploading === 'secondary' ? 'Subiendo...' : 'Hover'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange('secondary')} />
                  </label>
                </div>
              )}
              <div
                className="group relative w-full h-auto lg:h-[32rem] lg:w-[32rem] cursor-pointer overflow-visible flex items-center justify-center"
                onMouseEnter={() => setIsImageHovered(true)}
                onMouseLeave={() => setIsImageHovered(false)}
                onClick={() => setIsImageHovered(!isImageHovered)}
              >
                {/* Illustration Image */}
                <div
                  className={`transition-all duration-700 transform ${
                    isImageHovered
                      ? "opacity-0 scale-[1.08]"
                      : "opacity-100 scale-100"
                  } ${isImageHovered ? 'pointer-events-none' : 'relative lg:absolute lg:inset-0'}`}
                >
                  <EditableImage
                    src={primaryImage}
                    alt="Developer Illustration"
                    onSave={(value) => updateField('primaryImage', value)}
                    className="w-full h-auto max-h-[45vh] lg:max-h-full object-contain"
                  />
                </div>

                {/* Real Photo */}
                <div
                  className={`absolute inset-0 transition-all duration-700 transform ${
                    isImageHovered
                      ? "opacity-100 scale-[1.08]"
                      : "opacity-0 scale-95"
                  } ${!isImageHovered ? 'pointer-events-none' : ''}`}
                >
                  <EditableImage
                    src={secondaryImage}
                    alt="Professional Portrait"
                    onSave={(value) => updateField('secondaryImage', value)}
                    className="h-full w-full object-contain"
                  />
                </div>

                {/* Skill Bubbles INSIDE the image container */}
                <SkillBubble
                  name="React"
                  size="md"
                  className={`absolute right-4 top-10 z-10 pointer-events-none transition-all duration-500 transform ${
                    isImageHovered
                      ? "translate-x-0 translate-y-0 scale-110 opacity-100"
                      : "translate-x-4 -translate-y-4 scale-50 opacity-0"
                  }`}
                />
                <SkillBubble
                  name="Node.js"
                  size="md"
                  className={`absolute left-4 top-20 z-10 pointer-events-none transition-all duration-500 transform ${
                    isImageHovered
                      ? "translate-x-0 translate-y-0 scale-110 opacity-100"
                      : "-translate-x-4 -translate-y-4 scale-50 opacity-0"
                  }`}
                />
                <SkillBubble
                  name="TypeScript"
                  size="md"
                  className={`absolute left-8 bottom-32 z-10 pointer-events-none transition-all duration-700 transform ${
                    isImageHovered
                      ? "opacity-100 scale-110 translate-x-0"
                      : "opacity-0 scale-50 -translate-x-8"
                  }`}
                />
                <SkillBubble
                  name="Nest.js"
                  size="md"
                  className={`absolute right-12 top-1/2 z-10 pointer-events-none transition-all duration-500 delay-100 transform ${
                    isImageHovered
                      ? "opacity-100 scale-110 translate-y-0"
                      : "opacity-0 scale-50 translate-y-8"
                  }`}
                />
                <SkillBubble
                  name="PostgreSQL"
                  size="md"
                  className={`absolute right-8 bottom-20 z-10 pointer-events-none transition-all duration-700 delay-200 transform ${
                    isImageHovered
                      ? "opacity-100 scale-110 rotate-0"
                      : "opacity-0 scale-50 rotate-12 translate-y-8"
                  }`}
                />
              </div>
              <div className="relative z-20">
                <SpotifyNowPlayingCard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
