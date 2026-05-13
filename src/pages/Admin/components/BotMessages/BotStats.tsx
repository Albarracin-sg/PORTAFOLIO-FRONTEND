import { MessageSquare, Users, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";

interface BotStatsProps {
  totalThreads: number;
  totalMessages: number;
  uniquePersonas: number;
}

export function BotStats({ totalThreads, totalMessages, uniquePersonas }: BotStatsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="border-zinc-200 bg-white/70 dark:border-white/[0.07] dark:bg-white/[0.025]">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
            <MessageSquare className="size-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">
              {t("admin.bot.totalThreads", { defaultValue: "Threads in results" })}
            </p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{totalThreads}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-zinc-200 bg-white/70 dark:border-white/[0.07] dark:bg-white/[0.025]">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
            <Users className="size-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">
              {t("admin.bot.totalMessages", { defaultValue: "Messages in page" })}
            </p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{totalMessages}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-zinc-200 bg-white/70 dark:border-white/[0.07] dark:bg-white/[0.025]">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
            <Sparkles className="size-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">
              {t("admin.bot.personasSeen", { defaultValue: "Personas seen" })}
            </p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{uniquePersonas}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
