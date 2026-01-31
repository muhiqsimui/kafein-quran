import React from 'react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full gap-6 px-4">
      <div className="relative flex items-center justify-center">
        {/* Decorative background glow */}
        <div className="absolute w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        
        {/* Main Spinner */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          
          {/* Inner pulse */}
          <div className="absolute inset-4 rounded-full bg-primary/20 animate-pulse flex items-center justify-center">
             <div className="w-2 h-2 rounded-full bg-primary" />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center text-center gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground/80 font-inter">
          Kafein Quran
        </h2>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
          <span className="flex h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
          <span className="flex h-2 w-2 rounded-full bg-primary animate-bounce" />
        </div>
        <p className="text-sm text-muted-foreground mt-2 font-medium">
          Mempersiapkan halaman untuk Anda...
        </p>
      </div>

      {/* Glassmorphism card effect for better aesthetics */}
      <div className="mt-8 p-4 rounded-2xl bg-muted/30 backdrop-blur-sm border border-primary/5 max-w-xs w-full">
        <div className="space-y-3">
          <div className="h-2 w-3/4 bg-primary/20 rounded-full animate-pulse" />
          <div className="h-2 w-1/2 bg-primary/10 rounded-full animate-pulse [animation-delay:0.2s]" />
          <div className="h-2 w-2/3 bg-primary/10 rounded-full animate-pulse [animation-delay:0.4s]" />
        </div>
      </div>
    </div>
  );
}
