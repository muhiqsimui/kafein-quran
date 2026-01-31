import React from 'react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full gap-4 py-12">
      <div className="relative">
        {/* Modern concentric spinner */}
        <div className="w-16 h-16 rounded-full border-4 border-primary/10" />
        <div className="absolute top-0 w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <div className="absolute top-2 left-2 w-12 h-12 rounded-full border-4 border-primary/20 border-b-transparent animate-[spin_1.5s_linear_infinite_reverse]" />
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <p className="text-lg font-medium text-foreground/70 animate-pulse">
          Sedang menyiapkan ayat...
        </p>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary/80 animate-bounce" />
        </div>
      </div>

      {/* Modern skeleton-like loader for better visual continuity */}
      <div className="w-full max-w-md mt-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-xl border border-border/50 space-y-3 opacity-50">
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-muted rounded-md animate-pulse" />
              <div className="h-4 w-12 bg-muted rounded-md animate-pulse" />
            </div>
            <div className="h-10 w-full bg-muted/50 rounded-md animate-pulse" />
            <div className="h-4 w-full bg-muted/30 rounded-md animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
