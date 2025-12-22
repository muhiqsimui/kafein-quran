import Link from 'next/link';
import { Book, Layers, List, Bookmark, Search, Settings } from 'lucide-react';
import { LastReadCard } from '@/components/quran/LastReadCard';

const menuItems = [
  {
    title: 'Baca per Surah',
    description: 'Daftar surah dari Al-Fatihah sampai An-Nas',
    icon: Book,
    href: '/surah',
    color: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    title: 'Baca per Ayat',
    description: 'Tampilan fokus satu ayat per halaman',
    icon: List,
    href: '/ayah',
    color: 'bg-blue-500/10 text-blue-600',
  },
  {
    title: 'Baca per Halaman',
    description: 'Tampilan Al-Quran mushaf per halaman',
    icon: Layers,
    href: '/page/1',
    color: 'bg-amber-500/10 text-amber-600',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Lumina <span className="text-primary italic">Quran</span>
        </h1>
        <p className="text-muted-foreground">
          Selamat datang kembali! Lanjutkan bacaan Anda.
        </p>
      </header>

      <LastReadCard />

      <section className="grid grid-cols-1 gap-4">
        <h2 className="text-xl font-bold px-1">Menu Utama</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all"
            >
              <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed italic">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </section>


      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/bookmarks" className="p-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors flex flex-col items-center gap-2">
          <Bookmark className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">Bookmark</span>
        </Link>
        <Link href="/search" className="p-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors flex flex-col items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">Cari</span>
        </Link>
        <Link href="/settings" className="p-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors flex flex-col items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">Pengaturan</span>
        </Link>
        <div className="p-4 rounded-xl border border-border bg-card/50 flex flex-col items-center gap-2 opacity-50 cursor-not-allowed">
          <div className="w-5 h-5 rounded-full bg-primary/20" />
          <span className="text-sm font-medium">Segera</span>
        </div>
      </section>
    </div>
  );
}
