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
          Sedang memuat Surah...
        </p>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary/80 animate-bounce" />
        </div>
      </div>

      {/* Surah-specific skeleton loader */}
      <div className="w-full max-w-2xl mt-8 space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4 opacity-40">
            <div className="flex justify-end">
              <div className="h-12 w-3/4 bg-muted rounded-lg animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted/60 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-muted/40 rounded animate-pulse" />
            </div>
            <div className="h-[1px] w-full bg-border" />
          </div>
        ))}
      </div>
    </div>
  );
}
