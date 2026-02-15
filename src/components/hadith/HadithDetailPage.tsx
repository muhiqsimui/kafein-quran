"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Scroll,
  Star,
  Hash,
  Loader2,
  Copy,
  Check
} from "lucide-react";
import type { HadisEncDetail } from "@/lib/hadith-service";

interface HadithDetailPageProps {
  hadis: HadisEncDetail;
}

export default function HadithDetailPage({ hadis: initialHadis }: HadithDetailPageProps) {
  const [hadis, setHadis] = useState<HadisEncDetail>(initialHadis);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const navigateHadis = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/hadith/${id}`);
      const json = await res.json();
      if (json.status) {
        setHadis(json.data);
        window.scrollTo({ top: 0, behavior: "smooth" });
        // Update URL without full reload
        window.history.pushState({}, '', `/hadith/${id}`);
      }
    } catch (error) {
      console.error("Failed to navigate hadis:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const copyHadis = useCallback(() => {
    const text = `${hadis.text.ar}\n\n${hadis.text.id}\n\n${hadis.takhrij ? `(${hadis.takhrij})` : `(Hadis #${hadis.id})`}\n${hadis.grade ? `Status: ${hadis.grade}` : ""}`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [hadis]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/hadith"
          className="p-2 hover:bg-accent rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold">Hadis #{hadis.id}</h2>
          {hadis.grade && (
            <p className={`text-sm font-medium ${
              hadis.grade.toLowerCase().includes("shahih") || hadis.grade.toLowerCase().includes("sahih")
                ? "text-emerald-600 dark:text-emerald-400"
                : hadis.grade.toLowerCase().includes("hasan")
                ? "text-blue-600 dark:text-blue-400"
                : "text-amber-600 dark:text-amber-400"
            }`}>
              {hadis.grade}
            </p>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && (
        <div className="space-y-6">
          {/* Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm">
              <Hash className="w-4 h-4" />
              Hadis #{hadis.id}
            </div>
            {hadis.grade && (
              <div className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                hadis.grade.toLowerCase().includes("shahih") || hadis.grade.toLowerCase().includes("sahih")
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : hadis.grade.toLowerCase().includes("hasan")
                  ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              }`}>
                {hadis.grade}
              </div>
            )}
            <button
              onClick={copyHadis}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent hover:bg-accent/80 transition-colors text-xs font-medium"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  Tersalin
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Salin
                </>
              )}
            </button>
          </div>

          {/* Arabic text */}
          <div className="text-right p-8 rounded-3xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
            <p
              className="text-3xl md:text-4xl leading-[2.2] md:leading-[2.5] font-lpmq text-foreground antialiased"
              dir="rtl"
            >
              {hadis.text.ar}
            </p>
          </div>

          {/* Translation */}
          <div className="relative pl-6 py-5 border-l-2 border-primary/20 bg-accent/30 rounded-r-2xl">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-full" />
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Terjemahan
            </p>
            <p className="text-foreground leading-relaxed md:text-lg">
              {hadis.text.id}
            </p>
          </div>

          {/* Takhrij */}
          {hadis.takhrij && (
            <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10">
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Scroll className="w-4 h-4" />
                Takhrij (Sumber)
              </p>
              <p className="text-foreground leading-relaxed">
                {hadis.takhrij}
              </p>
            </div>
          )}

          {/* Hikmah */}
          {hadis.hikmah && (
            <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10">
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Hikmah & Faedah
              </p>
              <p className="text-foreground leading-relaxed whitespace-pre-line">
                {hadis.hikmah}
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-border">
            <button
              onClick={() => hadis.prev && navigateHadis(hadis.prev)}
              disabled={!hadis.prev || isLoading}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-border bg-card hover:bg-accent disabled:opacity-30 transition-all text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Sebelumnya
            </button>
            <span className="text-sm text-muted-foreground font-medium">
              #{hadis.id}
            </span>
            <button
              onClick={() => hadis.next && navigateHadis(hadis.next)}
              disabled={!hadis.next || isLoading}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-border bg-card hover:bg-accent disabled:opacity-30 transition-all text-sm font-medium"
            >
              Berikutnya
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
