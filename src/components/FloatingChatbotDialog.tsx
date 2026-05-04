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

type PromptKey = 'stack' | 'projects' | 'contact' | null;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface FloatingChatbotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPrompt: PromptKey;
  onPromptSelect: (prompt: Exclude<PromptKey, null>) => void;
  onScrollToContact: () => void;
  onEmailClick: () => void;
}

const DEFAULT_PROMPTS = {
  stack: '¿Qué tecnologías usas en tu stack?',
  projects: '¿Qué proyectos has hecho?',
  contact: '¿Cómo puedo contactarte?',
};

export default function FloatingChatbotDialog({
  open,
  onOpenChange,
  selectedPrompt: _selectedPrompt,
  onPromptSelect,
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
      const errorMessage = err instanceof Error ? err.message : 'Error de conexión';
      setError(errorMessage);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Lo siento, tuve un problema al procesar tu mensaje. ¿Podrías intentar de nuevo?',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handlePromptClick = (promptKey: Exclude<PromptKey, null>) => {
    onPromptSelect(promptKey);
    sendMessage(DEFAULT_PROMPTS[promptKey]);
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
      <DialogContent className="border-violet-100 bg-white/95 sm:max-w-md dark:border-violet-500/20 dark:bg-gray-950 max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Bot className="h-5 w-5 text-violet-500" />
            {t('floating.chatbot.title')}
          </DialogTitle>
          <DialogDescription>
            {t('floating.chatbot.description')}
          </DialogDescription>
        </DialogHeader>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto space-y-4 min-h-[200px] max-h-[300px] p-1">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'ml-auto border border-violet-200 bg-violet-50 text-gray-900 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-gray-100'
                  : 'mr-auto border border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200'
              } max-w-[85%] ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
            >
              {msg.content}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Escribiendo...</span>
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

        {/* Prompts - only shown when API fails (no credits, etc.) */}
        {error && (error.includes('créditos') || error.includes('credits') || error.includes('limit') || error.includes('quota') || error.includes('API')) && !isLoading && (
          <div className="grid gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={() => handlePromptClick('stack')}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:border-violet-200 hover:bg-violet-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-violet-500/30 dark:hover:bg-gray-800"
            >
              {t('floating.chatbot.prompts.stack')}
            </button>
            <button
              type="button"
              onClick={() => handlePromptClick('projects')}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:border-violet-200 hover:bg-violet-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-violet-500/30 dark:hover:bg-gray-800"
            >
              {t('floating.chatbot.prompts.projects')}
            </button>
            <button
              type="button"
              onClick={() => handlePromptClick('contact')}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:border-violet-200 hover:bg-violet-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-violet-500/30 dark:hover:bg-gray-800"
            >
              {t('floating.chatbot.prompts.contact')}
            </button>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2 flex-shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>

        {/* Footer Actions */}
        <div className="flex justify-between flex-shrink-0">
          <Button type="button" variant="outline" onClick={onScrollToContact}>
            {t('floating.chatbot.actions.contact')}
          </Button>
          <Button type="button" onClick={onEmailClick}>
            {t('floating.chatbot.actions.email')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}