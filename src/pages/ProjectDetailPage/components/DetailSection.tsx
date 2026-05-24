import { ReactNode } from 'react';

type DetailSectionProps = {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  withIndent?: boolean;
  className?: string;
};

export function DetailSection({ 
  icon, 
  title, 
  children, 
  withIndent = false,
  className = "" 
}: DetailSectionProps) {
  return (
    <section className={["p-5 sm:p-7 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] flex flex-col overflow-hidden", className].join(' ')}>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-2 rounded-xl bg-zinc-200/60 dark:bg-white/5 shrink-0">{icon}</div>
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 break-words">
          {title}
        </h2>
      </div>

      <div
        className={[
          'text-sm leading-7 text-zinc-600 dark:text-zinc-400 flex-1 break-words',
          withIndent ? 'pl-0 sm:pl-[2.375rem]' : '',
        ].join(' ')}
      >
        {children}
      </div>
    </section>
  );
}
