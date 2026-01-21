import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Bookmark {
  chapterId: number;
  ayahNumber: number;
  ayahKey: string;
  chapterName: string;
  textArabic?: string;
  translation?: string;
  note?: string;
}

interface BookmarkState {
  bookmarks: Bookmark[];
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (ayahKey: string) => void;
  updateBookmarkNote: (ayahKey: string, note: string) => void;
  toggleBookmark: (bookmark: Bookmark) => void;
  isBookmarked: (ayahKey: string) => boolean;
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      addBookmark: (bookmark) => {
        if (!get().bookmarks.some((b) => b.ayahKey === bookmark.ayahKey)) {
          set({ bookmarks: [bookmark, ...get().bookmarks] });
        }
      },
      removeBookmark: (ayahKey) => {
        set({ bookmarks: get().bookmarks.filter((b) => b.ayahKey !== ayahKey) });
      },
      updateBookmarkNote: (ayahKey, note) => {
        set({
          bookmarks: get().bookmarks.map((b) =>
            b.ayahKey === ayahKey ? { ...b, note } : b
          ),
        });
      },
      isBookmarked: (ayahKey) => {
        return get().bookmarks.some((b) => b.ayahKey === ayahKey);
      },
      toggleBookmark: (bookmark) => {
        const exists = get().isBookmarked(bookmark.ayahKey);
        if (exists) {
          get().removeBookmark(bookmark.ayahKey);
        } else {
          get().addBookmark(bookmark);
        }
      },
    }),
    {
      name: 'lumina-bookmarks',
    }
  )
);
