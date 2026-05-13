import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminAuth } from './AdminAuthProvider';
import { useEditMode } from './EditModeProvider';
import { uploadMedia } from './api/media';
import logoImg from '@/assets/logo.png';

type EditableTextProps = {
  value: string;
  displayValue?: string;
  onSave: (value: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
};

export function EditableText({ value, displayValue, onSave, placeholder, className, multiline }: EditableTextProps) {
  const { isEditMode } = useEditMode();
  const { token } = useAdminAuth();
  
  const [draft, setDraft] = useState<string | null>(null);
  const isTypingRef = useRef(false);

  // If the prop 'value' changes, we reset our local draft
  const prevValueRef = useRef(value);
  if (value !== prevValueRef.current) {
    setDraft(null);
    prevValueRef.current = value;
  }

  const currentValue = draft ?? value;
  const isEnabled = isEditMode && !!token && window.location.pathname.startsWith('/admin/live');

  if (!isEnabled) {
    return <span className={className}>{displayValue ?? value}</span>;
  }

  if (multiline) {
    return (
      <textarea
        value={currentValue}
        placeholder={placeholder}
        onFocus={() => { isTypingRef.current = true; }}
        onBlur={() => { isTypingRef.current = false; }}
        onChange={(event) => {
          const next = event.target.value;
          setDraft(next);
          onSave(next);
        }}
        rows={3}
        className={`w-full rounded-md border border-violet-400/40 bg-white/80 px-2 py-1 text-sm text-zinc-900 shadow-sm focus:outline-none dark:bg-zinc-900/70 dark:text-zinc-100 ${className ?? ''}`}
      />
    );
  }

  return (
    <input
      value={currentValue}
      placeholder={placeholder}
      onFocus={() => { isTypingRef.current = true; }}
      onBlur={() => { isTypingRef.current = false; }}
      onChange={(event) => {
        const next = event.target.value;
        setDraft(next);
        onSave(next);
      }}
      className={`w-full rounded-md border border-violet-400/40 bg-white/80 px-2 py-1 text-sm text-zinc-900 shadow-sm focus:outline-none dark:bg-zinc-900/70 dark:text-zinc-100 ${className ?? ''}`}
    />
  );
}

type EditableListProps = {
  value: string[];
  onSave: (value: string[]) => void;
  className?: string;
  placeholder?: string;
  hideWhenView?: boolean;
};

export function EditableList({ value, onSave, className, placeholder, hideWhenView = false }: EditableListProps) {
  const { isEditMode } = useEditMode();
  const { token } = useAdminAuth();
  
  const joinedValue = value.join(', ');
  const [draft, setDraft] = useState<string | undefined>(undefined);

  const prevJoinedValueRef = useRef(joinedValue);
  if (joinedValue !== prevJoinedValueRef.current) {
    setDraft(undefined);
    prevJoinedValueRef.current = joinedValue;
  }

  const isEnabled = isEditMode && !!token && window.location.pathname.startsWith('/admin/live');

  if (!isEnabled) {
    if (hideWhenView) return null;
    return (
      <div className={className}>
        {value.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    );
  }

  return (
    <input
      value={draft ?? joinedValue}
      placeholder={placeholder}
      onChange={(event) => {
        const next = event.target.value;
        setDraft(next);
        onSave(
          next
            .split(',')
            .flatMap((item) => {
              const trimmed = item.trim();
              return trimmed ? [trimmed] : [];
            }),
        );
      }}
      className={`w-full rounded-md border border-violet-400/40 bg-white/80 px-2 py-1 text-sm text-zinc-900 shadow-sm focus:outline-none dark:bg-zinc-900/70 dark:text-zinc-100 ${className ?? ''}`}
    />
  );
}

type EditableImageProps = {
  src: string;
  alt: string;
  onSave: (url: string) => void;
  className?: string;
};

export function EditableImage({ src, alt, onSave, className }: EditableImageProps) {
  const { t } = useTranslation();
  const { isEditMode } = useEditMode();
  const { token } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  
  const isEnabled = isEditMode && !!token && window.location.pathname.startsWith('/admin/live');
  const hasImage = !!src;

  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.[0] || !token) return;
    setLoading(true);
    try {
      const result = await uploadMedia(token, event.target.files[0]);
      onSave(result.url);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {hasImage ? (
        <img src={src} alt={alt} className={className} />
      ) : (
        <div
          className={`overflow-hidden rounded-md border border-dashed border-white/20 bg-white/5 ${className ?? ''}`}
        >
          <img src={logoImg} alt="Logo" className="size-full object-cover opacity-95" />
        </div>
      )}
      {isEnabled && (
        <>
          <label className="absolute inset-0 z-10 cursor-pointer" aria-label={t('admin.projects.edit.changeImage', 'Cambiar imagen')}>
            <input type="file" accept="image/*" className="hidden" onChange={handleMediaUpload} />
          </label>
          <label className="absolute bottom-3 right-3 z-20 rounded-md bg-black/60 px-3 py-1 text-xs text-white cursor-pointer flex items-center gap-2">
            {loading ? 'Subiendo…' : t('admin.projects.edit.change', 'Cambiar')}
            <input type="file" accept="image/*" className="hidden" onChange={handleMediaUpload} />
          </label>
        </>
      )}
    </div>
  );
}

export function useDebouncedSave<T>(value: T, onSave: (value: T) => void, delay = 900) {
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => onSave(value), delay);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, onSave]);
}
