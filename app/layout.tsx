import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Space_Grotesk } from "next/font/google"; // [1] Import next/font
import "./globals.css";

// [2] Configure fonts
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
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
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${space.variable} scroll-smooth`} suppressHydrationWarning>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                try {
                  if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              `,
            }}
          />
        </head>
        <body className="bg-background text-foreground antialiased selection:bg-blue-500/30 font-sans transition-colors duration-500">
          <ClerkProvider>
            <main className="min-h-screen">
              {children}
            </main>
          </ClerkProvider>
        </body>
      </html>
  );
}