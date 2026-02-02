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
  Wallet,
  CheckSquare,
  LayoutGrid,
  Calendar,
  Scroll,
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
  {
    id: "istiqomah",
    title: "Catatan Istiqomah",
    description: "Atur dan pantau rutinitas ibadah harian Anda",
    icon: CheckSquare,
    href: "/istiqomah",
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    id: "zakat",
    title: "Hitung Zakat",
    description: "Hitung berbagai jenis zakat dengan mudah",
    icon: Wallet,
    href: "/zakat",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    id: "others",
    title: "Menu Lainnya",
    description: "Lebih banyak menu seru lainnya",
    icon: LayoutGrid,
    color: "bg-slate-500/10 text-slate-600",
    isAction: true,
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

const otherMenuItems = [
  {
    title: "Kalender Islam",
    description: "Kalender Hijriyah, hari penting & jadwal puasa sunnah",
    icon: Calendar,
    href: "/calendar",
    color: "bg-cyan-500/10 text-cyan-600",
  },
  {
    title: "Baca Hadist",
    description: "Kumpulan hadist dari berbagai perawi",
    icon: Scroll,
    href: "/hadith",
    color: "bg-orange-500/10 text-orange-600",
  },
];

export default function DashboardPage() {
  const [activeMenu, setActiveMenu] = useState<"main" | "quran" | "others">("main");

  const getMenuTitle = () => {
    switch (activeMenu) {
      case "quran":
        return "Baca Al-Quran";
      case "others":
        return "Menu Lainnya";
      default:
        return "Menu Utama";
    }
  };

  const currentMenuItems = () => {
    if (activeMenu === "quran") return quranMenuItems;
    if (activeMenu === "others") return otherMenuItems;
    return mainMenuItems;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Kafein <span className="text-primary italic">Quran</span>
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
          {activeMenu !== "main" && (
            <button
              onClick={() => setActiveMenu("main")}
              className="p-1 -ml-1 hover:bg-accent rounded-full transition-colors"
              aria-label="Kembali ke menu utama"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <h2 className="text-xl font-bold">{getMenuTitle()}</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {currentMenuItems().map((item, index) => {
            const isMainAction = "id" in item && item.isAction;

            if (isMainAction) {
              return (
                <button
                  key={(item as any).id}
                  onClick={() =>
                    setActiveMenu((item as any).id === "quran" ? "quran" : "others")
                  }
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
              );
            }

            return (
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
            );
          })}
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

