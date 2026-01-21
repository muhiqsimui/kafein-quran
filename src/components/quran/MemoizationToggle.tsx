"use client";

import { useSettingsStore } from "@/store/useSettingsStore";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export function MemoizationToggle() {
  const { memoizationMode, isTextHidden, toggleTextVisibility } = useSettingsStore();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Only show on Quran reading pages
  const isReadingPage = 
    /^\/\d+$/.test(pathname) || 
    pathname.startsWith("/surah") || 
    pathname.startsWith("/juz") || 
    pathname.startsWith("/page") || 
    pathname.startsWith("/ayah");

  if (!memoizationMode || !isReadingPage) return null;

  return (
    <div className="fixed top-1/2 -translate-y-1/2 right-4 md:right-auto md:left-72 z-50 animate-in fade-in slide-in-from-right-4 md:slide-in-from-left-4 duration-500">
      <button
        onClick={toggleTextVisibility}
        className={cn(
          "flex items-center justify-center w-12 h-12 rounded-full border shadow-lg transition-all duration-200",
          "bg-background/95 backdrop-blur-md border-primary/20",
          "hover:bg-accent hover:border-primary/50 active:scale-90",
          "shadow-primary/5 hover:shadow-primary/10"
        )}
        title={isTextHidden ? "Tampilkan Bacaan" : "Sembunyikan Bacaan"}
      >
        {isTextHidden ? (
          <EyeOff className="w-6 h-6 text-muted-foreground" />
        ) : (
          <Eye className="w-6 h-6 text-primary" />
        )}
      </button>
    </div>
  );
}
