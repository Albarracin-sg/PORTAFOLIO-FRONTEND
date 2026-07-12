import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { catImages } from "@/assets/stack/cats";

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  catIndex?: number;
  isDark?: boolean;
}

export function StatsCard({ title, value, description, icon: Icon, catIndex, isDark }: StatsCardProps) {
  const cat = catIndex !== undefined ? catImages[catIndex] : undefined;

  return (
    <Card className="flex flex-col overflow-hidden border-zinc-200 bg-white/85 transition-colors hover:border-violet-400/30 hover:bg-white dark:bg-zinc-950/75 dark:border-white/10 dark:hover:bg-zinc-950/90">
      <CardHeader className="pb-2 sm:pb-3">
        <div className="mb-2 sm:mb-3 flex size-10 sm:size-11 items-center justify-center rounded-xl border border-zinc-200 bg-violet-50 text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-300">
          <Icon className="size-5" />
        </div>
        <CardTitle className="text-sm sm:text-base font-semibold tracking-tight text-zinc-900 dark:text-white">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          {value}
        </div>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      </CardContent>
      {cat && (
        <div className="flex justify-end px-4 pb-3">
          <img
            src={isDark ? cat.night : cat.day}
            alt=""
            aria-hidden="true"
            className={`pointer-events-none opacity-80 ${catIndex === 3 ? 'h-20 w-20 sm:h-28 sm:w-28' : 'h-16 w-16 sm:h-24 sm:w-24'}`}
          />
        </div>
      )}
    </Card>
  );
}
