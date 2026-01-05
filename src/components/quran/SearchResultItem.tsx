'use client';

import Link from 'next/link';
import { SearchResult } from '@/types';
import { Book, ChevronRight } from 'lucide-react';
import { normalizeQuranText } from '@/lib/utils';

interface SearchResultItemProps {
  result: SearchResult;
}

export function SearchResultItem({ result }: SearchResultItemProps) {
  const [surahId, ayahNumber] = result.verse_key.split(':');
  
  // Clean translation text from HTML tags (like <em>) if any, but dangerouslySetInnerHTML is safer for highlights
  const mainTranslation = result.translations[0]?.text || '';

  return (
    <Link 
      href={`/${surahId}?highlight=${ayahNumber}`}
      className="block p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3 flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <Book className="w-3.5 h-3.5" />
            <span>Surah {surahId}:{ayahNumber}</span>
          </div>
          
          <div className="space-y-4">
            <p 
              className="text-right font-arabic text-2xl leading-loose"
              dir="rtl"
            >
              {normalizeQuranText(result.text)}
            </p>
            
            <div 
              className="text-sm text-foreground/80 leading-relaxed line-clamp-3 [&_em]:text-primary [&_em]:font-bold [&_em]:not-italic"
              dangerouslySetInnerHTML={{ __html: mainTranslation }}
            />
          </div>
        </div>
        <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="w-5 h-5 text-primary" />
        </div>
      </div>
    </Link>
  );
}
