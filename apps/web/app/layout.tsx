import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google"; // [1] Import next/font
import "./globals.css";
import AppNavbar from "@/components/AppNavbar";
import { ClerkProvider } from "@clerk/nextjs";

// [2] Configure fonts
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Zap Bot — Meeting AI Assistant",
  description:
    "AI-powered meeting assistant that joins your meetings, records, transcribes, and summarizes everything automatically.",
  keywords: ["meeting", "AI", "assistant", "transcription", "recording", "calendar"],
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      {/* [3] Apply variable classes to HTML */}
      <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${jakarta.variable} scroll-smooth`}>
        <body className="bg-white dark:bg-black text-slate-900 dark:text-white antialiased selection:bg-cyan-500/30 font-sans transition-colors duration-500">
          <main className="min-h-screen">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}