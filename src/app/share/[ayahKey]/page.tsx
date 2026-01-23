import { getVerseByKey, getChapters } from "@/lib/api";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, BookOpen } from "lucide-react";

type Props = {
  params: Promise<{ ayahKey: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ayahKey } = await params;
  const decodedKey = decodeURIComponent(ayahKey).replace("-", ":");
  const verse = await getVerseByKey(decodedKey);
  const chaptersResponse = await getChapters();
  const [surahId] = decodedKey.split(":");
  const surah = chaptersResponse.chapters.find((c) => c.id === parseInt(surahId));

  if (!verse || !surah) {
    return {
      title: "Ayat tidak ditemukan | Lumina Quran",
    };
  }

  const title = `Surah ${surah.name_simple} Ayat ${verse.verse_number}`;
  const translationText = verse.translations?.[0]?.text.replace(/<(?:.|\n)*?>/gm, "") || "";
  const description = `${verse.text_uthmani}\n\n${translationText}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [`/api/og?surah=${surah.name_simple}&ayah=${verse.verse_number}`],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { ayahKey } = await params;
  const decodedKey = decodeURIComponent(ayahKey).replace("-", ":");
  const [surahId, verseNumber] = decodedKey.split(":");

  // Redirect to the main surah page with the ayah anchor
  redirect(`/${surahId}#ayah-${verseNumber}`);

  // Fallback UI in case redirect takes time
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6" />
      <h1 className="text-2xl font-bold mb-2">Menuju Ayat...</h1>
      <p className="text-muted-foreground mb-8">Anda akan segera dialihkan ke halaman utama.</p>
      
      <Link 
        href={`/${surahId}#ayah-${verseNumber}`}
        className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-medium flex items-center gap-2"
      >
        <BookOpen className="w-4 h-4" />
        Klik jika tidak beralih
      </Link>
    </div>
  );
}
