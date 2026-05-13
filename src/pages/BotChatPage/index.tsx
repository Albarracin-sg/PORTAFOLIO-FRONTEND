import { useRef, useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Send, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Markdown } from '@/components/ui/markdown';
import { sendBotMessage } from '@/shared/api/bot';
import { RateLimitError } from '@/shared/api/http';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface BotChatState {
  messages: Message[];
  input: string;
  isLoading: boolean;
  error: string | null;
  conversationId: string | null;
}

type BotChatAction =
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_INPUT'; payload: string }
  | { type: 'START_SEND' }
  | { type: 'FINISH_SEND'; payload: { conversationId: string; reply: string } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'FINISH_LOADING' };

function botChatReducer(state: BotChatState, action: BotChatAction): BotChatState {
  switch (action.type) {
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_INPUT':
      return { ...state, input: action.payload };
    case 'START_SEND':
      return { ...state, isLoading: true, error: null };
    case 'FINISH_SEND':
      return {
        ...state,
        isLoading: false,
        conversationId: action.payload.conversationId,
        messages: [
          ...state.messages,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: action.payload.reply,
            timestamp: Date.now(),
          },
        ],
      };
    case 'SET_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        messages: [
          ...state.messages,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: action.payload,
            timestamp: Date.now(),
          },
        ],
      };
    case 'FINISH_LOADING':
      return { ...state, isLoading: false };
    default:
      return state;
  }
}

export function BotChatPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(botChatReducer, {
    messages: [],
    input: '',
    isLoading: false,
    error: null,
    conversationId: null,
  });

  const { messages, input, isLoading, error, conversationId } = state;
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (messages.length === 0) {
      dispatch({
        type: 'SET_MESSAGES',
        payload: [
          {
            id: 'initial',
            role: 'assistant',
            content: t('floating.chatbot.intro'),
            timestamp: Date.now()
          },
        ],
      });
    }
  }, [messages.length, t]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: crypto.randomUUID(),
        role: 'user',
        content: content.trim(),
        timestamp: Date.now()
      }
    });
    dispatch({ type: 'SET_INPUT', payload: '' });
    dispatch({ type: 'START_SEND' });

    try {
      const data = await sendBotMessage({
        message: content.trim(),
        conversationId: conversationId || undefined,
      });

      dispatch({
        type: 'FINISH_SEND',
        payload: { conversationId: data.conversationId, reply: data.reply }
      });
    } catch (err) {
      const isRateLimit = err instanceof RateLimitError;
      const errorMessage = isRateLimit
        ? t('contact.form.errors.rateLimit')
        : t('contact.form.errors.serverError');

      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="h-[calc(100dvh-4.5rem)] md:h-[calc(100vh-4.5rem)] mt-[4.5rem] bg-background relative flex flex-col overflow-hidden">
      {/* Decorative side gradients — desktop only */}
      <div className="fixed top-20 -left-48 size-[500px] bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 rounded-full blur-3xl animate-pulse pointer-events-none -z-10 hidden lg:block" />
      <div className="fixed bottom-20 -right-48 size-[500px] bg-gradient-to-tl from-violet-600/10 to-violet-700/10 rounded-full blur-3xl animate-pulse pointer-events-none -z-10 hidden lg:block" style={{ animationDelay: '1.5s' }} />

      <div className="flex flex-col flex-1 w-full max-w-2xl mx-auto px-4 pt-2 pb-4 relative z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 py-2 md:py-3 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-xl size-9"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <Bot className="size-6 md:size-7 text-violet-500 flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {t('floating.chatbot.title')}
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground truncate">
              {t('floating.chatbot.description')}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 gap-y-4 mb-4 pb-2 flex flex-col overflow-y-auto custom-scrollbar"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-2xl px-4 py-2.5 transition-all duration-300 max-w-[90%] md:max-w-[85%] break-words ${
                msg.role === 'user'
                  ? 'self-end border border-violet-200 bg-violet-50 text-zinc-900 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-zinc-100 text-sm shadow-sm'
                  : 'self-start border border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 text-base shadow-sm'
              }`}
            >
              {msg.role === 'assistant' ? (
                <Markdown className="prose-p:my-0 prose-sm md:prose-base max-w-none dark:prose-invert prose-strong:font-bold prose-strong:text-violet-600 dark:prose-strong:text-violet-400">
                  {msg.content}
                </Markdown>
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-zinc-500 text-sm animate-pulse self-start ml-2">
              <Loader2 className="size-4 animate-spin" />
              <span>{t('common.loading')}…</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm self-start ml-2">
              <AlertCircle className="size-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Sticky Input Container for Mobile if needed */}
        <div className="sticky bottom-4 bg-background/80 backdrop-blur-sm pt-2 z-20">
          <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => dispatch({ type: 'SET_INPUT', payload: e.target.value })}
              placeholder={t('floating.chatbot.placeholder')}
              className="flex-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus-visible:!outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-600 min-w-0 shadow-inner"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="flex-shrink-0 rounded-2xl bg-violet-600 hover:bg-violet-700 transition-all duration-300 hover:scale-105 active:scale-95 size-11 md:size-12 shrink-0 focus-visible:!outline-none shadow-lg shadow-violet-500/20"
            >
              {isLoading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Send className="size-5" />
              )}
            </Button>
          </form>

          {/* Quick actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const el = document.getElementById('contact');
                if (el) {
                  navigate('/#contact');
                  setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
                } else {
                  navigate('/#contact');
                }
              }}
              className="flex-1 rounded-2xl transition-all duration-300 hover:scale-105 hover:border-violet-400 hover:text-violet-600 dark:hover:border-violet-500 dark:hover:text-violet-400 h-11"
            >
              {t('floating.chatbot.actions.contact')}
            </Button>
            <Button
              onClick={() => window.open('mailto:albarrajuan5@gmail.com', '_blank', 'noopener,noreferrer')}
              className="flex-1 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-violet-500/20 h-11"
            >
              {t('floating.chatbot.actions.email')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
