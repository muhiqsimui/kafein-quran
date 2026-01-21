"use client";

import { X, Save, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface BookmarkNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: string) => void;
  initialNote?: string;
  verseKey: string;
}

export function BookmarkNoteDialog({
  isOpen,
  onClose,
  onSave,
  initialNote = "",
  verseKey,
}: BookmarkNoteDialogProps) {
  const [note, setNote] = useState(initialNote);

  useEffect(() => {
    if (isOpen) {
      setNote(initialNote);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, initialNote]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-x-4 top-[20%] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[500px] bg-card border border-border rounded-2xl shadow-2xl z-[70] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Catatan Ayat</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="text-sm text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
            Tambahkan catatan atau pengingat untuk Ayat <span className="font-bold text-primary">{verseKey}</span>. Catatan ini hanya tersimpan di perangkat Anda.
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Tulis catatan Anda di sini..."
            className="w-full h-40 p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none text-sm"
            autoFocus
          />
        </div>

        <div className="p-6 border-t border-border bg-muted/30 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border hover:bg-accent transition-colors font-medium text-sm"
          >
            Batal
          </button>
          <button
            onClick={() => {
              onSave(note);
              onClose();
            }}
            className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium text-sm flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Simpan Catatan
          </button>
        </div>
      </div>
    </>
  );
}
