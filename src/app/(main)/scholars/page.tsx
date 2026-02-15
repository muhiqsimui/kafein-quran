import { Suspense } from "react";
import ScholarsIndex from "@/components/scholars/ScholarsIndex";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Profil Perawi & Ulama Hadis - Kafein Quran",
  description: "Database biografi perawi hadis, riwayat hidup, sanad keilmuan, dan derajat kredibilitas para ulama hadis.",
};

export default function ScholarsPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center py-20 min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <ScholarsIndex />
    </Suspense>
  );
}
