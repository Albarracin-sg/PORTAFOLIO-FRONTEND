import { useCallback, useEffect, useMemo, useState } from 'react';
import { updateSection, Section } from '../api/content';
import { useAdminAuth } from '../AdminAuthProvider';
import { useEditMode } from '../EditModeProvider';

function setValueByPath(obj: Record<string, unknown>, path: string, value: unknown) {
  const keys = path.split('.');
  const next = { ...obj } as Record<string, unknown>;
  let cursor: Record<string, unknown> | unknown[] = next;

  keys.forEach((key, index) => {
    const keyIndex = Number.isNaN(Number(key)) ? null : Number(key);
    if (index === keys.length - 1) {
      if (Array.isArray(cursor) && keyIndex !== null) {
        const updated = [...cursor];
        updated[keyIndex] = value;
        if (cursor === next) {
          return;
        }
        (cursor as unknown[])[keyIndex] = value;
      } else if (!Array.isArray(cursor)) {
        cursor[key] = value;
      }
      return;
    }

    if (Array.isArray(cursor) && keyIndex !== null) {
      const existing = cursor[keyIndex];
      const nextValue =
        Array.isArray(existing)
          ? [...existing]
          : typeof existing === 'object' && existing !== null
            ? { ...(existing as Record<string, unknown>) }
            : {};
      cursor[keyIndex] = nextValue;
      cursor = nextValue as Record<string, unknown> | unknown[];
      return;
    }

    const existing = (cursor as Record<string, unknown>)[key];
    (cursor as Record<string, unknown>)[key] =
      Array.isArray(existing)
        ? [...existing]
        : typeof existing === 'object' && existing !== null
          ? { ...(existing as Record<string, unknown>) }
          : {};
    cursor = (cursor as Record<string, unknown>)[key] as Record<string, unknown> | unknown[];
  });

  return next;
}

export function useSectionEditor(section?: Section) {
  const { token } = useAdminAuth();
  const { isEditMode } = useEditMode();
  const [draft, setDraft] = useState<Record<string, unknown>>(section?.content ?? {});
  const [saving, setSaving] = useState(false);

  const contentSignature = useMemo(
    () => JSON.stringify(section?.content ?? {}),
    [section?.id, section?.content],
  );

  useEffect(() => {
    setDraft(section?.content ?? {});
  }, [contentSignature]);

  const updateField = useCallback(
    (path: string, value: unknown) => {
      setDraft((prev) => setValueByPath(prev, path, value));
    },
  );

  useEffect(() => {
    if (!isEditMode || !token || !section) return;
    if (!window.location.pathname.startsWith('/admin/live')) return;

    const timeout = window.setTimeout(async () => {
      setSaving(true);
      try {
        await updateSection(token, section.id, { content: draft });
        window.dispatchEvent(new CustomEvent('admin-save-complete'));
      } catch (error) {
        window.dispatchEvent(
          new CustomEvent('admin-save-error', {
            detail: error instanceof Error ? error.message : 'Error guardando cambios',
          }),
        );
      } finally {
        setSaving(false);
      }
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [draft, isEditMode, token, section?.id]);

  useEffect(() => {
    if (!token || !section) return;
    if (!window.location.pathname.startsWith('/admin/live')) return;

    const handler = async () => {
      setSaving(true);
      try {
        await updateSection(token, section.id, { content: draft });
        window.dispatchEvent(new CustomEvent('admin-save-complete'));
      } catch (error) {
        window.dispatchEvent(
          new CustomEvent('admin-save-error', {
            detail: error instanceof Error ? error.message : 'Error guardando cambios',
          }),
        );
      } finally {
        setSaving(false);
      }
    };

    window.addEventListener('admin-save', handler);
    return () => window.removeEventListener('admin-save', handler);
  }, [token, section?.id, draft]);

  return {
    draft,
    updateField,
    saving,
  };
}
