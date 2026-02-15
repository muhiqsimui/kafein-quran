import { getHadisById } from "@/lib/hadith-service";
import HadithDetailPage from "@/components/hadith/HadithDetailPage";
import { notFound, redirect } from "next/navigation";

interface HadithPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: HadithPageProps) {
  const { slug } = await params;
  const id = parseInt(slug);

  if (isNaN(id)) return { title: "Cari Hadis - Kafein Quran" };

  try {
    const hadis = await getHadisById(id);
    const previewText =
      hadis.text.id.length > 150
        ? hadis.text.id.substring(0, 150) + "..."
        : hadis.text.id;

    return {
      title: `Hadis #${hadis.id} - Ensiklopedia Hadis`,
      description: previewText,
      openGraph: {
        title: `Hadis #${hadis.id} - Kafein Quran`,
        description: previewText,
      },
    };
  } catch (error) {
    console.error("Metadata error:", error);
    return { title: "Hadis - Kafein Quran" };
  }
}

export default async function HadithByIdPage({ params }: HadithPageProps) {
  const { slug } = await params;
  const id = parseInt(slug);

  // Handle legacy narrator slugs or invalid IDs by searching
  if (isNaN(id)) {
    redirect(`/hadith?q=${encodeURIComponent(slug)}`);
  }

  try {
    const hadis = await getHadisById(id);
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <HadithDetailPage hadis={hadis} />
      </div>
    );
  } catch (error) {
    console.error("Page error:", error);
    // If not found, show 404
    notFound();
  }
}
