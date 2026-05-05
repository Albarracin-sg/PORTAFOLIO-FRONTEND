import { useEffect, useState, useMemo } from 'react';
import { fetchMessages, ContactMessage } from '@/features/admin/api/messages';
import { useAdminAuth } from '@/features/admin/AdminAuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Calendar, ChevronLeft, ChevronRight, User, Mail, Clock } from 'lucide-react';

export function AdminMessagesPage() {
  const { token } = useAdminAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchMessages(token);
        // Sort messages by date descending (newest first)
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

  // Filtering logic
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

  // Pagination logic
  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMessages.slice(start, start + itemsPerPage);
  }, [filteredMessages, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [dateFrom, dateTo]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-emerald-600" />
            Messages
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View and manage contact form submissions.
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-slate-200 dark:border-white/10 bg-background/60 backdrop-blur-md rounded-3xl">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                <Calendar className="h-3 w-3" /> From
              </label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-2xl border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 h-11 focus:ring-emerald-500 transition-all"
              />
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                <Calendar className="h-3 w-3" /> To
              </label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-2xl border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 h-11 focus:ring-emerald-500 transition-all"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => { setDateFrom(''); setDateTo(''); }}
              className="rounded-2xl h-11 px-6 hover:bg-slate-100 dark:hover:bg-white/5"
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-20 text-center">
            <span className="h-8 w-8 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin inline-block" />
            <p className="text-muted-foreground mt-4 font-medium">Loading messages...</p>
          </div>
        ) : currentItems.length === 0 ? (
          <Card className="border-slate-200 dark:border-white/10 bg-background/40 backdrop-blur-md rounded-3xl p-20 border-dashed flex flex-col items-center justify-center text-center">
            <div className="p-6 rounded-3xl bg-slate-100 dark:bg-white/5 mb-4">
              <MessageSquare className="h-12 w-12 text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">No messages found</h3>
            <p className="text-muted-foreground max-w-xs mt-2">Try adjusting your date filters or check back later.</p>
          </Card>
        ) : (
          <>
            <div className="grid gap-4">
              {currentItems.map((message) => (
                <Card key={message.id} className="border-slate-200 dark:border-white/10 bg-background/60 backdrop-blur-md rounded-3xl overflow-hidden hover:border-emerald-500/30 transition-all duration-300">
                  <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-600/10 flex items-center justify-center text-emerald-600">
                          <User className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{message.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" /> {message.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 h-fit">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(message.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="relative p-6 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed italic">
                        "{message.message}"
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl border-slate-200 dark:border-white/10 h-10 w-10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="text-sm font-bold tracking-widest uppercase">
                  Page <span className="text-emerald-600">{currentPage}</span> of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-xl border-slate-200 dark:border-white/10 h-10 w-10"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
