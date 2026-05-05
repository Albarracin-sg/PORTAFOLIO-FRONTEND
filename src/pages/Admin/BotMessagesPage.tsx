import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  ArrowLeft, 
  Bot, 
  MessageSquare, 
  Trash2, 
  Calendar, 
  User, 
  ChevronRight,
  MessageCircle,
  RefreshCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminAuth } from "@/features/admin/AdminAuthProvider";
import { fetchBotThreads, deleteBotThread, type BotThread } from "@/shared/api/bot";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function BotMessagesPage() {
  const { t } = useTranslation();
  const { token } = useAdminAuth();
  const [threads, setThreads] = useState<BotThread[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedThread, setSelectedThread] = useState<BotThread | null>(null);

  const limit = 10;

  useEffect(() => {
    if (token) {
      loadThreads();
    }
  }, [token, page]);

  const loadThreads = async () => {
    try {
      setIsLoading(true);
      const data = await fetchBotThreads(token!, page, limit);
      setThreads(data.items);
      setTotal(data.meta.total);
    } catch (error) {
      console.error("Failed to fetch bot threads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("admin.bot.deleteConfirm"))) return;
    try {
      await deleteBotThread(token!, id);
      if (selectedThread?.id === id) setSelectedThread(null);
      loadThreads();
    } catch (error) {
      console.error("Failed to delete thread:", error);
    }
  };

  const totalPages = Math.ceil(total / limit);

  if (isLoading && threads.length === 0) return <LoadingScreen />;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Button
            variant="ghost"
            asChild
            className="group -ml-3 mb-2 rounded-full text-slate-600 hover:text-violet-700 dark:text-slate-400 dark:hover:text-violet-300"
          >
            <Link to="/admin">
              <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-0.5" />
              {t("admin.logs.back")}
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <Bot className="h-8 w-8 text-violet-500" />
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t("admin.bot.title")}
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-base">
            {t("admin.bot.subtitle")}
          </p>
        </div>
        <Button 
          onClick={loadThreads} 
          variant="outline" 
          className="rounded-2xl border-violet-200 bg-violet-50/50 hover:bg-violet-50 dark:border-violet-500/20 dark:bg-violet-500/5 dark:hover:bg-violet-500/10"
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          {t("admin.bot.refresh")}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        
        {/* Thread List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-slate-200 bg-white/70 dark:border-white/[0.07] dark:bg-white/[0.025]">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-white/5">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-violet-500" />
                {t("admin.bot.recentThreads")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {threads.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">No conversations found.</div>
                ) : (
                  threads.map((thread) => (
                    <div 
                      key={thread.id}
                      onClick={() => setSelectedThread(thread)}
                      className={`group flex items-center justify-between p-4 cursor-pointer transition-colors hover:bg-violet-50/50 dark:hover:bg-violet-500/5 ${selectedThread?.id === thread.id ? 'bg-violet-50 dark:bg-violet-500/10' : ''}`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {thread.title || t("admin.bot.newConversation")}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500">
                            {thread._count.messages} {t("admin.bot.messages")}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(thread.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className={`h-4 w-4 text-slate-300 transition-transform ${selectedThread?.id === thread.id ? 'translate-x-1 text-violet-500' : ''}`} />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
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

        {/* Chat Detail */}
        <div className="lg:col-span-3">
          {selectedThread ? (
            <Card className="h-full flex flex-col border-slate-200 bg-white/70 dark:border-white/[0.07] dark:bg-white/[0.025] overflow-hidden">
              <CardHeader className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">{selectedThread.title || t("admin.bot.newConversation")}</CardTitle>
                  <p className="text-xs text-slate-400 mt-0.5">ID: {selectedThread.id}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(selectedThread.id)}
                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[600px]">
                {selectedThread.messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] space-y-1 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className="flex items-center gap-2 px-1">
                        {msg.role === 'user' ? (
                          <>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t("admin.bot.visitor")}</span>
                            <User className="h-3 w-3 text-slate-400" />
                          </>
                        ) : (
                          <>
                            <Bot className="h-3 w-3 text-violet-500" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-500">{t("admin.bot.aiAssistant")}</span>
                          </>
                        )}
                      </div>
                      <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        msg.role === 'user' 
                          ? 'bg-violet-600 text-white rounded-tr-none' 
                          : 'bg-white border border-slate-100 dark:bg-white/5 dark:border-white/5 text-slate-800 dark:text-slate-200 rounded-tl-none'
                      }`}>
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-slate-400 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
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
