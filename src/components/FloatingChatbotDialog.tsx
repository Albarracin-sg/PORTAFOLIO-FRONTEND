import { useRef, useEffect, useReducer, useTransition, type FormEvent } from 'react';
import { Bot, Send, Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { sendBotMessage } from '../shared/api/bot';
import { RateLimitError } from '../shared/api/http';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatState {
  messages: Message[];
  input: string;
  error: string | null;
  conversationId: string | null;
}

type ChatAction = 
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_INPUT'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONVERSATION_ID'; payload: string | null }
  | { type: 'RESET' };

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_INPUT':
      return { ...state, input: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_CONVERSATION_ID':
      return { ...state, conversationId: action.payload };
    case 'RESET':
      return { messages: [], input: '', error: null, conversationId: null };
    default:
      return state;
  }
}

interface FloatingChatbotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScrollToContact: () => void;
  onEmailClick: () => void;
}

export default function FloatingChatbotDialog({
  open,
  onOpenChange,
  onScrollToContact,
  onEmailClick,
}: FloatingChatbotDialogProps) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [state, dispatch] = useReducer(chatReducer, {
    messages: [],
    input: '',
    error: null,
    conversationId: null,
  });

  const { messages, input, error, conversationId } = state;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      dispatch({ 
        type: 'ADD_MESSAGE', 
        payload: { id: 'initial', role: 'assistant', content: t('floating.chatbot.intro') } 
      });
    }
    
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open, messages, t]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isPending) return;

    const userMessage: Message = { 
      id: crypto.randomUUID(),
      role: 'user', 
      content: content.trim() 
    };
    
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_INPUT', payload: '' });
    dispatch({ type: 'SET_ERROR', payload: null });

    startTransition(async () => {
      try {
        const data = await sendBotMessage({
          message: content.trim(),
          conversationId: conversationId || undefined,
        });

        dispatch({ type: 'SET_CONVERSATION_ID', payload: data.conversationId });
        dispatch({ 
          type: 'ADD_MESSAGE', 
          payload: { 
            id: crypto.randomUUID(), 
            role: 'assistant', 
            content: data.response || data.reply || '' 
          } 
        });
      } catch (err) {
        const isRateLimit = err instanceof RateLimitError;
        dispatch({ 
          type: 'SET_ERROR', 
          payload: isRateLimit ? t('contact.form.errors.rateLimit') : t('contact.form.errors.serverError') 
        });
      }
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleClose = () => {
    dispatch({ type: 'RESET' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="border-violet-100 bg-white/95 sm:max-w-md dark:border-violet-500/20 dark:bg-zinc-950 flex flex-col p-4 sm:p-6 overflow-hidden fixed max-h-[75dvh] sm:h-[600px] h-[70dvh]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-white">
            <Bot className="size-5 text-violet-500" />
            {t('floating.chatbot.title')}
          </DialogTitle>
          <DialogDescription>
            {t('floating.chatbot.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto gap-y-4 my-4 p-1 custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-2xl px-4 py-3 text-sm transition-all duration-300 ${
                msg.role === 'user'
                  ? 'ml-auto border border-violet-200 bg-violet-50 text-zinc-900 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-white'
                  : 'mr-auto border border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white'
              } max-w-[85%] ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
            >
              {msg.content}
            </div>
          ))}

          {isPending && (
            <div className="flex items-center gap-2 text-zinc-500 text-sm animate-pulse">
              <Loader2 className="size-4 animate-spin" />
              <span>{t('common.loading')}…</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="size-4" />
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="mt-auto gap-y-4 flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => dispatch({ type: 'SET_INPUT', payload: e.target.value })}
              placeholder={t('floating.chatbot.placeholder') || 'Escribe tu mensaje…'}
              className="flex-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500"
              disabled={isPending}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isPending || !input.trim()}
              className="flex-shrink-0 rounded-2xl bg-violet-600 hover:bg-violet-700 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </form>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onScrollToContact}
              className="flex-1 rounded-2xl transition-all duration-300 hover:scale-105 hover:border-violet-400 hover:text-violet-600 dark:hover:border-violet-500 dark:hover:text-violet-400"
            >
              {t('floating.chatbot.actions.contact')}
            </Button>
            <Button 
              type="button" 
              onClick={onEmailClick}
              className="flex-1 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-violet-500/20"
            >
              {t('floating.chatbot.actions.email')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
