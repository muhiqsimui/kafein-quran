"use client";

import { useEffect, useRef, useState } from "react";
import { Howl } from "howler";
import { useAudioStore } from "@/store/useAudioStore";
import {
  Play,
  Pause,
  X,
  SkipForward,
  SkipBack,
  Repeat,
  Repeat1,
  ListVideo,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AudioBar() {
  const {
    currentSurah,
    currentSurahName,
    currentAyah,
    isPlaying,
    audioUrl,
    qoriName,
    onNavigateNext,
    onNavigatePrev,
    repeatMode,
    autoAdvance,
    toggleRepeat,
    setAutoAdvance,
    togglePlay,
    stop,
    pause,
    play,
  } = useAudioStore();

  const howlRef = useRef<Howl | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Ref untuk menyimpan state terbaru agar callback 'onend' tidak stale (basi)
  const stateRef = useRef({ repeatMode, autoAdvance, onNavigateNext });

  useEffect(() => {
    stateRef.current = { repeatMode, autoAdvance, onNavigateNext };
  }, [repeatMode, autoAdvance, onNavigateNext]);

  // Efek Utama: Inisialisasi Audio
  useEffect(() => {
    if (!audioUrl) return;

    setIsLoading(true);

    if (howlRef.current) {
      howlRef.current.unload();
    }

    howlRef.current = new Howl({
      src: [audioUrl],
      html5: true,
      onplay: () => {
        setIsLoading(false);
        play();
      },
      onpause: () => pause(),
      onend: () => {
        const {
          repeatMode: mode,
          autoAdvance: auto,
          onNavigateNext: next,
        } = stateRef.current;

        if (mode === "one") {
          howlRef.current?.play();
        } else if (mode === "all" || (mode === "off" && auto)) {
          if (next) {
            next();
          } else {
            pause(); // Logo otomatis jadi Play jika list habis
          }
        } else {
          pause(); // Logo otomatis jadi Play saat audio selesai
        }
      },
      onloaderror: () => {
        setIsLoading(false);
        pause();
      },
    });

    if (isPlaying) {
      howlRef.current.play();
    }

    return () => {
      howlRef.current?.unload();
    };
  }, [audioUrl]); // Audio hanya reload jika URL berganti

  // Efek Sinkronisasi Play/Pause
  useEffect(() => {
    if (!howlRef.current) return;
    const isActuallyPlaying = howlRef.current.playing();

    if (isPlaying && !isActuallyPlaying) {
      howlRef.current.play();
    } else if (!isPlaying && isActuallyPlaying) {
      howlRef.current.pause();
    }
  }, [isPlaying]);

  if (!audioUrl) return null;

  return (
    <div className="fixed bottom-16 md:bottom-4 left-4 right-4 z-40 animate-in slide-in-from-bottom-8 duration-500">
      <div className="relative max-w-xl mx-auto bg-background/95 backdrop-blur-xl border border-primary/20 shadow-2xl rounded-2xl px-5 py-4 flex flex-col gap-4">
        {/* Tombol Close */}
        <button
          onClick={stop}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-accent text-muted-foreground transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Info Surah & Ayat */}
        <div className="flex flex-row gap-3 items-center">
          <div className="relative w-12 h-12 flex items-center justify-center bg-primary/10 rounded-full shrink-0">
            <img
              src="/ayah-marker.svg"
              className="w-10 h-10 object-contain opacity-20"
              alt=""
            />
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-primary">
              {currentAyah}
            </span>
          </div>
          <div className="flex min-w-0 flex-col flex-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              {isLoading
                ? "Memuat..."
                : isPlaying
                ? "Sedang Diputar"
                : "Berhenti"}
            </p>
            <h4 className="font-bold truncate text-primary">
              Surah {currentSurahName || currentSurah}
            </h4>
            {qoriName && (
              <p className="text-xs text-muted-foreground truncate">
                Qori: {qoriName}
              </p>
            )}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-3 md:gap-4">
          {/* Tombol Repeat: Off -> One (Repeat1) -> All (Repeat Active) */}
          <button
            onClick={toggleRepeat}
            className={cn(
              "p-2 rounded-full transition-all",
              repeatMode !== "off"
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:bg-accent"
            )}
          >
            {repeatMode === "one" ? (
              <Repeat1 className="w-5 h-5" />
            ) : (
              <Repeat className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={() => onNavigatePrev?.()}
            disabled={!onNavigatePrev || isLoading}
            className="p-2 rounded-full hover:bg-accent text-muted-foreground disabled:opacity-20"
          >
            <SkipBack className="w-6 h-6" />
          </button>

          {/* Tombol Play/Pause - Logo Otomatis Berganti */}
          <button
            onClick={togglePlay}
            disabled={isLoading}
            className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-1" />
            )}
          </button>

          <button
            onClick={() => onNavigateNext?.()}
            disabled={!onNavigateNext || isLoading}
            className="p-2 rounded-full hover:bg-accent text-muted-foreground disabled:opacity-20"
          >
            <SkipForward className="w-6 h-6" />
          </button>

          {/* Tombol Auto Play */}
          <button
            onClick={() => setAutoAdvance(!autoAdvance)}
            className={cn(
              "p-2 rounded-full transition-all",
              autoAdvance
                ? "bg-emerald-500/20 text-emerald-600"
                : "text-muted-foreground hover:bg-accent"
            )}
            title="Auto Advance"
          >
            <ListVideo className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
