'use client';

import { useState, useEffect } from 'react';
import { Search as SearchIcon, BookOpen, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { searchVerses } from '@/lib/api';
import { SearchResultItem } from '@/components/quran/SearchResultItem';
import { useDebounce } from '@/hooks/useDebounce';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 500);
  
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchVerses(debouncedQuery),
    enabled: debouncedQuery.length > 2,
    placeholderData: (previousData) => previousData,
  });

  const results = data?.search?.results || [];
  const totalResults = data?.search?.total_results || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold">Cari Ayat</h1>
        <p className="text-muted-foreground">Cari ayat berdasarkan isi teks Arab atau terjemahan Indonesia</p>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isFetching ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            ) : (
              <SearchIcon className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <input
            autoFocus
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ketik kata kunci (misal: 'sabar', 'shalat', 'الحمد')..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-lg"
          />
        </div>
      </header>

      <section className="space-y-4">
        {debouncedQuery.length > 0 && debouncedQuery.length <= 2 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Ketik minimal 3 karakter untuk mencari...
          </p>
        )}

        {debouncedQuery.length > 2 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
            <span>{totalResults} Ayat ditemukan</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {results.map((result) => (
            <SearchResultItem key={result.verse_key} result={result} />
          ))}
        </div>
        
        {isLoading && debouncedQuery.length > 2 && results.length === 0 && (
          <div className="grid grid-cols-1 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        )}

        {!isLoading && results.length === 0 && debouncedQuery.length > 2 && (
          <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-border">
            <SearchIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Tidak ada ayat yang cocok dengan "{debouncedQuery}"</p>
          </div>
        )}
        
        {!searchQuery && (
          <div className="text-center py-20 opacity-50">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Gunakan kolom di atas untuk mencari topik tertentu</p>
          </div>
        )}
      </section>
    </div>
  );
}
