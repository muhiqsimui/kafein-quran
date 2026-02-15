"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  BookOpen,
  Scroll,
  Users,
  RefreshCw,
  Star,
  Hash,
  ArrowLeft,
  ArrowRight,
  X,
  ChevronsLeft,
  ChevronsRight,
  Copy,
  Check,
  Share2,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { ShareHadithDialog } from "./ShareHadithDialog";
import {
  API_BASE,
  type HadisEncEntry,
  type HadisEncPaging,
  type HadisEncSearchHit,
  type HadisEncDetail,
  type HadisEncMeta,
  type PerawiBrowseEntry,
  type PerawiDetail,
} from "@/lib/hadith-service";

// ========== Helpers ==========
const highlightText = (text: string, keyword: string) => {
  if (!keyword) return text;
  const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === keyword.toLowerCase() 
          ? <strong key={i} className="text-primary font-bold">{part}</strong> 
          : part
      )}
    </>
  );
};

// ========== Types ==========
type TabType = "explore" | "search" | "perawi";

interface ExploreState {
  hadis: HadisEncEntry[];
  paging: HadisEncPaging | null;
  isLoading: boolean;
  error: string | null;
}

interface SearchState {
  hadis: HadisEncSearchHit[];
  paging: HadisEncPaging | null;
  keyword: string;
  isLoading: boolean;
  error: string | null;
}

interface PerawiState {
  rawi: PerawiBrowseEntry[];
  paging: HadisEncPaging | null;
  isLoading: boolean;
  error: string | null;
}

interface DetailState {
  hadis: HadisEncDetail | null;
  isLoading: boolean;
  isOpen: boolean;
}

interface MetaState {
  data: HadisEncMeta | null;
  isLoading: boolean;
}

// ========== Skeleton Loaders ==========
function HadithCardSkeleton() {
  return (
    <div className="p-6 md:p-8 rounded-3xl border border-border bg-card/50 space-y-6 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent" />
        <div className="h-4 w-20 bg-accent rounded-full" />
      </div>
      <div className="space-y-4">
        <div className="h-8 w-full bg-accent rounded-xl" />
        <div className="h-8 w-3/4 bg-accent rounded-xl ml-auto" />
      </div>
      <div className="h-20 w-full bg-accent/30 rounded-2xl" />
    </div>
  );
}

function PerawiCardSkeleton() {
  return (
    <div className="p-6 rounded-2xl border border-border bg-card/50 flex items-center gap-4 animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-accent" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-24 bg-accent rounded" />
        <div className="h-3 w-16 bg-accent rounded" />
      </div>
    </div>
  );
}

// ========== Hadith Detail Modal ==========
function HadithDetailModal({
  detail,
  onClose,
  onNavigate,
  onShare,
}: {
  detail: DetailState;
  onClose: () => void;
  onNavigate: (id: number) => void;
  onShare: (h: any) => void;
}) {
  useEffect(() => {
    if (!detail.isOpen || detail.isLoading) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && detail.hadis?.prev) onNavigate(detail.hadis.prev);
      if (e.key === "ArrowRight" && detail.hadis?.next) onNavigate(detail.hadis.next);
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [detail.isOpen, detail.isLoading, detail.hadis, onNavigate, onClose]);

  if (!detail.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card border border-border rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="sticky top-0 bg-card/95 backdrop-blur-md border-b border-border/50 p-4 flex items-center justify-between rounded-t-3xl z-10">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">Detail Hadis</h3>
          </div>
          <div className="flex items-center gap-2">
            {detail.hadis && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onShare(detail.hadis)}
                  className="p-2 hover:bg-accent rounded-full transition-colors text-muted-foreground hover:text-primary"
                  title="Bagikan Gambar"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    const h = detail.hadis!;
                    const text = `${h.text.ar}\n\n${h.text.id}\n\n${h.takhrij ? `(${h.takhrij})` : `(Hadis #${h.id})`}\n${h.grade ? `Status: ${h.grade}` : ""}`;
                    navigator.clipboard.writeText(text);
                    alert("Hadis berhasil disalin!");
                  }}
                  className="p-2 hover:bg-accent rounded-full transition-colors text-muted-foreground hover:text-primary"
                  title="Salin Hadis"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {detail.isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : detail.hadis ? (
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm">
                <Hash className="w-4 h-4" />
                Hadis #{detail.hadis.id}
              </div>
              {detail.hadis.grade && (
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  detail.hadis.grade.toLowerCase().includes("shahih") || detail.hadis.grade.toLowerCase().includes("sahih")
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : detail.hadis.grade.toLowerCase().includes("hasan")
                    ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                }`}>
                  {detail.hadis.grade}
                </div>
              )}
            </div>

            <div className="text-right p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
              <p className="text-2xl md:text-3xl leading-[2.2] md:leading-[2.5] font-lpmq text-foreground antialiased" dir="rtl">
                {detail.hadis.text.ar}
              </p>
            </div>

            <div className="relative pl-6 py-4 border-l-2 border-primary/20 bg-accent/30 rounded-r-xl">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-full" />
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Terjemahan
              </p>
              <p className="text-foreground leading-relaxed md:text-lg">
                {detail.hadis.text.id}
              </p>
            </div>

            {detail.hadis.takhrij && (
              <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Scroll className="w-4 h-4" />
                  Takhrij
                </p>
                <p className="text-foreground text-sm leading-relaxed">
                  {detail.hadis.takhrij}
                </p>
              </div>
            )}

            {detail.hadis.hikmah && (
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Hikmah & Faedah
                </p>
                <p className="text-foreground text-sm leading-relaxed whitespace-pre-line">
                  {detail.hadis.hikmah}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => detail.hadis?.prev && onNavigate(detail.hadis.prev)}
                  disabled={!detail.hadis.prev}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card hover:bg-accent disabled:opacity-30 transition-all text-sm font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Sebelumnya
                </button>
                <button
                  onClick={() => detail.hadis?.next && onNavigate(detail.hadis.next)}
                  disabled={!detail.hadis.next}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card hover:bg-accent disabled:opacity-30 transition-all text-sm font-medium"
                >
                  Berikutnya
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-center text-muted-foreground italic">
                Tips: Gunakan tombol panah <b>Kiri</b> / <b>Kanan</b> di keyboard untuk navigasi
              </p>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center text-muted-foreground">
            Hadis tidak ditemukan.
          </div>
        )}
      </div>
    </div>
  );
}

// ========== Pagination Component ==========
function Pagination({
  paging,
  onPageChange,
  isLoading,
}: {
  paging: HadisEncPaging;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}) {
  if (paging.total_pages <= 1) return null;

  const getPageNumbers = () => {
    const pages: number[] = [];
    const totalPages = paging.total_pages;
    const current = paging.current;

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (current <= 3) {
      for (let i = 1; i <= 5; i++) pages.push(i);
    } else if (current >= totalPages - 2) {
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      for (let i = current - 2; i <= current + 2; i++) pages.push(i);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1 md:gap-2 py-8">
      <button
        onClick={() => paging.first_page && onPageChange(paging.first_page)}
        disabled={!paging.has_prev || isLoading}
        className="p-2 rounded-xl border border-border bg-card hover:bg-accent disabled:opacity-30 transition-colors"
      >
        <ChevronsLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => paging.prev_page && onPageChange(paging.prev_page)}
        disabled={!paging.has_prev || isLoading}
        className="p-2 rounded-xl border border-border bg-card hover:bg-accent disabled:opacity-30 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-1 md:gap-2">
        {getPageNumbers().map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            disabled={isLoading}
            className={`w-10 h-10 md:w-11 md:h-11 rounded-xl border transition-all font-bold text-sm ${
              paging.current === pageNum
                ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20 scale-105"
                : "border-border bg-card hover:border-primary/50 text-muted-foreground"
            }`}
          >
            {pageNum}
          </button>
        ))}
      </div>

      <button
        onClick={() => paging.next_page && onPageChange(paging.next_page)}
        disabled={!paging.has_next || isLoading}
        className="p-2 rounded-xl border border-border bg-card hover:bg-accent disabled:opacity-30 transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      <button
        onClick={() => paging.last_page && onPageChange(paging.last_page)}
        disabled={!paging.has_next || isLoading}
        className="p-2 rounded-xl border border-border bg-card hover:bg-accent disabled:opacity-30 transition-colors"
      >
        <ChevronsRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ========== Hadith Card ==========
function HadithCard({
  hadis,
  onViewDetail,
  onShare,
}: {
  hadis: HadisEncEntry;
  onViewDetail: (id: number) => void;
  onShare: (h: any) => void;
}) {
  return (
    <div className="p-6 md:p-8 rounded-3xl border border-border bg-card hover:border-primary/30 transition-all space-y-6 shadow-sm group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
            {hadis.id}
          </div>
          {hadis.grade && (
            <div className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${
              hadis.grade.toLowerCase().includes("shahih") || hadis.grade.toLowerCase().includes("sahih")
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : hadis.grade.toLowerCase().includes("hasan")
                ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
            }`}>
              {hadis.grade}
            </div>
          )}
          {hadis.takhrij && (
            <div className="px-3 py-1 rounded-full bg-accent text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
              {hadis.takhrij}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onShare(hadis)}
            className="p-2 hover:bg-accent rounded-full transition-colors text-muted-foreground hover:text-primary"
            title="Bagikan Gambar"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const text = `${hadis.text.ar}\n\n${hadis.text.id}\n\n${hadis.takhrij ? `(${hadis.takhrij})` : `(Hadis #${hadis.id})`}\n${hadis.grade ? `Status: ${hadis.grade}` : ""}`;
              navigator.clipboard.writeText(text);
              alert("Hadis berhasil disalin!");
            }}
            className="p-2 hover:bg-accent rounded-full transition-colors text-muted-foreground hover:text-primary"
            title="Salin Hadis"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewDetail(hadis.id)}
            className="p-2 hover:bg-accent rounded-full transition-colors group-hover:text-primary"
            title="Lihat Detail"
          >
            <BookOpen className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="text-right">
          <p className="text-2xl md:text-3xl leading-[2.2] md:leading-[2.5] font-lpmq text-foreground antialiased" dir="rtl">
            {hadis.text.ar}
          </p>
        </div>

        <div className="relative pl-6 py-4 border-l-2 border-primary/20 bg-accent/30 rounded-r-xl">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-full" />
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
            Terjemahan
          </p>
          <p className="text-foreground leading-relaxed md:text-base">
            {hadis.text.id}
          </p>
        </div>

        {hadis.hikmah && (
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Star className="w-3 h-3" />
              Hikmah
            </p>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {hadis.hikmah}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ========== Main Component Helper ==========
function HadithIndexContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialTab = (searchParams.get("tab") as TabType) || "perawi";
  const initialQuery = searchParams.get("q") || "";

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  const [explore, setExplore] = useState<ExploreState>({ hadis: [], paging: null, isLoading: true, error: null });
  const [search, setSearch] = useState<SearchState>({ hadis: [], paging: null, keyword: "", isLoading: false, error: null });
  const [perawi, setPerawi] = useState<PerawiState>({ rawi: [], paging: null, isLoading: true, error: null });
  const [detail, setDetail] = useState<DetailState>({ hadis: null, isLoading: false, isOpen: false });
  const [meta, setMeta] = useState<MetaState>({ data: null, isLoading: true });
  const [shareData, setShareData] = useState<any>(null);

  const fetchExplore = useCallback(async (page: number = 1) => {
    setExplore((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const res = await fetch(`/api/hadith/explore?page=${page}&limit=10`);
      const json = await res.json();
      if (json.status) {
        setExplore({ hadis: json.data.hadis, paging: json.data.paging, isLoading: false, error: null });
      } else {
        throw new Error(json.message);
      }
    } catch (error) {
      setExplore((prev) => ({ ...prev, isLoading: false, error: "Gagal memuat hadis. Silakan coba lagi." }));
    }
  }, []);

  const fetchSearch = useCallback(async (keyword: string, page: number = 1) => {
    if (keyword.length < 4) return;
    setSearch((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const res = await fetch(`/api/hadith/search?keyword=${encodeURIComponent(keyword)}&page=${page}&limit=10`);
      const json = await res.json();
      if (json.status) {
        setSearch({ hadis: json.data.hadis, paging: json.data.paging, keyword: json.data.keyword, isLoading: false, error: null });
      } else {
        throw new Error(json.message);
      }
    } catch (error) {
      setSearch((prev) => ({ ...prev, isLoading: false, error: "Gagal mencari hadis. Silakan coba lagi." }));
    }
  }, []);

  const fetchPerawi = useCallback(async (page: number = 1) => {
    setPerawi((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const res = await fetch(`/api/hadith/perawi?page=${page}&limit=20`);
      const json = await res.json();
      if (json.status) {
        setPerawi((prev) => ({ ...prev, rawi: json.data.rawi, paging: json.data.paging, isLoading: false, error: null }));
      } else {
        throw new Error(json.message);
      }
    } catch (error) {
      setPerawi((prev) => ({ ...prev, isLoading: false, error: "Gagal memuat data perawi. Silakan coba lagi." }));
    }
  }, []);

  const fetchDetail = useCallback(async (id: number) => {
    setDetail({ hadis: null, isLoading: true, isOpen: true });
    try {
      const res = await fetch(`/api/hadith/${id}`);
      const json = await res.json();
      if (json.status) {
        setDetail({ hadis: json.data, isLoading: false, isOpen: true });
      } else {
        throw new Error(json.message);
      }
    } catch {
      setDetail({ hadis: null, isLoading: false, isOpen: true });
    }
  }, []);


  const fetchMeta = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/hadis/enc`);
      const json = await res.json();
      if (json.status) {
        setMeta({ data: json.data, isLoading: false });
      }
    } catch {
      setMeta((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    // meta only on mount
    fetchMeta();
  }, [fetchMeta]);

  useEffect(() => {
    if (activeTab === "explore" && explore.hadis.length === 0) {
      fetchExplore(1);
    }
    if (activeTab === "perawi" && perawi.rawi.length === 0) {
      fetchPerawi(1);
    }
  }, [activeTab, explore.hadis.length, perawi.rawi.length, fetchExplore, fetchPerawi]);

  useEffect(() => {
    if (searchQuery.length >= 4) {
      const timer = setTimeout(() => {
        setDebouncedQuery(searchQuery);
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setDebouncedQuery("");
    }
  }, [searchQuery]);

  useEffect(() => {
    // Only search if the query is fresh and different from current search
    if (debouncedQuery.length >= 4 && debouncedQuery !== search.keyword) {
      setActiveTab("search");
      fetchSearch(debouncedQuery, 1);
      
      const params = new URLSearchParams(window.location.search);
      params.set("q", debouncedQuery);
      params.set("tab", "search");
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [debouncedQuery, fetchSearch, search.keyword, router]);

  useEffect(() => {
    const tab = searchParams.get("tab") as TabType;
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams, activeTab]);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "explore", label: "Eksplorasi", icon: <BookOpen className="w-4 h-4" /> },
    { id: "search", label: "Pencarian", icon: <Search className="w-4 h-4" /> },
    { id: "perawi", label: "Periwayat", icon: <Scroll className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              Ensiklopedia <span className="text-primary italic">Hadis</span>
            </h1>
            <p className="text-muted-foreground leading-relaxed max-w-2xl">
              Rasulullah ﷺ bersabda: &quot;Semoga Allah memperindah orang yang mendengar
              hadis dariku, lalu dia menghafalnya dan menyampaikannya (kepada orang
              lain).&quot; (HR. Tirmidzi)
            </p>
          </div>
          {meta.data && (
            <div className="flex flex-wrap gap-2 animate-in slide-in-from-right-4 duration-1000">
              <div className="px-3 py-1 rounded-lg bg-accent/50 border border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Ver: {meta.data.ver}
              </div>
              <div className="px-3 py-1 rounded-lg bg-accent/50 border border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Source: {meta.data.source}
              </div>
            </div>
          )}
        </div>

        <div className="relative group max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            id="hadith-search-input"
            type="text"
            placeholder="Cari hadis (min 4 karakter, misal: kiamat, sabar)..."
            className="w-full pl-12 pr-12 py-4 rounded-2xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => { 
                setSearchQuery(""); 
                setDebouncedQuery(""); 
                setActiveTab("explore");
                const params = new URLSearchParams(window.location.search);
                params.delete("q");
                params.set("tab", "explore");
                router.replace(`?${params.toString()}`, { scroll: false });
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          {search.isLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {["kiamat", "sabar", "sholat", "puasa", "sedekah", "ilmu", "taubat", "dosa"].map((tag) => (
            <button
              key={tag}
              onClick={() => setSearchQuery(tag)}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-accent hover:bg-primary/10 hover:text-primary transition-colors border border-border/50"
            >
              {tag}
            </button>
          ))}
        </div>
      </header>

      <div className="flex gap-2 border-b border-border pb-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              const params = new URLSearchParams(window.location.search);
              params.set("tab", tab.id);
              router.replace(`?${params.toString()}`, { scroll: false });
            }}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-xl transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-primary/10 text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="animate-in fade-in duration-500">
        {activeTab === "explore" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {explore.isLoading ? "Memuat..." : explore.paging ? `Total ${explore.paging.total_data.toLocaleString("id-ID")} hadis` : ""}
            </p>
            {explore.isLoading ? (
              <div className="grid grid-cols-1 gap-4">
                {[...Array(3)].map((_, i) => <HadithCardSkeleton key={i} />)}
              </div>
            ) : explore.hadis.length > 0 ? (
              <>
                <div className="space-y-4">
                  {explore.hadis.map((h) => <HadithCard key={h.id} hadis={h} onViewDetail={fetchDetail} onShare={setShareData} />)}
                </div>
                {explore.paging && (
                  <Pagination paging={explore.paging} onPageChange={(page) => { fetchExplore(page); window.scrollTo({ top: 0, behavior: "smooth" }); }} isLoading={explore.isLoading} />
                )}
              </>
            ) : (
              <div className="py-20 text-center text-muted-foreground">Tidak ada hadis.</div>
            )}
          </div>
        )}

        {activeTab === "search" && (
          <div className="space-y-4">
            {!debouncedQuery || debouncedQuery.length < 4 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto opacity-50"><Search className="w-8 h-8" /></div>
                <p className="text-muted-foreground">Ketik minimal 4 karakter untuk mencari hadis.</p>
              </div>
            ) : search.isLoading ? (
              <div className="grid grid-cols-1 gap-4">
                {[...Array(3)].map((_, i) => <HadithCardSkeleton key={i} />)}
              </div>
            ) : search.hadis.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Ditemukan {search.paging?.total_data.toLocaleString("id-ID")} hasil untuk &quot;{search.keyword}&quot;
                </p>
                <div className="space-y-4">
                  {search.hadis.map((h) => (
                    <div key={h.id} className="p-6 md:p-8 rounded-3xl border border-border bg-card hover:border-primary/30 transition-all space-y-4 shadow-sm cursor-pointer" onClick={() => fetchDetail(h.id)}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">{h.id}</div>
                          <span className="text-xs text-muted-foreground font-medium">Klik untuk lihat detail</span>
                        </div>
                      </div>
                      <p className="text-foreground leading-relaxed">
                        {highlightText(h.text, search.keyword)}
                      </p>
                      {h.focus.length > 0 && (
                        <div className="space-y-2 mt-4">
                          {h.focus.map((f, i) => (
                            <p key={i} className="text-sm text-muted-foreground pl-4 border-l-2 border-primary/30 italic">
                              {highlightText(f, search.keyword)}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {search.paging && (
                  <Pagination paging={search.paging} onPageChange={(page) => { fetchSearch(debouncedQuery, page); window.scrollTo({ top: 0, behavior: "smooth" }); }} isLoading={search.isLoading} />
                )}
              </>
            ) : (
              <div className="py-20 text-center text-muted-foreground">Tidak ditemukan hasil untuk &quot;{search.keyword}&quot;.</div>
            )}
          </div>
        )}

        {activeTab === "perawi" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
              <div className="flex flex-col md:flex-row gap-6 items-center text-center md:text-left">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 text-primary flex items-center justify-center">
                  <Scroll className="w-8 h-8" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-2xl font-bold">Cari Berdasarkan Periwayat</h3>
                  <p className="text-muted-foreground">Pilih atau cari koleksi hadis dari periwayat (kolektor) hadis terkemuka.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-sm font-bold flex items-center gap-2 px-1">
                <Star className="w-4 h-4 text-amber-500" /> Periwayat Populer
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {[
                  { name: "Muttafaq 'Alaihi", desc: "Bukhari & Muslim" },
                  { name: "Bukhari", desc: "Shahih Bukhari" },
                  { name: "Muslim", desc: "Shahih Muslim" },
                  { name: "Abu Daud", desc: "Sunan Abu Daud" },
                  { name: "Tirmidzi", desc: "Sunan Tirmidzi" },
                  { name: "Nasai", desc: "Sunan An-Nasai" },
                  { name: "Ibnu Majah", desc: "Sunan Ibnu Majah" },
                  { name: "Ahmad", desc: "Musnad Ahmad" },
                  { name: "Malik", desc: "Muwatha Malik" },
                  { name: "Darimi", desc: "Sunan Ad-Darimi" }
                ].map((p) => (
                  <button
                    key={p.name}
                    onClick={() => {
                      const query = p.name === "Muttafaq 'Alaihi" ? "Bukhari Muslim" : p.name;
                      setSearchQuery(query);
                      setDebouncedQuery(query);
                      setActiveTab("search");
                      
                      const params = new URLSearchParams(window.location.search);
                      params.set("q", query);
                      params.set("tab", "search");
                      router.replace(`?${params.toString()}`, { scroll: false });
                    }}
                    className="p-5 rounded-2xl border border-border bg-card hover:bg-primary/5 hover:border-primary/40 hover:shadow-md transition-all text-left group"
                  >
                    <h5 className="font-bold text-lg group-hover:text-primary transition-colors">{p.name}</h5>
                    <p className="text-xs text-muted-foreground mt-1">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-accent/30 border border-border text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-accent text-muted-foreground flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold">Butuh Biografi Perawi?</h4>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Untuk mempelajari riwayat hidup, sanad keilmuan, dan derajat kredibilitas para perawi secara mendalam, silakan kunjungi menu Profil Perawi.
                </p>
              </div>
              <Link
                href="/scholars"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card border border-border font-bold text-sm hover:bg-accent transition-colors mt-2"
              >
                Buka Profil Perawi <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>

      <HadithDetailModal detail={detail} onClose={() => setDetail({ hadis: null, isLoading: false, isOpen: false })} onNavigate={fetchDetail} onShare={setShareData} />
      <ShareHadithDialog 
        isOpen={!!shareData} 
        onClose={() => setShareData(null)} 
        id={shareData?.id} 
        textArabic={shareData?.text?.ar} 
        translation={shareData?.text?.id} 
        takhrij={shareData?.takhrij} 
        grade={shareData?.grade} 
      />
    </div>
  );
}

export default function HadithIndex() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <HadithIndexContent />
    </Suspense>
  );
}
