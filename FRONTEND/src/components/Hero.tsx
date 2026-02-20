import { Button } from "./ui/button";
import { ArrowRight, Mail } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState } from "react";
import { EditableText, EditableImage } from "@/features/admin/InlineEdit";
import { useSectionEditor } from "@/features/admin/hooks/useSectionEditor";
import { useAdminAuth } from "@/features/admin/AdminAuthProvider";
import { useEditMode } from "@/features/admin/EditModeProvider";
import { uploadMedia } from "@/features/admin/api/media";

interface HeroProps {
  translations: any;
  scrollY?: number;
  section?: { id: string; type: string; content: Record<string, unknown> };
}

export default function Hero({ translations, section }: HeroProps) {
  const [isImageHovered, setIsImageHovered] = useState(false);
  const heroContent = section?.content ?? {};
  const stats = (heroContent.stats as { yearsExperience?: string; projectsCompleted?: string; technologies?: string }) ?? {};
  const cta = (heroContent.cta as { viewProjects?: string; contactMe?: string }) ?? {};
  const { draft, updateField } = useSectionEditor(section as any);
  const { token } = useAdminAuth();
  const { isEditMode } = useEditMode();
  const [uploading, setUploading] = useState<'primary' | 'secondary' | null>(null);
  const draftStats = (draft.stats as { yearsExperience?: string; projectsCompleted?: string; technologies?: string }) ?? stats;
  const draftCta = (draft.cta as { viewProjects?: string; contactMe?: string }) ?? cta;
  const primaryImage = String(heroContent.primaryImage ?? '');
  const secondaryImage = String(heroContent.secondaryImage ?? '');
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
    <section className="min-h-[calc(100vh-4rem)] flex items-center py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl text-gray-900 dark:text-gray-100">
                <EditableText
                  value={String(draft.greeting ?? heroContent.greeting ?? '')}
                  displayValue={String(heroContent.greeting ?? '')}
                  onSave={(value) => updateField('greeting', value)}
                  className="w-full"
                />
                <span className="text-violet-600 dark:text-violet-400 block">
                  <EditableText
                    value={String(draft.role ?? heroContent.role ?? '')}
                    displayValue={String(heroContent.role ?? '')}
                    onSave={(value) => updateField('role', value)}
                    className="w-full"
                  />
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
                <EditableText
                  value={String(draft.subtitle ?? heroContent.subtitle ?? '')}
                  displayValue={String(heroContent.subtitle ?? '')}
                  onSave={(value) => updateField('subtitle', value)}
                  multiline
                />
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
                <EditableText
                  value={String(draftCta.viewProjects ?? '')}
                  displayValue={String(cta.viewProjects ?? '')}
                  onSave={(value) => updateField('cta.viewProjects', value)}
                />
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
                <EditableText
                  value={String(draftCta.contactMe ?? '')}
                  displayValue={String(cta.contactMe ?? '')}
                  onSave={(value) => updateField('cta.contactMe', value)}
                />
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border dark:border-gray-700">
              <div className="text-center">
                <div className="font-display text-2xl mb-1 font-semibold text-violet-700 dark:text-violet-400">
                  <EditableText
                    value={String(draftStats.yearsExperience ?? stats.yearsExperience ?? '')}
                    displayValue={String(stats.yearsExperience ?? '')}
                    onSave={(value) => updateField('stats.yearsExperience', value)}
                  />
                </div>
                <div className="text-sm text-muted-foreground dark:text-gray-400">
                  {translations?.hero?.yearsExperience ?? ''}
                </div>
              </div>
              <div className="text-center">
                <div className="font-display text-2xl mb-1 font-semibold text-violet-700 dark:text-violet-400">
                  <EditableText
                    value={String(draftStats.projectsCompleted ?? stats.projectsCompleted ?? '')}
                    displayValue={String(stats.projectsCompleted ?? '')}
                    onSave={(value) => updateField('stats.projectsCompleted', value)}
                  />
                </div>
                <div className="text-sm text-muted-foreground dark:text-gray-400">
                  {translations?.hero?.projectsCompleted ?? ''}
                </div>
              </div>
              <div className="text-center">
                <div className="font-display text-2xl mb-1 font-semibold text-violet-700 dark:text-violet-400">
                  <EditableText
                    value={String(draftStats.technologies ?? stats.technologies ?? '')}
                    displayValue={String(stats.technologies ?? '')}
                    onSave={(value) => updateField('stats.technologies', value)}
                  />
                </div>
                <div className="text-sm text-muted-foreground dark:text-gray-400">
                  {translations?.hero?.technologies ?? ''}
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
                className="w-80 h-80 lg:w-96 lg:h-96 rounded-2xl overflow-hidden bg-linear-to-br from-violet-500/30 to-violet-400/20 dark:from-violet-600/40 dark:to-violet-500/30 ring-1 ring-gray-300 dark:ring-gray-600 cursor-pointer transition-all duration-500 hover:ring-2 hover:ring-violet-500 dark:hover:ring-violet-400 hover:shadow-2xl hover:shadow-violet-500/20 group"
                onMouseEnter={() => setIsImageHovered(true)}
                onMouseLeave={() => setIsImageHovered(false)}
              >
                {/* Subtle hover hint */}
                <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md opacity-70 group-hover:opacity-0 transition-opacity duration-300 z-10">
                  Hover me ✨
                </div>
                {/* Illustration Image */}
                <div
                  className={`absolute inset-0 transition-all duration-700 transform ${
                    isImageHovered
                      ? "opacity-0 scale-110"
                      : "opacity-100 scale-100"
                  }`}
                >
                  <EditableImage
                    src={String(draft.primaryImage ?? primaryImage)}
                    alt="Developer Illustration"
                    onSave={(value) => updateField('primaryImage', value)}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Real Photo */}
                <div
                  className={`absolute inset-0 transition-all duration-700 transform ${
                    isImageHovered
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-90"
                  }`}
                >
                  <EditableImage
                    src={String(draft.secondaryImage ?? secondaryImage)}
                    alt="Professional Portrait"
                    onSave={(value) => updateField('secondaryImage', value)}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Hover indicator */}
                <div
                  className={`absolute inset-0 bg-linear-to-t from-violet-500/20 via-transparent to-transparent transition-opacity duration-300 ${
                    isImageHovered ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>

              {/* Floating elements */}
              <div
                className={`absolute -top-4 -right-4 bg-linear-to-r from-violet-600 to-violet-500 text-white p-3 rounded-xl shadow-lg border border-violet-400/30 transition-all duration-500 transform ${
                  isImageHovered
                    ? "translate-x-2 -translate-y-2 scale-110"
                    : "translate-x-0 translate-y-0 scale-100"
                }`}
              >
                <div className="text-sm">React</div>
              </div>
              <div
                className={`absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 p-3 rounded-xl shadow-lg transition-all duration-500 transform ${
                  isImageHovered
                    ? "-translate-x-2 translate-y-2 scale-110"
                    : "translate-x-0 translate-y-0 scale-100"
                }`}
              >
                <div className="text-sm">Node.js</div>
              </div>

              {/* Additional floating elements that appear on hover */}
              <div
                className={`absolute top-1/2 -left-8 bg-linear-to-r from-violet-500 to-violet-600 text-white p-2 rounded-lg shadow-lg border border-violet-400/30 transition-all duration-700 transform ${
                  isImageHovered
                    ? "opacity-100 scale-100 translate-x-0"
                    : "opacity-0 scale-0 -translate-x-4"
                }`}
              >
                <div className="text-xs">TypeScript</div>
              </div>

              <div
                className={`absolute top-8 right-8 bg-linear-to-r from-violet-600/90 to-violet-500/90 text-white p-2 rounded-lg shadow-lg border border-violet-400/30 transition-all duration-500 delay-200 transform ${
                  isImageHovered
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-0 -translate-y-4"
                }`}
              >
                <div className="text-xs">Nest.js</div>
              </div>

              <div
                className={`absolute bottom-8 right-4 bg-linear-to-r from-violet-500/80 to-violet-600/80 text-white p-2 rounded-lg shadow-lg border border-violet-400/30 transition-all duration-700 delay-300 transform ${
                  isImageHovered
                    ? "opacity-100 scale-100 rotate-0"
                    : "opacity-0 scale-0 rotate-12"
                }`}
              >
                <div className="text-xs">PostgreSQL</div>
              </div>

              {/* Animated glow effect on hover */}
              <div
                className={`absolute inset-0 rounded-2xl transition-all duration-1000 ${
                  isImageHovered
                    ? "bg-linear-to-r from-violet-500/20 to-violet-400/20 blur-xl scale-110"
                    : "bg-transparent scale-100"
                }`}
                style={{ zIndex: -1 }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
