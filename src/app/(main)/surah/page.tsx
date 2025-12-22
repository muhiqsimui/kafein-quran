'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getChapters } from '@/lib/api';
import { SurahCard } from '@/components/quran/SurahCard';
import { Search } from 'lucide-react';
import { Chapter } from '@/types';

export default function SurahListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data, isLoading } = useQuery({
    queryKey: ['chapters'],
    queryFn: getChapters,
  });

  const filteredChapters = useMemo(() => {
    if (!data?.chapters) return [];
    const query = searchQuery.toLowerCase();
    return data.chapters.filter((chapter: Chapter) => 
      chapter.name_simple.toLowerCase().includes(query) ||
      chapter.translated_name.name.toLowerCase().includes(query) ||
      chapter.id.toString() === query
    );
  }, [data, searchQuery]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Pilih <span className="text-primary italic">Surah</span>
        </h1>
        <p className="text-muted-foreground">
          Daftar 114 Surah dalam Al-Quran.
        </p>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Surah (nama atau nomor)..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all h-10"
          />
        </div>
      </header>

      {isLoading ? (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
          ))}
        </section>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChapters.map((chapter) => (
            <SurahCard key={chapter.id} chapter={chapter} />
          ))}
          {filteredChapters.length === 0 && searchQuery && (
            <div className="col-span-full text-center py-20 opacity-50">
              <p>Tidak ditemukan surah dengan nama "{searchQuery}"</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
