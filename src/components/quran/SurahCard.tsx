import Link from 'next/link';
import { Chapter } from '@/types';

interface SurahCardProps {
  chapter: Chapter;
}

export function SurahCard({ chapter }: SurahCardProps) {
  return (
    <Link
      href={`/${chapter.id}`}
      className="group p-4 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/50 transition-all duration-300 flex items-center gap-4"
    >
      <div className="w-10 h-10 rounded-lg bg-secondary group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center font-bold transition-colors">
        {chapter.id}
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
          {chapter.name_simple}
        </h3>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">
          {chapter.translated_name.name} • {chapter.verses_count} Ayat
        </p>
      </div>
      <div className="text-right">
        <div className="font-arabic text-xl text-primary font-medium">
          {chapter.name_arabic}
        </div>
      </div>
    </Link>
  );
}
