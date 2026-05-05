import { useEffect, useState, useMemo } from 'react';
import { fetchMessages, ContactMessage } from '@/features/admin/api/messages';
import { useAdminAuth } from '@/features/admin/AdminAuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Calendar, ChevronLeft, ChevronRight, User, ChevronDown, Loader2 } from 'lucide-react';

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
        console.error('Error fetching messages:', err);
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

      if (from) {
        from.setHours(0, 0, 0, 0);
        if (msgDate < from) return false;
      }
      if (to) {
        to.setHours(23, 59, 59, 999);
        if (msgDate > to) return false;
      }
      return true;
    });
  }, [messages, dateFrom, dateTo]);

  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMessages.slice(start, start + itemsPerPage);
  }, [filteredMessages, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [dateFrom, dateTo]);

  const toggleExpand = (id: string) => {
    setExpandedMessageId(expandedMessageId === id ? null : id);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-5xl mx-auto px-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-2">
            <MessageSquare className="h-3 w-3" />
            Communication
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Inbox
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            Recent submissions from your portfolio's contact form.
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-background/50 backdrop-blur-md p-2 rounded-[1.5rem] border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-2 px-2">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-8 w-32 border-none bg-transparent text-[10px] font-bold uppercase tracking-widest focus-visible:ring-0 p-0"
            />
          </div>
          <div className="h-4 w-px bg-slate-200 dark:bg-white/10" />
          <div className="flex items-center gap-2 px-2">
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-8 w-32 border-none bg-transparent text-[10px] font-bold uppercase tracking-widest focus-visible:ring-0 p-0 text-right"
            />
          </div>
          {(dateFrom || dateTo) && (
            <Button variant="ghost" size="sm" onClick={() => { setDateFrom(''); setDateTo(''); }} className="h-8 w-8 rounded-full p-0">
              ×
            </Button>
          )}
        </div>
      </div>

      {/* Messages List — Floating items */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mx-auto" />
          </div>
        ) : currentItems.length === 0 ? (
          <div className="py-20 text-center opacity-50 italic">
            No messages found for this period.
          </div>
        ) : (
          <>
            <div className="grid gap-3">
              {currentItems.map((message) => (
                <div 
                  key={message.id} 
                  className={`group relative rounded-[2rem] border transition-all duration-500 overflow-hidden ${
                    expandedMessageId === message.id 
                      ? 'border-emerald-500/20 bg-background/40 shadow-2xl' 
                      : 'border-transparent bg-background/20 hover:bg-background/40 hover:border-emerald-500/10'
                  }`}
                >
                  <button 
                    onClick={() => toggleExpand(message.id)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-5 flex-1 min-w-0">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                        expandedMessageId === message.id ? 'bg-emerald-600 text-white scale-110 shadow-lg shadow-emerald-500/20' : 'bg-emerald-600/10 text-emerald-600 group-hover:scale-105'
                      }`}>
                        <User className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-base text-gray-900 dark:text-gray-100 truncate mb-0.5">{message.name}</div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{message.email}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 flex-shrink-0">
                      <div className="hidden sm:flex flex-col items-end gap-0.5">
                        <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600/70">
                          {new Date(message.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                        </div>
                        <div className="text-[9px] font-medium text-muted-foreground/40 tracking-tighter">
                          {new Date(message.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div className={`p-2 rounded-full transition-transform duration-500 ${expandedMessageId === message.id ? 'rotate-180 bg-emerald-500/10' : 'group-hover:translate-y-1'}`}>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </button>
                  
                  {expandedMessageId === message.id && (
                    <div className="px-8 pb-8 pt-2 animate-in fade-in slide-in-from-top-4 duration-500">
                      <div className="relative p-6 rounded-[1.5rem] bg-white/40 dark:bg-black/20 border border-slate-200/50 dark:border-white/5 text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap italic">
                        "{message.message}"
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Aesthetic Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-8 pt-10">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-2xl h-11 px-6 gap-2 text-xs font-bold uppercase tracking-[0.2em] hover:bg-emerald-500/10 hover:text-emerald-600"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <div className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40">
                  {currentPage} <span className="mx-2">/</span> {totalPages}
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-2xl h-11 px-6 gap-2 text-xs font-bold uppercase tracking-[0.2em] hover:bg-emerald-500/10 hover:text-emerald-600"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
