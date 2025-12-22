'use client';

import { useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { useAudioStore } from '@/store/useAudioStore';
import { Play, Pause, X, SkipForward, SkipBack } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AudioBar() {
  const { currentSurah, currentSurahName, currentAyah, isPlaying, audioUrl, togglePlay, stop, pause, play } = useAudioStore();
  const howlRef = useRef<Howl | null>(null);

  useEffect(() => {
    if (audioUrl) {
      if (howlRef.current) {
        howlRef.current.unload();
      }

      howlRef.current = new Howl({
        src: [audioUrl],
        html5: true,
        onplay: () => play(),
        onpause: () => pause(),
        onend: () => stop(),
        onloaderror: () => {
          console.error('Audio load error');
          stop();
        }
      });

      if (isPlaying) {
        howlRef.current.play();
      }
    }

    return () => {
      if (howlRef.current) {
        howlRef.current.unload();
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    if (!howlRef.current) return;
    
    if (isPlaying) {
      howlRef.current.play();
    } else {
      howlRef.current.pause();
    }
  }, [isPlaying]);

  if (!audioUrl) return null;

  return (
    <div className="fixed bottom-16 md:bottom-4 left-4 right-4 z-40 animate-in slide-in-from-bottom-8 duration-500">
      <div className="max-w-xl mx-auto bg-background/95 backdrop-blur-xl border border-primary/20 shadow-2xl rounded-2xl p-4 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            Memutar Ayat {currentAyah}
          </p>
          <h4 className="font-bold truncate text-primary">Surah {currentSurahName || currentSurah}</h4>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-primary/20"
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
          </button>
          
          <button
            onClick={stop}
            className="p-2 rounded-full hover:bg-accent text-muted-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
