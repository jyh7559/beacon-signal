import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ContrastMode = 'comfortable' | 'high-contrast';

interface ContrastModeContextType {
  contrastMode: ContrastMode;
  setContrastMode: (mode: ContrastMode) => void;
}

const ContrastModeContext = createContext<ContrastModeContextType | undefined>(undefined);

const STORAGE_KEY = 'intellizence-contrast-mode';

export function ContrastModeProvider({ children }: { children: ReactNode }) {
  const [contrastMode, setContrastModeState] = useState<ContrastMode>('comfortable');

  // Load preference from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ContrastMode | null;
    if (stored === 'comfortable' || stored === 'high-contrast') {
      setContrastModeState(stored);
    }
  }, []);

  // Apply/remove high-contrast class on document
  useEffect(() => {
    if (contrastMode === 'high-contrast') {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [contrastMode]);

  const setContrastMode = (mode: ContrastMode) => {
    setContrastModeState(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  };

  return (
    <ContrastModeContext.Provider value={{ contrastMode, setContrastMode }}>
      {children}
    </ContrastModeContext.Provider>
  );
}

export function useContrastMode(): ContrastModeContextType {
  const context = useContext(ContrastModeContext);
  if (!context) {
    throw new Error('useContrastMode must be used within a ContrastModeProvider');
  }
  return context;
}
