import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Mail, Github, Send, Linkedin, MapPin, CheckCircle2, XCircle } from "lucide-react";
import { sendContactMessage } from "@/shared/api/public";
import { EditableText } from "@/features/admin/InlineEdit";
import { useSectionEditor } from "@/features/admin/hooks/useSectionEditor";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

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

type SubmitFeedback = {
  open: boolean;
  type: "success" | "error";
  title: string;
  description: string;
  emailStatus?: "sent" | "failed";
};

type IconComponent = typeof Mail;

interface ContactProps {
  section?: { id: string; type: string; content: Record<string, unknown> };
}

function resolveIcon(iconStr: string | undefined): IconComponent {
  if (!iconStr) return Mail;
  const name = String(iconStr).toLowerCase();
  if (name.includes("github")) return Github;
  if (name.includes("linkedin")) return Linkedin;
  if (name.includes("map") || name.includes("location")) return MapPin;
  if (name.includes("mail") || name.includes("email")) return Mail;
  return Mail;
}

export default function Contact({ section }: ContactProps) {
  const { t, i18n } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({ mode: "onChange" });

  // Force re-validation when language changes so error messages translate instantly
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      trigger();
    }
  }, [i18n.language, trigger]);

  const [submitFeedback, setSubmitFeedback] = useState<SubmitFeedback>({
    open: false,
    type: "success",
    title: "",
    description: "",
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      const response = await sendContactMessage({
        ...data,
        subject: "Consulta desde Portfolio",
      });
      
      const emailStatus = (response as any)?.emailStatus;
      
      reset();
      setSubmitFeedback({
        open: true,
        type: "success",
        title: t("contact.form.modal.successTitle"),
        description: t("contact.form.modal.successDescription"),
        emailStatus: emailStatus,
      });
    } catch (error) {
      setSubmitFeedback({
        open: true,
        type: "error",
        title: t("contact.form.modal.errorTitle"),
        description:
          error instanceof Error && error.message
            ? error.message
            : t("contact.form.modal.errorDescription"),
      });
    }
  };

  const fallbackContactInfo: Array<Record<string, string>> = [
    {
      label: "Email",
      value: "albarrajuan5@gmail.com",
      link: "mailto:albarrajuan5@gmail.com",
      icon: "Mail",
    },
    {
      label: "Location",
      value: "Bogotá, Colombia",
      link: "",
      icon: "MapPin",
    },
  ];
  const fallbackSocialLinks: Array<Record<string, string>> = [
    {
      label: "GitHub",
      link: "https://github.com/Albarracin-sg",
      icon: "Github",
    },
    {
      label: "LinkedIn",
      link: "https://www.linkedin.com/in/juan-camilo-albarrac%C3%ADn-urrego-077504296/",
      icon: "Linkedin",
    },
  ];

  const contactContent = (section?.content ?? {}) as ContactContent;
  const { draft, updateField } = useSectionEditor(section as any);
  const typedDraft = draft as ContactDraft;

  const infoItems =
    (draft.info as Array<Record<string, string>>) ??
    contactContent.info ??
    fallbackContactInfo;

  const rawSocialItems: Array<Record<string, string>> =
    (draft.social as Array<Record<string, string>>) ??
    contactContent.social ??
    fallbackSocialLinks;

  // Merge real data with defaults — ensure GitHub AND LinkedIn always appear
  const socialDefaults: Array<Record<string, string>> = [
    { label: "GitHub",   icon: "Github",   link: "#" },
    { label: "LinkedIn", icon: "Linkedin", link: "#" },
  ];

  const socialItems: Array<Record<string, string>> = socialDefaults.map((def) => {
    const match = rawSocialItems.find((s) =>
      String(s.icon ?? s.label ?? "").toLowerCase().includes(def.icon.toLowerCase())
    );
    return match ?? def;
  });

  const socialTitle = typedDraft.socialTitle ?? t("contact.social.title");

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <h1 className="mb-4 text-5xl font-semibold leading-none tracking-tight text-gray-900 dark:text-gray-100 sm:text-6xl">
            <EditableText
              value={String(typedDraft.title ?? t("contact.title"))}
              displayValue={String(t("contact.title"))}
              onSave={(value) => updateField("title", value)}
            />
            <span className="text-violet-500"> .</span>
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-gray-600 dark:text-gray-400 sm:text-base">
            <EditableText
              value={String(typedDraft.subtitle ?? t("contact.subtitle"))}
              displayValue={String(t("contact.subtitle"))}
              onSave={(value) => updateField("subtitle", value)}
              multiline
            />
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">

          {/* ── Left: Contact Form ── */}
          <div className="flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 p-7">
            <p className="text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-6">
              {t("contact.form.title")}
            </p>

            <form 
              onSubmit={handleSubmit(onSubmit)} 
              noValidate 
              className="flex flex-col flex-1 gap-5"
            >
              <div>
                <Label htmlFor="name" className="text-sm text-gray-600 dark:text-gray-400 mb-1.5 block">
                  <EditableText
                    value={String(t("contact.form.name"))}
                    displayValue={String(t("contact.form.name"))}
                    onSave={(value) => updateField("form.name", value)}
                  />
                </Label>
                <Input
                  id="name"
                  {...register("name", {
                    required: t("contact.form.errors.required"),
                    minLength: {
                      value: 2,
                      message: t("contact.form.errors.minLength"),
                    },
                  })}
                  placeholder={String(t("contact.form.namePlaceholder"))}
                  disabled={isSubmitting}
                  className={`bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 focus-visible:ring-violet-500 ${
                    errors.name ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="text-sm text-gray-600 dark:text-gray-400 mb-1.5 block">
                  <EditableText
                    value={String(t("contact.form.email"))}
                    displayValue={String(t("contact.form.email"))}
                    onSave={(value) => updateField("form.email", value)}
                  />
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: t("contact.form.errors.required"),
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t("contact.form.errors.invalidEmail"),
                    },
                  })}
                  placeholder={String(t("contact.form.emailPlaceholder"))}
                  disabled={isSubmitting}
                  className={`bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 focus-visible:ring-violet-500 ${
                    errors.email ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="company" className="text-sm text-gray-600 dark:text-gray-400 mb-1.5 block">
                  <EditableText
                    value={String(t("contact.form.company") || "Company (Optional)")}
                    displayValue={String(t("contact.form.company") || "Company (Optional)")}
                    onSave={(value) => updateField("form.company", value)}
                  />
                </Label>
                <Input
                  id="company"
                  {...register("company")}
                  placeholder={String(t("contact.form.companyPlaceholder") || "Where do you work?")}
                  disabled={isSubmitting}
                  className="bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 focus-visible:ring-violet-500"
                />
              </div>

              <div className="flex flex-col flex-1">
                <Label htmlFor="message" className="text-sm text-gray-600 dark:text-gray-400 mb-1.5 block">
                  <EditableText
                    value={String(t("contact.form.message"))}
                    displayValue={String(t("contact.form.message"))}
                    onSave={(value) => updateField("form.message", value)}
                  />
                </Label>
                <Textarea
                  id="message"
                  {...register("message", {
                    required: t("contact.form.errors.required"),
                    minLength: {
                      value: 5,
                      message: t("contact.form.errors.minLength"),
                    },
                  })}
                  placeholder={String(t("contact.form.messagePlaceholder"))}
                  disabled={isSubmitting}
                  className={`flex-1 min-h-[140px] bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 focus-visible:ring-violet-500 resize-none ${
                    errors.message ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                />
                {errors.message && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.message.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full gap-2 bg-violet-600 hover:bg-violet-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {String(t("contact.form.sending"))}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {String(t("contact.form.send"))}
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* ── Right: Info + Social ── */}
          <div className="flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 p-7">

            {/* Info items */}
            <div className="flex flex-col gap-3">
              {infoItems.map((item, index) => {
                const Icon = resolveIcon(item.icon) as IconComponent;
                const content = (
                  <div className="flex items-center gap-4 rounded-xl border border-gray-100 dark:border-gray-700/60 bg-gray-50 dark:bg-gray-800/40 px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 dark:hover:border-violet-500/30">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/50 ring-1 ring-violet-200/60 dark:ring-violet-500/20">
                      <Icon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-0.5">
                        <EditableText
                          value={String(item.label)}
                          onSave={(value) => updateField(`info.${index}.label`, value)}
                        />
                      </div>
                      <div className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                        <EditableText
                          value={String(item.value)}
                          onSave={(value) => updateField(`info.${index}.value`, value)}
                        />
                      </div>
                    </div>
                  </div>
                );

                return item.link ? (
                  <a key={index} href={String(item.link)} className="block">
                    {content}
                  </a>
                ) : (
                  <div key={index}>{content}</div>
                );
              })}
            </div>

            {/* Social — always GitHub + LinkedIn, pinned to bottom */}
            <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-700/60">
              <p className="text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
                {String(socialTitle)}
              </p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {socialItems.map((social, index) => {
                  const Icon = resolveIcon(social.icon) as IconComponent;
                  return (
                    <a
                      key={index}
                      href={String(social.link)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-gray-100 dark:border-gray-700/60 bg-gray-50 dark:bg-gray-800/40 px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 dark:hover:border-violet-500/30"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/50 ring-1 ring-violet-200/60 dark:ring-violet-500/20">
                        <Icon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-0.5">
                          Social
                        </div>
                        <span className="block truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {String(social.label)}
                        </span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog
        open={submitFeedback.open}
        onOpenChange={(open: boolean) =>
          setSubmitFeedback((current) => ({ ...current, open }))
        }
      >
        <AlertDialogContent className="max-w-[400px] rounded-3xl border-none bg-white dark:bg-gray-900 p-8">
          <div className="flex flex-col items-center text-center">
            <div className={`mb-6 flex h-20 w-20 items-center justify-center rounded-full ring-8 ${
              submitFeedback.type === "success" 
                ? "bg-emerald-100 text-emerald-600 ring-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/5"
                : "bg-red-100 text-red-600 ring-red-50 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/5"
            }`}>
              {submitFeedback.type === "success" ? (
                <CheckCircle2 className="h-10 w-10" />
              ) : (
                <XCircle className="h-10 w-10" />
              )}
            </div>
            
            <AlertDialogHeader className="space-y-2">
              <AlertDialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                {submitFeedback.title}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                {submitFeedback.description}
                {submitFeedback.emailStatus === "failed" && (
                  <p className="mt-2 text-amber-600 dark:text-amber-400">
                    ⚠️ El mensaje se guardó, pero el correo no pudo enviarse. Revisá la configuración del servidor.
                  </p>
                )}
                {submitFeedback.emailStatus === "sent" && (
                  <p className="mt-2 text-emerald-600 dark:text-emerald-400">
                    ✓ Correo enviado correctamente.
                  </p>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <AlertDialogFooter className="mt-8 w-full sm:justify-center">
              <AlertDialogAction className={`w-full rounded-xl py-6 font-semibold text-white transition-all duration-200 active:scale-95 ${
                submitFeedback.type === "success"
                  ? "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                  : "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
              }`}>
                {t("contact.form.modal.confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
