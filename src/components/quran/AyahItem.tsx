import { Verse } from "@/types";
import { cn, normalizeQuranText, getArabicFontClass } from "@/lib/utils";
import { Play, BookOpen, Bookmark, FileText } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";

interface AyahItemProps {
  verse: Verse;
  isActive?: boolean;
  isHighlighted?: boolean;
  isBookmarked?: boolean;
  onPlay?: () => void;
  onTafsir?: () => void;
  onBookmark?: () => void;
  note?: string;
  hasMounted?: boolean;
}

export function AyahItem({
  verse,
  isActive,
  isHighlighted,
  isBookmarked,
  onPlay,
  onTafsir,
  onBookmark,
  note,
  hasMounted,
}: AyahItemProps) {
  const { 
    arabicFontSize, 
    translationFontSize, 
    fontFamily,
    showTranslation,
    isTextHidden,
  } = useSettingsStore();

  const fontClass = getArabicFontClass(fontFamily);

  return (
    <div
      id={`ayah-${verse.verse_number}`}
      data-verse-number={verse.verse_number}
      className={cn(
        "group p-6 rounded-2xl border transition-all duration-500 space-y-6",
        isActive || isHighlighted
          ? "border-primary bg-primary/5 shadow-lg shadow-primary/5 ring-1 ring-primary/20"
          : "border-border bg-card/40 hover:border-primary/20 hover:bg-card/60",
        isHighlighted && "highlight-pulse"
      )}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center justify-center min-w-[32px] h-8 rounded-lg bg-secondary text-secondary-foreground text-xs font-bold">
            {verse.verse_number}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onPlay}
              className="p-2 rounded-md text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all"
              title="Putar Ayat"
            >
              <Play className="w-4 h-4 fill-current" />
            </button>
            <button
              onClick={onTafsir}
              className="p-2 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
              title="Lihat Tafsir"
            >
              <BookOpen className="w-4 h-4" />
            </button>
            <button
              onClick={onBookmark}
              className={cn(
                "p-2 rounded-md transition-all",
                isBookmarked
                  ? "text-primary bg-primary/10 hover:bg-primary/20"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
              title={isBookmarked ? "Hapus dari Simpanan" : "Simpan Ayat"}
            >
              <Bookmark
                className={cn("w-4 h-4", isBookmarked && "fill-current")}
              />
            </button>
          </div>
        </div>

        <div className="text-right w-full overflow-visible">
          <div
            className={cn(
              fontClass,
              "leading-[2.5] md:leading-[3.0] text-foreground tracking-normal text-right antialiased py-6 transition-all duration-500",
              hasMounted && isTextHidden && "blur-md opacity-20 select-none pointer-events-none"
            )}
            dir="rtl"
            style={{ 
              fontSize: `${hasMounted ? arabicFontSize : 32}px`,
              fontFeatureSettings: '"rlig" 1, "calt" 1, "liga" 1',
              textRendering: 'optimizeLegibility'
            }}
          >
            {normalizeQuranText(verse.text_uthmani || "")}
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4">

        {(!hasMounted || showTranslation) && verse.translations && verse.translations.length > 0 && (
          <p
            className={cn(
              "text-muted-foreground leading-relaxed transition-all duration-500",
              hasMounted && isTextHidden && "blur-sm opacity-10 select-none pointer-events-none"
            )}
            style={{ fontSize: `${hasMounted ? translationFontSize : 16}px` }}
          >
            {verse.translations[0].text.replace(/<(?:.|\n)*?>/gm, "")}
          </p>
        )}

        {note && (
          <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-500">
            <FileText className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Catatan Anda</p>
              <p className="text-sm text-foreground/80 italic">{note}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
