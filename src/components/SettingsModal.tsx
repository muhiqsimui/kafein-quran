"use client";

import { useSettingsStore, MushafMode } from "@/store/useSettingsStore";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, Type, Eye, Volume2, X, Book, Brain } from "lucide-react";
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
    selectedQariId,
    setSelectedQari,
    fontFamily,
    setFontFamily,
    showTranslation,
    setShowTranslation,
    mushafMode,
    setMushafMode,
    memoizationMode,
    setMemoizationMode,
  } = useSettingsStore();

  const [qaris, setQaris] = useState<Qari[]>([]);
  const [loading, setLoading] = useState(true);

  const themes = [
    { id: "light", label: "Terang", icon: Sun },
    { id: "dark", label: "Gelap", icon: Moon },
    { id: "system", label: "Sistem", icon: Monitor },
  ];
  
  const fonts = [
    { id: "lpmq", label: "LPMQ (Standar Kemenag RI)" },
    { id: "amiri", label: "Amiri (Naskh Style)" },
    { id: "uthman-hafs", label: "Uthmanic Hafs" },
    { id: "uthman-naskh", label: "Uthman Taha Naskh" },
  ];

  const mushafOptions = [
    { id: "kemenag", label: "Kemenag RI (Indonesian Standard)" },
    { id: "uthmani", label: "Uthmani (Madinah Style)" },
  ];

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

  useEffect(() => {
    setQaris(qaris128kbps);
    setLoading(false);
  }, []);

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
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-4 sm:inset-auto sm:right-4 sm:top-16 sm:w-96 bg-card border border-border rounded-2xl shadow-2xl z-50 flex flex-col max-h-[90vh] sm:max-h-[calc(100vh-100px)] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <h1 className="text-xl font-bold">Pengaturan</h1>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 p-6 font-sans">
          {/* Mushaf Selection */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Book className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-sm">Versi Mushaf</h2>
            </div>
            
            <select
              value={mushafMode}
              onChange={(e) => setMushafMode(e.target.value as MushafMode)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors cursor-pointer"
            >
              {mushafOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </section>

          <section className="space-y-4 border-t border-border pt-4">
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

          <section className="space-y-4 border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <Type className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-sm">Jenis Font Arab</h2>
            </div>
            
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors cursor-pointer"
            >
              {fonts.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </section>

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
              </div>
            </div>
          </section>

          <section className="space-y-4 border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-sm">Tampilan</h2>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Terjemahan</div>
                </div>
                <button
                  onClick={() => setShowTranslation(!showTranslation)}
                  className={cn(
                    "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                    showTranslation ? "bg-primary" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                      showTranslation ? "translate-x-4" : "translate-x-0"
                    )}
                  />
                </button>
              </div>

              {/* Mode Menghafal */}
              <div className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  <div className="text-sm font-medium">Mode Menghafal</div>
                </div>
                <button
                  onClick={() => setMemoizationMode(!memoizationMode)}
                  className={cn(
                    "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                    memoizationMode ? "bg-primary" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                      memoizationMode ? "translate-x-4" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            </div>
          </section>

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
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors cursor-pointer"
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
        </div>

        <div className="border-t border-border p-4 text-center text-xs text-muted-foreground bg-background/50 sticky bottom-0">
          Pengaturan disimpan otomatis ✓
          
          <br/>
          
          <div className="text-[8px] mt-2">
          Lumina Quran v1.0.0 • Dibuat oleh{" "}
          <a target="__blank" href="https://github.com/muhiqsimui">
            Muhammad Iqbal atau @muhiqsimui.
          </a>
          </div>
        </div>
        
      </div>

    </>
  );
}
