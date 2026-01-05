"use client";

import { useState, useEffect, useRef } from "react";
import { Verse, Chapter } from "@/types";
import { AyahItem } from "./AyahItem";
import { TafsirSheet } from "./TafsirSheet";
import { useAudioStore } from "@/store/useAudioStore";
import { useBookmarkStore } from "@/store/useBookmarkStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useScrollToAyah } from "@/hooks/useScrollToAyah";

interface JuzVerseListProps {
  verses: Verse[];
  chapters: Chapter[];
  juzId: number;
}

export function JuzVerseList({ verses, chapters, juzId }: JuzVerseListProps) {
  const [activeTafsir, setActiveTafsir] = useState<string | null>(null);
  const { selectedQari, setLastRead } = useSettingsStore();
  const { setAudio, currentAyah, setNavigationCallbacks } = useAudioStore();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarkStore();

  useScrollToAyah(currentAyah);

  const getChapterName = (chapterId: number) => {
    return chapters.find((c) => c.id === chapterId)?.name_simple || "";
  };

  const handlePlay = (verse: Verse) => {
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
      // Pass total verses of THIS surah, assuming audio logic handles it. 
      // If we are in Juz view, next audio track should ideally be the next verse in the LIST.
      // But standard AudioStore might stick to one Surah.
      // For now, let's pass a large number or current verses length? 
      // Actually, useAudioStore logic might loop within the chapterId if we verify strictly.
      // Let's pass verses.length of the JUZ context? 
      // No, let's keep it simple:
      verses.length
    );
  };

  // Implement navigation callbacks for AudioBar to move to next/prev verse in this LIST
  useEffect(() => {
    const handleNextAyah = () => {
      // Find current index
      // Since currentAyah is just a number, it's ambiguous in multi-surah context (Juz).
      // But useAudioStore tracks `currentSurah` (chapterId) too.
      const { currentSurah: playingChapterId, currentAyah: playingVerseNum } = useAudioStore.getState();
      
      const currentIndex = verses.findIndex(v => {
        const [cId, vId] = v.verse_key.split(":");
        return parseInt(cId) === playingChapterId && parseInt(vId) === playingVerseNum;
      });

      if (currentIndex !== -1 && currentIndex < verses.length - 1) {
        handlePlay(verses[currentIndex + 1]);
      }
    };

    const handlePrevAyah = () => {
        const { currentSurah: playingChapterId, currentAyah: playingVerseNum } = useAudioStore.getState();
        const currentIndex = verses.findIndex(v => {
          const [cId, vId] = v.verse_key.split(":");
          return parseInt(cId) === playingChapterId && parseInt(vId) === playingVerseNum;
        });
  
        if (currentIndex > 0) {
          handlePlay(verses[currentIndex - 1]);
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
      });
    }
  };

  // Intersection Observer to track "Last Read"
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
      <div className="space-y-6">
        {verses.map((verse, index) => {
          const chapterId = parseInt(verse.verse_key.split(":")[0]);
          const chapter = chapters.find((c) => c.id === chapterId);
          const isSurahStartInJuz = index === 0 || parseInt(verses[index - 1].verse_key.split(":")[0]) !== chapterId;
          const showHeader = isSurahStartInJuz;

          // Bismillah logic: Show if text doesn't have it, AND it is NOT Surah 1 or 9.
          // BUT, unlike Page view, we display full Ayat blocks. 
          // AyahItem handles "Bismillah" inside the text usually.
          // In "Verse List" mode (Surah view), Bismillah is usually a separate header *before* verse 1 if applicable.
          // If we are showing a new Surah header, we should show Bismillah if applicable.
          // Note: AyahItem renders `verse.text_uthmani`. If Bismillah is in text (Al-Fatihah), it shows.
          // If not in text (most surahs), we might want to show it in the header.
          const showBismillah = showHeader && chapterId !== 1 && chapterId !== 9;

          return (
            <div key={verse.id}>
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
                        <div className="text-center font-lpmq text-2xl sm:text-3xl mt-6 mb-4 text-black/80">
                            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                        </div>
                    )}
                 </div>
              )}
              
              {/* Assign data-verse-key for observer */}
              <div data-verse-key={verse.verse_key}>
                  <AyahItem
                    verse={verse}
                    isActive={
                        useAudioStore.getState().currentSurah === chapterId && 
                        useAudioStore.getState().currentAyah === verse.verse_number
                    }
                    isBookmarked={isBookmarked(verse.verse_key)}
                    onPlay={() => handlePlay(verse)}
                    onTafsir={() => setActiveTafsir(verse.verse_key)}
                    onBookmark={() => handleBookmark(verse)}
                  />
              </div>
            </div>
          );
        })}
      </div>

      <TafsirSheet
        ayahKey={activeTafsir}
        onClose={() => setActiveTafsir(null)}
      />
    </>
  );
}
