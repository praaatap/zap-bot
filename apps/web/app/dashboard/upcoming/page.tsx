"use client";

import Link from "next/link";
import { CalendarCheck2, Sparkles, ArrowLeft, Calendar, LayoutDashboard, ChevronRight } from "lucide-react";
import UpcomingRecordingPanel from "../UpcomingRecordingPanel";

export default function UpcomingPage() {
  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-[#09090b] text-zinc-100 selection:bg-blue-500/30 font-sans">
      
      {/* THE "DOTI" BACKGROUND GRID */}
      <div className="absolute inset-0 z-0 opacity-[0.15] [background-image:radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-12 space-y-12">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Live Queue</span>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-white">
              Upcoming <span className="text-zinc-500">Events</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/30">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" strokeWidth={1.5} />
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-tighter">Sync Active</span>
          </div>
        </header>

        {/* Quick Actions - Simple & Clean */}
        <nav className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { label: "Calendar", sub: "Temporal Grid", href: "/dashboard/calendar", icon: Calendar },
            { label: "Recordings", sub: "Session Vault", href: "/dashboard/recordings", icon: LayoutDashboard },
            { label: "Back", sub: "Control Deck", href: "/dashboard", icon: ArrowLeft },
          ].map((item) => (
            <Link 
              key={item.label}
              href={item.href}
              className="group flex items-center justify-between p-5 rounded-xl border border-zinc-800/50 bg-zinc-900/10 transition-all hover:border-zinc-700 hover:bg-zinc-900/30"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 group-hover:text-blue-400 group-hover:border-blue-500/20 transition-all">
                  <item.icon size={18} strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-200">{item.label}</div>
                  <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-tight">{item.sub}</div>
                </div>
              </div>
              <ChevronRight size={14} className="text-zinc-700 group-hover:text-zinc-400 transition-colors" />
            </Link>
          ))}
        </nav>

        {/* Recording Panel Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
            <h2 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <CalendarCheck2 size={14} className="text-blue-500" strokeWidth={2} />
              Scheduled Operations
            </h2>
          </div>
          
          <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/5 p-6 min-h-[300px]">
            <UpcomingRecordingPanel />
          </div>
        </section>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
      `}</style>
    </div>
  );
}