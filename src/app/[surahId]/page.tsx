import { SearchParams } from "@/types";
import { getVersesLocal, getChaptersLocal } from "@/lib/quran-service";
import { normalizeQuranText } from "@/lib/utils";
import { VerseList } from "@/components/quran/VerseList";
import { FloatingControls } from "@/components/quran/FloatingControls";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface SurahPageProps {
  params: Promise<{ surahId: string }>;
  searchParams: Promise<SearchParams>;
}

export async function generateStaticParams() {
  const { chapters } = await getChaptersLocal();
  return chapters.map((chapter) => ({
    surahId: String(chapter.id),
  }));
}

export default async function SurahPage({ params, searchParams }: SurahPageProps) {
  const { surahId } = await params;
  const { highlight } = await searchParams;
  const highlightStr = Array.isArray(highlight) ? highlight[0] : highlight;
  const highlightAyah = highlightStr ? parseInt(highlightStr, 10) : undefined;
  const chapterId = parseInt(surahId);

  try {
    const { chapters } = await getChaptersLocal();
    const chapter = chapters.find((c) => c.id === chapterId);
    
    if (!chapter) {
      notFound();
    }

    const { verses } = await getVersesLocal(chapterId);

    return (
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-screen pb-20 sm:pb-32">
        {/* Floating Controls */}
        <FloatingControls
          chapters={chapters}
          currentChapterId={chapter.id}
          currentVerseNumber={1}
          totalVerses={chapter.verses_count}
        />
        {/* Header Section */}
        <header className="flex flex-col items-center text-center py-6 sm:py-8 border-b border-border mb-4 sm:mb-8 px-4">
          <div className="flex items-center justify-between w-full mb-6 sm:mb-8">
            <Link
              href="/"
              className="p-2 rounded-full hover:bg-accent transition-colors border border-border active:scale-90"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="text-[10px] sm:text-sm font-medium text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full uppercase tracking-widest">
              Surah {chapter.id}
            </div>
            <div className="w-9" /> {/* Spacer agar text surah tetap center */}
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
              {chapter.name_simple}
            </h1>
            <p className="text-muted-foreground uppercase tracking-widest text-[10px] sm:text-sm">
              {chapter.translated_name.name} • {chapter.verses_count} Ayat
            </p>
          </div>

          <div className="font-lpmq text-5xl sm:text-6xl text-primary py-4 sm:py-6 drop-shadow-sm">
            {normalizeQuranText(chapter.name_arabic)}
          </div>

          {chapter.bismillah_pre && (
            <div className="font-lpmq text-3xl sm:text-5xl text-foreground/80 pt-8 pb-6 sm:pt-16 sm:pb-12 border-t border-border/50 w-full mt-6 sm:mt-8 leading-relaxed text-center flex justify-center items-center">
              <span className="inline-block h-auto py-2">
                {" "}
                {normalizeQuranText("بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ")}{" "}
              </span>
            </div>
          )}
        </header>

        {/* Verse List Section */}
        <section className="px-2 sm:px-4">
          <VerseList
            verses={verses}
            chapterId={chapter.id}
            chapterName={chapter.name_simple}
            highlightAyah={highlightAyah}
          />
        </section>

        {/* Navigation Section */}
        <div className="flex items-center justify-between p-4 border-t border-border mt-8 bg-card/20 rounded-xl mx-2 sm:mx-0">
          {chapter.id > 1 ? (
            <Link
              href={`/${chapter.id - 1}`}
              className="flex items-center gap-2 p-2 sm:p-3 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground active:bg-accent"
            >
              <ChevronLeft className="w-5 h-5" />
              <div className="text-left">
                <div className="text-[10px] font-medium opacity-70">
                  Sebelumnya
                </div>
                <div className="text-sm sm:text-base font-bold line-clamp-1">
                  Surah {chapter.id - 1}
                </div>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {chapter.id < 114 ? (
            <Link
              href={`/${chapter.id + 1}`}
              className="flex items-center gap-2 p-2 sm:p-3 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground text-right active:bg-accent"
            >
              <div className="text-right">
                <div className="text-[10px] font-medium opacity-70">
                  Berikutnya
                </div>
                <div className="text-sm sm:text-base font-bold line-clamp-1">
                  Surah {chapter.id + 1}
                </div>
              </div>
              <ChevronLeft className="w-5 h-5 rotate-180" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
}
