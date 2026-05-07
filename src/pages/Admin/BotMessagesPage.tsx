import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  ArrowLeft, 
  Bot, 
  Brain,
  Calendar,
  ChevronRight,
  Loader2,
  MessageSquare, 
  RefreshCcw,
  Repeat,
  Sparkles,
  Trash2, 
  User, 
  Users,
  Waves,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Markdown } from "@/components/ui/markdown";
import { useAdminAuth } from "@/features/admin/AdminAuthProvider";
import {
  deleteBotThread,
  fetchBotThreadMessages,
  fetchBotThreads,
  analyzeBotThread,
  analyzeBulkThreads,
  type BotThread,
  type BotThreadMessage,
} from "@/shared/api/bot";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { cn } from "@/components/ui/utils";

const EMPTY_MESSAGES: BotThreadMessage[] = [];
const KEYWORD_STOP_WORDS = new Set([
  "a", "al", "algo", "and", "como", "con", "cuál", "cual", "cuándo", "cuando", "de", "del", "el",
  "en", "es", "esta", "este", "for", "hola", "how", "i", "la", "las", "lo", "los", "me", "mi",
  "necesito", "para", "por", "que", "qué", "quiero", "se", "si", "sobre", "the", "to", "un", "una",
  "y", "yo",
]);

interface TopicInsight {
  label: string;
  mentions: number;
}

interface RepeatedPromptInsight {
  normalizedText: string;
  sample: string;
  mentions: number;
}

interface ThreadInsight {
  topics: TopicInsight[];
  repeatedPrompts: RepeatedPromptInsight[];
  userTurns: number;
}

const BOT_MESSAGE_ROLE_LABEL = {
  assistant: "assistant",
  system: "system",
  user: "user",
} as const;

function hasMessagesCache(
  cache: Record<string, BotThreadMessage[]>,
  threadId: string,
): boolean {
  return Object.prototype.hasOwnProperty.call(cache, threadId);
}

function resolveThreadMessages(
  thread: BotThread | null,
  cache: Record<string, BotThreadMessage[]>,
): BotThreadMessage[] {
  if (!thread) {
    return EMPTY_MESSAGES;
  }

  if (hasMessagesCache(cache, thread.id)) {
    return cache[thread.id] ?? EMPTY_MESSAGES;
  }

  return thread.messages ?? EMPTY_MESSAGES;
}

function normalizePrompt(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeContent(content: string): string[] {
  return normalizePrompt(content)
    .split(" ")
    .filter((token) => token.length >= 4 && !KEYWORD_STOP_WORDS.has(token));
}

function analyzeTopics(messages: BotThreadMessage[], limit = 5): TopicInsight[] {
  const counts = new Map<string, number>();

  for (const message of messages) {
    if (message.role !== "user") {
      continue;
    }

    for (const token of tokenizeContent(message.content)) {
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([label, mentions]) => ({ label, mentions }));
}

function analyzeRepeatedPrompts(messages: BotThreadMessage[], limit = 4): RepeatedPromptInsight[] {
  const promptMap = new Map<string, RepeatedPromptInsight>();

  for (const message of messages) {
    if (message.role !== "user") {
      continue;
    }

    const normalizedText = normalizePrompt(message.content);

    if (normalizedText.length < 10) {
      continue;
    }

    const existing = promptMap.get(normalizedText);

    if (existing) {
      existing.mentions += 1;
      continue;
    }

    promptMap.set(normalizedText, {
      normalizedText,
      sample: message.content,
      mentions: 1,
    });
  }

  return [...promptMap.values()]
    .filter((entry) => entry.mentions > 1)
    .sort((left, right) => right.mentions - left.mentions)
    .slice(0, limit);
}

function analyzeThread(messages: BotThreadMessage[]): ThreadInsight {
  const userTurns = messages.filter((message) => message.role === "user").length;

  return {
    topics: analyzeTopics(messages),
    repeatedPrompts: analyzeRepeatedPrompts(messages),
    userTurns,
  };
}

function formatConversationDate(input: string, locale?: string) {
  return new Date(input).toLocaleString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BotMessagesPage() {
  const { t } = useTranslation();
  const { token } = useAdminAuth();
  const [threads, setThreads] = useState<BotThread[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messagesByThreadId, setMessagesByThreadId] = useState<Record<string, BotThreadMessage[]>>({});
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [deletingThreadId, setDeletingThreadId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isBulkAnalyzing, setIsBulkAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [bulkAnalysisResult, setBulkAnalysisResult] = useState<string | null>(null);

  const limit = 10;

  useEffect(() => {
    if (token) {
      void loadThreads();
    }
  }, [token, page, searchQuery]);

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === selectedThreadId) ?? null,
    [selectedThreadId, threads],
  );

  const selectedThreadMessages = resolveThreadMessages(selectedThread, messagesByThreadId);

  const selectedThreadInsight = useMemo(
    () => analyzeThread(selectedThreadMessages),
    [selectedThreadMessages],
  );

  const globalUserMessages = useMemo(
    () => threads.flatMap((thread) => thread.messages || []).filter((message) => message && message.role === "user"),
    [threads],
  );

  const globalTopics = useMemo(() => analyzeTopics(globalUserMessages, 6), [globalUserMessages]);

  const totalMessages = useMemo(
    () => threads.reduce((accumulator, thread) => accumulator + (thread._count?.messages ?? 0), 0),
    [threads],
  );

  const uniquePersonas = useMemo(() => {
    return new Set(threads.map((thread) => thread.persona?.name ?? thread.personaId)).size;
  }, [threads]);

  const loadThreadMessages = async (thread: BotThread) => {
    if (!token) {
      return;
    }

    setIsLoadingMessages(true);

    try {
      const messages = await fetchBotThreadMessages(token, thread.id);

      setMessagesByThreadId((current) => ({
        ...current,
        [thread.id]: messages.length > 0 ? messages : thread.messages,
      }));
    } catch {
      setMessagesByThreadId((current) => ({
        ...current,
        [thread.id]: thread.messages,
      }));
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const loadThreads = async () => {
    try {
      setErrorMessage(null);
      setIsLoading((current) => (threads.length === 0 ? true : current));
      setIsRefreshing((current) => (threads.length > 0 ? true : current));
      const data = await fetchBotThreads(token!, page, limit, searchQuery);

      setThreads(data.items);
      setTotal(data.meta.total);

      // Si hay una seleccionada pero ya no está en la lista (por búsqueda o borrado), la mantenemos
      // Pero NO forzamos la selección del primer elemento si no hay nada seleccionado
    } catch (error) {
      console.error("Failed to fetch bot threads:", error);
      setErrorMessage(
        t("admin.bot.loadError", {
          defaultValue: "Could not load bot conversations. Try again in a moment.",
        }),
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSelectThread = async (thread: BotThread) => {
    // Si ya está seleccionada, la deseleccionamos (toggle)
    if (selectedThreadId === thread.id) {
      setSelectedThreadId(null);
      setAnalysisResult(null);
      return;
    }

    setSelectedThreadId(thread.id);
    setErrorMessage(null);
    setAnalysisResult(null);

    if (!hasMessagesCache(messagesByThreadId, thread.id)) {
      setMessagesByThreadId((current) => ({
        ...current,
        [thread.id]: thread.messages,
      }));
      await loadThreadMessages(thread);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedThread || !token) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const result = await analyzeBotThread(token, selectedThread.id);
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      setErrorMessage("Could not analyze conversation.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBulkAnalyze = async () => {
    if (!token) return;
    setIsBulkAnalyzing(true);
    setBulkAnalysisResult(null);
    try {
      const result = await analyzeBulkThreads(token, searchQuery);
      setBulkAnalysisResult(result);
    } catch (err) {
      console.error(err);
      setErrorMessage("Could not analyze results.");
    } finally {
      setIsBulkAnalyzing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("admin.bot.deleteConfirm"))) return;

    try {
      setDeletingThreadId(id);
      await deleteBotThread(token!, id);

      setMessagesByThreadId((current) => {
        const nextState = { ...current };
        delete nextState[id];
        return nextState;
      });

      if (selectedThreadId === id) {
        setSelectedThreadId(null);
      }

      await loadThreads();
    } catch (error) {
      console.error("Failed to delete thread:", error);
      setErrorMessage(
        t("admin.bot.deleteError", {
          defaultValue: "The conversation could not be deleted.",
        }),
      );
    } finally {
      setDeletingThreadId(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  if (isLoading && threads.length === 0) return <LoadingScreen />;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── Header ── */}
      <div className="mb-8 sm:mb-12">
        <Button
          variant="ghost"
          asChild
          className="group mb-2 sm:mb-6 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-slate-600 transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:border-violet-400/30 dark:hover:bg-violet-500/10 dark:hover:text-violet-200"
        >
          <Link to="/admin">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            {t("admin.logs.back")}
          </Link>
        </Button>

        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-600 dark:text-violet-400">
            {t("admin.bot.subtitle")}
          </p>
          <div className="mt-3 flex items-center justify-center gap-4">
            <Bot className="h-10 w-10 text-violet-500 shrink-0 hidden sm:block" />
            <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
              {t("admin.bot.title")}
            </h1>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-2xl border-violet-100 bg-white dark:border-violet-500/10 dark:bg-white/5"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleBulkAnalyze} 
                variant="outline" 
                disabled={isBulkAnalyzing || threads.length === 0}
                className="rounded-2xl border-violet-200 bg-violet-50/50 hover:bg-violet-50 dark:border-violet-500/20 dark:bg-violet-500/5 dark:hover:bg-violet-500/10 text-violet-700 dark:text-violet-400"
              >
                {isBulkAnalyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
                Analyze All
              </Button>
              <Button 
                onClick={() => void loadThreads()} 
                variant="outline" 
                className="rounded-2xl border-violet-200 bg-violet-50/50 hover:bg-violet-50 dark:border-violet-500/20 dark:bg-violet-500/5 dark:hover:bg-violet-500/10"
                disabled={isRefreshing}
              >
                <RefreshCcw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
                {t("admin.bot.refresh")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {bulkAnalysisResult && (
        <Card className="border-violet-400/30 bg-violet-500/5 backdrop-blur-sm animate-in zoom-in-95 duration-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-violet-700 dark:text-violet-300">
              <Sparkles className="h-5 w-5" />
              Global IA Strategy Report
            </CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full" 
              onClick={() => setBulkAnalysisResult(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Markdown className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-violet-600 dark:prose-headings:text-violet-400">
              {bulkAnalysisResult}
            </Markdown>
          </CardContent>
        </Card>
      )}

      {errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200 bg-white/70 dark:border-white/[0.07] dark:bg-white/[0.025]">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                {t("admin.bot.totalThreads", { defaultValue: "Threads in results" })}
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{total}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white/70 dark:border-white/[0.07] dark:bg-white/[0.025]">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                {t("admin.bot.totalMessages", { defaultValue: "Messages in page" })}
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalMessages}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white/70 dark:border-white/[0.07] dark:bg-white/[0.025]">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                {t("admin.bot.personasSeen", { defaultValue: "Personas seen" })}
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{uniquePersonas}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 bg-white/70 dark:border-white/[0.07] dark:bg-white/[0.025]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-4 w-4 text-violet-500" />
            {t("admin.bot.topicRadar", { defaultValue: "Topic radar" })}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {globalTopics.length > 0 ? (
            globalTopics.map((topic) => (
              <Badge key={topic.label} variant="outline" className="rounded-full border-violet-200 bg-violet-50/60 px-3 py-1 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-200">
                {topic.label} · {topic.mentions}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("admin.bot.topicFallback", { defaultValue: "Topic analysis will appear as soon as threads contain user prompts." })}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-slate-200 bg-white/70 dark:border-white/[0.07] dark:bg-white/[0.025]">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-white/5">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Waves className="h-4 w-4 text-violet-500" />
                {t("admin.bot.recentThreads")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {threads.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    {t("admin.bot.noThreads", { defaultValue: "No conversations found." })}
                  </div>
                ) : (
                  threads.map((thread) => (
                     <div 
                       key={thread.id}
                       onClick={() => void handleSelectThread(thread)}
                       className={cn(
                         "group flex items-start justify-between gap-3 p-4 cursor-pointer transition-colors hover:bg-violet-50/50 dark:hover:bg-violet-500/5",
                         selectedThread?.id === thread.id && "bg-violet-50 dark:bg-violet-500/10",
                       )}
                     >
                       <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                              {thread.title || t("admin.bot.newConversation")}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500">
                            {thread._count?.messages ?? 0} {t("admin.bot.messages")}
                          </span>
                          </div>
                         <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                           <span className="flex items-center gap-1">
                             <Calendar className="h-3 w-3" />
                             {formatConversationDate(thread.createdAt)}
                           </span>
                           <Badge variant="outline" className="rounded-full border-slate-200 bg-white/70 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                             {thread.persona?.name ?? thread.personaId}
                           </Badge>
                         </div>
                       </div>
                       <ChevronRight className={cn(
                         "mt-2 h-4 w-4 text-slate-300 transition-transform",
                         selectedThread?.id === thread.id && "translate-x-1 text-violet-500",
                       )} />
                     </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2">
              <p className="text-xs text-slate-500">
                {t("common.pagination.page", { current: page, total: totalPages })}
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-xl h-8"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  {t("common.pagination.previous")}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-xl h-8"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  {t("common.pagination.next")}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          {selectedThread ? (
            <Card className="h-full flex flex-col border-slate-200 bg-white/70 dark:border-white/[0.07] dark:bg-white/[0.025] overflow-hidden">
              <CardHeader className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex flex-row items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg font-semibold">{selectedThread.title || t("admin.bot.newConversation")}</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="rounded-full h-8 px-3 text-xs gap-2 border-violet-200 text-violet-700 hover:bg-violet-50 dark:border-violet-500/20 dark:text-violet-300 dark:hover:bg-violet-500/10"
                    >
                      {isAnalyzing ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                      Analyze Context
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
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
                    onClick={() => void handleDelete(selectedThread.id)}
                    disabled={deletingThreadId === selectedThread.id}
                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    {deletingThreadId === selectedThread.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setSelectedThreadId(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-0 flex flex-col">
                {/* Analysis result banner */}
                {analysisResult && (
                  <div className="p-6 bg-violet-50/50 dark:bg-violet-500/5 border-b border-violet-100 dark:border-violet-500/10 animate-in slide-in-from-top-2">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm font-bold text-violet-700 dark:text-violet-300">
                        <Brain className="h-4 w-4" />
                        AI Feedback
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 rounded-full text-violet-400 hover:text-violet-600"
                        onClick={() => setAnalysisResult(null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <Markdown className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 text-slate-700 dark:text-slate-300">
                      {analysisResult}
                    </Markdown>
                  </div>
                )}

                <div className="p-6 space-y-4 border-b border-slate-100 dark:border-white/5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                        <Brain className="h-4 w-4 text-violet-500" />
                        {t("admin.bot.topicsTitle", { defaultValue: "Topics discussed" })}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedThreadInsight.topics.length > 0 ? (
                          selectedThreadInsight.topics.map((topic) => (
                            <Badge key={topic.label} variant="outline" className="rounded-full border-violet-200 bg-violet-50/70 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-200">
                              {topic.label} · {topic.mentions}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {t("admin.bot.noTopicSignals", { defaultValue: "Not enough user text yet to infer topics." })}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                        <Repeat className="h-4 w-4 text-sky-500" />
                        {t("admin.bot.flowTitle", { defaultValue: "Conversation flow" })}
                      </div>

                      {selectedThreadInsight.repeatedPrompts.length > 0 ? (
                        <div className="space-y-2">
                          {selectedThreadInsight.repeatedPrompts.map((prompt) => (
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
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {t("admin.bot.flowHealthy", {
                            defaultValue: "No repeated user prompts detected in this thread. The flow looks direct.",
                          })}
                        </p>
                      )}

                      <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
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
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("common.loading", { defaultValue: "Loading" })}...
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
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t("admin.bot.visitor")}</span>
                                <User className="h-3 w-3 text-slate-400" />
                             </>
                           ) : msg.role === BOT_MESSAGE_ROLE_LABEL.system ? (
                             <>
                               <Brain className="h-3 w-3 text-amber-500" />
                               <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                                 {t("admin.bot.system", { defaultValue: "System" })}
                               </span>
                             </>
                           ) : (
                             <>
                               <Bot className="h-3 w-3 text-violet-500" />
                               <span className="text-[10px] font-bold uppercase tracking-wider text-violet-500">{t("admin.bot.aiAssistant")}</span>
                             </>
                           )}
                         </div>
                          <div className={cn(
                            "p-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                            msg.role === BOT_MESSAGE_ROLE_LABEL.user
                              ? "bg-violet-600 text-white rounded-tr-none"
                              : msg.role === BOT_MESSAGE_ROLE_LABEL.system
                                ? "rounded-tl-none border border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100"
                              : "bg-white border border-slate-100 dark:bg-white/5 dark:border-white/5 text-slate-800 dark:text-slate-200 rounded-tl-none",
                          )}>
                            {msg.role === BOT_MESSAGE_ROLE_LABEL.assistant || msg.role === BOT_MESSAGE_ROLE_LABEL.system ? (
                              <Markdown className="prose prose-sm max-w-none prose-p:my-0 dark:prose-invert">
                                {msg.content}
                              </Markdown>
                           ) : (
                             <p className="whitespace-pre-wrap">{msg.content}</p>
                           )}
                         </div>
                         <span className="text-[10px] text-slate-400 px-1">
                           {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                       </div>
                     </div>
                   ))}

                  {!isLoadingMessages && selectedThreadMessages.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
                      {t("admin.bot.noMessages", { defaultValue: "This thread has no stored messages yet." })}
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50/30 dark:bg-white/[0.01] p-12 text-center">
              <div className="h-16 w-16 rounded-2xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-violet-300 dark:text-violet-700" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{t("admin.bot.selectConversation")}</h3>
              <p className="text-slate-500 max-w-xs mt-2">
                {t("admin.bot.selectConversationDesc")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

