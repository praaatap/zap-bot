"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  Link as LinkIcon,
  Loader2,
  Play,
  Users,
  Video,
  ChevronRight,
  History,
  Monitor
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useZapStore } from "@/lib/store";
import type { Meeting } from "@/lib/store";

export default function MeetingsPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  const {
    upcomingMeetings,
    pastMeetings,
    isLoadingMeetings,
    setUpcomingMeetings,
    setPastMeetings,
    setLoadingMeetings
  } = useZapStore();

  useEffect(() => {
    async function fetchMeetings() {
      setLoadingMeetings(true);
      try {
        const upRes = await fetch("/api/meetings/upcoming-recordings");
        if (upRes.ok) {
          const upData = await upRes.json();
          if (upData.success) setUpcomingMeetings(upData.data || []);
        }

        const pastRes = await fetch("/api/meetings");
        if (pastRes.ok) {
          const pastData = await pastRes.json();
          if (pastData.success) {
            const now = new Date();
            const all: Meeting[] = pastData.data || [];
            const pastM = all.filter(m => new Date(m.endTime) < now);
            setPastMeetings(pastM);
          }
        }
      } catch (err) {
        console.error("Error fetching meetings:", err);
      } finally {
        setLoadingMeetings(false);
      }
    }

    if (upcomingMeetings.length === 0 && pastMeetings.length === 0) {
      void fetchMeetings();
    }
  }, [setLoadingMeetings, setUpcomingMeetings, setPastMeetings, upcomingMeetings.length, pastMeetings.length]);

  const currentList = activeTab === "upcoming" ? upcomingMeetings : pastMeetings;

  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-[#09090b] text-zinc-100 selection:bg-blue-500/30">
      
      {/* THE "DOTI" BACKGROUND GRID */}
      <div className="absolute inset-0 z-0 opacity-[0.15] [background-image:radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-12 space-y-10">
        
        {/* Header & Tabs */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-zinc-500">
              <Monitor size={14} strokeWidth={1.5} />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">Temporal Database</span>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-white">
              Session <span className="text-zinc-500">Archive</span>
            </h1>
          </div>

          <div className="flex p-1 bg-zinc-900/50 border border-zinc-800 rounded-xl backdrop-blur-sm">
            {["upcoming", "past"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={cn(
                  "px-6 py-2 rounded-lg text-[11px] font-medium uppercase tracking-wider transition-all",
                  activeTab === tab 
                    ? "bg-zinc-800 text-white shadow-sm" 
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {tab === "upcoming" ? "Scheduled" : "Completed"}
              </button>
            ))}
          </div>
        </header>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {isLoadingMeetings ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-zinc-500">
              <Loader2 className="animate-spin text-blue-500" size={24} strokeWidth={1.5} />
              <p className="text-[10px] font-medium uppercase tracking-widest italic">Syncing session history...</p>
            </div>
          ) : currentList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/10">
              <History className="text-zinc-800 mb-4" size={40} strokeWidth={1} />
              <p className="text-sm font-medium text-zinc-500">No session data localized for this segment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentList.map((meeting) => (
                <article
                  key={meeting.id}
                  className="group flex flex-col bg-zinc-900/20 border border-zinc-800/60 rounded-2xl p-6 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/40 hover:shadow-2xl hover:shadow-black/60"
                >
                  <div className="flex items-start justify-between mb-8">
                    <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 group-hover:text-blue-400 group-hover:border-blue-500/20 transition-all">
                      <Video size={18} strokeWidth={1.5} />
                    </div>
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-colors",
                      meeting.botScheduled || meeting.transcriptReady
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        : "bg-zinc-900/50 text-zinc-600 border-zinc-800"
                    )}>
                      {activeTab === "upcoming" 
                        ? (meeting.botScheduled ? "Bot Active" : "Manual") 
                        : (meeting.transcriptReady ? "Neural Linked" : "Raw Data")}
                    </span>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-base font-semibold text-zinc-100 line-clamp-2 leading-snug group-hover:text-white transition-colors">
                        {meeting.title || "Internal Sync"}
                      </h3>
                      <div className="flex items-center gap-4 text-[10px] font-medium text-zinc-500 uppercase tracking-tight">
                        <span className="flex items-center gap-1.5"><CalendarIcon size={12} strokeWidth={1.5} className="text-zinc-600" /> {format(new Date(meeting.startTime), "MMM do")}</span>
                        <span className="flex items-center gap-1.5"><Clock size={12} strokeWidth={1.5} className="text-zinc-600" /> {format(new Date(meeting.startTime), "h:mm a")}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-zinc-800/50">
                      <div className="flex -space-x-1.5">
                        {(meeting.participants || ["U"]).slice(0, 3).map((p, i) => (
                          <div key={i} className="w-5 h-5 rounded border border-zinc-800 bg-zinc-900 flex items-center justify-center text-[8px] font-bold text-zinc-400 uppercase ring-2 ring-zinc-950">
                            {p[0]}
                          </div>
                        ))}
                      </div>
                      <span className="text-[9px] font-semibold text-zinc-600 uppercase tracking-tighter">Verified Signals</span>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center gap-2">
                    {activeTab === "upcoming" ? (
                      meeting.meetingUrl && (
                        <a
                          href={meeting.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl bg-zinc-100 text-zinc-950 text-[11px] font-bold uppercase tracking-wider transition-transform active:scale-95"
                        >
                          Join Session
                        </a>
                      )
                    ) : (
                      <>
                        {meeting.recordingUrl ? (
                          <a
                            href={meeting.recordingUrl}
                            className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl bg-zinc-100 text-zinc-950 text-[11px] font-bold uppercase tracking-wider transition-transform active:scale-95"
                          >
                            <Play size={12} fill="currentColor" strokeWidth={0} /> Playback
                          </a>
                        ) : (
                          <div className="flex-1 h-10 flex items-center justify-center rounded-xl bg-zinc-900/50 border border-zinc-800 text-[11px] font-bold uppercase text-zinc-600">
                            Offline
                          </div>
                        )}
                        
                        {meeting.transcriptReady && (
                          <a
                            href={`/dashboard/meetings/${meeting.id}`}
                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500 active:scale-90"
                          >
                            <ChevronRight size={18} />
                          </a>
                        )}
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
      `}</style>
    </div>
  );
}