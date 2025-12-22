import { Sidebar } from '@/components/navigation/Sidebar';
import { BottomNav } from '@/components/navigation/BottomNav';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="container mx-auto max-w-5xl px-4 py-8 md:px-8">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
