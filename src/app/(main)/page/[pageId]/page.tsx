import { getVersesByPage, getChapters } from '@/lib/api';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { PageTracker } from '@/components/quran/PageTracker';

interface PageReadingProps {
  params: Promise<{ pageId: string }>;
}

export default async function PageReading({ params }: PageReadingProps) {
  const { pageId } = await params;
  const currentPage = parseInt(pageId);
  const data = await getVersesByPage(currentPage);
  const verses = data.verses;
  
  // Fetch chapters to get proper names
  const { chapters } = await getChapters();

  return (
    <div className="max-w-3xl mx-auto min-h-screen bg-[#fffcf2] text-[#2d2d2d] flex flex-col items-center py-8 px-4 md:px-8 shadow-2xl my-4 rounded-sm border-l-4 border-r-4 border-[#eaddcf]">
      <PageTracker pageId={currentPage} />
      
      {/* Header Info */}
      <div className="w-full flex justify-between text-xs font-serif text-[#8a8a8a] mb-6 px-2 border-b border-[#eaddcf] pb-2">
        <span>Juz {verses[0]?.juz_number || '-'}</span>
        <span>Halaman {currentPage}</span>
      </div>

      {/* Mushaf Content Area */}
      <div className="w-full h-full flex-1 flex flex-col justify-center">
        
        <div 
          className="font-arabic text-[28px] leading-[2.2] text-justify w-full"
          dir="rtl"
          style={{ textAlignLast: 'center' }}
        >
          {verses.map((verse, idx) => {
            // Check if this verse is the start of a Surah (verse 1)
            const isSurahStart = verse.verse_number === 1;
            // Get chapter info. 
            // Note: Since we don't have chapter_id in verse object from some APIs, we might need to rely on verse_key "1:1"
            const chapterId = parseInt(verse.verse_key.split(':')[0]);
            const chapter = chapters.find(c => c.id === chapterId);

            return (
              <span key={verse.id}>
                {isSurahStart && (
                  <div className="w-full block my-8">
                     <div className="w-full h-24 bg-[url('/surah-header.png')] bg-contain bg-no-repeat bg-center flex flex-col items-center justify-center border-y border-black/10 relative py-2">
                        <div className="absolute inset-x-0 h-full border-y-[3px] border-double border-[#eaddcf]" />
                        <div className="z-10 bg-[#fffcf2] px-6 font-arabic text-3xl text-black font-bold mb-1">
                          سورة {chapter?.name_arabic || ''}
                        </div>
                        <div className="z-10 bg-[#fffcf2] px-2 font-serif text-sm text-[#8a8a8a] tracking-widest uppercase">
                          {chapter?.name_simple || ''}
                        </div>
                     </div>
                     <div className="text-center font-arabic text-3xl mt-6 mb-4">
                       بسم الله الرحمن الرحيم
                     </div>
                  </div>
                )}
                
                {(verse.text_uthmani || '').replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ', '')} 
                <span className="inline-flex items-center justify-center w-[1.5em] h-[1.5em] mx-1 align-middle bg-[url('/ayah-marker.svg')] bg-contain bg-no-repeat bg-center select-none relative" style={{ transform: 'translateY(5px)' }}>
                   <span className="text-[0.5em] font-bold text-black pt-1">
                     {verse.verse_number.toLocaleString('ar-EG')}
                   </span>
                </span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mt-12 flex items-center justify-center gap-8 w-full">
         <Link
          href={`/page/${Math.max(1, currentPage - 1)}`}
          className={`p-2 hover:bg-black/5 rounded-full transition-all ${currentPage <= 1 ? 'opacity-0 pointer-events-none' : ''}`}
        >
          <ChevronRight className="w-6 h-6 rotate-180" />
        </Link>
        
        <span className="font-serif text-sm text-[#8a8a8a]">{currentPage}</span>

        <Link
          href={`/page/${Math.min(604, currentPage + 1)}`}
          className={`p-2 hover:bg-black/5 rounded-full transition-all ${currentPage >= 604 ? 'opacity-0 pointer-events-none' : ''}`}
        >
          <ChevronRight className="w-6 h-6" />
        </Link>
      </div>

    </div>
  );
}
