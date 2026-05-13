import { 
  Loader2, 
  Trash2, 
  X, 
  Sparkles, 
  Brain, 
  Repeat,
  Bot,
  User,
  MessageSquare
} from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from "react";

// SafeTime to avoid hydration mismatch
function SafeTime({ date, locale }: { date: string | number | Date, locale: string }) {
  const [formatted, setFormatted] = useState<string>("");
  
  useEffect(() => {
    setFormatted(commonFormatters.shortTime(locale).format(new Date(date)));
  }, [date, locale]);

  return <time suppressHydrationWarning>{formatted}</time>;
}
import { commonFormatters } from '@/shared/utils/formatters';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Markdown } from "@/components/ui/markdown";
import { cn } from "@/components/ui/utils";
import { type BotThread, type BotThreadMessage } from "@/shared/api/bot";

interface ThreadDetailProps {
  selectedThread: BotThread | null;
  selectedThreadMessages: BotThreadMessage[];
  selectedThreadInsight: any;
  isLoadingMessages: boolean;
  isAnalyzing: boolean;
  analysisResult: string | null;
  deletingThreadId: string | null;
  onAnalyze: () => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  onCloseAnalysis: () => void;
}

const BOT_MESSAGE_ROLE_LABEL = {
  assistant: "assistant",
  system: "system",
  user: "user",
} as const;

export function ThreadDetail({
  selectedThread,
  selectedThreadMessages,
  selectedThreadInsight,
  isLoadingMessages,
  isAnalyzing,
  analysisResult,
  deletingThreadId,
  onAnalyze,
  onDelete,
  onClose,
  onCloseAnalysis,
}: ThreadDetailProps) {
  const { t, i18n } = useTranslation();

  const formatConversationDate = (input: string) => {
    return commonFormatters.shortDate(i18n.language).format(new Date(input));
  };

  if (!selectedThread) {
    return (
      <div className="lg:col-span-3 h-full min-h-[400px] flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 dark:border-white/10 bg-zinc-50/30 dark:bg-white/[0.01] p-12 text-center">
        <div className="size-16 rounded-2xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center mb-4">
          <MessageSquare className="size-8 text-violet-300 dark:text-violet-700" />
        </div>
        <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">{t("admin.bot.selectConversation")}</h3>
        <p className="text-zinc-500 max-w-xs mt-2">
          {t("admin.bot.selectConversationDesc")}
        </p>
      </div>
    );
  }

  return (
    <Card className="lg:col-span-3 h-full flex flex-col border-zinc-200 bg-white/70 dark:border-white/[0.07] dark:bg-white/[0.025] overflow-hidden">
      <CardHeader className="border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02] flex flex-row items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg font-semibold">{selectedThread.title || t("admin.bot.newConversation")}</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="rounded-full h-8 px-3 text-xs gap-2 border-violet-200 text-violet-700 hover:bg-violet-50 dark:border-violet-500/20 dark:text-violet-300 dark:hover:bg-violet-500/10"
            >
              {isAnalyzing ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Sparkles className="size-3.5" />
              )}
              Analyze Context
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
            <span>ID: {selectedThread.id}</span>
            <span>•</span>
            <span>{formatConversationDate(selectedThread.createdAt)}</span>
            <Badge variant="outline" className="rounded-full border-violet-200 bg-violet-50/70 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-200">
              {selectedThread.persona?.name ?? selectedThread.personaId}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onDelete(selectedThread.id)}
            disabled={deletingThreadId === selectedThread.id}
            className="text-red-950 hover:text-red-600 hover:bg-red-50 dark:text-red-200 dark:hover:bg-red-500/10"
          >
            {deletingThreadId === selectedThread.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-black hover:text-zinc-600 dark:text-white dark:hover:text-zinc-300"
          >
            <X className="size-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-0 flex flex-col">
        {analysisResult && (
          <div className="p-6 bg-violet-50/50 dark:bg-violet-500/5 border-b border-violet-100 dark:border-violet-500/10 animate-in slide-in-from-top-2">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-violet-700 dark:text-violet-300">
                <Brain className="size-4" />
                AI Feedback
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="size-6 rounded-full text-violet-400 hover:text-violet-600"
                onClick={onCloseAnalysis}
              >
                <X className="size-3" />
              </Button>
            </div>
            <Markdown className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 text-zinc-700 dark:text-zinc-300">
              {analysisResult}
            </Markdown>
          </div>
        )}

        <div className="p-6 space-y-4 border-b border-zinc-100 dark:border-white/5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
                <Brain className="size-4 text-violet-500" />
                {t("admin.bot.topicsTitle", { defaultValue: "Topics discussed" })}
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedThreadInsight.topics.length > 0 ? (
                  selectedThreadInsight.topics.map((topic: any) => (
                    <Badge key={topic.label} variant="outline" className="rounded-full border-violet-200 bg-violet-50/70 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-200">
                      {topic.label} · {topic.mentions}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {t("admin.bot.noTopicSignals", { defaultValue: "Not enough user text yet to infer topics." })}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
                <Repeat className="size-4 text-sky-500" />
                {t("admin.bot.flowTitle", { defaultValue: "Conversation flow" })}
              </div>

              {selectedThreadInsight.repeatedPrompts.length > 0 ? (
                <div className="space-y-2">
                  {selectedThreadInsight.repeatedPrompts.map((prompt: any) => (
                    <div key={prompt.normalizedText} className="rounded-xl border border-sky-200 bg-sky-50/70 px-3 py-2 text-sm text-sky-900 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-100">
                      <p className="font-medium">{prompt.sample}</p>
                      <p className="mt-1 text-xs text-sky-700 dark:text-sky-200/80">
                        {t("admin.bot.repeatedPrompt", {
                          defaultValue: "Repeated {{count}} times — likely unresolved intent or confirmation need.",
                          count: prompt.mentions,
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {t("admin.bot.flowHealthy", {
                    defaultValue: "No repeated user prompts detected in this thread. The flow looks direct.",
                  })}
                </p>
              )}

              <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
                {t("admin.bot.turnsSummary", {
                  defaultValue: "User turns: {{count}}",
                  count: selectedThreadInsight.userTurns,
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[600px]">
          {isLoadingMessages ? (
            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Loader2 className="size-4 animate-spin" />
              {t("common.loading", { defaultValue: "Loading" })}…
            </div>
          ) : null}

          {selectedThreadMessages.map((msg) => (
             <div 
                key={msg.id}
                className={cn("flex", msg.role === BOT_MESSAGE_ROLE_LABEL.user ? "justify-end" : "justify-start")}
              >
                <div className={cn("flex max-w-[85%] flex-col space-y-1", msg.role === BOT_MESSAGE_ROLE_LABEL.user ? "items-end" : "items-start")}>
                  <div className="flex items-center gap-2 px-1">
                    {msg.role === BOT_MESSAGE_ROLE_LABEL.user ? (
                      <>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{t("admin.bot.visitor")}</span>
                        <User className="size-3 text-zinc-400" />
                     </>
                   ) : msg.role === BOT_MESSAGE_ROLE_LABEL.system ? (
                     <>
                       <Brain className="size-3 text-amber-500" />
                       <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-500">
                         {t("admin.bot.system", { defaultValue: "System" })}
                       </span>
                     </>
                   ) : (
                     <>
                       <Bot className="size-3 text-violet-500" />
                       <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-500">{t("admin.bot.aiAssistant")}</span>
                     </>
                   )}
                 </div>
                  <div className={cn(
                    "p-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                    msg.role === BOT_MESSAGE_ROLE_LABEL.user
                      ? "bg-violet-600 text-white rounded-tr-none"
                      : msg.role === BOT_MESSAGE_ROLE_LABEL.system
                                ? "rounded-tl-none border border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100"
                              : "bg-white border border-zinc-100 dark:bg-white/5 dark:border-white/5 text-zinc-800 dark:text-zinc-200 rounded-tl-none",
                  )}>
                    {msg.role === BOT_MESSAGE_ROLE_LABEL.assistant || msg.role === BOT_MESSAGE_ROLE_LABEL.system ? (
                      <Markdown className="prose prose-sm max-w-none prose-p:my-0 dark:prose-invert">
                        {msg.content}
                      </Markdown>
                   ) : (
                     <p className="whitespace-pre-wrap">{msg.content}</p>
                   )}
                 </div>
                 <span className="text-[10px] text-zinc-400 px-1">
                   <SafeTime date={msg.createdAt} locale={i18n.language} />
                 </span>
               </div>
             </div>
           ))}

          {!isLoadingMessages && selectedThreadMessages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 p-6 text-center text-sm text-zinc-500 dark:border-white/10 dark:text-zinc-400">
              {t("admin.bot.noMessages", { defaultValue: "This thread has no stored messages yet." })}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
