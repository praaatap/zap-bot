"use client";

import MeetingHistoryPanel from "../MeetingHistoryPanel";
import { Monitor } from "lucide-react";

export default function HistoryPage() {
  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-[#09090b] text-zinc-100 selection:bg-blue-500/30 font-sans">
      
      {/* THE "DOTI" BACKGROUND GRID */}
      <div className="absolute inset-0 z-0 opacity-[0.15] [background-image:radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-12 space-y-10">
        {/* Header Section */}
        <header className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Historical Intelligence</span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-white">
            Meeting <span className="text-zinc-500">History</span>
          </h1>
          <p className="text-sm text-zinc-500 max-w-md">Review past sessions, revisit insights, and manage your archived recordings.</p>
        </header>

        {/* Panel Content */}
        <div className="mt-8">
          <MeetingHistoryPanel />
        </div>
      </div>
    </div>
  );
}