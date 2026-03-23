"use client";

import Link from "next/link";
import { CalendarCheck2, Sparkles, ArrowLeft, Calendar, LayoutDashboard } from "lucide-react";
import UpcomingRecordingPanel from "../UpcomingRecordingPanel";

export default function UpcomingPage() {
  return (
    <div className="h-[calc(100vh-64px)] px-4 py-8 md:px-8 bg-[#030303] text-white overflow-hidden flex flex-col">
      <div className="relative mx-auto max-w-7xl w-full h-full flex flex-col space-y-8 overflow-hidden">
        {/* Header Section - Compact */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 shrink-0 relative overflow-hidden">
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                  <CalendarCheck2 className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-black tracking-widest text-blue-400 uppercase">Live Queue</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white mb-1 italic">
                UPCOMING <span className="text-blue-400">SESSIONS</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 p-1.5 shrink-0">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/20">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Active Sink</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section - Scrollable internally */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pb-10">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Link 
              href="/dashboard/calendar" 
              className="group relative rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-zinc-800 text-zinc-400 group-hover:text-blue-400">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Full Calendar</div>
                  <div className="text-[10px] text-zinc-500 uppercase font-black">Temporal view</div>
                </div>
              </div>
            </Link>

            <Link 
              href="/dashboard/recordings" 
              className="group relative rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-zinc-800 text-zinc-400 group-hover:text-blue-400">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Vault</div>
                  <div className="text-[10px] text-zinc-500 uppercase font-black">All records</div>
                </div>
              </div>
            </Link>

            <Link 
              href="/dashboard" 
              className="group relative rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-zinc-800 text-zinc-400 group-hover:text-zinc-200">
                  <ArrowLeft className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Return</div>
                  <div className="text-[10px] text-zinc-500 uppercase font-black">Control deck</div>
                </div>
              </div>
            </Link>
          </div>

          {/* Recording Panel Section */}
          <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 lg:p-8">
            <UpcomingRecordingPanel />
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
