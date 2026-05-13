import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function StatsCard({ title, value, description, icon: Icon }: StatsCardProps) {
  return (
    <Card className="border-zinc-200 bg-white/85 transition-colors hover:border-violet-400/30 hover:bg-white dark:border-white/[0.07] dark:bg-white/[0.025] dark:hover:bg-white/[0.04]">
      <CardHeader className="pb-2 sm:pb-3">
        <div className="mb-2 sm:mb-3 flex size-10 sm:size-11 items-center justify-center rounded-xl border border-zinc-200 bg-violet-50 text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-300">
          <Icon className="size-5" />
        </div>
        <CardTitle className="text-sm sm:text-base font-semibold tracking-tight text-zinc-900 dark:text-white">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          {value}
        </div>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
