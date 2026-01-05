"use client";

import { useState, useEffect, useRef } from "react";
import { Verse } from "@/types";
import { AyahItem } from "./AyahItem";
import { TafsirSheet } from "./TafsirSheet";
import { useAudioStore } from "@/store/useAudioStore";
import { useBookmarkStore } from "@/store/useBookmarkStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useScrollToAyah } from "@/hooks/useScrollToAyah";
import { useDebounce } from "@/hooks/useDebounce";


interface VerseListProps {
  verses: Verse[];
  chapterId: number;
  chapterName: string;
  highlightAyah?: number;
}

export function VerseList({ 
  verses: initialVerses, 
  chapterId, 
  chapterName, 
  highlightAyah 
}: VerseListProps) {
  const [activeTafsir, setActiveTafsir] = useState<string | null>(null);
  const { lastRead, setLastRead, selectedQari } = useSettingsStore();
  const [verses, setVerses] = useState<Verse[]>(initialVerses);
  
  // Initialize lastReadAyah from store if we're in the same chapter
  const [lastReadAyah, setLastReadAyah] = useState<number>(() => {
    // During hydration, store might not be ready, but on client it might be
    return 1;
  });

  const { setAudio, currentAyah, setNavigationCallbacks } = useAudioStore();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarkStore();

  const isInitialized = useRef(false);


  // Scroll to highlight or last read on mount
  useEffect(() => {
    if (highlightAyah) {
      setLastReadAyah(highlightAyah);
      const timer = setTimeout(() => {
        const element = document.getElementById(`ayah-${highlightAyah}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 500);
      return () => clearTimeout(timer);
    } else if (lastRead?.chapterId === chapterId && lastRead.ayahNumber) {
      setLastReadAyah(lastRead.ayahNumber);
      // Native browser hash scroll might handle this if URL has #ayah-X
    }
    isInitialized.current = true;
  }, [chapterId, highlightAyah, lastRead]); // Re-run if store hydrates or highlight changes

  useScrollToAyah(currentAyah);

  // Debounce last read updates to avoid excessive store updates
  const debouncedLastReadAyah = useDebounce(lastReadAyah, 1500);

  // Track visible ayahs using Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the most visible ayah
        const visibleAyahs = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleAyahs.length > 0) {
          const mostVisible = visibleAyahs[0];
          const verseNumber = (mostVisible.target as HTMLElement).getAttribute('data-verse-number');
          if (verseNumber) {
            setLastReadAyah(parseInt(verseNumber, 10));
          }
        }
      },
      {
        root: null,
        rootMargin: '-25% 0px -25% 0px', // Focus on middle half of screen
        threshold: [0, 0.1, 0.5, 0.9, 1.0],
      }
    );

    // Observe all ayah elements after a short delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const ayahElements = document.querySelectorAll('[data-verse-number]');
      ayahElements.forEach((element) => observer.observe(element));
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [verses, chapterId]);

  // Save debounced last read to persistent store
  useEffect(() => {
    // Only save if it's not the initial '1' unless we're actually on ayah 1
    if (debouncedLastReadAyah === 1 && !isInitialized.current) return;

    setLastRead({
      chapterId,
      chapterName,
      ayahNumber: debouncedLastReadAyah,
    });
  }, [debouncedLastReadAyah, chapterId, chapterName, setLastRead]);

  // Register navigation callbacks for AudioBar
  useEffect(() => {
    const handleNextAyah = () => {
      const { repeatMode, isPlaying } = useAudioStore.getState();
      if (lastReadAyah < verses.length) {
        const nextVerse = verses[lastReadAyah];
        handlePlay(nextVerse, isPlaying);
      } else if (repeatMode === "all") {
        handlePlay(verses[0], isPlaying);
      }
    };

    const handlePrevAyah = () => {
      const { isPlaying } = useAudioStore.getState();
      if (lastReadAyah > 1) {
        const prevVerse = verses[lastReadAyah - 2];
        handlePlay(prevVerse, isPlaying);
      }
    };

    setNavigationCallbacks(handleNextAyah, handlePrevAyah);
  }, [lastReadAyah, verses, setNavigationCallbacks]);

  const handlePlay = (verse: Verse, autoPlay = true) => {
    if (!selectedQari) return;

    const surahPadded = String(chapterId).padStart(3, "0");
    const versePadded = String(verse.verse_number).padStart(3, "0");
    const audioUrl = `https://everyayah.com/data/${selectedQari.reciter_id}/${surahPadded}${versePadded}.mp3`;

    setAudio(
      chapterId,
      verse.verse_number,
      audioUrl,
      chapterName,
      selectedQari.name,
      verses.length,
      autoPlay
    );

    setLastReadAyah(verse.verse_number);
  };

  const handleBookmark = (verse: Verse) => {
    if (isBookmarked(verse.verse_key)) {
      removeBookmark(verse.verse_key);
    } else {
      addBookmark({
        chapterId,
        chapterName,
        ayahNumber: verse.verse_number,
        ayahKey: verse.verse_key,
      });
    }
  };

  return (
    <>
      <div className="space-y-6">
        {verses.map((verse) => (
          <AyahItem
            key={verse.id}
            verse={verse}
            isActive={currentAyah === verse.verse_number}
            isHighlighted={highlightAyah === verse.verse_number}
            isBookmarked={isBookmarked(verse.verse_key)}
            onPlay={() => handlePlay(verse)}
            onTafsir={() => setActiveTafsir(verse.verse_key)}
            onBookmark={() => handleBookmark(verse)}
          />
        ))}
      </div>

      <TafsirSheet
        ayahKey={activeTafsir}
        onClose={() => setActiveTafsir(null)}
      />
    </>
  );
}
