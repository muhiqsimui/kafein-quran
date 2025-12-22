import { Verse } from '@/types';
import { cn } from '@/lib/utils';
import { Play, BookOpen, Bookmark } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';

interface AyahItemProps {
  verse: Verse;
  isActive?: boolean;
  isBookmarked?: boolean;
  onPlay?: () => void;
  onTafsir?: () => void;
  onBookmark?: () => void;
}

export function AyahItem({ verse, isActive, isBookmarked, onPlay, onTafsir, onBookmark }: AyahItemProps) {
  const { arabicFontSize, translationFontSize, showWordByWord } = useSettingsStore();

  return (
    <div
      id={`ayah-${verse.verse_number}`}
      className={cn(
        'group p-6 rounded-2xl border transition-all duration-500 space-y-6',
        isActive
          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5 ring-1 ring-primary/20'
          : 'border-border bg-card/40 hover:border-primary/20 hover:bg-card/60'
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary text-secondary-foreground text-xs font-bold">
            {verse.verse_number}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onPlay}
              className="p-1.5 rounded-md text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all"
              title="Putar Ayat"
            >
              <Play className="w-4 h-4 fill-current" />
            </button>
            <button
              onClick={onTafsir}
              className="p-1.5 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
              title="Lihat Tafsir"
            >
              <BookOpen className="w-4 h-4" />
            </button>
            <button
              onClick={onBookmark}
              className={cn(
                "p-1.5 rounded-md transition-all",
                isBookmarked 
                  ? "text-primary bg-primary/10 hover:bg-primary/20" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
              title={isBookmarked ? "Hapus dari Simpanan" : "Simpan Ayat"}
            >
              <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
            </button>
          </div>
        </div>
        
        <div className="text-right flex-1 overflow-visible">
           <div 
            className="font-arabic leading-[2.8] text-foreground tracking-normal text-right antialiased"
            dir="rtl"
            style={{ fontSize: `${arabicFontSize}px` }}
          >
            {verse.text_uthmani}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {showWordByWord && (
          <div className="flex flex-wrap gap-2" dir="rtl">
            {verse.words.map((word) => (
              <div key={word.id} className="group/word relative">
                <span 
                  className="font-arabic text-foreground/80 group-hover/word:text-primary transition-colors cursor-default"
                  style={{ fontSize: `${arabicFontSize * 0.75}px` }}
                >
                  {word.text_uthmani}
                </span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-[10px] rounded opacity-0 group-hover/word:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-border">
                  {word.translation.text}
                </div>
              </div>
            ))}
          </div>
        )}

        <p 
          className="text-muted-foreground leading-relaxed"
          style={{ fontSize: `${translationFontSize}px` }}
        >
          {verse.translations?.[0]?.text.replace(/<(?:.|\n)*?>/gm, '')}
        </p>
      </div>
    </div>
  );
}
