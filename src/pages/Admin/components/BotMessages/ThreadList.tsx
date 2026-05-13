import { Waves, Calendar, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import { type BotThread } from "@/shared/api/bot";
import { commonFormatters } from "@/shared/utils/formatters";

interface ThreadListProps {
  threads: BotThread[];
  selectedThreadId: string | null;
  onSelectThread: (thread: BotThread) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ThreadList({ 
  threads, 
  selectedThreadId, 
  onSelectThread, 
  page, 
  totalPages, 
  onPageChange 
}: ThreadListProps) {
  const { t, i18n } = useTranslation();

  const formatConversationDate = (input: string) => {
    return commonFormatters.shortDate(i18n.language).format(new Date(input));
  };

  return (
    <div className="lg:col-span-2 space-y-4">
      <Card className="border-zinc-200 bg-white/70 dark:border-white/[0.07] dark:bg-white/[0.025]">
        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-white/5">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Waves className="size-4 text-violet-500" />
            {t("admin.bot.recentThreads")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-zinc-100 dark:divide-white/5">
            {threads.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">
                {t("admin.bot.noThreads", { defaultValue: "No conversations found." })}
              </div>
            ) : (
              threads.map((thread) => (
                 <button 
                   key={thread.id}
                   type="button"
                   onClick={() => onSelectThread(thread)}
                   className={cn(
                     "w-full text-left group flex items-start justify-between gap-3 p-4 transition-colors hover:bg-violet-50/50 dark:hover:bg-violet-500/5",
                     selectedThreadId === thread.id && "bg-violet-50 dark:bg-violet-500/10",
                   )}
                 >
                   <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                          {thread.title || t("admin.bot.newConversation")}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-white/10 text-zinc-500">
                        {thread._count?.messages ?? 0} {t("admin.bot.messages")}
                      </span>
                      </div>
                     <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                       <span className="flex items-center gap-1">
                         <Calendar className="size-3" />
                         {formatConversationDate(thread.createdAt)}
                       </span>
                       <Badge variant="outline" className="rounded-full border-zinc-200 bg-white/70 text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
                         {thread.persona?.name ?? thread.personaId}
                       </Badge>
                     </div>
                   </div>
                   <ChevronRight className={cn(
                     "mt-2 size-4 text-zinc-300 transition-transform",
                     selectedThreadId === thread.id && "translate-x-1 text-violet-500",
                   )} />
                 </button>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-xs text-zinc-500">
            {t("common.pagination.page", { current: page, total: totalPages })}
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-xl h-8"
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
            >
              {t("common.pagination.previous")}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-xl h-8"
              disabled={page === totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              {t("common.pagination.next")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
