import { Globe, Target, CheckCircle2, Zap } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

interface TranslationFieldsProps {
  lang: 'Es' | 'En';
  form: any;
  onChange: (field: string, value: string) => void;
  t: any;
}

export function TranslationFields({ lang, form, onChange, t }: TranslationFieldsProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <FieldGroup
        icon={<Globe className="size-4" />}
        title={t('admin.projects.edit.whatIs')}
        colorClass="text-violet-600 dark:text-violet-400"
      >
        <Textarea
          value={form[`description${lang}`]}
          onChange={(e) => onChange(`description${lang}`, e.target.value)}
          rows={5}
          placeholder={t('admin.projects.edit.placeholders.description')}
          className="rounded-2xl border-zinc-200 dark:border-white/10 p-4 bg-white/50 dark:bg-black/20 focus:ring-violet-500/20 transition-all text-sm leading-relaxed"
        />
      </FieldGroup>

      <Separator className="bg-zinc-200/50 dark:bg-white/5" />

      <FieldGroup
        icon={<Target className="size-4" />}
        title={t('admin.projects.edit.problem')}
        colorClass="text-blue-600 dark:text-blue-400"
      >
        <Textarea
          value={form[`problem${lang}`]}
          onChange={(e) => onChange(`problem${lang}`, e.target.value)}
          rows={5}
          placeholder={t('admin.projects.edit.placeholders.problem')}
          className="rounded-2xl border-zinc-200 dark:border-white/10 p-4 bg-white/50 dark:bg-black/20 focus:ring-violet-500/20 transition-all text-sm leading-relaxed"
        />
      </FieldGroup>

      <Separator className="bg-zinc-200/50 dark:bg-white/5" />

      <FieldGroup
        icon={<CheckCircle2 className="size-4" />}
        title={t('admin.projects.edit.solution')}
        colorClass="text-emerald-600 dark:text-emerald-400"
      >
        <Textarea
          value={form[`solution${lang}`]}
          onChange={(e) => onChange(`solution${lang}`, e.target.value)}
          rows={5}
          placeholder={t('admin.projects.edit.placeholders.solution')}
          className="rounded-2xl border-zinc-200 dark:border-white/10 p-4 bg-white/50 dark:bg-black/20 focus:ring-violet-500/20 transition-all text-sm leading-relaxed"
        />
      </FieldGroup>

      <Separator className="bg-zinc-200/50 dark:bg-white/5" />

      <FieldGroup
        icon={<Zap className="size-4" />}
        title={t('admin.projects.edit.challenge')}
        colorClass="text-amber-600 dark:text-amber-400"
      >
        <Textarea
          value={form[`challenge${lang}`]}
          onChange={(e) => onChange(`challenge${lang}`, e.target.value)}
          rows={5}
          placeholder={t('admin.projects.edit.placeholders.challenge')}
          className="rounded-2xl border-zinc-200 dark:border-white/10 p-4 bg-white/50 dark:bg-black/20 focus:ring-violet-500/20 transition-all text-sm leading-relaxed"
        />
      </FieldGroup>
    </div>
  );
}

function FieldGroup({ icon, title, colorClass, children }: { icon: React.ReactNode, title: string, colorClass: string, children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className={`flex items-center gap-2 ${colorClass}`}>
        {icon}
        <h4 className="text-sm font-semibold uppercase tracking-widest">{title}</h4>
      </div>
      {children}
    </div>
  );
}
