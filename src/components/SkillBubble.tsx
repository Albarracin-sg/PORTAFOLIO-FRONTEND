import { TechIcon } from './TechIcon';
import { cn } from './ui/utils';

interface SkillBubbleProps {
  name: string;
  showName?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SkillBubble({ name, showName = false, className, size = 'md' }: SkillBubbleProps) {
  const sizeClasses = {
    sm: 'p-1.5 gap-1.5 text-[10px]',
    md: 'p-2.5 gap-2.5 text-xs',
    lg: 'p-4 gap-3 text-sm'
  };

  const iconSizeClasses = {
    sm: 'size-3.5',
    md: 'size-5',
    lg: 'size-7'
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full border border-violet-200/60 bg-violet-100/40 shadow-sm transition-transform duration-300 hover:scale-110 hover:border-violet-400 hover:bg-violet-200/50 dark:border-violet-500/30 dark:bg-violet-950/30 dark:hover:border-violet-500/50 dark:hover:bg-violet-900/40",
        sizeClasses[size],
        className
      )}
      title={name}
    >
      <TechIcon name={name} className={cn("text-violet-600 dark:text-violet-300 transition-colors duration-300", iconSizeClasses[size])} />
      {showName && (
        <span className="font-medium text-violet-600 dark:text-violet-300">
          {name}
        </span>
      )}
    </div>
  );
}
