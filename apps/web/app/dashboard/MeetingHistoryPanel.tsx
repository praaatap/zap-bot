"use client";

import { useEffect, useState } from "react";
import { 
  Clock, 
  Calendar, 
  Video, 
  CheckCircle2, 
  AlertCircle, 
  History, 
  FileText, 
  Play, 
  ArrowRight, 
  Activity,
  Sparkles,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

type PastMeeting = {
  id: string;
  title: string;
  startTime: string;
  endTime?: string;
  platform?: string;
  summary?: string;
  transcriptReady?: boolean;
  recordingUrl?: string;
  participants?: string[];
};

export default function MeetingHistoryPanel() {
  const [meetings, setMeetings] = useState<PastMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPastMeetings() {
      try {
        const res = await fetch("/api/meetings?scope=past&take=8&compact=1");
        const data = await res.json();

        if (data.success) {
          setMeetings(data.data || []);
        } else {
          setError(data.error || "Failed to fetch meeting history");
        }
      } catch (err: any) {
        console.error("Error fetching meeting history:", err);
        setError("Failed to fetch meeting history");
      } finally {
        setLoading(false);
      }
    }

    fetchPastMeetings();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-64 bg-white/5 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="p-8 rounded-[32px] bg-white/5 border border-white/10 animate-pulse">
              <div className="h-4 w-32 bg-white/5 rounded-lg mb-4" />
              <div className="h-6 w-3/4 bg-white/10 rounded-lg mb-6" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-white/5 rounded" />
                <div className="h-3 w-5/6 bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="group relative p-12 rounded-[32px] bg-white/5 border border-white/10 border-dashed backdrop-blur-xl flex flex-col items-center justify-center gap-6 transition-all hover:bg-white/8 hover:border-white/20">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500">
          <History className="w-8 h-8 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-black italic uppercase text-white tracking-widest">Zero Archives Found</p>
          <p className="text-sm font-medium text-zinc-500 max-w-xs">Your completed missions will be serialized and stored here for neural retrieval.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Retrieval Service</span>
          </div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white flex items-center gap-3">
             Past <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-violet-500">Recordings</span>
          </h2>
          <p className="text-sm font-medium text-zinc-500 italic">Extracting intelligence from completed temporal segments.</p>
        </div>
        <button className="group flex items-center gap-2 text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-[0.2em] transition-all">
          <span>Explore Archives</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {meetings.map((meeting) => (
          <a
            key={meeting.id}
            href={`/meetings/${meeting.id}`}
            className="group block relative"
          >
            <div className="relative p-8 rounded-[32px] bg-white/5 border border-white/10 hover:border-indigo-500/40 hover:bg-white/8 backdrop-blur-2xl shadow-lg transition-all duration-500 overflow-hidden group/card shadow-black/20">
              {/* Background ambient light */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover/card:bg-indigo-500/10 transition-all" />
              
              <div className="relative space-y-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-4 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-zinc-400 uppercase tracking-widest italic group-hover/card:border-white/20 transition-colors">
                        <Activity className="w-2.5 h-2.5" />
                        {(meeting.platform || "generic").replace('_', ' ')}
                      </div>
                      {meeting.transcriptReady && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400 uppercase tracking-widest italic shadow-lg shadow-emerald-500/5">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Ready
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-white group-hover/card:text-indigo-400 transition-colors leading-tight line-clamp-1 pr-6">
                      {meeting.title || "Quick Meeting"}
                    </h3>

                    <div className="flex items-center gap-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-zinc-600" />
                        {new Date(meeting.startTime).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}
                      </span>
                      <div className="w-1 h-1 rounded-full bg-zinc-800" />
                      <span className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-zinc-600" />
                        {new Date(meeting.startTime).toLocaleTimeString("en-US", { hour: 'numeric', minute: '2-digit', hour12: true })}
                      </span>
                    </div>
                  </div>
                </div>

                {meeting.summary ? (
                  <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed font-medium group-hover/card:text-zinc-200 transition-colors pr-4 italic">
                    {meeting.summary}
                  </p>
                ) : (
                  <div className="flex items-center gap-3 text-zinc-600 italic text-[10px] font-black uppercase tracking-widest">
                    <div className="p-1.5 rounded-lg bg-white/5 border border-white/5 relative">
                      <Loader2 className="w-3.5 h-3.5 animate-spin relative z-10" />
                      <div className="absolute inset-0 bg-indigo-500/10 blur-md animate-pulse rounded-full" />
                    </div>
                    Synthesis in progress...
                  </div>
                )}

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex -space-x-2">
                    {(meeting.participants || ["User"]).slice(0, 4).map((p, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-[#030303] flex items-center justify-center text-[9px] font-black text-zinc-300 shadow-xl overflow-hidden ring-1 ring-white/5 uppercase italic">
                        {p[0]?.toUpperCase()}
                      </div>
                    ))}
                    {(meeting.participants?.length || 1) > 4 && (
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 border-2 border-[#030303] flex items-center justify-center text-[9px] font-black text-indigo-400 ring-1 ring-indigo-500/20 uppercase italic">
                        +{(meeting.participants?.length || 1) - 4}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    {meeting.recordingUrl && (
                      <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-500/10 group-hover/card:scale-110 group-hover/card:bg-indigo-500 group-hover/card:text-white transition-all duration-300">
                        <Play className="w-4 h-4 fill-current transition-transform" />
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover/card:text-white transition-all italic">
                      Insights
                      <ArrowRight className="w-3 h-3 group-hover/card:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>

                {/* Status Dot Highlight */}
                <div className="absolute top-8 right-8">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full relative transition-all duration-500",
                    meeting.transcriptReady 
                      ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] scale-110" 
                      : "bg-indigo-500 animate-pulse shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                  )}>
                    <div className={cn(
                      "absolute inset-0 rounded-full blur-sm animate-ping opacity-20",
                      meeting.transcriptReady ? "bg-emerald-400" : "bg-indigo-400"
                    )} />
                  </div>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
