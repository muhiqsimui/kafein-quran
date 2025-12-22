'use client';

import { useState, useEffect } from 'react';
import { getChapters, getVerses } from '@/lib/api';
import { Chapter, Verse } from '@/types';
import { ChevronLeft, ChevronRight, Play, BookOpen } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useAudioStore } from '@/store/useAudioStore';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function SingleAyahPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentSurahId, setCurrentSurahId] = useState<number>(1);
  const [currentVerseNumber, setCurrentVerseNumber] = useState<number>(1);
  const [verse, setVerse] = useState<Verse | null>(null);
  const [loading, setLoading] = useState(true);
  const { arabicFontSize, translationFontSize } = useSettingsStore();

  useEffect(() => {
    getChapters().then((data) => setChapters(data.chapters));
  }, []);

  useEffect(() => {
    async function fetchVerse() {
      setLoading(true);
      try {
        // Since getVerses fetches the whole chapter, we might want to optimize this later
        // or just use the cached response. For now, fetching the chapter is safe.
        const data = await getVerses(currentSurahId);
        const targetVerse = data.verses.find(v => v.verse_number === currentVerseNumber);
        
        if (targetVerse) {
          setVerse(targetVerse);
        } else {
          // Fallback if verse number is out of bounds (reset to 1)
          if (data.verses.length > 0) {
            setCurrentVerseNumber(1);
            setVerse(data.verses[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch verse', error);
      } finally {
        setLoading(false);
      }
    }
    fetchVerse();
  }, [currentSurahId, currentVerseNumber]);

  const handleNext = () => {
    // Check if we can go to next verse in current surah
    // We need to know total verses. For simplicity, we can optimistically increment 
    // and rely on the fetch logic or use chapter metadata.
    const currentChapter = chapters.find(c => c.id === currentSurahId);
    if (!currentChapter) return;

    if (currentVerseNumber < currentChapter.verses_count) {
      setCurrentVerseNumber(prev => prev + 1);
    } else if (currentSurahId < 114) {
      // Go to next Surah
      setCurrentSurahId(prev => prev + 1);
      setCurrentVerseNumber(1);
    }
  };

  const handlePrev = () => {
    if (currentVerseNumber > 1) {
      setCurrentVerseNumber(prev => prev - 1);
    } else if (currentSurahId > 1) {
      // Go to previous Surah (last verse? defaulting to 1 for now is safer/easier)
      setCurrentSurahId(prev => prev - 1);
      setCurrentVerseNumber(1); 
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 min-h-[80vh] flex flex-col items-center justify-center p-4">
      
      {/* Navigation & Selector */}
      <div className="w-full max-w-xl flex items-center justify-between gap-4 p-4 bg-card border border-border rounded-2xl shadow-sm">
        <Link href="/" className="p-2 hover:bg-accent rounded-full transition-colors">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        
        <select 
          value={currentSurahId} 
          onChange={(e) => {
            setCurrentSurahId(Number(e.target.value));
            setCurrentVerseNumber(1);
          }}
          className="flex-1 bg-transparent font-semibold focus:outline-none text-center appearance-none cursor-pointer"
        >
          {chapters.map(c => (
            <option key={c.id} value={c.id}>
              {c.id}. {c.name_simple} ({c.verses_count} Ayat)
            </option>
          ))}
        </select>
        
        <div className="relative">
             <select
               value={currentVerseNumber}
               onChange={(e) => setCurrentVerseNumber(Number(e.target.value))}
               className="appearance-none bg-secondary text-secondary-foreground font-medium px-4 py-2 pr-8 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
             >
               {chapters.find(c => c.id === currentSurahId)?.verses_count ? (
                 Array.from({ length: chapters.find(c => c.id === currentSurahId)!.verses_count }, (_, i) => i + 1).map(num => (
                   <option key={num} value={num}>Ayat {num}</option>
                 ))
               ) : (
                 <option value={1}>Ayat 1</option>
               )}
             </select>
             <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
               <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
             </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-2xl flex flex-col items-center justify-center text-center space-y-12 py-10">
        {loading ? (
          <div className="animate-pulse space-y-8 w-full">
            <div className="h-20 bg-muted rounded-xl w-3/4 mx-auto" />
            <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
          </div>
        ) : verse ? (
          <>
            <div 
              className="font-arabic leading-[3.6] text-foreground tracking-normal w-full px-4"
              dir="rtl"
              style={{ fontSize: `${arabicFontSize * 1.5}px` }}
            >
              {verse.text_uthmani}
            </div>

            <p 
              className="text-muted-foreground leading-relaxed max-w-lg"
              style={{ fontSize: `${translationFontSize * 1.25}px` }}
            >
              {verse.translations?.[0]?.text.replace(/<(?:.|\n)*?>/gm, '')}
            </p>
          </>
        ) : (
          <div className="text-muted-foreground">Ayat tidak ditemukan.</div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="flex items-center gap-6">
        <button
          onClick={handlePrev}
          disabled={currentSurahId === 1 && currentVerseNumber === 1}
          className="p-4 rounded-full border border-border bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div className="flex gap-2">
           <button 
             onClick={() => {
               if (!verse) return;
               const surahPadded = String(currentSurahId).padStart(3, '0');
               const versePadded = String(currentVerseNumber).padStart(3, '0');
               const audioUrl = `https://mirrors.quranicaudio.com/everyayah/Hudhaify_128kbps/${surahPadded}${versePadded}.mp3`;
               const surahName = chapters.find(c => c.id === currentSurahId)?.name_simple || `Surah ${currentSurahId}`;
               
               // Use the store's setAudio to play
               useAudioStore.getState().setAudio(currentSurahId, currentVerseNumber, audioUrl, surahName);
             }}
             className="p-3 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
           >
             <Play className="w-5 h-5 fill-current" />
           </button>
        </div>

        <button
          onClick={handleNext}
          className="p-4 rounded-full border border-border bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

    </div>
  );
}
