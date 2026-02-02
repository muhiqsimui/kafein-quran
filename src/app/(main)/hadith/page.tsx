import { getNarrators } from "@/lib/hadith-service";
import HadithIndex from "@/components/hadith/HadithIndex";

export const metadata = {
  title: "Baca Hadist - Kafein Quran",
  description: "Daftar perawi hadist lengkap dengan ribuan hadist sahih",
};

export default async function HadithPage() {
  const narrators = await getNarrators();

  return <HadithIndex narrators={narrators} />;
}
