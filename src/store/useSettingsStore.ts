import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  arabicFontSize: number;
  translationFontSize: number;
  showWordByWord: boolean;
  lastRead: {
    chapterId?: number;
    chapterName?: string;
    ayahNumber?: number;
    pageId?: number;
  } | null;
  
  // Actions
  setArabicFontSize: (size: number) => void;
  setTranslationFontSize: (size: number) => void;
  setShowWordByWord: (show: boolean) => void;
  setLastRead: (lastRead: SettingsState['lastRead']) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      arabicFontSize: 32,
      translationFontSize: 16,
      showWordByWord: true,
      lastRead: null,

      setArabicFontSize: (size) => set({ arabicFontSize: size }),
      setTranslationFontSize: (size) => set({ translationFontSize: size }),
      setShowWordByWord: (show) => set({ showWordByWord: show }),
      setLastRead: (lastRead) => set({ lastRead }),
    }),
    {
      name: 'lumina-quran-settings',
    }
  )
);
