import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { AudioBar } from "@/components/player/AudioBar";
import { MemoizationToggle } from "@/components/quran/MemoizationToggle";

import NextTopLoader from "nextjs-toploader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kafein Quran",
  description: "A high-performance Al-Quran Web Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <NextTopLoader 
          color="#10b981"
          showSpinner={false}
          shadow="0 0 10px #10b981,0 0 5px #10b981"
        />
        <Providers>
          {children}
          <AudioBar />
          <MemoizationToggle />
        </Providers>
      </body>
    </html>
  );
}
