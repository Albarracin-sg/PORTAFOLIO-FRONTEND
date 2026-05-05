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
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700 max-w-5xl mx-auto px-4">
      {/* Super Compact Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-600/10 flex items-center justify-center text-emerald-600">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100 leading-none">Inbox</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mt-1">Reader responses</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-background/40 backdrop-blur-md p-1 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-2 px-2">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-7 w-28 border-none bg-transparent text-[9px] font-black uppercase tracking-widest focus-visible:ring-0 p-0"
            />
          </div>
          <div className="h-3 w-px bg-slate-200 dark:bg-white/10" />
          <div className="flex items-center gap-2 px-2">
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-7 w-28 border-none bg-transparent text-[9px] font-black uppercase tracking-widest focus-visible:ring-0 p-0 text-right"
            />
          </div>
          {(dateFrom || dateTo) && (
            <Button variant="ghost" size="sm" onClick={() => { setDateFrom(''); setDateTo(''); }} className="h-6 w-6 rounded-full p-0 text-xs">
              ×
            </Button>
          )}
        </div>
      </div>

      {/* Messages List — Minimalist Rows */}
      <div className="space-y-1">
        {loading ? (
          <div className="py-12 text-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto" /></div>
        ) : currentItems.length === 0 ? (
          <div className="py-12 text-center opacity-50 italic text-sm">Empty inbox.</div>
        ) : (
          <>
            <div className="grid gap-1">
              {currentItems.map((message) => (
                <div 
                  key={message.id} 
                  className={`group relative rounded-xl border transition-all duration-300 overflow-hidden ${
                    expandedMessageId === message.id 
                      ? 'border-emerald-500/20 bg-background/40 shadow-lg' 
                      : 'border-transparent bg-background/10 hover:bg-background/30 hover:border-emerald-500/10'
                  }`}
                >
                  <button 
                    onClick={() => toggleExpand(message.id)}
                    className="w-full text-left px-4 py-2.5 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                        expandedMessageId === message.id ? 'bg-emerald-600 text-white shadow-md' : 'bg-emerald-600/5 text-emerald-600'
                      }`}>
                        <User className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">{message.name}</div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 truncate">{message.email}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="hidden sm:flex flex-col items-end gap-0">
                        <div className="text-[9px] font-black uppercase tracking-widest text-emerald-600/70">
                          {new Date(message.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                        </div>
                      </div>
                      <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-500 ${expandedMessageId === message.id ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  
                  {expandedMessageId === message.id && (
                    <div className="px-12 pb-4 pt-1 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="relative p-3 rounded-xl bg-white/40 dark:bg-black/20 border border-slate-200/50 dark:border-white/5 text-xs leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap italic">
                        "{message.message}"
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Compact Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <Button variant="ghost" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 rounded-lg px-2 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500/10 hover:text-emerald-600">
                  <ChevronLeft className="h-3 w-3 mr-1" /> Prev
                </Button>
                <div className="text-[9px] font-black tracking-widest uppercase opacity-40">{currentPage} / {totalPages}</div>
                <Button variant="ghost" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 rounded-lg px-2 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500/10 hover:text-emerald-600">
                  Next <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
