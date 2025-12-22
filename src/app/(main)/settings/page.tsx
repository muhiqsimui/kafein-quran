'use client';

import { useSettingsStore } from '@/store/useSettingsStore';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor, Type, Languages, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { 
    arabicFontSize, setArabicFontSize, 
    translationFontSize, setTranslationFontSize,
    showWordByWord, setShowWordByWord
  } = useSettingsStore();

  const themes = [
    { id: 'light', label: 'Terang', icon: Sun },
    { id: 'dark', label: 'Gelap', icon: Moon },
    { id: 'system', label: 'Sistem', icon: Monitor },
  ];

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
                <label className="text-muted-foreground">Teks Arab ({arabicFontSize}px)</label>
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
                بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <label className="text-muted-foreground">Terjemahan ({translationFontSize}px)</label>
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
              <p style={{ fontSize: `${translationFontSize}px` }} className="text-center px-4">
                Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 border-t border-border pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-primary" />
            <h2 className="font-semibold px-1">Tampilan</h2>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
            <div className="space-y-0.5">
              <div className="font-medium">Kata per Kata</div>
              <div className="text-xs text-muted-foreground">Tampilkan terjemahan untuk setiap kata</div>
            </div>
            <button
              onClick={() => setShowWordByWord(!showWordByWord)}
              className={cn(
                "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                showWordByWord ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  showWordByWord ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>


        </div>
      </section>
      
      <footer className="pt-8 text-center text-xs text-muted-foreground">
        Lumina Quran v1.0.0 • Dibuat dengan cinta.
      </footer>
    </div>
  );
}
