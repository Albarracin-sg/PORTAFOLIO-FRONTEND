import { Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export default function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className="relative overflow-hidden transition-all duration-300 hover:scale-110 hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400 rounded-xl"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Sun Icon */}
      <Sun
        className={`
          size-5 absolute transition-all duration-500 ease-in-out
          ${
            isDark
              ? 'translate-y-8 rotate-90 opacity-0'
              : 'translate-y-0 rotate-0 opacity-100'
          }
        `}
      />
      
      {/* Moon Icon */}
      <Moon
        className={`
          size-5 absolute transition-all duration-500 ease-in-out
          ${
            isDark
              ? 'translate-y-0 rotate-0 opacity-100'
              : '-translate-y-8 -rotate-90 opacity-0'
          }
        `}
      />
      
      {/* Animated background circle */}
      <div
        className={`
          absolute inset-0 rounded-full transition-all duration-500 ease-in-out
          ${
            isDark
              ? 'bg-linear-to-br from-purple-500/20 to-blue-600/20 scale-100'
              : 'bg-linear-to-br from-orange-400/20 to-yellow-500/20 scale-0'
          }
        `}
      />
    </Button>
  );
}