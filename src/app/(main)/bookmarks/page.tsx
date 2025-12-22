'use client';

import { useBookmarkStore } from '@/store/useBookmarkStore';
import { Bookmark as BookmarkIcon, Trash2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function BookmarksPage() {
  const { bookmarks, removeBookmark } = useBookmarkStore();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Simpanan Saya</h1>
        <p className="text-muted-foreground text-sm">
          Kumpulan ayat-ayat yang telah Anda simpan.
        </p>
      </header>

      {bookmarks.length === 0 ? (
        <div className="text-center py-24 bg-muted/20 rounded-3xl border border-dashed border-border mt-8">
          <BookmarkIcon className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Belum ada simpanan</h2>
          <p className="text-muted-foreground max-w-xs mx-auto">
            Gunakan ikon bookmark pada setiap ayat untuk menyimpannya di sini.
          </p>
          <Link 
            href="/"
            className="inline-block mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:scale-105 transition-transform"
          >
            Mulai Membaca
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {bookmarks.map((bookmark) => (
            <div 
              key={bookmark.ayahKey}
              className="group p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all flex items-center justify-between gap-4"
            >
              <Link 
                href={`/${bookmark.chapterId}#ayah-${bookmark.ayahNumber}`}
                className="flex-1 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center font-bold text-sm">
                  {bookmark.ayahNumber}
                </div>
                <div>
                  <h3 className="font-bold group-hover:text-primary transition-colors">
                    Surah {bookmark.chapterName}
                  </h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Ayat {bookmark.ayahNumber} • {bookmark.ayahKey}
                  </p>
                </div>
              </Link>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => removeBookmark(bookmark.ayahKey)}
                  className="p-2 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <Link
                   href={`/${bookmark.chapterId}#ayah-${bookmark.ayahNumber}`}
                   className="p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-primary transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
