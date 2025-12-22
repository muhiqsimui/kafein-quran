import { create } from 'zustand';

interface AudioState {
  currentSurah: number | null;
  currentSurahName: string | null;
  currentAyah: number | null;
  isPlaying: boolean;
  audioUrl: string | null;

  // Actions
  setAudio: (surah: number, ayah: number, url: string, surahName: string) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  togglePlay: () => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  currentSurah: null,
  currentSurahName: null,
  currentAyah: null,
  isPlaying: false,
  audioUrl: null,

  setAudio: (surah, ayah, url, surahName) => set({
    currentSurah: surah,
    currentSurahName: surahName,
    currentAyah: ayah,
    audioUrl: url,
    isPlaying: true,
  }),

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  stop: () => set({
    isPlaying: false,
    currentSurah: null,
    currentAyah: null,
    audioUrl: null,
  }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
}));
