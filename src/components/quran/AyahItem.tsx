import { Verse } from "@/types";
import { cn, normalizeQuranText } from "@/lib/utils";
import { Play, BookOpen, Bookmark } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";

interface AyahItemProps {
  verse: Verse;
  isActive?: boolean;
  isHighlighted?: boolean;
  isBookmarked?: boolean;
  onPlay?: () => void;
  onTafsir?: () => void;
  onBookmark?: () => void;
}

export function AyahItem({
  verse,
  isActive,
  isHighlighted,
  isBookmarked,
  onPlay,
  onTafsir,
  onBookmark,
}: AyahItemProps) {
  const { arabicFontSize, translationFontSize, showWordByWord } =
    useSettingsStore();

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
            className="font-lpmq leading-[2.5] md:leading-[3.0] text-foreground tracking-normal text-right antialiased py-6"
            dir="rtl"
            style={{ 
              fontSize: `${arabicFontSize}px`,
              fontFeatureSettings: '"rlig" 1, "calt" 1, "liga" 1',
              textRendering: 'optimizeLegibility'
            }}
          >
            {normalizeQuranText(verse.text_uthmani || "")}
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-4">
        {showWordByWord && verse.words && verse.words.length > 0 && (
          <div className="flex flex-wrap gap-3" dir="rtl">
            {verse.words.map((word) => (
              <div key={word.id} className="group/word relative">
                <span
                  className="font-arabic text-foreground/80 group-hover/word:text-primary transition-colors cursor-default leading-[2.5]"
                  style={{ 
                    fontSize: `${arabicFontSize * 0.75}px`,
                    fontFeatureSettings: '"rlig" 1, "calt" 1, "liga" 1',
                    textRendering: 'optimizeLegibility'
                  }}
                >
                  {normalizeQuranText(word.text_uthmani)}
                </span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-[10px] rounded opacity-0 group-hover/word:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-border shadow-md">
                  {word?.translation?.text}
                </div>
              </div>
            ))}
          </div>
        )}

        <p
          className="text-muted-foreground leading-relaxed pt-2"
          style={{ fontSize: `${translationFontSize}px` }}
        >
          {verse.translations?.[0]?.text.replace(/<(?:.|\n)*?>/gm, "")}
        </p>
      </div>
    </div>
  );
}
