"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Book,
  Layers,
  List,
  Bookmark,
  Search,
  Settings,
  CircleDot,
  Clock,
  ChevronLeft,
} from "lucide-react";
import { LastReadCard } from "@/components/quran/LastReadCard";

const mainMenuItems = [
  {
    id: "quran",
    title: "Baca Al-Quran",
    description: "Pilih mode baca: Surah, Ayat, Halaman, atau Juz",
    icon: Book,
    color: "bg-emerald-500/10 text-emerald-600",
    isAction: true,
  },
  {
    id: "dzikir",
    title: "Dzikir & Tasbih",
    description: "Hitung dzikir dengan mode bantu & siklus",
    icon: CircleDot,
    href: "/dzikir",
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    id: "prayer",
    title: "Jadwal Sholat",
    description: "Waktu sholat akurat sesuai lokasi Anda",
    icon: Clock,
    href: "/prayer-times",
    color: "bg-rose-500/10 text-rose-600",
  },
];

const quranMenuItems = [
  {
    title: "Baca per Surah",
    description: "Daftar surah dari Al-Fatihah sampai An-Nas",
    icon: Book,
    href: "/surah",
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    title: "Baca per Ayat",
    description: "Tampilan fokus satu ayat per halaman",
    icon: List,
    href: "/ayah",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Baca per Halaman",
    description: "Tampilan Al-Quran mushaf per halaman",
    icon: Layers,
    href: "/page/1",
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    title: "Baca per Juz",
    description: "Daftar Juz 1 sampai 30",
    icon: Layers,
    href: "/juz",
    color: "bg-indigo-500/10 text-indigo-600",
  },
];

export default function DashboardPage() {
  const [activeMenu, setActiveMenu] = useState<"main" | "quran">("main");

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Lumina <span className="text-primary italic">Quran</span>
        </h1>
        <p className="text-muted-foreground">
          Selamat datang di taman-taman surga. Rasulullah ﷺ bersabda: 'Bacalah
          Al-Qur'an, karena ia akan datang pada hari kiamat sebagai pemberi
          syafaat bagi pembacanya.' (HR. Muslim).
        </p>
      </header>

      <LastReadCard />

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          {activeMenu === "quran" && (
            <button
              onClick={() => setActiveMenu("main")}
              className="p-1 -ml-1 hover:bg-accent rounded-full transition-colors"
              aria-label="Kembali ke menu utama"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <h2 className="text-xl font-bold">
            {activeMenu === "main" ? "Menu Utama" : "Baca Al-Quran"}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {activeMenu === "main"
            ? mainMenuItems.map((item) =>
                item.isAction ? (
                  <button
                    key={item.id}
                    onClick={() => setActiveMenu("quran")}
                    className="group p-4 md:p-6 text-left rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all"
                  >
                    <div
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${item.color} flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <item.icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <h3 className="text-base md:text-lg font-bold mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed italic line-clamp-2 md:line-clamp-none">
                      {item.description}
                    </p>
                  </button>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href!}
                    className="group p-4 md:p-6 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all"
                  >
                    <div
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${item.color} flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <item.icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <h3 className="text-base md:text-lg font-bold mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed italic line-clamp-2 md:line-clamp-none">
                      {item.description}
                    </p>
                  </Link>
                )
              )
            : quranMenuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group p-4 md:p-6 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all"
                >
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${item.color} flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <item.icon className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <h3 className="text-base md:text-lg font-bold mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed italic line-clamp-2 md:line-clamp-none">
                    {item.description}
                  </p>
                </Link>
              ))}
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Link
          href="/bookmarks"
          className="p-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors flex flex-col items-center gap-2"
        >
          <Bookmark className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">Bookmark</span>
        </Link>
        <Link
          href="/search"
          className="p-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors flex flex-col items-center gap-2"
        >
          <Search className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">Cari</span>
        </Link>
        <Link
          href="/settings"
          className="p-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors flex flex-col items-center gap-2"
        >
          <Settings className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">Pengaturan</span>
        </Link>
        <div className="p-4 rounded-xl border border-border bg-card/50 flex flex-col items-center gap-2 opacity-50 cursor-not-allowed">
          <div className="w-5 h-5 rounded-full bg-primary/20" />
          <span className="text-sm font-medium">Segera</span>
        </div>
      </section>
    </div>
  );
}

