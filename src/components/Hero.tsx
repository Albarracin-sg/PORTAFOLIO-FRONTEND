import { Button } from "./ui/button";
import { ArrowRight, Mail } from "lucide-react";
import { useState } from "react";
import { EditableImage } from "@/features/admin/InlineEdit";
import { useSectionEditor } from "@/features/admin/hooks/useSectionEditor";
import { useAdminAuth } from "@/features/admin/AdminAuthProvider";
import { useEditMode } from "@/features/admin/EditModeProvider";
import { uploadMedia } from "@/features/admin/api/media";
import { useTheme } from "@/features/theme";
import { useTranslation } from "react-i18next";
import logoImg from "@/assets/logo.png";

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
    <section className="min-h-[calc(100vh-4rem)] flex items-center px-4 pb-16 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-5 max-w-3xl">
              <h1 className="text-4xl leading-tight sm:text-5xl lg:text-6xl text-gray-900 dark:text-gray-100">
                {t('hero.greeting')}
              </h1>
              <div className="max-w-2xl text-xl font-medium leading-snug text-violet-600 dark:text-violet-400 sm:text-2xl lg:text-3xl">
                {t('hero.role')}
              </div>
              <p className="max-w-2xl text-base leading-7 text-gray-600 dark:text-gray-400 sm:text-lg">
                {t('hero.subtitle')}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
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

          {/* Profile Image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {canEditImages && (
                <div className="absolute top-3 right-3 z-20 flex gap-2">
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
                className="group relative h-80 w-80 cursor-pointer overflow-visible lg:h-[28rem] lg:w-[28rem]"
                onMouseEnter={() => setIsImageHovered(true)}
                onMouseLeave={() => setIsImageHovered(false)}
              >
                {/* Subtle hover hint */}
                <div className="absolute left-3 top-3 z-10 rounded-md bg-black/50 px-2 py-1 text-xs text-white opacity-70 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-0">
                  Hover me ✨
                </div>
                {/* Illustration Image */}
                <div
                  className={`absolute inset-0 transition-all duration-700 transform ${
                    isImageHovered
                      ? "opacity-0 scale-[1.08]"
                      : "opacity-100 scale-100"
                  }`}
                >
                  <EditableImage
                    src={primaryImage}
                    alt="Developer Illustration"
                    onSave={(value) => updateField('primaryImage', value)}
                    className="h-full w-full object-contain"
                  />
                </div>

                {/* Real Photo */}
                <div
                  className={`absolute inset-0 transition-all duration-700 transform ${
                    isImageHovered
                      ? "opacity-100 scale-[1.08]"
                      : "opacity-0 scale-95"
                  }`}
                >
                  <EditableImage
                    src={secondaryImage}
                    alt="Professional Portrait"
                    onSave={(value) => updateField('secondaryImage', value)}
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>

              {/* Floating elements */}
              <div
                className={`absolute -right-4 -top-4 rounded-xl bg-violet-600 p-3 text-white shadow-lg transition-all duration-500 transform ${
                  isImageHovered
                    ? "translate-x-2 -translate-y-2 scale-110"
                    : "translate-x-0 translate-y-0 scale-100"
                }`}
              >
                <div className="text-sm">React</div>
              </div>
              <div
                className={`absolute -bottom-4 -left-4 rounded-xl border border-gray-200 bg-white p-3 text-gray-900 shadow-lg transition-all duration-500 transform dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 ${
                  isImageHovered
                    ? "-translate-x-2 translate-y-2 scale-110"
                    : "translate-x-0 translate-y-0 scale-100"
                }`}
              >
                <div className="text-sm">Node.js</div>
              </div>

              {/* Additional floating elements that appear on hover */}
              <div
                className={`absolute -left-8 top-1/2 rounded-lg bg-violet-600 p-2 text-white shadow-lg transition-all duration-700 transform ${
                  isImageHovered
                    ? "opacity-100 scale-100 translate-x-0"
                    : "opacity-0 scale-0 -translate-x-4"
                }`}
              >
                <div className="text-xs">TypeScript</div>
              </div>

              <div
                className={`absolute right-8 top-8 rounded-lg bg-violet-600/95 p-2 text-white shadow-lg transition-all duration-500 delay-200 transform ${
                  isImageHovered
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-0 -translate-y-4"
                }`}
              >
                <div className="text-xs">Nest.js</div>
              </div>

              <div
                className={`absolute bottom-8 right-4 rounded-lg bg-violet-600/90 p-2 text-white shadow-lg transition-all duration-700 delay-300 transform ${
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
