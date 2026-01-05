import { getVersesByJuzLocal, getChaptersLocal } from "@/lib/quran-service";
import { ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { JuzVerseList } from "@/components/quran/JuzVerseList";

interface JuzReadingProps {
  params: Promise<{ juzId: string }>;
}

export default async function JuzReading({ params }: JuzReadingProps) {
  const { juzId } = await params;
  const currentJuz = parseInt(juzId);
  const data = await getVersesByJuzLocal(currentJuz);
  const verses = data.verses;
  const { chapters } = await getChaptersLocal();

  return (
    <div className="max-w-4xl mx-auto min-h-screen pb-20 pt-4 px-2 sm:px-0 animate-in fade-in duration-700">
      
      {/* Header Info */}
      <div className="flex items-center justify-between mb-8 px-2">
        <h1 className="text-2xl font-bold">Juz {currentJuz}</h1>
        <div className="text-sm text-muted-foreground">{verses.length} Ayat</div>
      </div>

      {/* Content Area */}
      <JuzVerseList 
        verses={verses} 
        chapters={chapters} 
        juzId={currentJuz} 
      />

      {/* Footer Navigation */}
      <div className="mt-12 flex items-center justify-between gap-4">
        <Link
          href={`/juz/${Math.max(1, currentJuz - 1)}`}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card hover:bg-accent transition-all ${
            currentJuz <= 1 ? "opacity-0 pointer-events-none" : ""
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-semibold text-sm">Juz Sebelumnya</span>
        </Link>

        <Link
          href={`/juz/${Math.min(30, currentJuz + 1)}`}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card hover:bg-accent transition-all ${
            currentJuz >= 30 ? "opacity-0 pointer-events-none" : ""
          }`}
        >
          <span className="font-semibold text-sm">Juz Berikutnya</span>
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
