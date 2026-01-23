"use client";

import { useState, useEffect, useRef } from "react";
import { Verse, Chapter } from "@/types";
import { AyahItem } from "./AyahItem";
import { TafsirSheet } from "./TafsirSheet";
import { BookmarkNoteDialog } from "./BookmarkNoteDialog";
import { useAudioStore } from "@/store/useAudioStore";
import { useBookmarkStore } from "@/store/useBookmarkStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useScrollToAyah } from "@/hooks/useScrollToAyah";
import { getArabicFontClass, cn } from "@/lib/utils";

interface JuzVerseListProps {
  verses: Verse[];
  chapters: Chapter[];
  juzId: number;
}

export function JuzVerseList({ verses: initialVerses, chapters, juzId }: JuzVerseListProps) {
  const [activeTafsir, setActiveTafsir] = useState<string | null>(null);
  const [notingAyah, setNotingAyah] = useState<{ key: string; note?: string } | null>(null);
  const { selectedQari, setLastRead, fontFamily, mushafMode } = useSettingsStore();
  const [verses, setVerses] = useState<Verse[]>(initialVerses);
  const [loading, setLoading] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const fontClass = getArabicFontClass(fontFamily);

  useEffect(() => {
    setHasMounted(true);
  }, []);
  const { setAudio, currentAyah, setNavigationCallbacks } = useAudioStore();
  const { addBookmark, removeBookmark, isBookmarked, updateBookmarkNote, bookmarks } = useBookmarkStore();

  const isInitialized = useRef(false);
  const initialModeRef = useRef(mushafMode);

  // Re-fetch verses when mushafMode changes
  useEffect(() => {
    if (mushafMode === initialModeRef.current && isInitialized.current) return;
    if (!isInitialized.current) {
        isInitialized.current = true;
        if (mushafMode === 'kemenag') return;
    }

    const fetchVerses = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/juz/${juzId}?mode=${mushafMode}`);
        if (res.ok) {
          const data = await res.json();
          setVerses(data.verses);
        }
      } catch (error) {
        console.error("Failed to fetch alternative mushaf verses (juz)", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVerses();
  }, [mushafMode, juzId]);

  useScrollToAyah(currentAyah);

  const getChapterName = (chapterId: number) => {
    return chapters.find((c) => c.id === chapterId)?.name_simple || "";
  };

  const handlePlay = (verse: Verse, autoPlay = true) => {
    if (!selectedQari) return;

    const [chapterIdStr, verseNumStr] = verse.verse_key.split(":");
    const chapterId = parseInt(chapterIdStr);
    const surahPadded = String(chapterId).padStart(3, "0");
    const versePadded = String(verse.verse_number).padStart(3, "0");
    const audioUrl = `https://everyayah.com/data/${selectedQari.reciter_id}/${surahPadded}${versePadded}.mp3`;

      setAudio(
      chapterId,
      verse.verse_number,
      audioUrl,
      getChapterName(chapterId),
      selectedQari.name,
      verses.length,
      autoPlay
    );
  };

  useEffect(() => {
    const handleNextAyah = () => {
      const { repeatMode, isPlaying, currentSurah: playingChapterId, currentAyah: playingVerseNum } = useAudioStore.getState();
      
      const currentIndex = verses.findIndex(v => {
        const [cId, vId] = v.verse_key.split(":");
        return parseInt(cId) === playingChapterId && parseInt(vId) === playingVerseNum;
      });

      if (currentIndex !== -1 && currentIndex < verses.length - 1) {
        handlePlay(verses[currentIndex + 1], isPlaying);
      } else if (repeatMode === "all" && verses.length > 0) {
        handlePlay(verses[0], isPlaying);
      }
    };

    const handlePrevAyah = () => {
        const { isPlaying, currentSurah: playingChapterId, currentAyah: playingVerseNum } = useAudioStore.getState();
        const currentIndex = verses.findIndex(v => {
          const [cId, vId] = v.verse_key.split(":");
          return parseInt(cId) === playingChapterId && parseInt(vId) === playingVerseNum;
        });
  
        if (currentIndex > 0) {
          handlePlay(verses[currentIndex - 1], isPlaying);
        }
    };

    setNavigationCallbacks(handleNextAyah, handlePrevAyah);
  }, [verses, setNavigationCallbacks]);


  const handleBookmark = (verse: Verse) => {
    const chapterId = parseInt(verse.verse_key.split(":")[0]);
    if (isBookmarked(verse.verse_key)) {
      removeBookmark(verse.verse_key);
    } else {
      addBookmark({
        chapterId,
        chapterName: getChapterName(chapterId),
        ayahNumber: verse.verse_number,
        ayahKey: verse.verse_key,
        textArabic: verse.text_uthmani,
        translation: verse.translations?.[0]?.text,
      });
      // Suggest writing a note
      setNotingAyah({ key: verse.verse_key });
    }
  };

    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          const visibleAyahs = entries
            .filter(e => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
  
          if (visibleAyahs.length > 0) {
            const mostVisible = visibleAyahs[0];
            const verseKey = (mostVisible.target as HTMLElement).getAttribute('data-verse-key');
            
            if (verseKey) {
              const [cId, vId] = verseKey.split(":");
              setLastRead({
                 chapterId: parseInt(cId),
                 chapterName: getChapterName(parseInt(cId)),
                 ayahNumber: parseInt(vId)
              });
            }
          }
        },
        {
          root: null,
          rootMargin: '-25% 0px -25% 0px',
          threshold: [0, 0.1, 0.5, 0.9, 1.0],
        }
      );
  
      const timer = setTimeout(() => {
        const ayahElements = document.querySelectorAll('[data-verse-key]');
        ayahElements.forEach((element) => observer.observe(element));
      }, 500);
  
      return () => {
        clearTimeout(timer);
        observer.disconnect();
      };
    }, [verses]);

  return (
    <>
      <div className={cn("space-y-6 transition-opacity duration-300", loading && "opacity-50 pointer-events-none")}>
        {verses.map((verse, index) => {
          const chapterId = parseInt(verse.verse_key.split(":")[0]);
          const chapter = chapters.find((c) => c.id === chapterId);
          const isSurahStartInJuz = index === 0 || parseInt(verses[index - 1].verse_key.split(":")[0]) !== chapterId;
          const showHeader = isSurahStartInJuz;
          const showBismillah = showHeader && chapterId !== 1 && chapterId !== 9;

          return (
            <div key={`${mushafMode}-${verse.id}`}>
              {showHeader && (
                 <div className="w-full block mt-12 mb-8 animate-in slide-in-from-bottom-5 duration-700" dir="rtl">
                    <div className="w-full min-h-[80px] sm:h-28 bg-[url('/surah-header.png')] bg-contain bg-no-repeat bg-center flex flex-col items-center justify-center border-y border-black/5 relative py-2">
                         <div className="absolute inset-x-0 h-full border-y-[2px] sm:border-y-[3px] border-double border-[#eaddcf]" />
                         <div className="z-10 bg-[#fffcf2] px-6 font-lpmq text-2xl sm:text-4xl text-black font-bold mb-1 drop-shadow-sm">
                           سورة {chapter?.name_arabic || ""}
                         </div>
                         <div className="z-10 bg-[#fffcf2] px-3 font-serif text-xs sm:text-sm text-[#8a8a8a] tracking-[0.2em] uppercase">
                           {chapter?.name_simple || ""}
                         </div>
                    </div>
                    {showBismillah && (
                        <div className={cn(fontClass, "text-center text-2xl sm:text-3xl mt-6 mb-4 text-black/80")}>
                            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                        </div>
                    )}
                 </div>
              )}
              
              <div data-verse-key={verse.verse_key}>
                  <AyahItem
                    verse={verse}
                    isActive={
                        hasMounted &&
                        currentAyah === verse.verse_number &&
                        useAudioStore.getState().currentSurah === chapterId
                    }
                    isBookmarked={hasMounted && isBookmarked(verse.verse_key)}
                    onPlay={() => handlePlay(verse)}
                    onTafsir={() => setActiveTafsir(verse.verse_key)}
                    onBookmark={() => handleBookmark(verse)}
                    note={hasMounted ? bookmarks.find(b => b.ayahKey === verse.verse_key)?.note : undefined}
                    hasMounted={hasMounted}
                  />
              </div>
            </div>
          );
        })}
      </div>

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/20 backdrop-blur-[1px]">
          <div className="bg-card border border-border px-4 py-2 rounded-full shadow-lg text-sm font-medium animate-pulse">
            Mengganti Versi Mushaf...
          </div>
        </div>
      )}

      <TafsirSheet
        ayahKey={activeTafsir}
        onClose={() => setActiveTafsir(null)}
      />

      <BookmarkNoteDialog
        isOpen={!!notingAyah}
        onClose={() => setNotingAyah(null)}
        onSave={(note) => {
          if (notingAyah) {
            updateBookmarkNote(notingAyah.key, note);
          }
        }}
        verseKey={notingAyah?.key || ""}
        initialNote={bookmarks.find(b => b.ayahKey === notingAyah?.key)?.note}
      />
    </>
  );
}
