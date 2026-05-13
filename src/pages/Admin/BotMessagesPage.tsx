import { useEffect, useMemo, useReducer, useCallback } from "react";
import { useTranslation } from "react-i18next";
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

// Components
import { AnalysisHeader } from "./components/BotMessages/AnalysisHeader";
import { BulkAnalysisReport } from "./components/BotMessages/BulkAnalysisReport";
import { BotStats } from "./components/BotMessages/BotStats";
import { TopicRadar } from "./components/BotMessages/TopicRadar";
import { ThreadList } from "./components/BotMessages/ThreadList";
import { ThreadDetail } from "./components/BotMessages/ThreadDetail";

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

interface BotMessagesState {
  threads: BotThread[];
  total: number;
  page: number;
  isLoading: boolean;
  isRefreshing: boolean;
  selectedThreadId: string | null;
  messagesByThreadId: Record<string, BotThreadMessage[]>;
  isLoadingMessages: boolean;
  deletingThreadId: string | null;
  errorMessage: string | null;
  searchQuery: string;
  isAnalyzing: boolean;
  isBulkAnalyzing: boolean;
  analysisResult: string | null;
  bulkAnalysisResult: string | null;
}

type BotMessagesAction =
  | { type: "START_LOAD" }
  | { type: "FINISH_LOAD"; payload: { threads: BotThread[]; total: number } }
  | { type: "START_REFRESH" }
  | { type: "FINISH_REFRESH"; payload: { threads: BotThread[]; total: number } }
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SELECT_THREAD"; payload: string | null }
  | { type: "SET_MESSAGES"; payload: { threadId: string; messages: BotThreadMessage[] } }
  | { type: "START_LOAD_MESSAGES" }
  | { type: "FINISH_LOAD_MESSAGES" }
  | { type: "START_DELETE"; payload: string }
  | { type: "FINISH_DELETE"; payload: string }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "START_ANALYSIS" }
  | { type: "FINISH_ANALYSIS"; payload: string }
  | { type: "START_BULK_ANALYSIS" }
  | { type: "FINISH_BULK_ANALYSIS"; payload: string }
  | { type: "CLOSE_ANALYSIS" }
  | { type: "CLOSE_BULK_ANALYSIS" };

function botMessagesReducer(state: BotMessagesState, action: BotMessagesAction): BotMessagesState {
  switch (action.type) {
    case "START_LOAD":
      return { ...state, isLoading: true, errorMessage: null };
    case "FINISH_LOAD":
      return { ...state, isLoading: false, threads: action.payload.threads, total: action.payload.total };
    case "START_REFRESH":
      return { ...state, isRefreshing: true, errorMessage: null };
    case "FINISH_REFRESH":
      return { ...state, isRefreshing: false, threads: action.payload.threads, total: action.payload.total };
    case "SET_PAGE":
      return { ...state, page: action.payload };
    case "SET_SEARCH":
      return { ...state, searchQuery: action.payload, page: 1 };
    case "SELECT_THREAD":
      return { ...state, selectedThreadId: action.payload, analysisResult: null };
    case "SET_MESSAGES":
      return { ...state, messagesByThreadId: { ...state.messagesByThreadId, [action.payload.threadId]: action.payload.messages } };
    case "START_LOAD_MESSAGES":
      return { ...state, isLoadingMessages: true };
    case "FINISH_LOAD_MESSAGES":
      return { ...state, isLoadingMessages: false };
    case "START_DELETE":
      return { ...state, deletingThreadId: action.payload };
    case "FINISH_DELETE":
      return { 
        ...state, 
        deletingThreadId: null, 
        threads: state.threads.filter(t => t.id !== action.payload),
        selectedThreadId: state.selectedThreadId === action.payload ? null : state.selectedThreadId
      };
    case "SET_ERROR":
      return { ...state, errorMessage: action.payload };
    case "START_ANALYSIS":
      return { ...state, isAnalyzing: true, analysisResult: null };
    case "FINISH_ANALYSIS":
      return { ...state, isAnalyzing: false, analysisResult: action.payload };
    case "START_BULK_ANALYSIS":
      return { ...state, isBulkAnalyzing: true, bulkAnalysisResult: null };
    case "FINISH_BULK_ANALYSIS":
      return { ...state, isBulkAnalyzing: false, bulkAnalysisResult: action.payload };
    case "CLOSE_ANALYSIS":
      return { ...state, analysisResult: null };
    case "CLOSE_BULK_ANALYSIS":
      return { ...state, bulkAnalysisResult: null };
    default:
      return state;
  }
}

function hasMessagesCache(cache: Record<string, BotThreadMessage[]>, threadId: string): boolean {
  return Object.prototype.hasOwnProperty.call(cache, threadId);
}

function resolveThreadMessages(thread: BotThread | null, cache: Record<string, BotThreadMessage[]>): BotThreadMessage[] {
  if (!thread) return EMPTY_MESSAGES;
  if (hasMessagesCache(cache, thread.id)) return cache[thread.id] ?? EMPTY_MESSAGES;
  return thread.messages ?? EMPTY_MESSAGES;
}

function normalizePrompt(input: string): string {
  return input.toLowerCase().normalize("NFD").replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}

function tokenizeContent(content: string): string[] {
  return normalizePrompt(content).split(" ").filter((token) => token.length >= 4 && !KEYWORD_STOP_WORDS.has(token));
}

function analyzeTopics(messages: BotThreadMessage[], limit = 5): TopicInsight[] {
  const counts = new Map<string, number>();
  for (const message of messages) {
    if (message.role !== "user") continue;
    for (const token of tokenizeContent(message.content)) {
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .toSorted((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([label, mentions]) => ({ label, mentions }));
}

function analyzeRepeatedPrompts(messages: BotThreadMessage[], limit = 4): RepeatedPromptInsight[] {
  const promptMap = new Map<string, RepeatedPromptInsight>();
  for (const message of messages) {
    if (message.role !== "user") continue;
    const normalizedText = normalizePrompt(message.content);
    if (normalizedText.length < 10) continue;
    const existing = promptMap.get(normalizedText);
    if (existing) { existing.mentions += 1; continue; }
    promptMap.set(normalizedText, { normalizedText, sample: message.content, mentions: 1 });
  }
  return [...promptMap.values()].filter((entry) => entry.mentions > 1).sort((left, right) => right.mentions - left.mentions).slice(0, limit);
}

function analyzeThread(messages: BotThreadMessage[]): ThreadInsight {
  const userTurns = messages.filter((message) => message.role === "user").length;
  return { topics: analyzeTopics(messages), repeatedPrompts: analyzeRepeatedPrompts(messages), userTurns };
}

export default function BotMessagesPage() {
  const { t } = useTranslation();
  const { token } = useAdminAuth();
  const [state, dispatch] = useReducer(botMessagesReducer, {
    threads: [], total: 0, page: 1, isLoading: true, isRefreshing: false, selectedThreadId: null,
    messagesByThreadId: {}, isLoadingMessages: false, deletingThreadId: null, errorMessage: null,
    searchQuery: '', isAnalyzing: false, isBulkAnalyzing: false, analysisResult: null, bulkAnalysisResult: null
  });

  const {
    threads, total, page, isLoading, isRefreshing, selectedThreadId,
    messagesByThreadId, isLoadingMessages, deletingThreadId, errorMessage,
    searchQuery, isAnalyzing, isBulkAnalyzing, analysisResult, bulkAnalysisResult
  } = state;

  const limit = 10;

  const loadThreads = useCallback(async () => {
    if (!token) return;
    try {
      dispatch({ type: threads.length === 0 ? "START_LOAD" : "START_REFRESH" });
      const data = await fetchBotThreads(token, page, limit, searchQuery);
      dispatch({ type: threads.length === 0 ? "FINISH_LOAD" : "FINISH_REFRESH", payload: { threads: data.items, total: data.meta.total } });
    } catch (error) {
      console.error("Failed to fetch bot threads:", error);
      dispatch({ type: "SET_ERROR", payload: t("admin.bot.loadError") });
    }
  }, [token, page, searchQuery, threads.length, t]);

  useEffect(() => { loadThreads(); }, [loadThreads]);

  const selectedThread = useMemo(() => threads.find((thread) => thread.id === selectedThreadId) ?? null, [selectedThreadId, threads]);
  const selectedThreadMessages = resolveThreadMessages(selectedThread, messagesByThreadId);
  const selectedThreadInsight = useMemo(() => analyzeThread(selectedThreadMessages), [selectedThreadMessages]);

  const globalUserMessages = useMemo(() => threads.reduce<BotThreadMessage[]>((acc, thread) => {
    if (thread.messages) {
      for (const msg of thread.messages) { if (msg && msg.role === "user") acc.push(msg); }
    }
    return acc;
  }, []), [threads]);

  const globalTopics = useMemo(() => analyzeTopics(globalUserMessages, 6), [globalUserMessages]);
  const totalMessages = useMemo(() => threads.reduce((acc, thread) => acc + (thread._count?.messages ?? 0), 0), [threads]);
  const uniquePersonas = useMemo(() => new Set(threads.map((thread) => thread.persona?.name ?? thread.personaId)).size, [threads]);

  const loadThreadMessages = async (thread: BotThread) => {
    if (!token) return;
    dispatch({ type: "START_LOAD_MESSAGES" });
    try {
      const messages = await fetchBotThreadMessages(token, thread.id);
      dispatch({ type: "SET_MESSAGES", payload: { threadId: thread.id, messages: messages.length > 0 ? messages : (thread.messages ?? []) } });
    } catch {
      dispatch({ type: "SET_MESSAGES", payload: { threadId: thread.id, messages: thread.messages ?? [] } });
    } finally {
      dispatch({ type: "FINISH_LOAD_MESSAGES" });
    }
  };

  const handleSelectThread = async (thread: BotThread) => {
    if (selectedThreadId === thread.id) {
      dispatch({ type: "SELECT_THREAD", payload: null });
      return;
    }
    dispatch({ type: "SELECT_THREAD", payload: thread.id });
    if (!hasMessagesCache(messagesByThreadId, thread.id)) {
      dispatch({ type: "SET_MESSAGES", payload: { threadId: thread.id, messages: thread.messages ?? [] } });
      await loadThreadMessages(thread);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedThread || !token) return;
    dispatch({ type: "START_ANALYSIS" });
    try {
      const result = await analyzeBotThread(token, selectedThread.id);
      dispatch({ type: "FINISH_ANALYSIS", payload: result });
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Could not analyze conversation." });
    }
  };

  const handleBulkAnalyze = async () => {
    if (!token) return;
    dispatch({ type: "START_BULK_ANALYSIS" });
    try {
      const result = await analyzeBulkThreads(token, searchQuery);
      dispatch({ type: "FINISH_BULK_ANALYSIS", payload: result });
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Could not analyze results." });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("admin.bot.deleteConfirm"))) return;
    dispatch({ type: "START_DELETE", payload: id });
    try {
      await deleteBotThread(token!, id);
      dispatch({ type: "FINISH_DELETE", payload: id });
      await loadThreads();
    } catch {
      dispatch({ type: "SET_ERROR", payload: t("admin.bot.deleteError") });
      dispatch({ type: "START_DELETE", payload: '' }); // reset
    }
  };

  const totalPages = Math.ceil(total / limit);

  if (isLoading && threads.length === 0) return <LoadingScreen />;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AnalysisHeader searchQuery={searchQuery} onSearchChange={(val) => dispatch({ type: "SET_SEARCH", payload: val })} onBulkAnalyze={handleBulkAnalyze} onRefresh={loadThreads} isBulkAnalyzing={isBulkAnalyzing} isRefreshing={isRefreshing} hasThreads={threads.length > 0} />
      <BulkAnalysisReport result={bulkAnalysisResult} onClose={() => dispatch({ type: "CLOSE_BULK_ANALYSIS" })} />
      {errorMessage && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">{errorMessage}</div>}
      <BotStats totalThreads={total} totalMessages={totalMessages} uniquePersonas={uniquePersonas} />
      <TopicRadar topics={globalTopics} />
      <div className="grid gap-6 lg:grid-cols-5">
        <ThreadList threads={threads} selectedThreadId={selectedThreadId} onSelectThread={handleSelectThread} page={page} totalPages={totalPages} onPageChange={(p) => dispatch({ type: "SET_PAGE", payload: p })} />
        <ThreadDetail selectedThread={selectedThread} selectedThreadMessages={selectedThreadMessages} selectedThreadInsight={selectedThreadInsight} isLoadingMessages={isLoadingMessages} isAnalyzing={isAnalyzing} analysisResult={analysisResult} deletingThreadId={deletingThreadId} onAnalyze={handleAnalyze} onDelete={handleDelete} onClose={() => dispatch({ type: "SELECT_THREAD", payload: null })} onCloseAnalysis={() => dispatch({ type: "CLOSE_ANALYSIS" })} />
      </div>
    </div>
  );
}
