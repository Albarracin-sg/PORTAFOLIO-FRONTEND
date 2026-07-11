import { useCallback } from "react";
import { Mail, Github, Linkedin, MapPin } from "lucide-react";
import { sendContactMessage } from "@/shared/api/public";
import { useSectionEditor } from "@/features/admin/hooks/useSectionEditor";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

// Sub-components
import { ContactHeader } from "./Contact/ContactHeader";
import { ContactForm } from "./Contact/ContactForm";
import { ContactInfo } from "./Contact/ContactInfo";

type ContactFormData = {
  name: string;
  email: string;
  company?: string;
  message: string;
};

type ContactDraft = Record<string, unknown> & {
  title?: string;
  subtitle?: string;
  infoTitle?: string;
  socialTitle?: string;
  form?: Record<string, string>;
};

type ContactContent = Record<string, unknown> & {
  form?: Record<string, string>;
  info?: Array<Record<string, string>>;
  social?: Array<Record<string, string>>;
};

interface ContactProps {
  section?: { id: string; type: string; content: Record<string, unknown> };
}

export default function Contact({ section }: ContactProps) {
  const { t } = useTranslation();
  const onSubmit = async (data: ContactFormData) => {
    try {
      await sendContactMessage({ ...data, subject: "Consulta desde Portfolio" });
      toast.success(t("contact.form.successMessage"));
    } catch (error) {
      toast.error(error instanceof Error && error.message ? error.message : t("contact.form.errorMessage"));
      throw error;
    }
  };

  const resolveIcon = useCallback((iconStr: string | undefined) => {
    if (!iconStr) return Mail;
    const name = String(iconStr).toLowerCase();
    if (name.includes("github")) return Github;
    if (name.includes("linkedin")) return Linkedin;
    if (name.includes("map") || name.includes("location")) return MapPin;
    return Mail;
  }, []);

  const contactContent = (section?.content ?? {}) as ContactContent;
  const { draft, updateField } = useSectionEditor(section as any);
  const typedDraft = draft as ContactDraft;

  const fallbackInfo = [
    { label: "Email", value: "albarrajuan5@gmail.com", link: "mailto:albarrajuan5@gmail.com", icon: "Mail" },
    { label: "Location", value: "Bogotá, Colombia", link: "", icon: "MapPin" },
  ];

  const infoItems = (draft.info as Array<Record<string, string>>) ?? contactContent.info ?? fallbackInfo;
  const rawSocialItems = (draft.social as Array<Record<string, string>>) ?? contactContent.social ?? [
    { label: "GitHub", link: "https://github.com/Albarracin-sg", icon: "Github" },
    { label: "LinkedIn", link: "https://www.linkedin.com/in/juan-camilo-albarracin/", icon: "Linkedin" },
  ];

  const socialDefaults = [{ label: "GitHub", icon: "Github", link: "#" }, { label: "LinkedIn", icon: "Linkedin", link: "#" }];
  const socialItems = socialDefaults.map((def) => rawSocialItems.find((s) => String(s.icon ?? s.label ?? "").toLowerCase().includes(def.icon.toLowerCase())) ?? def);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <ContactHeader 
          title={String(typedDraft.title ?? t("contact.title"))} 
          subtitle={String(typedDraft.subtitle ?? t("contact.subtitle"))} 
          onSaveTitle={(v) => updateField("title", v)} 
          onSaveSubtitle={(v) => updateField("subtitle", v)} 
          t={t} 
        />

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
          <ContactForm onSubmit={onSubmit} updateField={updateField} t={t} />
          <ContactInfo 
            infoItems={infoItems} 
            socialItems={socialItems} 
            socialTitle={String(typedDraft.socialTitle ?? t("contact.social.title"))} 
            updateField={updateField} 
            resolveIcon={resolveIcon} 
          />
        </div>
      </div>
    </section>
  );
}
