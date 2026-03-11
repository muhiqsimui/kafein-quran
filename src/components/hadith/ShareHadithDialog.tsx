"use client";

import { X, Share2, Copy, Download, Check, Loader2, Maximize2, Type, Palette, Camera, ImagePlus } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useHadithCanvas, ShareTheme } from "@/hooks/useHadithCanvas";

interface ShareHadithDialogProps {
  isOpen: boolean;
  onClose: () => void;
  id: number;
  textArabic?: string;
  translation?: string;
  takhrij?: string;
  grade?: string;
}

const THEME_OPTIONS: { id: ShareTheme; label: string; colors: string[] }[] = [
  { id: 'midnight', label: 'Midnight', colors: ['#020617', '#0f172a', '#1e293b'] },
  { id: 'emerald', label: 'Emerald', colors: ['#064e3b', '#065f46', '#047857'] },
  { id: 'sunset', label: 'Sunset', colors: ['#4c1d95', '#701a75', '#831843'] },
  { id: 'ocean', label: 'Ocean', colors: ['#1e3a8a', '#1d4ed8', '#1e40af'] },
  { id: 'rose', label: 'Rose', colors: ['#881337', '#9f1239', '#4c0519'] },
  { id: 'minimal', label: 'Minimal', colors: ['#ffffff', '#f8fafc', '#f1f5f9'] },
  { id: 'custom', label: 'Custom', colors: ['#475569', '#334155', '#1e293b'] },
];

export function ShareHadithDialog({
  isOpen,
  onClose,
  id,
  textArabic,
  translation,
  takhrij,
  grade,
}: ShareHadithDialogProps) {
  const [showArabic, setShowArabic] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showGrade, setShowGrade] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<ShareTheme>('midnight');
  
  const [isCopied, setIsCopied] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [customBg, setCustomBg] = useState<string | null>(null);
  const [customTextColor, setCustomTextColor] = useState('#ffffff');

  const { previewUrl, isGenerating, generateImage } = useHadithCanvas();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullScreen) setIsFullScreen(false);
        else onClose();
      }
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose, isFullScreen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      generateImage({ 
        id, 
        textArabic, 
        translation, 
        takhrij,
        grade,
        showArabic,
        showTranslation,
        showGrade,
        theme: selectedTheme,
        customBg: selectedTheme === 'custom' && customBg ? customBg : undefined,
        customTextColor
      });
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen, showArabic, showTranslation, showGrade, selectedTheme, customBg, customTextColor, generateImage, id, textArabic, translation, takhrij, grade]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/hadith/${id}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    link.download = `kafein-hadis-${id}.png`;
    link.href = previewUrl;
    link.click();
  };

  const handleNativeShare = async () => {
    if (!previewUrl) return;
    try {
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const file = new File([blob], `hadis-${id}.png`, { type: "image/png" });
      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: `Hadis #${id}`,
          text: `Baca hadis ini di Kafein Quran`,
        });
      } else {
        handleDownload();
      }
    } catch (error) {
      console.error("Error sharing:", error);
      handleDownload();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

      <div className="relative w-full max-w-5xl h-[calc(100dvh-2rem)] sm:h-[650px] bg-card border border-border rounded-3xl shadow-2xl z-[110] flex flex-col sm:flex-row overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="flex-1 bg-muted/30 p-6 flex flex-col items-center justify-center relative border-b sm:border-b-0 sm:border-r border-border overflow-hidden">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-4 animate-pulse">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm font-medium text-muted-foreground">Meracik Gambar...</p>
            </div>
          ) : previewUrl ? (
            <div className="relative h-full w-full flex items-center justify-center group cursor-zoom-in" onClick={() => setIsFullScreen(true)}>
              <img src={previewUrl} alt="Hadis Preview" className="max-h-full max-w-full object-contain rounded-lg shadow-2xl border border-border/50" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-lg pointer-events-none">
                <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-medium">
                  <Maximize2 className="w-3 h-3" /> Perbesar
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Gagal memuat preview</p>
          )}
        </div>

        <div className="w-full sm:w-[400px] bg-card flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-lg font-bold flex items-center gap-3">
              <Share2 className="w-5 h-5 text-primary" /> Bagikan Hadis
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-accent rounded-xl transition-colors"><X className="w-5 h-5" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="space-y-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2"><Palette className="w-4 h-4" /> Tema Latar</p>
              <div className="grid grid-cols-3 gap-3">
                {THEME_OPTIONS.map((theme) => (
                  <button key={theme.id} onClick={() => setSelectedTheme(theme.id)} className={cn("relative flex flex-col items-center gap-2 p-2 rounded-xl border transition-all", selectedTheme === theme.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/50")}>
                    <div className="w-full h-12 rounded-lg" style={{ background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]}, ${theme.colors[2] || theme.colors[1]})`, border: theme.id === 'minimal' ? '1px solid #e2e8f0' : 'none' }} />
                    <span className="text-[10px] font-bold">{theme.label}</span>
                    {selectedTheme === theme.id && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {selectedTheme === 'custom' && (
                <div className="pt-2 flex flex-col gap-3">
                  <div className="flex gap-2">
                    <label className="flex-1 cursor-pointer" htmlFor="upload-hadith">
                      <input 
                        id="upload-hadith"
                        type="file" 
                        accept="image/*" 
                        className="sr-only" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => setCustomBg(ev.target?.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <div className="flex items-center justify-center gap-2 p-3 border border-dashed border-primary/50 bg-primary/5 rounded-xl text-xs font-bold text-primary hover:bg-primary/10 transition-colors">
                        <ImagePlus className="w-4 h-4" /> Upload Foto
                      </div>
                    </label>
                    <label className="flex-1 cursor-pointer" htmlFor="camera-hadith">
                      <input 
                        id="camera-hadith"
                        type="file" 
                        accept="image/*" 
                        capture="environment"
                        className="sr-only" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => setCustomBg(ev.target?.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <div className="flex items-center justify-center gap-2 p-3 border border-dashed border-primary/50 bg-primary/5 rounded-xl text-xs font-bold text-primary hover:bg-primary/10 transition-colors">
                        <Camera className="w-4 h-4" /> Ambil Foto
                      </div>
                    </label>
                  </div>
                  {customBg && (
                    <button onClick={() => setCustomBg(null)} className="text-[10px] text-destructive font-bold uppercase tracking-wider text-center">Hapus Latar Kustom</button>
                  )}
                </div>
              )}
            </div>

            {/* Text Color Customization */}
            <div className="space-y-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2"><Palette className="w-4 h-4" /> Warna Tulisan</p>
              <div className="flex items-center gap-4">
                <div className="flex-1 grid grid-cols-6 gap-2">
                  {['#ffffff', '#f8fafc', '#ecfdf5', '#fff7ed', '#fef2f2', '#f0f9ff'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setCustomTextColor(color)}
                      className={cn(
                        "w-8 h-8 rounded-full border border-border shadow-sm transition-transform active:scale-95",
                        customTextColor === color && "ring-2 ring-primary ring-offset-2"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="shrink-0 w-px h-8 bg-border" />
                <div className="relative group">
                  <input type="color" value={customTextColor} onChange={(e) => setCustomTextColor(e.target.value)} className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center pointer-events-none">
                    <Type className="w-2 h-2 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2"><Type className="w-4 h-4" /> Tampilan</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Arab", state: showArabic, setter: setShowArabic },
                  { label: "Terjemahan", state: showTranslation, setter: setShowTranslation },
                  { label: "Derajat/Takhrij", state: showGrade, setter: setShowGrade },
                ].map((opt) => (
                  <button key={opt.label} onClick={() => opt.setter(!opt.state)} className={cn("flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold", opt.state ? "bg-primary/5 border-primary" : "bg-muted/50 border-border opacity-60")}>
                    <div className={cn("w-3 h-3 rounded border flex items-center justify-center", opt.state ? "bg-primary border-primary" : "border-muted-foreground")}>
                      {opt.state && <Check className="w-2 h-2 text-white" />}
                    </div>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <button onClick={handleNativeShare} className="w-full py-4 px-6 rounded-2xl bg-primary text-primary-foreground hover:opacity-90 transition-all flex items-center justify-center gap-3 font-bold shadow-lg shadow-primary/20">
                <Share2 className="w-5 h-5" /> Bagikan (IG/WA)
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={handleDownload} className="py-2.5 px-4 rounded-xl border border-border hover:bg-accent transition-all flex items-center justify-center gap-2 font-semibold text-xs"><Download className="w-4 h-4" /> Simpan</button>
                <button onClick={handleCopyLink} className="py-2.5 px-4 rounded-xl border border-border hover:bg-accent transition-all flex items-center justify-center gap-2 font-semibold text-xs">
                  {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />} {isCopied ? "Tersalin" : "Link"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isFullScreen && previewUrl && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setIsFullScreen(false)}>
          <button onClick={() => setIsFullScreen(false)} className="absolute top-6 right-6 p-3 bg-white/10 text-white rounded-full"><X className="w-8 h-8" /></button>
          <img src={previewUrl} alt="Full Preview" className="max-w-full max-h-[90vh] object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
