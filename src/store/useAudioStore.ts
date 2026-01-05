import { create } from "zustand";

interface AudioState {
  currentSurah: number | null;
  currentSurahName: string | null;
  currentAyah: number | null;
  totalVerses: number | null;
  isPlaying: boolean;
  audioUrl: string | null;
  qoriName: string | null;
  onNavigateNext: (() => void) | null;
  onNavigatePrev: (() => void) | null;
  repeatMode: "off" | "one" | "all"; // off, one (repeat current ayah), all (repeat all ayahs)
  autoAdvance: boolean; // auto go to next ayah when current finishes

  // Actions
  setAudio: (
    surah: number,
    ayah: number,
    url: string,
    surahName: string,
    qoriName?: string,
    totalVerses?: number,
    autoPlay?: boolean
  ) => void;
  setNavigationCallbacks: (
    onNext: (() => void) | null,
    onPrev: (() => void) | null
  ) => void;
  toggleRepeat: () => void;
  setAutoAdvance: (enabled: boolean) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  togglePlay: () => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  currentSurah: null,
  currentSurahName: null,
  currentAyah: null,
  totalVerses: null,
  isPlaying: false,
  audioUrl: null,
  qoriName: null,
  onNavigateNext: null,
  onNavigatePrev: null,
  repeatMode: "off",
  autoAdvance: false,

  setAudio: (surah, ayah, url, surahName, qoriName, totalVerses, autoPlay = true) =>
    set({
      currentSurah: surah,
      currentSurahName: surahName,
      currentAyah: ayah,
      audioUrl: url,
      qoriName: qoriName || null,
      totalVerses: totalVerses || null,
      isPlaying: autoPlay,
    }),

  setNavigationCallbacks: (onNext, onPrev) =>
    set({
      onNavigateNext: onNext,
      onNavigatePrev: onPrev,
    }),

  toggleRepeat: () =>
    set((state) => {
      const modes: ("off" | "one" | "all")[] = ["off", "one", "all"];
      const currentIndex = modes.indexOf(state.repeatMode);
      const nextIndex = (currentIndex + 1) % modes.length;
      const nextMode = modes[nextIndex];

      // If repeat is ON (one or all), set autoAdvance to false
      return {
        repeatMode: nextMode,
        autoAdvance: nextMode === "off" ? state.autoAdvance : false,
      };
    }),

  setAutoAdvance: (enabled) =>
    set((state) => ({
      autoAdvance: enabled,
      // If autoAdvance is turned ON, set repeatMode to off
      repeatMode: enabled ? "off" : state.repeatMode,
    })),

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  stop: () =>
    set({
      isPlaying: false,
      currentSurah: null,
      currentAyah: null,
      audioUrl: null,
      qoriName: null,
    }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
}));
