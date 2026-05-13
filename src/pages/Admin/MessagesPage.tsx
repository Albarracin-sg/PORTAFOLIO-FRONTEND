import { useEffect, useReducer } from 'react';
import { Link } from 'react-router-dom';
import { fetchMessages, ContactMessage } from '@/features/admin/api/messages';
import { useAdminAuth } from '@/features/admin/AdminAuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Calendar, ChevronLeft, ChevronRight, User, ChevronDown, Loader2,  X, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { commonFormatters } from '@/shared/utils/formatters';

interface MessagesState {
  messages: ContactMessage[];
  loading: boolean;
  currentPage: number;
  dateFrom: string;
  dateTo: string;
  expandedMessageId: string | null;
  itemsPerPage: number;
}

type MessagesAction = 
  | { type: 'SET_MESSAGES'; payload: ContactMessage[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_DATE_FROM'; payload: string }
  | { type: 'SET_DATE_TO'; payload: string }
  | { type: 'TOGGLE_EXPAND'; payload: string | null }
  | { type: 'SET_ITEMS_PER_PAGE'; payload: number }
  | { type: 'RESET_FILTERS' };

function messagesReducer(state: MessagesState, action: MessagesAction): MessagesState {
  switch (action.type) {
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    case 'SET_DATE_FROM':
      return { ...state, dateFrom: action.payload, currentPage: 1 };
    case 'SET_DATE_TO':
      return { ...state, dateTo: action.payload, currentPage: 1 };
    case 'TOGGLE_EXPAND':
      return { ...state, expandedMessageId: state.expandedMessageId === action.payload ? null : action.payload };
    case 'SET_ITEMS_PER_PAGE':
      return { ...state, itemsPerPage: action.payload };
    case 'RESET_FILTERS':
      return { ...state, dateFrom: '', dateTo: '', currentPage: 1 };
    default:
      return state;
  }
}

function ClientTime({ date }: { date: string }) {
  const { i18n } = useTranslation();

  return (
    <span suppressHydrationWarning>
      {commonFormatters.shortDate(i18n.language).format(new Date(date))}
    </span>
  );
}

export function AdminMessagesPage() {
  const { t } = useTranslation();
  const { token } = useAdminAuth();
  const [state, dispatch] = useReducer(messagesReducer, {
    messages: [],
    loading: true,
    currentPage: 1,
    dateFrom: '',
    dateTo: '',
    expandedMessageId: null,
    itemsPerPage: window.innerWidth < 640 ? 7 : 10,
  });

  const { messages, loading, currentPage, dateFrom, dateTo, expandedMessageId, itemsPerPage } = state;

  useEffect(() => {
    const handleResize = () => {
      dispatch({ type: 'SET_ITEMS_PER_PAGE', payload: window.innerWidth < 640 ? 7 : 10 });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const data = await fetchMessages(token);
        const sorted = data.toSorted((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        dispatch({ type: 'SET_MESSAGES', payload: sorted });
      } catch (err) {
        console.error(err);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    load();
  }, [token]);

  const filteredMessages = messages.filter((msg) => {
    const msgDate = new Date(msg.createdAt).toISOString().split('T')[0];
    const fromOk = !dateFrom || msgDate >= dateFrom;
    const toOk = !dateTo || msgDate <= dateTo;
    return fromOk && toOk;
  });

  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);
  const currentMessages = filteredMessages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (!token) return null;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8 sm:mb-12">
        <Button
          variant="ghost"
          asChild
          className="group mb-2 sm:mb-6 rounded-full border border-zinc-200 bg-white px-4 py-2 text-black transition-all hover:bg-violet-700 hover:text-white hover:border-violet-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:hover:bg-violet-600 dark:hover:text-white"
        >
          <Link to="/admin">
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            {t('admin.messages.back')}
          </Link>
        </Button>

        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-600 dark:text-violet-400">
            {t('admin.messages.inbox')}
          </p>
          <div className="mt-3 flex items-center justify-center gap-4">
            <MessageSquare className="size-10 text-violet-500 shrink-0 hidden sm:block" />
            <h1 className="text-5xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-6xl">
              {t('admin.messages.title')}
            </h1>
          </div>
          <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-400 sm:text-base">
            {t('admin.messages.subtitle')}
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/50 dark:bg-white/[0.02] p-4 rounded-3xl border border-zinc-200 dark:border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-2 flex-1 w-full">
            <Calendar className="size-4 text-zinc-400 shrink-0" />
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => dispatch({ type: 'SET_DATE_FROM', payload: e.target.value })}
              className="h-auto w-28 border-none bg-transparent text-xs p-0 focus-visible:ring-0 text-zinc-700 dark:text-zinc-400"
            />
            <span className="text-white">→</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => dispatch({ type: 'SET_DATE_TO', payload: e.target.value })}
              className="h-auto w-28 border-none bg-transparent text-xs p-0 focus-visible:ring-0 text-zinc-700 dark:text-zinc-400"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch({ type: 'RESET_FILTERS' })}
            className="rounded-xl text-xs hover:bg-violet-500/10 hover:text-violet-600"
          >
            <X className="size-3 mr-1.5" />
            {t('admin.messages.reset')}
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="size-8 text-violet-500 animate-spin" />
            <p className="text-sm text-zinc-500 animate-pulse">{t('admin.messages.loading')}</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-20 bg-white/30 dark:bg-white/[0.01] rounded-3xl border border-dashed border-zinc-200 dark:border-white/10">
            <MessageSquare className="size-12 text-white dark:text-zinc-800 mx-auto mb-4" />
            <p className="text-zinc-500">{t('admin.messages.empty')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentMessages.map((msg) => (
              <div
                key={msg.id}
                className={`group rounded-3xl border transition-all duration-300 overflow-hidden ${
                  expandedMessageId === msg.id
                    ? 'border-violet-500/30 bg-white dark:bg-zinc-900/40 shadow-xl shadow-violet-500/5'
                    : 'border-zinc-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/[0.04]'
                }`}
              >
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_EXPAND', payload: msg.id })}
                  className="w-full text-left p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                      expandedMessageId === msg.id ? 'bg-violet-500 text-white' : 'bg-zinc-100 dark:bg-white/5 text-zinc-500'
                    }`}>
                      <User className="size-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 dark:text-white leading-tight">
                        {msg.name}
                      </h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-0.5">
                        {msg.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="text-right">
                      <p className="text-xs font-medium text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
                        {t('admin.messages.received')}
                      </p>
                      <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 tabular-nums">
                        <ClientTime date={msg.createdAt} />
                      </p>
                    </div>
                    <ChevronDown className={`size-5 text-white transition-transform duration-300 ${
                      expandedMessageId === msg.id ? 'rotate-180 text-violet-500' : ''
                    }`} />
                  </div>
                </button>

                {expandedMessageId === msg.id && (
                  <div className="px-6 pb-6 pt-2 animate-in slide-in-from-top-2 duration-300">
                    <div className="h-px bg-zinc-100 dark:bg-white/5 mb-6" />
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="size-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
                          {t('admin.messages.content')}
                        </span>
                      </div>
                      <div className="relative">
                        <p className="text-sm leading-relaxed text-zinc-700 dark:text-white whitespace-pre-wrap border-l-2 border-emerald-500/30 pl-4">
                          {msg.message}
                        </p>
                      </div>
                      <div className="pt-4 flex justify-end">
                        <Button
                          variant="outline"
                          asChild
                          size="sm"
                          className="rounded-xl border-zinc-200 dark:border-white/10 gap-2 hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:text-violet-600 transition-all"
                        >
                          <a href={`mailto:${msg.email}`}>
                            {t('admin.messages.reply')}
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-6">
            <Button
              variant="ghost"
              onClick={() => dispatch({ type: 'SET_PAGE', payload: Math.max(1, currentPage - 1) })}
              disabled={currentPage === 1}
              className="rounded-2xl gap-2 hover:bg-violet-500/10 hover:text-violet-600"
            >
              <ChevronLeft className="size-4" />
              {t('common.pagination.previous')}
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => dispatch({ type: 'SET_PAGE', payload: i + 1 })}
                  className={`size-8 rounded-xl text-xs font-bold transition-all ${
                    currentPage === i + 1
                      ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20'
                      : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <Button
              variant="ghost"
              onClick={() => dispatch({ type: 'SET_PAGE', payload: Math.min(totalPages, currentPage + 1) })}
              disabled={currentPage === totalPages}
              className="rounded-2xl gap-2 hover:bg-violet-500/10 hover:text-violet-600"
            >
              {t('common.pagination.next')}
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
