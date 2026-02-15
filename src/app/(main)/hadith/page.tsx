import HadithIndex from "@/components/hadith/HadithIndex";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Ensiklopedia Hadis - Kafein Quran",
  description:
    "Ensiklopedia Terjemahan Hadis-hadis Nabi lengkap dengan teks Arab, terjemahan Indonesia, takhrij, hikmah, dan data perawi.",
};

export default function HadithPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <HadithIndex />
    </Suspense>
  );
}
