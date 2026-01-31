import { X, Share2, Copy, Download, Check, Link2, FileText, Loader2, Maximize2, Type, Languages, Palette } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useAyahCanvas, ShareTheme } from "@/hooks/useAyahCanvas";

interface ShareAyahDialogProps {
  isOpen: boolean;
  onClose: () => void;
  chapterName: string;
  ayahNumber: number;
  ayahKey: string;
  textArabic?: string;
  translation?: string;
  note?: string;
}

const THEME_OPTIONS: { id: ShareTheme; label: string; colors: string[] }[] = [
  { id: 'midnight', label: 'Midnight', colors: ['#020617', '#0f172a', '#1e293b'] },
  { id: 'emerald', label: 'Emerald', colors: ['#064e3b', '#065f46', '#047857'] },
  { id: 'sunset', label: 'Sunset', colors: ['#4c1d95', '#701a75', '#831843'] },
  { id: 'ocean', label: 'Ocean', colors: ['#1e3a8a', '#1d4ed8', '#1e40af'] },
  { id: 'rose', label: 'Rose', colors: ['#881337', '#9f1239', '#4c0519'] },
  { id: 'minimal', label: 'Minimal', colors: ['#ffffff', '#f8fafc', '#f1f5f9'] },
];

export function ShareAyahDialog({
  isOpen,
  onClose,
  chapterName,
  ayahNumber,
  ayahKey,
  textArabic,
  translation,
  note,
}: ShareAyahDialogProps) {
  const [includeNote, setIncludeNote] = useState(false);
  const [showArabic, setShowArabic] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<ShareTheme>('midnight');
  
  const [isCopied, setIsCopied] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Custom Hook untuk handle canvas rendering
  const { previewUrl, isGenerating, generateImage } = useAyahCanvas();

  // 1. Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullScreen) {
          setIsFullScreen(false);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose, isFullScreen]);

  // 2. Trigger Generate Gambar
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      generateImage({ 
        chapterName, 
        ayahNumber, 
        textArabic, 
        translation, 
        note, 
        includeNote,
        showArabic,
        showTranslation,
        theme: selectedTheme
      });
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen, includeNote, showArabic, showTranslation, selectedTheme, generateImage, chapterName, ayahNumber, textArabic, translation, note]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/share/${ayahKey.replace(":", "-")}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    link.download = `kafein-quran-${ayahKey.replace(":", "-")}.png`;
    link.href = previewUrl;
    link.click();
  };

  const handleNativeShare = async () => {
    if (!previewUrl) return;
    try {
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const file = new File([blob], `ayah-${ayahKey}.png`, { type: "image/png" });

      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: `QS ${chapterName}:${ayahNumber}`,
          text: `Baca ayat ini di Kafein Quran`,
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
    <>
      <div 
        role="dialog" 
        aria-modal="true" 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      >
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={onClose}
        />

        <div className="relative w-full max-w-5xl h-[calc(100dvh-2rem)] sm:h-[650px] bg-card border border-border rounded-3xl shadow-2xl z-[110] flex flex-col sm:flex-row overflow-hidden animate-in zoom-in-95 duration-300">
          
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-20 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full sm:hidden transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* --- 1. PREVIEW SECTION --- */}
          <div className="flex-1 bg-muted/30 p-6 flex flex-col items-center justify-center relative min-h-[40%] sm:min-h-full overflow-hidden border-b sm:border-b-0 sm:border-r border-border">
            <div className="absolute top-6 left-6 z-10 hidden sm:block">
              <span className="px-3 py-1 bg-background/80 backdrop-blur border border-border rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                Preview Story
              </span>
            </div>
            
            {isGenerating ? (
              <div className="flex flex-col items-center gap-4 animate-pulse text-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm font-medium text-muted-foreground">Meracik Gambar...</p>
              </div>
            ) : previewUrl ? (
              <div 
                className="relative h-full w-full flex items-center justify-center group cursor-zoom-in"
                onClick={() => setIsFullScreen(true)}
              >
                  <img 
                    src={previewUrl} 
                    alt="Ayah Preview" 
                    className="max-h-full max-w-full object-contain rounded-lg shadow-2xl border border-border/50 transition-all duration-300" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-lg pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-medium">
                      <Maximize2 className="w-3 h-3" />
                      Perbesar
                    </div>
                  </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center">Gagal memuat preview</p>
            )}
          </div>

          {/* --- 2. CONTROLS SECTION --- */}
          <div className="w-full sm:w-[400px] bg-card flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Share2 className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold">Bagikan Ayat</h2>
              </div>
              <button
                onClick={onClose}
                className="hidden sm:flex p-2 hover:bg-accent rounded-xl transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Theme Selector */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-primary" />
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Tema Latar</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {THEME_OPTIONS.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      className={cn(
                        "relative flex flex-col items-center gap-2 p-2 rounded-xl border transition-all",
                        selectedTheme === theme.id 
                          ? "border-primary bg-primary/5 ring-1 ring-primary" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div 
                        className="w-full h-12 rounded-lg"
                        style={{ 
                          background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]}, ${theme.colors[2] || theme.colors[1]})`,
                          border: theme.id === 'minimal' ? '1px solid #e2e8f0' : 'none'
                        }}
                      />
                      <span className="text-[10px] font-bold">{theme.label}</span>
                      {selectedTheme === theme.id && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visibility Controls */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-primary" />
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Tampilan</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <button
                    onClick={() => setShowArabic(!showArabic)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all",
                      showArabic ? "bg-primary/5 border-primary" : "bg-muted/50 border-border opacity-60"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                      showArabic ? "bg-primary border-primary" : "border-muted-foreground"
                    )}>
                      {showArabic && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-xs font-semibold">Teks Arab</span>
                  </button>

                  <button
                    onClick={() => setShowTranslation(!showTranslation)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all",
                      showTranslation ? "bg-primary/5 border-primary" : "bg-muted/50 border-border opacity-60"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                      showTranslation ? "bg-primary border-primary" : "border-muted-foreground"
                    )}>
                      {showTranslation && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-xs font-semibold">Terjemahan</span>
                  </button>
                </div>

                {note && (
                  <button
                    onClick={() => setIncludeNote(!includeNote)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-xl border transition-all",
                      includeNote ? "bg-primary/5 border-primary" : "bg-muted/50 border-border opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                        includeNote ? "bg-primary border-primary" : "border-muted-foreground"
                      )}>
                        {includeNote && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-xs font-semibold text-left">Sertakan Catatan</span>
                    </div>
                    <FileText className={cn("w-4 h-4", includeNote ? "text-primary" : "text-muted-foreground")} />
                  </button>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-2">
                  <button
                    onClick={handleNativeShare}
                    className="w-full py-4 px-6 rounded-2xl bg-primary text-primary-foreground hover:opacity-90 transition-all flex items-center justify-center gap-3 font-bold shadow-lg shadow-primary/20 active:scale-[0.98]"
                  >
                    <Share2 className="w-5 h-5" />
                    Bagikan (IG/WA)
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleDownload}
                      className="py-3 px-4 rounded-xl border border-border hover:bg-accent transition-all flex items-center justify-center gap-2 font-semibold text-xs"
                    >
                      <Download className="w-4 h-4" />
                      Simpan
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="py-3 px-4 rounded-xl border border-border hover:bg-accent transition-all flex items-center justify-center gap-2 font-semibold text-xs overflow-hidden"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      <span className="truncate">{isCopied ? 'Tersalin' : 'Link'}</span>
                    </button>
                  </div>
              </div>
            </div>

            <div className="p-4 bg-muted/30 border-t border-border mt-auto shrink-0">
               <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
                 Tip: Pilih tema dan kustomisasi sebelum membagikan ke media sosial.
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- 3. FULL SCREEN OVERLAY --- */}
      {isFullScreen && previewUrl && (
        <div 
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsFullScreen(false)}
        >
          <button
            onClick={() => setIsFullScreen(false)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[210]"
          >
            <X className="w-8 h-8" />
          </button>

          <img 
            src={previewUrl} 
            alt="Full Preview" 
            className="max-w-full max-h-[90vh] object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
