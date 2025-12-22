'use client';

import { useSettingsStore } from '@/store/useSettingsStore';
import { BookOpen, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function LastReadCard() {
  const { lastRead } = useSettingsStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[120px] w-full rounded-2xl bg-muted animate-pulse" />;
  }

  if (!lastRead) return null;

  const isPage = 'pageId' in lastRead;
  const href = isPage 
    ? `/page/${lastRead.pageId}` 
    : `/${lastRead.chapterId}#ayah-${lastRead.ayahNumber}`;

  return (
    <Link
      href={href}
      className="block p-6 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden"
    >
      <div className="flex items-center justify-between relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary-foreground/80">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Terakhir Dibaca</span>
          </div>
          <h2 className="text-2xl font-bold">
            {isPage ? `Halaman ${lastRead.pageId}` : `Surah ${lastRead.chapterName}`}
          </h2>
          <p className="text-primary-foreground/80 font-medium">
            {isPage ? 'Lanjutkan membaca' : `Ayat ${lastRead.ayahNumber}`}
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
          <ChevronRight className="w-6 h-6" />
        </div>
      </div>
      
      {/* Decorative Arabic Text Background */}
      <div className="absolute -right-4 -bottom-4 font-arabic text-8xl text-white/10 select-none pointer-events-none rotate-12">
        القرآن
      </div>
    </Link>
  );
}
