import { Bot } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

type PromptKey = 'stack' | 'projects' | 'contact' | null;

interface FloatingChatbotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPrompt: PromptKey;
  onPromptSelect: (prompt: Exclude<PromptKey, null>) => void;
  onScrollToContact: () => void;
  onEmailClick: () => void;
}

export default function FloatingChatbotDialog({
  open,
  onOpenChange,
  selectedPrompt,
  onPromptSelect,
  onScrollToContact,
  onEmailClick,
}: FloatingChatbotDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-violet-100 bg-white/95 sm:max-w-md dark:border-violet-500/20 dark:bg-gray-950">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Bot className="h-5 w-5 text-violet-500" />
            {t('floating.chatbot.title')}
          </DialogTitle>
          <DialogDescription>
            {t('floating.chatbot.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-2xl border border-violet-100 bg-violet-50/80 px-4 py-3 text-sm text-violet-950 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-100">
            {t('floating.chatbot.intro')}
          </div>

          {selectedPrompt ? (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
              {t(`floating.chatbot.replies.${selectedPrompt}`)}
            </div>
          ) : null}

          <div className="grid gap-3">
            <button
              type="button"
              onClick={() => onPromptSelect('stack')}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:border-violet-200 hover:bg-violet-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-violet-500/30 dark:hover:bg-gray-800"
            >
              {t('floating.chatbot.prompts.stack')}
            </button>
            <button
              type="button"
              onClick={() => onPromptSelect('projects')}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:border-violet-200 hover:bg-violet-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-violet-500/30 dark:hover:bg-gray-800"
            >
              {t('floating.chatbot.prompts.projects')}
            </button>
            <button
              type="button"
              onClick={() => onPromptSelect('contact')}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:border-violet-200 hover:bg-violet-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-violet-500/30 dark:hover:bg-gray-800"
            >
              {t('floating.chatbot.prompts.contact')}
            </button>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="outline" onClick={onScrollToContact}>
            {t('floating.chatbot.actions.contact')}
          </Button>
          <Button type="button" onClick={onEmailClick}>
            {t('floating.chatbot.actions.email')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
