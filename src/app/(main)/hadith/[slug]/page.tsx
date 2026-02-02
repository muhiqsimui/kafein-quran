import { getNarrators, getPaginatedHadiths } from "@/lib/hadith-service";
import { HadithList } from "@/components/hadith/HadithList";
import { notFound } from "next/navigation";

interface HadithPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: HadithPageProps) {
  const { slug } = await params;
  const narrators = await getNarrators();
  const narrator = narrators.find((n) => n.slug === slug);

  if (!narrator) return { title: "Hadist Tidak Ditemukan" };

  return {
    title: `Hadist ${narrator.name} - Kafein Quran`,
    description: `Baca kumpulan hadist dari perawi ${narrator.name} lengkap dengan teks Arab dan terjemahan Indonesia.`,
  };
}

export default async function HadithNarratorPage({ params }: HadithPageProps) {
  const { slug } = await params;
  const narrators = await getNarrators();
  const narrator = narrators.find((n) => n.slug === slug);

  if (!narrator) {
    notFound();
  }

  const initialData = await getPaginatedHadiths(slug, 1, 20);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <HadithList
        slug={slug}
        narratorName={narrator.name}
        initialData={initialData}
      />
    </div>
  );
}
