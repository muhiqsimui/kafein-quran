"use client";

import { useSettingsStore } from "@/store/useSettingsStore";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, Type, Eye, Volume2, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface Qari {
  id: string;
  name: string;
  arabic_name?: string;
  reciter_id: string;
  description?: string;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const {
    arabicFontSize,
    setArabicFontSize,
    translationFontSize,
    setTranslationFontSize,
    selectedQariId,
    selectedQari,
    setSelectedQari,
    memoizationMode,
    setMemoizationMode,
    showTranslation,
    setShowTranslation,
  } = useSettingsStore();

  const [qaris, setQaris] = useState<Qari[]>([]);
  const [loading, setLoading] = useState(true);

  const themes = [
    { id: "light", label: "Terang", icon: Sun },
    { id: "dark", label: "Gelap", icon: Moon },
    { id: "system", label: "Sistem", icon: Monitor },
  ];

  // Initialize with EveryAyah reciters - verified working
  useEffect(() => {
    // Reciters dari EveryAyah API - verified working dengan 64kbps bitrate
    const qaris128kbps = [
      {
        id: "Alafasy_64kbps",
        name: "Mishary Rashid al-Afasy",
        arabic_name: "مشاري راشد العفاسي",
        reciter_id: "Alafasy_64kbps",
      },
      {
        id: "Hudhaify_64kbps",
        name: "Ali Abdur-Rahman al-Huthaify",
        arabic_name: "علي عبدالرحمن الحذيفي",
        reciter_id: "Hudhaify_64kbps",
      },
      {
        id: "Husary_64kbps",
        name: "Mahmoud al-Husary",
        arabic_name: "محمود الحصري",
        reciter_id: "Husary_64kbps",
      },
    ];

    setQaris(qaris128kbps);
    setLoading(false);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Pengaturan</h1>
        <p className="text-muted-foreground text-sm">
          Sesuaikan pengalaman membaca Anda.
        </p>
      </header>

      <section className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="w-5 h-5 text-primary" />
            <h2 className="font-semibold px-1">Tema Aplikasi</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                  theme === t.id
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-card hover:bg-accent"
                )}
              >
                <t.icon className="w-6 h-6" />
                <span className="text-xs font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 border-t border-border pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Type className="w-5 h-5 text-primary" />
            <h2 className="font-semibold px-1">Ukuran Font</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <label className="text-muted-foreground">
                  Teks Arab ({arabicFontSize}px)
                </label>
              </div>
              <input
                type="range"
                min="24"
                max="64"
                step="2"
                value={arabicFontSize}
                onChange={(e) => setArabicFontSize(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
              />
              <div
                className="p-4 bg-muted/30 rounded-lg text-center font-arabic"
                style={{ fontSize: `${arabicFontSize}px` }}
              >
                بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <label className="text-muted-foreground">
                  Terjemahan ({translationFontSize}px)
                </label>
              </div>
              <input
                type="range"
                min="12"
                max="24"
                step="1"
                value={translationFontSize}
                onChange={(e) => setTranslationFontSize(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
              />
              <p
                style={{ fontSize: `${translationFontSize}px` }}
                className="text-center px-4"
              >
                Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 border-t border-border pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-primary" />
            <h2 className="font-semibold px-1">Tampilan & Fitur</h2>
          </div>

          <div className="space-y-4">
            {/* Translation Toggle */}
            <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary font-bold text-xs">ID</div>
                <div>
                  <div className="text-sm font-semibold">Tampilkan Terjemahan</div>
                  <p className="text-xs text-muted-foreground">Tampilkan teks terjemahan di bawah ayat</p>
                </div>
              </div>
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className={cn(
                  "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  showTranslation ? "bg-primary" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    showTranslation ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {/* Memoization Mode Toggle */}
            <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Mode Menghafal</div>
                  <p className="text-xs text-muted-foreground">Aktifkan tombol bantuan untuk menyembunyikan bacaan</p>
                </div>
              </div>
              <button
                onClick={() => setMemoizationMode(!memoizationMode)}
                className={cn(
                  "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  memoizationMode ? "bg-primary" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    memoizationMode ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4 border-t border-border pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Volume2 className="w-5 h-5 text-primary" />
            <h2 className="font-semibold px-1">Qori Pembacaan (128 kbps)</h2>
          </div>

          {loading ? (
            <div className="text-center py-6 text-muted-foreground">
              Memuat daftar qori...
            </div>
          ) : (
            <div className="space-y-4">
              <select
                value={selectedQariId}
                onChange={(e) => {
                  const qariId = e.target.value;
                  const qari = qaris.find((q) => q.id === qariId);
                  if (qari) {
                    setSelectedQari(qariId, qari);
                  }
                }}
                className="w-full px-4 py-3 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              >
                {qaris.map((qari) => (
                  <option key={qari.id} value={qari.id}>
                    {qari.name}
                    {qari.arabic_name ? ` (${qari.arabic_name})` : ""}
                  </option>
                ))}
              </select>

              {selectedQari && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">
                    Qori terpilih:
                  </p>
                  <p className="font-semibold text-sm">{selectedQari.name}</p>
                  {selectedQari.arabic_name && (
                    <p className="text-sm font-arabic text-primary mt-1">
                      {selectedQari.arabic_name}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

      </section>

      <footer className="pt-8 text-center text-xs text-muted-foreground">
        Lumina Quran v1.0.0 • Dibuat oleh{" "}
        <a target="__blank" href="https://github.com/muhiqsimui">
          Muhammad Iqbal atau @muhiqsimui.
        </a>
      </footer>
    </div>
  );
}
