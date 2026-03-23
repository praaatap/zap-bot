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
  FileText,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  MoreVertical,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useZapStore } from "@/lib/store";
import type { Meeting } from "@/lib/store";

// Helper Functions
function formatMeetingDuration(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const m = Math.round((e.getTime() - s.getTime()) / 60000);
  return `${m} min`;
}

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

  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden flex flex-col bg-[#030303]">
      {/* Header Section - Compact */}
      <header className="px-6 py-6 border-b border-white/5 bg-white/2 shrink-0">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <CalendarIcon size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">MEETINGS <span className="text-blue-400">INDEX</span></h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mt-1">Archive and Scheduled Sessions</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-2xl border border-white/5">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === "upcoming" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-zinc-500 hover:text-white"
              )}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === "past" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-zinc-500 hover:text-white"
              )}
            >
              Past Records
            </button>
          </div>
        </div>
      </header>

      {/* Content Area - Scrollable */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="mx-auto max-w-7xl">
          {isLoadingMeetings ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
              <Loader2 className="animate-spin text-blue-400" size={32} />
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Reconstructing History...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(activeTab === "upcoming" ? upcomingMeetings : pastMeetings).length === 0 ? (
                <div className="col-span-full py-32 flex flex-col items-center justify-center text-center bg-white/[0.02] rounded-[40px] border border-dashed border-white/10">
                  <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-white/10 flex items-center justify-center mb-6 text-zinc-700">
                    <History size={32} />
                  </div>
                  <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px] italic">No temporal segments match your status.</p>
                </div>
              ) : (
                (activeTab === "upcoming" ? upcomingMeetings : pastMeetings).map((meeting) => (
                  <article
                    key={meeting.id}
                    className="group flex flex-col bg-white/[0.03] border border-white/5 rounded-[32px] p-6 hover:bg-white/[0.05] hover:border-white/10 transition-all flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-zinc-400">
                        <Video size={20} />
                      </div>
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                        meeting.botScheduled || meeting.transcriptReady
                          ? "bg-blue-600/10 text-blue-400 border-blue-500/20"
                          : "bg-white/5 text-zinc-500 border-white/10"
                      )}>
                        {activeTab === "upcoming" 
                          ? (meeting.botScheduled ? "Bot Armed" : "Manual") 
                          : (meeting.transcriptReady ? "Neural Complete" : "Raw Data")}
                      </div>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-lg font-black text-white italic uppercase tracking-tighter line-clamp-2">
                          {meeting.title || "Untitled Session"}
                        </h3>
                        <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><CalendarIcon size={10} className="text-blue-500" /> {format(new Date(meeting.startTime), "MMM do")}</span>
                          <span className="flex items-center gap-1.5"><Clock size={10} className="text-blue-500" /> {format(new Date(meeting.startTime), "h:mm a")}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 py-4 border-t border-white/5">
                        <div className="flex -space-x-2">
                          {(meeting.participants || ["U"]).slice(0, 3).map((p, i) => (
                            <div key={i} className="w-6 h-6 rounded-lg border-2 border-black bg-zinc-800 flex items-center justify-center text-[8px] font-black text-white uppercase">{p[0]}</div>
                          ))}
                        </div>
                        <span className="text-[10px] font-black text-zinc-600 tracking-widest uppercase">Signal Detected</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                      {activeTab === "upcoming" ? (
                        meeting.meetingUrl && (
                          <a
                            href={meeting.meetingUrl}
                            target="_blank"
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest"
                          >
                            <LinkIcon size={12} /> Join Session
                          </a>
                        )
                      ) : (
                        <div className="flex items-center gap-2 w-full">
                           {meeting.recordingUrl ? (
                            <a
                              href={meeting.recordingUrl}
                              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest"
                            >
                              <Play size={12} className="fill-current" /> Playback
                            </a>
                           ) : (
                            <div className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-600 text-center">Unrecorded</div>
                           )}
                           
                           {meeting.transcriptReady && (
                            <a
                              href={`/dashboard/meetings/${meeting.id}`}
                              className="p-3 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/20"
                            >
                              <ChevronRight size={16} />
                            </a>
                           )}
                        </div>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          )}
        </div>
      </main>

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