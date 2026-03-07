import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zap Bot — Meeting AI Assistant",
  description:
    "AI-powered meeting assistant that joins your meetings, records, transcribes, and summarizes everything automatically.",
  keywords: ["meeting", "AI", "assistant", "transcription", "recording", "calendar"],
};

import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
