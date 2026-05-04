import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Send, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { sendBotMessage } from '@/shared/api/bot';
import { RateLimitError } from '@/shared/api/http';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function BotChatPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageCount = useRef(0);

  // Scroll to bottom only when new messages are added (not on every render)
  useEffect(() => {
    if (messages.length > messageCount.current) {
      messageCount.current = messages.length;
      const container = messagesContainerRef.current;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [messages]);

  // Show initial message when page mounts
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        { role: 'assistant', content: t('floating.chatbot.intro') },
      ]);
    }
  }, [messages.length, t]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: content.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setError(null);
    setIsLoading(true);

    try {
      const data = await sendBotMessage({
        message: content.trim(),
        conversationId: conversationId || undefined,
      });

      setConversationId(data.conversationId);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      const isRateLimit = err instanceof RateLimitError;
      const errorMessage = isRateLimit
        ? t('contact.form.errors.rateLimit')
        : t('contact.form.errors.serverError');

      setError(errorMessage);
      setMessages((prev) => [...prev, { role: 'assistant', content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="fixed inset-0 top-14 z-40 bg-background">
      {/* Decorative side gradients — desktop only */}
      <div className="fixed top-20 -left-48 w-[500px] h-[500px] bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 rounded-full blur-3xl animate-pulse pointer-events-none -z-10 hidden lg:block" />
      <div className="fixed bottom-20 -right-48 w-[500px] h-[500px] bg-gradient-to-tl from-indigo-600/10 to-violet-600/10 rounded-full blur-3xl animate-pulse pointer-events-none -z-10 hidden lg:block" style={{ animationDelay: '1.5s' }} />

      <div className="flex flex-col h-full w-full max-w-2xl mx-auto px-4 pt-3 pb-4">
        {/* Header */}
        <div className="flex items-center gap-3 py-3 flex-shrink-0 scroll-mt-16 md:scroll-mt-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Bot className="h-7 w-7 text-violet-500 flex-shrink-0" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {t('floating.chatbot.title')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('floating.chatbot.description')}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-6 pb-4 custom-scrollbar">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`rounded-2xl px-4 py-3 text-sm transition-all duration-300 ${
                msg.role === 'user'
                  ? 'ml-auto border border-violet-200 bg-violet-50 text-gray-900 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-gray-100'
                  : 'mr-auto border border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200'
              } max-w-[85%] ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
            >
              {msg.content}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-gray-500 text-sm animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t('common.loading')}...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('floating.chatbot.placeholder')}
            className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:!outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 hover:border-gray-300 dark:hover:border-gray-600"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="flex-shrink-0 rounded-2xl bg-violet-600 hover:bg-violet-700 transition-all duration-300 hover:scale-105 active:scale-95 h-12 w-12 shrink-0 focus-visible:!outline-none"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
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
            className="flex-1 rounded-2xl transition-all duration-300 hover:scale-105 hover:border-violet-400 hover:text-violet-600 dark:hover:border-violet-500 dark:hover:text-violet-400"
          >
            {t('floating.chatbot.actions.contact')}
          </Button>
          <Button
            onClick={() => window.open('mailto:albarrajuan5@gmail.com', '_blank', 'noopener,noreferrer')}
            className="flex-1 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-violet-500/20"
          >
            {t('floating.chatbot.actions.email')}
          </Button>
        </div>
      </div>
    </div>
  );
}
