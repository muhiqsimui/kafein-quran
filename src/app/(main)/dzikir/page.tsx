"use client";

import { useEffect, useRef, useState } from "react";
import { useDzikirStore } from "@/store/useDzikirStore";
import {
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  CircleDot,
  RefreshCw,
  History,
  Info,
  ChevronRight,
  Sparkles,
  Settings2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DzikirCategory, DzikirItem } from "@/types";

const DZIKIR_HINTS = {
  Subhanallah: "Maha Suci Allah",
  Alhamdulillah: "Segala Puji Bagi Allah",
  "Allahu Akbar": "Allah Maha Besar",
};

export default function DzikirPage() {
  const {
    counter,
    target,
    soundOn,
    mode,
    activeDzikir,
    isAssistActive,
    assistCategoryId,
    activeDzikirId,
    increment,
    decrement,
    reset,
    setTarget,
    toggleSound,
    setMode,
    setActiveDzikir,
    toggleAssist,
    setAssistCategory,
    setAssistDzikir,
  } = useDzikirStore();

  const [dzikirData, setDzikirData] = useState<DzikirCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAssistModalOpen, setIsAssistModalOpen] = useState(false);
  const [showFinishedModal, setShowFinishedModal] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/data/dzikirData.json");
        const data = await res.json();
        setDzikirData(data);
      } catch (error) {
        console.error("Failed to fetch dzikir data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Get current assist data
  const currentCategory = dzikirData.find((c) => c.id === assistCategoryId);
  const currentDzikirItem =
    currentCategory?.items.find((i) => i.id === activeDzikirId) ||
    currentCategory?.items[0];

  const currentIndex = currentCategory
    ? currentCategory.items.indexOf(currentDzikirItem as DzikirItem)
    : -1;
  const isLastItem =
    currentCategory && currentIndex === currentCategory.items.length - 1;

  // Initialize target based on mode/assist
  useEffect(() => {
    if (isAssistActive && currentDzikirItem) {
      setTarget(currentDzikirItem.target);
    } else if (mode === "cycle") {
      setTarget(33);
    }
  }, [isAssistActive, currentDzikirItem, mode, setTarget]);

  // Handle cycle mode transition
  useEffect(() => {
    if (mode === "cycle" && !isAssistActive) {
      setActiveDzikir("Subhanallah");
    }
  }, [mode, isAssistActive, setActiveDzikir]);

  // Initialize Audio Context on first interaction
  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const playBeep = (freq = 440, duration = 0.1, type: OscillatorType = "sine") => {
    if (!soundOn) return;
    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") ctx.resume();

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.0001,
        ctx.currentTime + duration
      );

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start();
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.error("Audio failed", e);
    }
  };

  const handleNextAssist = () => {
    if (!currentCategory || !currentDzikirItem) return;
    const nextItem = currentCategory.items[currentIndex + 1];
    if (nextItem) {
      setAssistDzikir(nextItem.id);
      reset();
      // Play a transition sound
      playBeep(660, 0.1, "triangle");
      if (navigator.vibrate) navigator.vibrate(40);
    } else {
      // Category finished!
      setShowFinishedModal(true);
      playBeep(880, 0.5, "triangle");
      if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 500]);
    }
  };

  const handleIncrement = () => {
    // If target already reached in assist mode, the next click moves forward
    if (isAssistActive && counter >= target) {
      handleNextAssist();
      return;
    }

    increment();
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 100);

    const nextCount = counter + 1;

    // Feedback
    if (nextCount === target) {
      // Target reached!
      playBeep(880, 0.3, "triangle");
      
      if (navigator.vibrate) {
        if (isAssistActive && isLastItem) {
          navigator.vibrate([200, 100, 200, 100, 200, 100, 500]);
        } else {
          navigator.vibrate([100, 50, 100]);
        }
      }
    } else if (nextCount > target && mode === "cycle" && !isAssistActive) {
      // Transition in cycle mode
      playBeep(660, 0.1, "triangle");
      if (navigator.vibrate) navigator.vibrate(60);
    } else {
      // Regular click
      playBeep(440, 0.05, "sine");
      if (navigator.vibrate) navigator.vibrate(40);
    }
  };

  // Pulse effect when target reached
  const isTargetReached = counter >= target;

  return (
    <div className="max-w-4xl mx-auto min-h-[85vh] flex flex-col items-center justify-center p-4 space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">📿 Tasbih Digital</h1>
        <p className="text-muted-foreground text-sm">Berdzikir dengan tenang dan fokus</p>
      </div>

      {/* Utility Controls - Moved Outside as requested */}
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleSound}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all shadow-sm",
            soundOn ? "bg-primary/10 border-primary/20 text-primary" : "bg-card border-border text-muted-foreground"
          )}
          title={soundOn ? "Matikan Suara" : "Aktifkan Suara"}
        >
          {soundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          <span className="text-xs font-semibold">{soundOn ? "On" : "Off"}</span>
        </button>
        
        <button 
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-muted-foreground hover:bg-accent transition-all shadow-sm active:scale-95"
          title="Reset Hitungan"
        >
          <RotateCcw className="w-5 h-5" />
          <span className="text-xs font-semibold">Reset</span>
        </button>

        <button 
          onClick={() => setIsAssistModalOpen(true)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all shadow-sm",
            isAssistActive ? "bg-amber-500/10 border-amber-500/20 text-amber-600" : "bg-card border-border text-muted-foreground"
          )}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-xs font-semibold">Mode Assist</span>
        </button>
      </div>

      {/* Assist Text Display */}
      {isAssistActive && currentDzikirItem && (
        <div className="w-full max-w-lg bg-card/50 backdrop-blur-xl border border-primary/20 rounded-3xl p-6 space-y-4 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary opacity-70">
              {currentCategory?.name}
            </span>
            <div className="flex gap-2">
               <button 
                onClick={handleNextAssist}
                className="p-1 hover:bg-accent rounded-full text-muted-foreground"
                title="Dzikir Selanjutnya"
               >
                 <ChevronRight className="w-4 h-4" />
               </button>
            </div>
          </div>
          <div className="text-center space-y-4">
            <div className="font-arabic text-2xl md:text-3xl leading-relaxed text-foreground drop-shadow-sm" dir="rtl">
              {currentDzikirItem.arabic}
            </div>
            <p className="text-sm text-muted-foreground italic px-4">
              "{currentDzikirItem.translation}"
            </p>
          </div>
        </div>
      )}

      {/* Mode Selector */}
      {!isAssistActive && (
        <div className="flex bg-card/50 backdrop-blur-md border border-border p-1 rounded-xl shadow-sm">
          <button
            onClick={() => setMode("manual")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              mode === "manual" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-accent"
            )}
          >
            Manual
          </button>
          <button
            onClick={() => setMode("cycle")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              mode === "cycle" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-accent"
            )}
          >
            Siklus (33x)
          </button>
        </div>
      )}

      {/* Main Counter Card */}
      <div className={cn(
        "relative w-full max-w-sm aspect-square flex flex-col items-center justify-center rounded-[3.5rem] border-4 transition-all duration-500",
        isTargetReached 
          ? "border-primary bg-primary/5 shadow-[0_0_50px_rgba(var(--primary-rgb),0.2)]" 
          : "border-border bg-card/30 backdrop-blur-xl shadow-2xl"
      )}>
        {/* Info */}
        <div className="absolute top-12 text-center animate-in slide-in-from-top-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary drop-shadow-sm">
            {isAssistActive ? currentDzikirItem?.title : activeDzikir}
          </p>
          {!isAssistActive && (
            <p className="text-[10px] text-muted-foreground mt-1 opacity-70">
              {DZIKIR_HINTS[activeDzikir as keyof typeof DZIKIR_HINTS]}
            </p>
          )}
        </div>

        {/* Counter Display */}
        <div className={cn(
          "text-9xl font-black tabular-nums transition-all duration-700",
          isAnimating ? "scale-105" : "scale-100",
          isTargetReached ? "text-primary drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" : "text-foreground"
        )}>
          {counter}
        </div>

        {/* Target Progress */}
        <div className="absolute bottom-16 flex flex-col items-center gap-2">
          <div className="bg-accent/50 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider">
            {counter} / {target}
          </div>
          {isTargetReached && (
            <div className="flex flex-col items-center">
               <span className="text-[10px] text-primary font-bold animate-bounce uppercase tracking-widest">
                Target Tercapai!
              </span>
              {isAssistActive && (
                 <button 
                  onClick={handleNextAssist}
                  className="mt-2 text-[10px] font-bold text-amber-600 hover:underline flex items-center gap-1"
                 >
                   Lanjut ke berikutnya <ChevronRight className="w-3 h-3" />
                 </button>
              )}
            </div>
          )}
        </div>

        {/* Hidden Increment Area (Full Card) */}
        <button
          onClick={handleIncrement}
          className="absolute inset-0 rounded-[3.5rem] cursor-pointer touch-none active:bg-primary/5 transition-colors"
          aria-label="Increment counter"
        />
      </div>

      {/* Secondary Controls - Simplified */}
      {!isAssistActive && (
        <div className="w-full max-w-sm grid grid-cols-2 gap-4">
          <div className="bg-card/50 backdrop-blur-md border border-border p-4 rounded-3xl flex flex-col items-center gap-3 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Target</span>
            <div className="flex items-center gap-4">
               <button 
                  onClick={() => setTarget(Math.max(1, target - 1))}
                  className="p-1 rounded-full hover:bg-accent transition-colors"
               >
                 <ChevronDown className="w-4 h-4" />
               </button>
               <span className="text-xl font-bold min-w-[2rem] text-center">{target}</span>
               <button 
                  onClick={() => setTarget(target + 1)}
                  className="p-1 rounded-full hover:bg-accent transition-colors"
               >
                 <ChevronUp className="w-4 h-4" />
               </button>
            </div>
            <div className="flex gap-2">
              {[33, 99, 100].map((t) => (
                <button
                  key={t}
                  onClick={() => setTarget(t)}
                  className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold border transition-all",
                    target === t ? "bg-primary border-primary text-primary-foreground" : "border-border hover:bg-accent"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-md border border-border p-4 rounded-3xl flex flex-col items-center gap-3 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Koreksi</span>
            <div className="flex items-center gap-2">
              <button
                onClick={decrement}
                className="p-3 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-all active:scale-90"
                title="Kurangi"
              >
                <ChevronDown className="w-6 h-6" />
              </button>
            </div>
            <span className="text-[10px] text-muted-foreground text-center opacity-70">Tekan jika berlebih</span>
          </div>
        </div>
      )}

      {/* Assist Mode Modal */}
      {isAssistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
             <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <Sparkles className="w-5 h-5 text-amber-500" />
                   <h2 className="text-lg font-bold">Pengaturan Assist</h2>
                </div>
                <button onClick={() => setIsAssistModalOpen(false)} className="p-2 hover:bg-accent rounded-full">
                   <X className="w-5 h-5" />
                </button>
             </div>
             
             <div className="p-6 overflow-y-auto space-y-6">
                <div className="flex items-center justify-between p-4 bg-accent/30 rounded-2xl border border-primary/10">
                   <div>
                      <p className="font-bold text-sm">Aktifkan Mode Assist</p>
                      <p className="text-xs text-muted-foreground">Tampilkan teks dzikir sahih</p>
                   </div>
                   <button 
                    onClick={toggleAssist}
                    className={cn(
                      "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      isAssistActive ? "bg-primary" : "bg-muted"
                    )}
                   >
                     <span className={cn(
                       "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                       isAssistActive ? "translate-x-5" : "translate-x-0"
                     )} />
                   </button>
                </div>

                {isAssistActive && (
                  <div className="space-y-4 animate-in slide-in-from-bottom-2">
                     <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-2">Pilih Kategori</p>
                     <div className="grid grid-cols-1 gap-2">
                        {dzikirData.map((cat: DzikirCategory) => (
                           <button
                            key={cat.id}
                            onClick={() => setAssistCategory(cat.id)}
                            className={cn(
                              "p-4 rounded-2xl border text-left transition-all",
                              assistCategoryId === cat.id 
                                ? "border-primary bg-primary/5 ring-1 ring-primary" 
                                : "border-border hover:bg-accent"
                            )}
                           >
                             <p className="font-bold text-sm">{cat.name}</p>
                             <p className="text-[10px] text-muted-foreground mt-1">{cat.items.length} Dzikir Sahih</p>
                           </button>
                        ))}
                     </div>
                  </div>
                )}
             </div>

             <div className="p-6 border-t border-border bg-accent/10">
                <button 
                  onClick={() => setIsAssistModalOpen(false)}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform"
                >
                  Selesai
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Finished Modal */}
      {showFinishedModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-500">
          <div className="w-full max-w-sm bg-card border border-primary/20 rounded-[3rem] shadow-2xl p-8 text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-10 h-10 text-primary animate-pulse" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Masa Allah!</h2>
              <p className="text-muted-foreground">Anda telah menyelesaikan seluruh rangkaian dzikir ini.</p>
            </div>
            <div className="pt-4  space-y-3">
              <button 
                onClick={() => {
                  setShowFinishedModal(false);
                  setAssistDzikir(currentCategory?.items[0].id || null);
                  reset();
                }}
                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-xl shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <RefreshCw className="w-5 h-5" />
                Ulangi Kategori
              </button>
              <button 
                onClick={() => {
                  setShowFinishedModal(false);
                  toggleAssist();
                }}
                className="w-full py-4 bg-secondary text-secondary-foreground rounded-2xl font-bold hover:bg-accent transition-all"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guide/Hint */}
      <div className="text-center text-[10px] text-muted-foreground max-w-xs leading-relaxed opacity-60">
        Klik di mana saja pada kotak besar untuk menambah hitungan. Assist membantu anda menghafal dzikir sesuai sunnah.
      </div>
    </div>
  );
}
