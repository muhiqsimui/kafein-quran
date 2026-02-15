"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Users, 
  Search, 
  Info, 
  ExternalLink, 
  ShieldCheck, 
  History, 
  BookOpen, 
  Loader2,
  X,
  ChevronRight,
  Database,
  Star,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import Link from "next/link";
import { 
  browsePerawi, 
  getPerawiById, 
  PerawiBrowseEntry, 
  PerawiDetail, 
  HadisEncPaging 
} from "@/lib/hadith-service";

interface PerawiMeta {
  total: number;
  last_update: string;
  sumber: string;
}

// ========== Perawi Detail Modal ==========
function PerawiDetailModal({
  perawi,
  onClose,
}: {
  perawi: PerawiDetail | null;
  onClose: () => void;
}) {
  if (!perawi) return null;

  const infoItems = [
    { label: "Nama", value: perawi.name },
    { label: "Grade (Derajat)", value: perawi.grade },
    { label: "Orang Tua", value: perawi.parents },
    { label: "Pasangan", value: perawi.spouse },
    { label: "Saudara", value: perawi.siblings },
    { label: "Anak", value: perawi.children },
    { label: "Tempat/Tanggal Lahir", value: perawi.birth_date_place },
    { label: "Tempat Tinggal", value: perawi.places_of_stay },
    { label: "Wafat", value: perawi.death_date_place },
    { label: "Guru-guru", value: perawi.teachers },
    { label: "Murid-murid", value: perawi.students },
    { label: "Bidang", value: perawi.area_of_interest },
    { label: "Tags", value: perawi.tags },
    { label: "Kitab", value: perawi.books },
  ].filter((item) => item.value);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card border border-border rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-4 flex items-center justify-between rounded-t-3xl z-10">
          <h3 className="font-bold text-lg">Detail Profil Perawi</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
              {perawi.name?.charAt(0) || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-2xl font-bold truncate">{perawi.name || "Tidak diketahui"}</h4>
              {perawi.grade && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                    {perawi.grade}
                  </span>
                  {perawi.tags && <span className="text-xs text-muted-foreground">• {perawi.tags}</span>}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            {infoItems.map((item) => (
              <div key={item.label} className="p-4 rounded-2xl bg-accent/40 border border-border/50 group hover:border-primary/30 transition-colors">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">
                  {item.label}
                </p>
                <p className="text-foreground text-sm leading-relaxed">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {infoItems.length === 0 && (
            <div className="py-12 text-center space-y-3">
              <Info className="w-12 h-12 text-muted-foreground mx-auto opacity-20" />
              <p className="text-muted-foreground">Informasi biografi detail belum tersedia.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ScholarsIndex() {
  const [meta, setMeta] = useState<PerawiMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isListLoading, setIsListLoading] = useState(false);
  const [rawiList, setRawiList] = useState<PerawiBrowseEntry[]>([]);
  const [paging, setPaging] = useState<HadisEncPaging | null>(null);
  const [selectedPerawi, setSelectedPerawi] = useState<PerawiDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchRawi = useCallback(async (page: number = 1) => {
    setIsListLoading(true);
    try {
      const data = await browsePerawi(page, 15);
      setRawiList(data.rawi);
      setPaging(data.paging);
    } catch (error) {
      console.error("Failed to fetch perawi list:", error);
    } finally {
      setIsListLoading(false);
    }
  }, []);

  const fetchDetail = async (id: number) => {
    setIsDetailLoading(true);
    try {
      const data = await getPerawiById(id);
      setSelectedPerawi(data);
    } catch (error) {
      console.error("Failed to fetch perawi detail:", error);
    } finally {
      setIsDetailLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch("/perawi.json");
        const json = await res.json();
        if (json.status) {
          setMeta(json.data);
        }
        await fetchRawi(1);
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [fetchRawi]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              Profil <span className="text-primary italic">Perawi</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Database komprehensif biografi perawi hadis, sanad keilmuan, dan derajat kredibilitas para ulama hadis.
            </p>
          </div>
          {meta && (
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs">
                <Database className="w-3 h-3" />
                {meta.total.toLocaleString("id-ID")} Data Perawi
              </div>
              <p className="text-[10px] text-muted-foreground italic">Update: {meta.last_update}</p>
            </div>
          )}
        </div>

        <div className="relative group max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Cari nama perawi (Sedang dikembangkan)..."
            className="w-full pl-12 pr-12 py-4 rounded-2xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Menghubungkan ke database perawi...</p>
        </div>
      ) : (
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 rounded-3xl border border-border bg-card space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                <History className="w-32 h-32" />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                <History className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Lini Masa Perawi</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Telusuri riwayat hidup para perawi dari masa Sahabat, Tabi'in, hingga Tabi'ut Tabi'in secara kronologis.
                </p>
              </div>
              <button className="flex items-center gap-2 text-primary font-bold text-sm hover:underline">
                Buka Lini Masa <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="p-8 rounded-3xl border border-border bg-card space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-32 h-32" />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Kredibilitas (Jarh wa Ta'dil)</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Pelajari penilaian ulama terhadap kepribadian dan hafalan para perawi untuk menentukan keabsahan sanad.
                </p>
              </div>
              <button className="flex items-center gap-2 text-primary font-bold text-sm hover:underline">
                Lihat Kategori <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <section className="space-y-8">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                Daftar Semua Perawi
              </h2>
            </div>
            
            {isListLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="h-24 rounded-2xl bg-accent/20 animate-pulse border border-border/50" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rawiList.map((r) => (
                  <button 
                    key={r.id} 
                    onClick={() => fetchDetail(r.id)}
                    className="group p-5 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all text-left relative overflow-hidden"
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform font-bold text-lg">
                        {r.name?.charAt(0) || "?"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold truncate group-hover:text-primary transition-colors">{r.name || `Perawi #${r.id}`}</h3>
                        {r.grade && <p className="text-[10px] text-muted-foreground truncate uppercase tracking-wider">{r.grade}</p>}
                        {r.tags && <p className="text-[10px] text-primary/70 truncate mt-0.5">{r.tags}</p>}
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    </div>
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-5 transition-opacity">
                      <Users className="w-12 h-12" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {paging && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-8">
                <button
                  onClick={() => fetchRawi(1)}
                  disabled={paging.current === 1 || isListLoading}
                  className="p-2 rounded-xl border border-border bg-card hover:bg-accent disabled:opacity-30 transition-all"
                  title="Halaman Pertama"
                >
                  <ChevronsLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => fetchRawi(paging.current - 1)}
                  disabled={!paging.has_prev || isListLoading}
                  className="px-4 py-2 rounded-xl border border-border bg-card hover:bg-accent disabled:opacity-30 transition-all font-bold text-sm flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <div className="px-4 py-2 rounded-xl bg-primary/10 text-primary font-bold text-sm">
                  {paging.current} / {paging.total_pages}
                </div>
                <button
                  onClick={() => fetchRawi(paging.current + 1)}
                  disabled={!paging.has_next || isListLoading}
                  className="px-4 py-2 rounded-xl border border-border bg-card hover:bg-accent disabled:opacity-30 transition-all font-bold text-sm flex items-center gap-2"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => fetchRawi(paging.total_pages)}
                  disabled={paging.current === paging.total_pages || isListLoading}
                  className="p-2 rounded-xl border border-border bg-card hover:bg-accent disabled:opacity-30 transition-all"
                  title="Halaman Terakhir"
                >
                  <ChevronsRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </section>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-full md:w-1/3 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-600 flex items-center justify-center">
                  <Info className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold">Tentang Database</h3>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  Database ini mencakup lebih dari 24 ribu profil ulama dan perawi hadis yang dikompilasi dari berbagai kitab rujukan utama Ilmu Rijalul Hadis.
                </p>
                <div className="space-y-2 pt-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sumber Data</p>
                  <a 
                    href={meta?.sumber || "#"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-indigo-600 hover:underline"
                  >
                    Islamic Scholars Dataset (HuggingFace) <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-colors space-y-3">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <BookOpen className="w-4 h-4" /> Sahabat Nabi
                  </div>
                  <p className="text-xs text-muted-foreground">Perawi yang bertemu langsung dengan Rasulullah ﷺ.</p>
                </div>
                <div className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-colors space-y-3">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <BookOpen className="w-4 h-4" /> Tabi'in
                  </div>
                  <p className="text-xs text-muted-foreground">Murid dari para Sahabat Nabi yang meneruskan sanad.</p>
                </div>
                <div className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-colors space-y-3">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <BookOpen className="w-4 h-4" /> Aimmah Sitta
                  </div>
                  <p className="text-xs text-muted-foreground">6 penyusun kitab hadis utama (Bukhari, Muslim, dsb).</p>
                </div>
                <div className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-colors space-y-3">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <BookOpen className="w-4 h-4" /> Ulama Salaf
                  </div>
                  <p className="text-xs text-muted-foreground">Ulama generasi awal yang menjaga kemurnian ilmu hadis.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDetailLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
          <div className="bg-card p-6 rounded-2xl shadow-xl flex items-center gap-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="font-bold">Memuat Profil...</p>
          </div>
        </div>
      )}

      <PerawiDetailModal perawi={selectedPerawi} onClose={() => setSelectedPerawi(null)} />
    </div>
  );
}
