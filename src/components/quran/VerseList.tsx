'use client';

import { useState, useEffect } from 'react';
import { Verse } from '@/types';
import { AyahItem } from './AyahItem';
import { TafsirSheet } from './TafsirSheet';
import { useAudioStore } from '@/store/useAudioStore';
import { useBookmarkStore } from '@/store/useBookmarkStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useScrollToAyah } from '@/hooks/useScrollToAyah';

interface VerseListProps {
  verses: Verse[];
  chapterId: number;
  chapterName: string;
}

export function VerseList({ verses, chapterId, chapterName }: VerseListProps) {
  const [activeTafsir, setActiveTafsir] = useState<string | null>(null);
  const { setAudio, currentAyah } = useAudioStore();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarkStore();
  const { setLastRead } = useSettingsStore();
  
  useScrollToAyah(currentAyah);

  useEffect(() => {
    // Basic implementation: set the first verse or a visible verse as last read
    // For simplicity, we just set the chapter when entering
    setLastRead({
      chapterId,
      chapterName,
      ayahNumber: 1,
    });
  }, [chapterId, chapterName, setLastRead]);

  const handlePlay = (verse: Verse) => {
    // Pad surah and verse numbers with leading zeros (001001 format)
    const surahPadded = String(chapterId).padStart(3, '0');
    const versePadded = String(verse.verse_number).padStart(3, '0');
    
    // Using Ali Al-Hudhaify (Imam of Madinah) - Verified Mirror
    const audioUrl = `https://mirrors.quranicaudio.com/everyayah/Hudhaify_128kbps/${surahPadded}${versePadded}.mp3`;
    
    setAudio(chapterId, verse.verse_number, audioUrl, chapterName);
    
    // Update last read when playing
    setLastRead({
      chapterId,
      chapterName,
      ayahNumber: verse.verse_number,
    });
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
