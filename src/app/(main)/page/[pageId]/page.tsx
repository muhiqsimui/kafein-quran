import { getVersesByPageLocal, getChaptersLocal } from "@/lib/quran-service";
import { ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { PageTracker } from "@/components/quran/PageTracker";
import { FloatingPageControls } from "@/components/quran/FloatingPageControls";

interface PageReadingProps {
  params: Promise<{ pageId: string }>;
}

export default async function PageReading({ params }: PageReadingProps) {
  const { pageId } = await params;
  const currentPage = parseInt(pageId);
  const data = await getVersesByPageLocal(currentPage);
  const verses = data.verses;
  const { chapters } = await getChaptersLocal();

  // Calculate juz from verses
  const currentJuz = verses[0]?.juz_number || Math.ceil(currentPage / 20);

  return (
    // Mobile: Hilangkan margin luar (my-4) dan shadow agar fokus ke teks. Border samping dikurangi di mobile.
    <div className="max-w-3xl mx-auto min-h-screen bg-[#fffcf2] text-[#2d2d2d] flex flex-col items-center py-4 sm:py-8 px-3 sm:px-8 shadow-2xl sm:my-4 rounded-sm border-x-[2px] sm:border-x-4 border-[#eaddcf]">
      {/* Floating Page Controls */}
      <FloatingPageControls currentPage={currentPage} currentJuz={currentJuz} />

      <PageTracker pageId={currentPage} />

      {/* Header Info: Dibuat lebih rapat di mobile */}
      <div className="w-full flex justify-between text-[10px] sm:text-xs font-serif text-[#8a8a8a] mb-4 sm:mb-6 px-1 border-b border-[#eaddcf] pb-2">
        <span>Juz {verses[0]?.juz_number || "-"}</span>
        <span className="font-bold text-[#5d5d5d]">Halaman {currentPage}</span>
      </div>

      {/* Mushaf Content Area */}
      <div className="w-full h-full flex-1 flex flex-col justify-start sm:justify-center">
        <div
          // Mobile: Font-size sedikit lebih kecil (24px) agar tidak terlalu banyak line-break, sm: 28px
          className="font-lpmq text-[24px] sm:text-[28px] leading-[2.4] sm:leading-[2.2] text-justify w-full"
          dir="rtl"
          style={{ textAlignLast: "center" }}
        >
          {verses.map((verse) => {
            const isSurahStart = verse.verse_number === 1;
            const chapterId = parseInt(verse.verse_key.split(":")[0]);
            const chapter = chapters.find((c) => c.id === chapterId);
            // Only show decorative header Bismillah if text doesn't start with it
            // This prevents doubles while ensuring we rely on the correct API text for Bismillah
            const verseText = verse.text_uthmani || "";
            const hasBismillahInText = verseText.includes("بِسْمِ ٱللَّهِ");
            const showHeaderBismillah = isSurahStart && chapterId !== 1 && chapterId !== 9 && !hasBismillahInText;
            
            // For Al-Fatihah or if text has Bismillah, we might want to ensure it's displayed nicely 
            // but usually the main text rendering handles it.

            return (
              <span key={verse.id} className="inline">
                {isSurahStart && (
                  <div className="w-full block my-6 sm:my-8" dir="rtl">
                    {/* Surah Header: Dibuat responsif tinggi dan font-nya */}
                    <div className="w-full min-h-[70px] sm:h-24 bg-[url('/surah-header.png')] bg-contain bg-no-repeat bg-center flex flex-col items-center justify-center border-y border-black/5 relative py-2">
                       <div className="absolute inset-x-0 h-full border-y-[2px] sm:border-y-[3px] border-double border-[#eaddcf]" />
                       <div className="z-10 bg-[#fffcf2] px-4 sm:px-6 font-lpmq text-xl sm:text-3xl text-black font-bold mb-0.5 sm:mb-1">
                         سورة {chapter?.name_arabic || ""}
                       </div>
                       <div className="z-10 bg-[#fffcf2] px-2 font-serif text-[10px] sm:text-sm text-[#8a8a8a] tracking-widest uppercase">
                         {chapter?.name_simple || ""}
                       </div>
                    </div>
                    {/* Bismillah: Only show if not part of the ayah text */}
                    {showHeaderBismillah && (
                      <div className="text-center font-lpmq text-2xl sm:text-3xl mt-4 mb-2 sm:mt-6 sm:mb-4 text-black/90">
                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                      </div>
                    )}
                  </div>
                )}

                <span className="inline">
                  {verse.text_uthmani}
                </span>

                {/* Nomor Ayat Marker */}
                <span
                  className="inline-flex items-center justify-center w-[1.8em] h-[1.8em] mx-1 align-middle bg-[url('/ayah-marker.svg')] bg-contain bg-no-repeat bg-center select-none relative"
                  style={{ transform: "translateY(6px)" }} // Sesuaikan ini agar marker sejajar dengan garis teks Arab
                >
                  <span
                    className="absolute inset-0 flex items-center justify-center text-[0.8em] font-extrabold text-black leading-none"
                    style={{
                      fontFamily: "sans-serif", // Menggunakan font sistem biasanya lebih stabil untuk posisi angka
                      paddingTop: "0.1em", // Sedikit penyesuaian visual untuk font Arab agar tidak terlihat terlalu ke bawah
                    }}
                  >
                    {verse.verse_number.toLocaleString("ar-EG")}
                  </span>
                </span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Footer Navigation: Dibuat Fixed atau lebih besar di mobile agar mudah di-tap */}
      <div className="mt-8 sm:mt-12 flex items-center justify-between sm:justify-center gap-4 sm:gap-8 w-full max-w-xs">
        <Link
          href={`/page/${Math.max(1, currentPage - 1)}`}
          className={`flex-1 flex justify-center p-3 bg-[#eaddcf]/30 sm:bg-transparent hover:bg-black/5 rounded-xl transition-all active:scale-90 ${
            currentPage <= 1 ? "opacity-0 pointer-events-none" : ""
          }`}
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>

        <div className="flex flex-col items-center min-w-[60px]">
          <span className="font-serif text-[10px] text-[#8a8a8a] uppercase">
            Hal.
          </span>
          <span className="font-serif text-lg font-bold text-[#2d2d2d]">
            {currentPage}
          </span>
        </div>

        <Link
          href={`/page/${Math.min(604, currentPage + 1)}`}
          className={`flex-1 flex justify-center p-3 bg-[#eaddcf]/30 sm:bg-transparent hover:bg-black/5 rounded-xl transition-all active:scale-90 ${
            currentPage >= 604 ? "opacity-0 pointer-events-none" : ""
          }`}
        >
          <ChevronRight className="w-6 h-6" />
        </Link>
      </div>
    </div>
  );
}
