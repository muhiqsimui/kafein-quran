import { Suspense } from "react";
import ScholarsIndex from "@/components/scholars/ScholarsIndex";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Database Ulama & Perawi Hadis - Kafein Quran",
  description:
    "Database ini mencakup lebih dari 24 ribu profil ulama dan perawi hadis yang dikompilasi dari berbagai kitab rujukan utama Ilmu Rijalul Hadis.",
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
