import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Stethoscope } from "lucide-react";
import "./globals.css";
import { AuthProvider } from "@/lib/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "F2 White Coat Club — Closed-Loop Digital Ledger for Doctors",
  description: "Closed-loop internal wallet system for verified doctors to pay hospital canteens, food courts, and pharmacy outlets via static QR codes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
        <AuthProvider>
          <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
              <Link href="/" className="flex items-center gap-2 text-indigo-600 transition-colors hover:text-indigo-700">
                <Stethoscope className="h-6 w-6" />
                <span className="text-xl font-bold tracking-tight text-slate-900">White Coat Club</span>
              </Link>
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
