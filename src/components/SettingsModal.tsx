"use client";

import { useSettingsStore } from "@/store/useSettingsStore";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, Type, Eye, Volume2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface Qari {
  id: string;
  name: string;
  arabic_name?: string;
  reciter_id: string;
  description?: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const {
    arabicFontSize,
    setArabicFontSize,
    translationFontSize,
    setTranslationFontSize,
    showWordByWord,
    setShowWordByWord,
    selectedQariId,
    selectedQari,
    setSelectedQari,
    fontFamily,
    setFontFamily,
  } = useSettingsStore();

  const [qaris, setQaris] = useState<Qari[]>([]);
  const [loading, setLoading] = useState(true);

  const themes = [
    { id: "light", label: "Terang", icon: Sun },
    { id: "dark", label: "Gelap", icon: Moon },
    { id: "system", label: "Sistem", icon: Monitor },
  ];
  
  const fonts = [
    { id: "uthman-hafs", label: "Uthmanic Hafs", fontClass: "font-hafs" },
    { id: "lpmq", label: "Isep Misbah (LPMQ)", fontClass: "font-lpmq" },
    { id: "uthman-naskh", label: "Uthman Taha Naskh", fontClass: "font-naskh" },
  ];

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

  // Initialize with 128kbps qaris
  useEffect(() => {
    setQaris(qaris128kbps);
    setLoading(false);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 sm:inset-auto sm:right-4 sm:top-16 sm:w-96 bg-card border border-border rounded-2xl shadow-2xl z-50 flex flex-col max-h-[90vh] sm:max-h-[calc(100vh-100px)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <h1 className="text-xl font-bold">Pengaturan</h1>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-6 p-6">
          {/* Theme Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-sm">Tema Aplikasi</h2>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all text-xs",
                    theme === t.id
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-background hover:bg-accent"
                  )}
                >
                  <t.icon className="w-5 h-5" />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Font Size Section */}
          <section className="space-y-4 border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <Type className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-sm">Ukuran Font</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
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
                  className="p-3 bg-muted/30 rounded-lg text-center font-arabic text-sm"
                  style={{ fontSize: `${Math.min(arabicFontSize, 32)}px` }}
                >
                  بِسْمِ اللّٰهِ
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
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
                  onChange={(e) =>
                    setTranslationFontSize(Number(e.target.value))
                  }
                  className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                />
                <p
                  style={{ fontSize: `${translationFontSize}px` }}
                  className="text-center px-2 text-muted-foreground"
                >
                  In the name of Allah...
                </p>
              </div>
            </div>
          </section>

          {/* Font Selection Section */}
          <section className="space-y-4 border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <Type className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-sm">Jenis Font Arab</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {fonts.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFontFamily(f.id)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-all text-left",
                    fontFamily === f.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border bg-background hover:bg-accent"
                  )}
                >
                  <div className="space-y-1">
                    <span className="text-xs font-medium block">{f.label}</span>
                    <span className={cn(f.fontClass, "text-xl")} dir="rtl">
                      بِسْمِ اللَّهِ
                    </span>
                  </div>
                  {fontFamily === f.id && (
                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Qori Section */}
          <section className="space-y-4 border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-sm">Qori Pembacaan</h2>
            </div>

            {loading ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Memuat daftar qori...
              </div>
            ) : (
              <select
                value={selectedQariId}
                onChange={(e) => {
                  const qariId = e.target.value;
                  const qari = qaris.find((q) => q.id === qariId);
                  if (qari) {
                    setSelectedQari(qariId, qari);
                  }
                }}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              >
                {qaris.map((qari) => (
                  <option key={qari.id} value={qari.id}>
                    {qari.name}
                    {qari.arabic_name ? ` (${qari.arabic_name})` : ""}
                  </option>
                ))}
              </select>
            )}
          </section>

          {/* Display Section */}
          <section className="space-y-4 border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-sm">Tampilan</h2>
            </div>

            <div className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Kata per Kata</div>
                <div className="text-xs text-muted-foreground">
                  Terjemahan setiap kata
                </div>
              </div>
              <button
                onClick={() => setShowWordByWord(!showWordByWord)}
                className={cn(
                  "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  showWordByWord ? "bg-primary" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    showWordByWord ? "translate-x-4" : "translate-x-0"
                  )}
                />
              </button>
            </div>

          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 text-center text-xs text-muted-foreground bg-background/50 sticky bottom-0">
          Pengaturan disimpan otomatis ✓
        </div>
      </div>
    </>
  );
}
