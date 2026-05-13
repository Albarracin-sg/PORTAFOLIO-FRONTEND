import { EditableText } from "@/features/admin/InlineEdit";

interface ContactHeaderProps {
  title: string;
  subtitle: string;
  onSaveTitle: (val: string) => void;
  onSaveSubtitle: (val: string) => void;
  t: (key: string) => string;
}

export function ContactHeader({ title, subtitle, onSaveTitle, onSaveSubtitle, t }: ContactHeaderProps) {
  return (
    <div className="mb-12 text-center lg:text-left">
      <h1 className="mb-4 text-5xl font-semibold leading-none tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-6xl">
        <EditableText
          value={title}
          displayValue={String(t("contact.title"))}
          onSave={onSaveTitle}
        />
        <span className="text-violet-500"> .</span>
      </h1>
      <p className="max-w-3xl mx-auto lg:mx-0 text-sm leading-7 text-zinc-600 dark:text-zinc-400 sm:text-base">
        <EditableText
          value={subtitle}
          displayValue={String(t("contact.subtitle"))}
          onSave={onSaveSubtitle}
          multiline
        />
      </p>
    </div>
  );
}
