import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Bookmark {
  chapterId: number;
  ayahNumber: number;
  ayahKey: string;
  chapterName: string;
}

interface BookmarkState {
  bookmarks: Bookmark[];
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (ayahKey: string) => void;
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
      isBookmarked: (ayahKey) => {
        return get().bookmarks.some((b) => b.ayahKey === ayahKey);
      },
    }),
    {
      name: 'lumina-bookmarks',
    }
  )
);
