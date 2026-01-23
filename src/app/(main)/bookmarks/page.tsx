'use client';

import { useBookmarkStore } from '@/store/useBookmarkStore';
import { Bookmark as BookmarkIcon, Trash2, ChevronRight, FileText, PlusCircle, Share2 } from 'lucide-react';
import Link from 'next/link';
import { BookmarkNoteDialog } from '@/components/quran/BookmarkNoteDialog';
import { ShareAyahDialog } from '@/components/quran/ShareAyahDialog';
import { useState } from 'react';

export default function BookmarksPage() {
  const { bookmarks, removeBookmark, updateBookmarkNote } = useBookmarkStore();
  const [notingAyah, setNotingAyah] = useState<{ key: string; note?: string } | null>(null);
  const [sharingBookmark, setSharingBookmark] = useState<typeof bookmarks[0] | null>(null);

  return (
    // Optimasi padding untuk mobile (px-4) dan spacing (gap-6)
    <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 space-y-6 animate-in fade-in duration-500">
      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Simpanan Saya</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Kumpulan ayat-ayat yang telah Anda simpan.
        </p>
      </header>

      {bookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-muted/10 rounded-3xl border-2 border-dashed border-muted mt-4">
          <div className="p-4 bg-muted/20 rounded-full mb-4">
            <BookmarkIcon className="w-10 h-10 text-muted-foreground/40" />
          </div>
          <h2 className="text-lg font-semibold mb-1">Belum ada simpanan</h2>
          <p className="text-muted-foreground text-sm max-w-[250px] mb-6">
            Cari ayat yang menyentuh hati dan simpan di sini.
          </p>
          <Link 
            href="/"
            className="w-full sm:w-auto px-8 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold active:scale-95 transition-transform shadow-lg shadow-primary/20"
          >
            Mulai Membaca
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookmarks.map((bookmark) => (
            <div 
              key={bookmark.ayahKey}
              className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:ring-2 hover:ring-primary/20 transition-all"
            >
              {/* Main Content Area */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Ayah Badge & Info */}
                <div className="flex items-center gap-3 sm:flex-col sm:gap-2">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {bookmark.ayahNumber}
                  </div>
                  <div className="sm:hidden">
                     <h3 className="font-bold text-lg">Surah {bookmark.chapterName}</h3>
                     <p className="text-xs text-muted-foreground uppercase">{bookmark.ayahKey}</p>
                  </div>
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <div className="hidden sm:block mb-1">
                    <h3 className="font-bold text-lg leading-none">Surah {bookmark.chapterName}</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                      Ayat {bookmark.ayahNumber} • {bookmark.ayahKey}
                    </p>
                  </div>

                  {bookmark.note ? (
                    <div className="mt-2 bg-accent/50 p-3 rounded-xl border border-border/50">
                      <div className="flex gap-2">
                        <FileText className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <p className="text-sm text-foreground/80 italic leading-relaxed line-clamp-3">
                          "{bookmark.note}"
                        </p>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setNotingAyah({ key: bookmark.ayahKey })}
                      className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
                    >
                      <PlusCircle className="w-4 h-4" />
                      TAMBAH CATATAN
                    </button>
                  )}
                </div>
              </div>

              {/* Action Bar: Di mobile diletakkan di bawah dengan border-top untuk touch-friendliness */}
              <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-t border-border/50">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSharingBookmark(bookmark)}
                    className="p-2.5 rounded-lg text-muted-foreground hover:bg-background hover:text-primary transition-colors"
                    aria-label="Bagikan"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  
                  {bookmark.note && (
                    <button
                      onClick={() => setNotingAyah({ key: bookmark.ayahKey })}
                      className="p-2.5 rounded-lg text-muted-foreground hover:bg-background hover:text-primary transition-colors"
                      aria-label="Edit Catatan"
                    >
                      <FileText className="w-5 h-5" />
                    </button>
                  )}

                  <button
                    onClick={() => {
                        if(confirm('Hapus bookmark ini?')) removeBookmark(bookmark.ayahKey)
                    }}
                    className="p-2.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    aria-label="Hapus"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <Link
                  href={`/${bookmark.chapterId}#ayah-${bookmark.ayahNumber}`}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-background border border-border text-sm font-medium hover:bg-accent transition-colors"
                >
                  Baca Ayat
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialogs tetap sama namun pastikan di dalamnya responsif */}
      <BookmarkNoteDialog
        isOpen={!!notingAyah}
        onClose={() => setNotingAyah(null)}
        onSave={(note) => {
          if (notingAyah) updateBookmarkNote(notingAyah.key, note);
        }}
        verseKey={notingAyah?.key || ""}
        initialNote={bookmarks.find(b => b.ayahKey === notingAyah?.key)?.note}
      />

      {sharingBookmark && (
        <ShareAyahDialog
          isOpen={!!sharingBookmark}
          onClose={() => setSharingBookmark(null)}
          chapterName={sharingBookmark.chapterName}
          ayahNumber={sharingBookmark.ayahNumber}
          ayahKey={sharingBookmark.ayahKey}
          textArabic={sharingBookmark.textArabic}
          translation={sharingBookmark.translation}
          note={sharingBookmark.note}
        />
      )}
    </div>
  );
}