'use client';

import { useQuery } from '@tanstack/react-query';
import { getTafsir } from '@/lib/api';
import { X, BookOpen, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TafsirSheetProps {
  ayahKey: string | null;
  onClose: () => void;
}

export function TafsirSheet({ ayahKey, onClose }: TafsirSheetProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tafsir', ayahKey],
    queryFn: () => getTafsir(ayahKey!),
    enabled: !!ayahKey,
  });

  if (!ayahKey) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg h-full bg-card border-l border-border shadow-2xl animate-in slide-in-from-right duration-500 overflow-hidden flex flex-col">
        <header className="p-4 border-b border-border flex items-center justify-between bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="font-bold">Tafsir Kemenag</h3>
            <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">
              Ayat {ayahKey}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-accent transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-8 bg-muted animate-pulse rounded-md w-3/4" />
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded-md" />
                <div className="h-4 bg-muted animate-pulse rounded-md w-5/6" />
                <div className="h-4 bg-muted animate-pulse rounded-md w-4/6" />
                <div className="h-4 bg-muted animate-pulse rounded-md" />
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive font-medium">Gagal memuat tafsir.</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 text-sm text-primary hover:underline"
              >
                Coba lagi
              </button>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
               <div 
                className="text-foreground leading-relaxed text-lg"
                dangerouslySetInnerHTML={{ __html: data?.tafsir.text || '' }}
              />
            </div>
          )}
        </div>

        <footer className="p-4 border-t border-border bg-muted/30">
          <p className="text-[10px] text-muted-foreground text-center">
            Sumber: Quran.com • Tafsir Kementerian Agama Republik Indonesia
          </p>
        </footer>
      </div>
    </div>
  );
}
