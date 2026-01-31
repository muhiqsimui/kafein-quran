"use client";

import { useState, useEffect, useRef } from "react";
import { Verse } from "@/types";
import { AyahItem } from "./AyahItem";
import { TafsirSheet } from "./TafsirSheet";
import { BookmarkNoteDialog } from "./BookmarkNoteDialog";
import { useAudioStore } from "@/store/useAudioStore";
import { useBookmarkStore } from "@/store/useBookmarkStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useScrollToAyah } from "@/hooks/useScrollToAyah";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";


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
  const [notingAyah, setNotingAyah] = useState<{ key: string; note?: string } | null>(null);
  const { lastRead, setLastRead, selectedQari, mushafMode } = useSettingsStore();
  const [verses, setVerses] = useState<Verse[]>(initialVerses);
  const [loading, setLoading] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  
  // Initialize lastReadAyah from store if we're in the same chapter
  const [lastReadAyah, setLastReadAyah] = useState<number>(1);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const { setAudio, currentAyah, setNavigationCallbacks } = useAudioStore();
  const { addBookmark, removeBookmark, isBookmarked, updateBookmarkNote, bookmarks } = useBookmarkStore();

  const isInitialized = useRef(false);
  const initialModeRef = useRef(mushafMode);

  // Re-fetch verses when mushafMode changes, but skip initial render to prefer SSR
  useEffect(() => {
    if (mushafMode === initialModeRef.current && isInitialized.current) return;
    if (!isInitialized.current) {
        isInitialized.current = true;
        // If initial SSR verses match current mode, don't refetch
        // We assume SSR returns Kemenag by default
        if (mushafMode === 'kemenag') return;
    }

    const fetchVerses = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/chapters/${chapterId}?mode=${mushafMode}`);
        if (res.ok) {
          const data = await res.json();
          setVerses(data.verses);
        }
      } catch (error) {
        console.error("Failed to fetch alternative mushaf verses", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVerses();
  }, [mushafMode, chapterId]);

  // Scroll to highlight, hash, or last read on mount/change
  useEffect(() => {
    if (!hasMounted) return;

    const scrollToTarget = () => {
      const hash = window.location.hash;
      const hashAyah = hash.startsWith('#ayah-') ? parseInt(hash.replace('#ayah-', ''), 10) : null;
      const targetAyah = highlightAyah || hashAyah;

      if (targetAyah) {
        setLastReadAyah(targetAyah);
        const timer = setTimeout(() => {
          const element = document.getElementById(`ayah-${targetAyah}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 800);
        return () => clearTimeout(timer);
      } else if (lastRead?.chapterId === chapterId && lastRead.ayahNumber) {
        setLastReadAyah(lastRead.ayahNumber);
      }
    };

    scrollToTarget();

    // Handle hash changes within the same page
    window.addEventListener('hashchange', scrollToTarget);
    return () => window.removeEventListener('hashchange', scrollToTarget);
  }, [chapterId, highlightAyah, lastRead, hasMounted]);

  useScrollToAyah(currentAyah);

  // Debounce last read updates to avoid excessive store updates
  const debouncedLastReadAyah = useDebounce(lastReadAyah, 1500);

  // Track visible ayahs using Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
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
        rootMargin: '-25% 0px -25% 0px',
        threshold: [0, 0.1, 0.5, 0.9, 1.0],
      }
    );

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
      const { repeatMode, isPlaying, currentAyah: playingAyah } = useAudioStore.getState();
      const referenceAyah = playingAyah || lastReadAyah;
      
      if (referenceAyah < verses.length) {
        const nextVerse = verses[referenceAyah];
        handlePlay(nextVerse, isPlaying);
      } else if (repeatMode === "all") {
        handlePlay(verses[0], isPlaying);
      }
    };

    const handlePrevAyah = () => {
      const { isPlaying, currentAyah: playingAyah } = useAudioStore.getState();
      const referenceAyah = playingAyah || lastReadAyah;
      
      if (referenceAyah > 1) {
        const prevVerse = verses[referenceAyah - 2];
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
        textArabic: verse.text_uthmani,
        translation: verse.translations?.[0]?.text,
      });
      // Suggest writing a note
      setNotingAyah({ key: verse.verse_key });
    }
  };

  return (
    <>
      <div className={cn("space-y-6 transition-opacity duration-300", loading && "opacity-50 pointer-events-none")}>
        {verses.map((verse) => (
          <AyahItem
            key={`${mushafMode}-${verse.id}`}
            verse={verse}
            isActive={hasMounted && currentAyah === verse.verse_number}
            isHighlighted={highlightAyah === verse.verse_number}
            isBookmarked={hasMounted && isBookmarked(verse.verse_key)}
            onPlay={() => handlePlay(verse)}
            onTafsir={() => setActiveTafsir(verse.verse_key)}
            onBookmark={() => handleBookmark(verse)}
            note={hasMounted ? bookmarks.find(b => b.ayahKey === verse.verse_key)?.note : undefined}
            hasMounted={hasMounted}
          />
        ))}
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
