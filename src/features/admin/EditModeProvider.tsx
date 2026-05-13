import { createContext, use, useMemo, useState } from 'react';

type EditModeContextValue = {
  isEditMode: boolean;
  setEditMode: (value: boolean) => void;
};

const EditModeContext = createContext<EditModeContextValue | null>(null);

export function EditModeProvider({ children }: { children: React.ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false);

  const setEditMode = (value: boolean) => {
    setIsEditMode(value);
  };

  const value = useMemo(() => ({ isEditMode, setEditMode }), [isEditMode]);

  return <EditModeContext.Provider value={value}>{children}</EditModeContext.Provider>;
}

export function useEditMode() {
  const context = use(EditModeContext);
  if (!context) {
    throw new Error('useEditMode must be used within EditModeProvider');
  }
  return context;
}
