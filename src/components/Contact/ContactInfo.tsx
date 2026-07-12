import { EditableText } from "@/features/admin/InlineEdit";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface ContactInfoProps {
  infoItems: Array<Record<string, string>>;
  socialItems: Array<Record<string, string>>;
  socialTitle: string;
  updateField: (field: string, value: string) => void;
  resolveIcon: (iconStr: string | undefined) => any;
}

export function ContactInfo({ infoItems, socialItems, socialTitle, updateField, resolveIcon }: ContactInfoProps) {
  const { t } = useTranslation();

  const copyEmail = async (email: string) => {
    await navigator.clipboard.writeText(email);
    toast.success(t("footer.emailCopied"));
  };

  return (
    <div className="flex flex-col rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950/75 p-7">
      <div className="flex flex-col gap-3">
        {infoItems.map((item, index) => {
          const Icon = resolveIcon(item.icon);
          const isEmail = item.value.includes("@") || item.label.toLowerCase().includes("email") || item.label.toLowerCase().includes("correo");
          const content = (
            <div className="flex items-center gap-4 rounded-xl border border-zinc-100 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/40 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 dark:hover:border-violet-500/30">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/50 ring-1 ring-violet-200/60 dark:ring-violet-500/20">
                <Icon className="size-4 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-500 mb-0.5">
                  <EditableText
                    value={String(item.label)}
                    onSave={(value) => updateField(`info.${index}.label`, value)}
                  />
                </div>
                <div className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {isEmail ? t("footer.copyEmail") : (
                    <EditableText
                      value={String(item.value)}
                      onSave={(value) => updateField(`info.${index}.value`, value)}
                    />
                  )}
                </div>
              </div>
            </div>
          );

          return isEmail ? (
            <button key={String(item.label)} type="button" onClick={() => copyEmail(item.value)} className="block text-left">
              {content}
            </button>
          ) : item.link ? (
            <a key={String(item.link)} href={String(item.link)} className="block">
              {content}
            </a>
          ) : (
            <div key={String(item.label)}>{content}</div>
          );
        })}
      </div>

      <div className="mt-auto pt-6 border-t border-zinc-100 dark:border-white/10">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-500 mb-3">
          {String(socialTitle)}
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {socialItems.map((social) => {
            const Icon = resolveIcon(social.icon);
            return (
              <a
                key={String(social.link)}
                href={String(social.link)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-zinc-100 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/40 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 dark:hover:border-violet-500/30"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/50 ring-1 ring-violet-200/60 dark:ring-violet-500/20">
                  <Icon className="size-4 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-500 mb-0.5">
                    Social
                  </div>
                  <span className="block truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {String(social.label)}
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
