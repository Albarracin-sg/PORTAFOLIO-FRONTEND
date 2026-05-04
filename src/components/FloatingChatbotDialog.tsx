import { useState, useRef, useEffect } from 'react';
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
  role: 'user' | 'assistant';
  content: string;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages appear
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Show initial message when dialog opens
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: t('floating.chatbot.intro'),
        },
      ]);
    }
  }, [open, messages.length, t]);

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
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply },
      ]);
    } catch (err) {
      const isRateLimit = err instanceof RateLimitError;
      const errorMessage = isRateLimit 
        ? t('contact.form.errors.rateLimit') 
        : t('contact.form.errors.serverError');
      
      setError(errorMessage);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: errorMessage },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleClose = () => {
    setMessages([]);
    setInput('');
    setError(null);
    setConversationId(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="border-violet-100 bg-white/95 sm:max-w-md dark:border-violet-500/20 dark:bg-gray-950 flex flex-col p-4 sm:p-6 overflow-hidden fixed max-h-[75dvh] sm:h-[600px] h-[70dvh]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Bot className="h-5 w-5 text-violet-500" />
            {t('floating.chatbot.title')}
          </DialogTitle>
          <DialogDescription>
            {t('floating.chatbot.description')}
          </DialogDescription>
        </DialogHeader>

        {/* Messages Container - Fixed height flex area */}
        <div className="flex-1 overflow-y-auto space-y-4 my-4 p-1 custom-scrollbar">
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

        {/* Input Form */}
        <div className="mt-auto space-y-4 flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('floating.chatbot.placeholder') || 'Escribe tu mensaje...'}
              className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="flex-shrink-0 rounded-2xl bg-violet-600 hover:bg-violet-700 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>

          {/* Footer Actions */}
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