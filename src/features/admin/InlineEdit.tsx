import { useEffect, useState } from 'react';
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
  const [draft, setDraft] = useState(value);
  const isEnabled = isEditMode && !!token && window.location.pathname.startsWith('/admin/live');

  useEffect(() => {
    setDraft(value);
  }, [value]);

  if (!isEnabled) {
    return <span className={className}>{displayValue ?? value}</span>;
  }

  if (multiline) {
    return (
      <textarea
        value={draft}
        placeholder={placeholder}
        onChange={(event) => {
          const next = event.target.value;
          setDraft(next);
          onSave(next);
        }}
        rows={3}
        className={`w-full rounded-md border border-violet-400/40 bg-white/80 px-2 py-1 text-sm text-gray-900 shadow-sm focus:outline-none dark:bg-gray-900/70 dark:text-gray-100 ${className ?? ''}`}
      />
    );
  }

  return (
    <input
      value={draft}
      placeholder={placeholder}
      onChange={(event) => {
        const next = event.target.value;
        setDraft(next);
        onSave(next);
      }}
      className={`w-full rounded-md border border-violet-400/40 bg-white/80 px-2 py-1 text-sm text-gray-900 shadow-sm focus:outline-none dark:bg-gray-900/70 dark:text-gray-100 ${className ?? ''}`}
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
  const [draft, setDraft] = useState(value.join(', '));
  const isEnabled = isEditMode && !!token && window.location.pathname.startsWith('/admin/live');

  useEffect(() => {
    setDraft(value.join(', '));
  }, [value]);

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
      value={draft}
      placeholder={placeholder}
      onChange={(event) => {
        const next = event.target.value;
        setDraft(next);
        onSave(
          next
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
        );
      }}
      className={`w-full rounded-md border border-violet-400/40 bg-white/80 px-2 py-1 text-sm text-gray-900 shadow-sm focus:outline-none dark:bg-gray-900/70 dark:text-gray-100 ${className ?? ''}`}
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
  const { isEditMode } = useEditMode();
  const { token } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  const isEnabled = isEditMode && !!token && window.location.pathname.startsWith('/admin/live');
  const hasImage = !!src;

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
          <img src={logoImg} alt="Logo" className="h-full w-full object-cover opacity-95" />
        </div>
      )}
      {isEnabled && (
        <>
          <label className="absolute inset-0 z-10 cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handleChange} />
          </label>
          <label className="absolute bottom-3 right-3 z-20 rounded-md bg-black/60 px-3 py-1 text-xs text-white cursor-pointer">
            {loading ? 'Subiendo...' : 'Cambiar'}
            <input type="file" accept="image/*" className="hidden" onChange={handleChange} />
          </label>
        </>
      )}
    </div>
  );
}

export function useDebouncedSave<T>(value: T, onSave: (value: T) => void, delay = 900) {
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  useEffect(() => {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }

    const id = window.setTimeout(() => onSave(value), delay);
    setTimeoutId(id);

    return () => window.clearTimeout(id);
  }, [value, delay, onSave]);
}
