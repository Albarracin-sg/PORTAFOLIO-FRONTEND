import { Button } from "./ui/button";
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

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="gap-2"
                onClick={() => {
                  const element = document.getElementById("projects");
                  if (element) {
                    element.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
              >
                {t('hero.viewProjects')}
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={() => {
                  const element = document.getElementById("contact");
                  if (element) {
                    element.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
              >
                <Mail className="h-5 w-5" />
                {t('hero.contactMe')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 sm:hidden border-violet-500/50 text-violet-700 dark:text-violet-400"
                asChild
              >
                <a href={cvPdf} download="JUAN_ALBARRACIN_CV.pdf">
                  <Download className="h-5 w-5" />
                  {t('nav.downloadCV')}
                </a>
              </Button>
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
            <div className="relative w-full max-w-[320px] sm:max-w-xs lg:max-w-none px-4 lg:p-0">
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
              >
                {/* Subtle hover hint */}
                <div className="absolute left-1/2 -top-6 -translate-x-1/2 z-10 rounded-md bg-black/50 px-2 py-1 text-xs text-white opacity-70 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-0 whitespace-nowrap">
                  Hover me ✨
                </div>
                
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
              </div>

              {/* Floating elements — hidden on mobile */}
              <div
                className={`hidden lg:block absolute -right-4 -top-4 rounded-xl bg-violet-600 p-3 text-white shadow-lg transition-all duration-500 transform ${
                  isImageHovered
                    ? "translate-x-2 -translate-y-2 scale-110"
                    : "translate-x-0 translate-y-0 scale-100"
                }`}
              >
                <div className="text-sm">React</div>
              </div>
              <div
                className={`hidden lg:block absolute -bottom-4 -left-4 rounded-xl border border-gray-200 bg-white p-3 text-gray-900 shadow-lg transition-all duration-500 transform dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 ${
                  isImageHovered
                    ? "-translate-x-2 translate-y-2 scale-110"
                    : "translate-x-0 translate-y-0 scale-100"
                }`}
              >
                <div className="text-sm">Node.js</div>
              </div>

              {/* Additional floating elements that appear on hover */}
              <div
                className={`hidden lg:block absolute -left-8 top-1/2 rounded-lg bg-violet-600 p-2 text-white shadow-lg transition-all duration-700 transform ${
                  isImageHovered
                    ? "opacity-100 scale-100 translate-x-0"
                    : "opacity-0 scale-0 -translate-x-4"
                }`}
              >
                <div className="text-xs">TypeScript</div>
              </div>

              <div
                className={`hidden lg:block absolute right-8 top-8 rounded-lg bg-violet-600/95 p-2 text-white shadow-lg transition-all duration-500 delay-200 transform ${
                  isImageHovered
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-0 -translate-y-4"
                }`}
              >
                <div className="text-xs">Nest.js</div>
              </div>

              <div
                className={`hidden lg:block absolute bottom-8 right-4 rounded-lg bg-violet-600/90 p-2 text-white shadow-lg transition-all duration-700 delay-300 transform ${
                  isImageHovered
                    ? "opacity-100 scale-100 rotate-0"
                    : "opacity-0 scale-0 rotate-12"
                }`}
              >
                <div className="text-xs">PostgreSQL</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}