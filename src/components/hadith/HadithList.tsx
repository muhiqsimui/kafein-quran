"use client";

import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, Loader2, BookOpen } from "lucide-react";
import Link from "next/link";
import { Hadith } from "@/lib/hadith-service";

interface HadithListProps {
  slug: string;
  narratorName: string;
  initialData: {
    hadiths: Hadith[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalResults: number;
      limit: number;
    };
  };
}

export function HadithList({ slug, narratorName, initialData }: HadithListProps) {
  const [hadiths, setHadiths] = useState<Hadith[]>(initialData.hadiths);
  const [currentPage, setCurrentPage] = useState(initialData.pagination.currentPage);
  const [totalPages, setTotalPages] = useState(initialData.pagination.totalPages);
  const [totalResults, setTotalResults] = useState(initialData.pagination.totalResults);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1); // Reset to page 1 on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchHadiths = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/hadith/${slug}?page=${currentPage}&q=${encodeURIComponent(debouncedQuery)}`
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setHadiths(data.hadiths);
        setTotalPages(data.pagination.totalPages);
        setTotalResults(data.pagination.totalResults);
      } catch (error) {
        console.error("Failed to fetch hadiths:", error);
        setError("Gagal memuat hadist. Silakan coba lagi.");
      } finally {
        setIsLoading(false);
      }
    };

    // Skip the first render as we have initialData
    if (currentPage !== initialData.pagination.currentPage || debouncedQuery !== "") {
      fetchHadiths();
    }
  }, [currentPage, debouncedQuery, slug, initialData.pagination.currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Link
            href="/hadith"
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h2 className="text-2xl font-bold">{narratorName}</h2>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Cari hadist (nomor, teks, atau kata kunci)..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {isLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground px-2">
          {isLoading ? "Mencari..." : `Menampilkan ${totalResults.toLocaleString("id-ID")} hadist`}
        </p>
      </div>

      <div className="space-y-4">
        {error ? (
          <div className="py-20 text-center space-y-4">
            <p className="text-red-500 font-medium">{error}</p>
            <button 
              onClick={() => setCurrentPage(currentPage)} // Retry
              className="text-primary hover:underline text-sm"
            >
              Coba Lagi
            </button>
          </div>
        ) : hadiths.length > 0 ? (
          hadiths.map((hadith) => (
            <div
              key={hadith.number}
              className="p-6 md:p-8 rounded-3xl border border-border bg-card hover:border-primary/30 transition-all space-y-6 shadow-sm group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {hadith.number}
                  </div>
                  <div className="px-3 py-1 rounded-full bg-accent text-[10px] uppercase tracking-wider font-bold">
                    HR. {narratorName}
                  </div>
                </div>
                <button className="p-2 hover:bg-accent rounded-full transition-colors">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-8">
                <div className="text-right">
                  <p 
                    className="text-3xl md:text-4xl leading-[2.2] md:leading-[2.5] font-lpmq text-foreground antialiased"
                    dir="rtl"
                  >
                    {hadith.arab}
                  </p>
                </div>

                <div className="relative pl-6 py-2 border-l-2 border-primary/20 bg-accent/30 rounded-r-xl">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-full"></div>
                  <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                    Terjemahan
                  </p>
                  <p className="text-foreground dark:text-white-400 leading-relaxed md:text-lg font-medium">
                    {hadith.id}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto opacity-50">
               <Search className="w-8 h-8" />
            </div>
            <p className="text-muted-foreground">Hadist tidak ditemukan.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
            className="p-2 md:p-3 rounded-xl border border-border bg-card hover:bg-accent disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-1 md:gap-2">
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-xl border transition-all font-bold text-sm ${
                    currentPage === pageNum
                      ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20 scale-105"
                      : "border-border bg-card hover:border-primary/50 text-muted-foreground"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
            className="p-2 md:p-3 rounded-xl border border-border bg-card hover:bg-accent disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
