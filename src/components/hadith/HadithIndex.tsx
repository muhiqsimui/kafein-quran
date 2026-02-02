"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Scroll, Search } from "lucide-react";
import { Narrator } from "@/lib/hadith-service";

interface HadithIndexProps {
  narrators: Narrator[];
}

export default function HadithIndex({ narrators }: HadithIndexProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNarrators = narrators.filter((n) =>
    n.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Baca <span className="text-primary italic">Hadist</span>
          </h1>
          <p className="text-muted-foreground">
            Rasulullah ﷺ bersabda: "Semoga Allah memperindah orang yang mendengar hadis dariku, lalu dia menghafalnya dan menyampaikannya (kepada orang lain)." (HR. Tirmidzi).
          </p>
        </div>

        <div className="relative group max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Cari perawi (misal: Bukhari, Muslim)..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNarrators.map((narrator) => (
          <Link
            key={narrator.slug}
            href={`/hadith/${narrator.slug}`}
            className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Scroll className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{narrator.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {narrator.total.toLocaleString("id-ID")} Hadist
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </div>
      
      {filteredNarrators.length === 0 && (
        <div className="py-20 text-center space-y-4">
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto opacity-50">
             <Search className="w-8 h-8" />
          </div>
          <p className="text-muted-foreground">Perawi tidak ditemukan.</p>
        </div>
      )}
    </div>
  );
}
