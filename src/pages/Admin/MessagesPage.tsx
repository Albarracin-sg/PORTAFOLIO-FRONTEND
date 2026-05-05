import { useEffect, useState, useMemo } from 'react';
import { fetchMessages, ContactMessage } from '@/features/admin/api/messages';
import { useAdminAuth } from '@/features/admin/AdminAuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Calendar, ChevronLeft, ChevronRight, User, ChevronDown, Loader2, Sparkles, X } from 'lucide-react';

export function AdminMessagesPage() {
  const { token } = useAdminAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchMessages(token);
        const sorted = [...data].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setMessages(sorted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      const msgDate = new Date(msg.createdAt);
      const from = dateFrom ? new Date(dateFrom) : null;
      const to = dateTo ? new Date(dateTo) : null;
      if (from) { from.setHours(0, 0, 0, 0); if (msgDate < from) return false; }
      if (to) { to.setHours(23, 59, 59, 999); if (msgDate > to) return false; }
      return true;
    });
  }, [messages, dateFrom, dateTo]);

  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMessages.slice(start, start + itemsPerPage);
  }, [filteredMessages, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [dateFrom, dateTo]);

  const toggleExpand = (id: string) => {
    setExpandedMessageId(expandedMessageId === id ? null : id);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── Header ── */}
      <div className="space-y-4">
        <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-500 dark:text-emerald-400">
          <Sparkles className="h-3 w-3" />
          Contact inbox
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-7 w-7 text-emerald-500 shrink-0" />
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Messages
            </h1>
          </div>

          {/* Date filters */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 h-9 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.04]">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-auto w-28 border-none bg-transparent text-xs p-0 focus-visible:ring-0 text-slate-600 dark:text-slate-400"
              />
            </div>
            <span className="text-slate-300 dark:text-white/20 text-sm select-none">→</span>
            <div className="flex items-center gap-2 px-3 h-9 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.04]">
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-auto w-28 border-none bg-transparent text-xs p-0 focus-visible:ring-0 text-slate-600 dark:text-slate-400"
              />
            </div>
            {(dateFrom || dateTo) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { setDateFrom(''); setDateTo(''); }}
                className="h-9 w-9 rounded-2xl hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/10 dark:hover:text-red-400 transition-all duration-200"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Messages list ── */}
      <div>
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-emerald-500" />
          </div>
        ) : currentItems.length === 0 ? (
          <div className="py-20 text-center text-sm text-slate-400 dark:text-slate-600 italic">
            Empty inbox.
          </div>
        ) : (
          <div className="space-y-1.5">
            {currentItems.map((message) => {
              const isOpen = expandedMessageId === message.id;
              return (
                <div
                  key={message.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'border-emerald-400/30 bg-white dark:bg-white/[0.045] shadow-sm'
                      : 'border-slate-200 dark:border-white/[0.07] bg-white/70 dark:bg-white/[0.025] hover:border-emerald-400/20 hover:bg-white dark:hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Row */}
                  <button
                    onClick={() => toggleExpand(message.id)}
                    className="w-full text-left px-5 py-3.5 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                        isOpen
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-500/8 border border-emerald-500/15 text-emerald-500'
                      }`}>
                        <User className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {message.name}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-600 truncate">
                          {message.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-medium text-emerald-500 dark:text-emerald-400 hidden sm:block">
                        {new Date(message.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isOpen && (
                    <div className="px-5 pb-5 pt-0 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="ml-13 pl-[3.25rem]">
                        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-wrap border-l-2 border-emerald-500/30 pl-4">
                          {message.message}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-9 rounded-2xl px-4 gap-1.5 text-sm hover:bg-emerald-500/8 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200"
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-600 tabular-nums">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-9 rounded-2xl px-4 gap-1.5 text-sm hover:bg-emerald-500/8 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}