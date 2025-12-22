import { getChapters, getChapter, getVerses } from '@/lib/api';
import { VerseList } from '@/components/quran/VerseList';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const { chapters } = await getChapters();
  return chapters.map((chapter) => ({
    surahId: chapter.id.toString(),
  }));
}

interface SurahPageProps {
  params: Promise<{ surahId: string }>;
}

export default async function SurahPage({ params }: SurahPageProps) {
  const { surahId } = await params;
  
  try {
    const chapterData = await getChapter(surahId);
    const verseData = await getVerses(surahId);
    
    const chapter = chapterData.chapter;
    const verses = verseData.verses;

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-screen pb-32">
        <header className="flex flex-col items-center text-center space-y-4 py-8 border-b border-border mb-8">
          <div className="flex items-center justify-between w-full mb-4 px-4">
            <Link
              href="/"
              className="p-2 rounded-full hover:bg-accent transition-colors border border-border"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="text-sm font-medium text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full uppercase tracking-widest">
              Surah {chapter.id}
            </div>
          </div>
          
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              {chapter.name_simple}
            </h1>
            <p className="text-muted-foreground uppercase tracking-widest text-sm">
              {chapter.translated_name.name} • {chapter.verses_count} Ayat
            </p>
          </div>
          
          <div className="font-arabic text-6xl text-primary py-6 drop-shadow-sm">
            {chapter.name_arabic}
          </div>

          {chapter.bismillah_pre && (
            <div className="font-arabic text-4xl text-foreground/80 pt-12 py-6 border-t border-border/50 w-full mt-8">
              ﷽
            </div>
          )}
        </header>

        <section className="px-4">
          <VerseList verses={verses} chapterId={chapter.id} chapterName={chapter.name_simple} />
        </section>

        <div className="flex items-center justify-between p-4 border-t border-border mt-8">
          {chapter.id > 1 ? (
             <Link
              href={`/${chapter.id - 1}`}
              className="flex items-center gap-2 p-3 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-5 h-5" />
              <div className="text-left">
                <div className="text-xs font-medium">Sebelumnya</div>
                <div className="font-bold">Surah {chapter.id - 1}</div>
              </div>
            </Link>
          ) : <div />}

          {chapter.id < 114 ? (
             <Link
              href={`/${chapter.id + 1}`}
              className="flex items-center gap-2 p-3 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground text-right"
            >
              <div className="text-right">
                <div className="text-xs font-medium">Berikutnya</div>
                <div className="font-bold">Surah {chapter.id + 1}</div>
              </div>
              <ChevronLeft className="w-5 h-5 rotate-180" />
            </Link>
          ) : <div />}
        </div>

      </div>
    );
  } catch (error) {
    notFound();
  }
}
