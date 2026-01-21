import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Qari {
  id: string;
  name: string;
  arabic_name?: string;
  reciter_id: string; // EveryAyah format: e.g., "Alafasy_64kbps"
}

export type MushafMode = "kemenag" | "uthmani";

interface SettingsState {
  arabicFontSize: number;
  translationFontSize: number;
  selectedQariId: string;
  selectedQari: Qari | null;
  lastRead: {
    chapterId?: number;
    chapterName?: string;
    ayahNumber?: number;
    pageId?: number;
  } | null;
  fontFamily: string;
  showTranslation: boolean;
  mushafMode: MushafMode;
  memoizationMode: boolean;
  isTextHidden: boolean;

  // Actions
  setArabicFontSize: (size: number) => void;
  setTranslationFontSize: (size: number) => void;
  setSelectedQari: (qariId: string, qari: Qari) => void;
  setLastRead: (lastRead: SettingsState["lastRead"]) => void;
  setFontFamily: (font: string) => void;
  setShowTranslation: (show: boolean) => void;
  setMushafMode: (mode: MushafMode) => void;
  setMemoizationMode: (enabled: boolean) => void;
  setIsTextHidden: (hidden: boolean) => void;
  toggleTextVisibility: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      arabicFontSize: 32,
      translationFontSize: 16,
      selectedQariId: "Alafasy_64kbps",
      selectedQari: {
        id: "Alafasy_64kbps",
        name: "Mishary Rashid al-Afasy",
        arabic_name: "مشاري raashid العفاسي",
        reciter_id: "Alafasy_64kbps",
      },
      lastRead: null,
      fontFamily: "lpmq",
      showTranslation: true,
      mushafMode: "kemenag", // Default to Kemenag as requested
      memoizationMode: false,
      isTextHidden: false,

      setArabicFontSize: (size) => set({ arabicFontSize: size }),
      setTranslationFontSize: (size) => set({ translationFontSize: size }),
      setSelectedQari: (qariId, qari) =>
        set({ selectedQariId: qariId, selectedQari: qari }),
      setLastRead: (lastRead) => set({ lastRead }),
      setFontFamily: (font) => set({ fontFamily: font }),
      setShowTranslation: (show) => set({ showTranslation: show }),
      setMushafMode: (mode) => set({ mushafMode: mode }),
      setMemoizationMode: (enabled) => set({ memoizationMode: enabled }),
      setIsTextHidden: (hidden) => set({ isTextHidden: hidden }),
      toggleTextVisibility: () =>
        set((state) => ({ isTextHidden: !state.isTextHidden })),
    }),
    {
      name: "lumina-quran-settings",
    }
  )
);
