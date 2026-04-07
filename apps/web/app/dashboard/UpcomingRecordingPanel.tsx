"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Clock, Calendar, Video, AlertCircle, Loader2, RadioTower, Search, Bot, Play, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateGoogleCalendarLink } from "@/lib/calendar-links";

type UpcomingRecording = {
  id: string;
  title: string;
  startTime: string;
  endTime?: string;
  platform?: string;
  isFromCalendar?: boolean;
  botScheduled?: boolean;
  botSent?: boolean;
  botStatus?: string;
  participants?: string[];
  meetingUrl?: string;
};

type SourceFilter = "all" | "calendar" | "manual";

function UpcomingRecordingPanel() {
  const [recordings, setRecordings] = useState<UpcomingRecording[]>([]);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stoppingId, setStoppingId] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    let isCancelled = false;

    async function fetchUpcomingRecordings() {
      try {
        const params = new URLSearchParams();
        params.set("source", sourceFilter);
        if (debouncedSearchQuery.trim()) {
          params.set("q", debouncedSearchQuery.trim());
        }

        const res = await fetch(`/api/meetings/upcoming-recordings?${params.toString()}`);
        const data = await res.json();

        if (isCancelled) return;

        if (data.success) {
          setRecordings(data.data || []);
        } else {
          setError(data.error || "Failed to fetch upcoming recordings");
        }
      } catch (err) {
        if (isCancelled) return;
        console.error("Error fetching upcoming recordings:", err);
        setError("Failed to fetch upcoming recordings");
      } finally {
        if (isCancelled) return;
        setLoading(false);
      }
    }

    setLoading(true);
    fetchUpcomingRecordings();
    intervalRef.current = window.setInterval(fetchUpcomingRecordings, 5 * 60 * 1000);

    return () => {
      isCancelled = true;
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [sourceFilter, debouncedSearchQuery]);

  if (error) {
    return (
      <div className="p-8 rounded-3xl bg-red-500/5 border border-red-500/20 flex gap-4 backdrop-blur-md">
        <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
        <div>
          <h3 className="font-black text-white text-lg uppercase italic tracking-tighter">Mission Error</h3>
          <p className="text-zinc-500 mt-1">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 rounded-xl bg-red-500/10 text-red-400 text-xs font-black uppercase tracking-widest border border-red-500/20"
          >
            Reconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Controls: Search and Filter Row */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-6">
        <div className="relative flex-1 w-full max-w-lg group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#424754]/40 group-focus-within:text-[#0058be] transition-colors" strokeWidth={2.5} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search active missions..."
            className="w-full bg-[#f2f3fd]/50 border-none rounded-2xl pl-14 pr-5 py-4 text-sm text-[#191b23] placeholder:text-[#424754]/40 focus:ring-2 focus:ring-[#0058be]/10 transition-all outline-none"
          />
        </div>
        
        <div className="flex items-center gap-1.5 p-1.5 bg-[#f2f3fd]/50 rounded-2xl">
          {([
            { key: "all", label: "Global Sync" },
            { key: "calendar", label: "External" },
            { key: "manual", label: "Direct" },
          ] as const).map((item) => (
            <button
              key={item.key}
              onClick={() => setSourceFilter(item.key)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                sourceFilter === item.key
                  ? "bg-white text-[#0058be] shadow-sm"
                  : "text-[#424754]/60 hover:text-[#191b23]"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="h-28 w-full bg-white rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : recordings.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-center px-6 bg-white rounded-[40px] shadow-sm">
          <div className="w-20 h-20 rounded-3xl bg-[#f9f9ff] flex items-center justify-center mb-8 text-[#0058be]/20">
            <RadioTower size={40} strokeWidth={1} />
          </div>
          <p className="text-[#424754]/40 font-bold uppercase tracking-[0.2em] text-[11px]">Zero active session coordinates detected.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {recordings.map((recording) => {
            const startDate = new Date(recording.startTime);
            const isLive = recording.botSent && !recording.endTime;

            return (
              <div
                key={recording.id}
                className={cn(
                  "group flex flex-col lg:flex-row lg:items-center gap-8 p-8 rounded-4xl bg-white transition-all hover:translate-y-[-2px]",
                  isLive 
                    ? "shadow-[0_20px_40px_rgba(0,88,190,0.08)] ring-2 ring-[#0058be]/5" 
                    : "shadow-[0_20px_40px_rgba(25,27,35,0.04)]"
                )}
              >
                {/* Visual Status Container */}
                <div className="flex items-center gap-6 flex-1 min-w-0">
                  <div className={cn(
                    "w-16 h-16 rounded-3xl shrink-0 flex items-center justify-center transition-colors",
                    isLive ? "bg-[#0058be10] text-[#0058be]" : "bg-[#f2f3fd] text-[#424754]"
                  )}>
                    <Video size={28} strokeWidth={2.5} />
                  </div>

                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-[#191b23] truncate tracking-tight">
                        {recording.title || "Untitled Session"}
                      </h3>
                      {isLive && (
                        <div className="px-2.5 py-1 rounded-md bg-[#0058be] text-white text-[9px] font-bold uppercase tracking-widest animate-pulse">Live</div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-[#424754]/60 uppercase tracking-widest">
                      <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f2f3fd]">
                        <Calendar size={12} strokeWidth={2.5} className="text-[#0058be]" />
                        {startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f2f3fd]">
                        <Clock size={12} strokeWidth={2.5} className="text-[#0058be]" />
                        {startDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                      </span>
                      {recording.platform && (
                        <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0058be]/10 text-[#0058be]">
                          {recording.platform.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Grid */}
                <div className="flex flex-wrap items-center gap-3 lg:shrink-0">
                  {recording.meetingUrl ? (
                    <button
                      onClick={() => window.open(recording.meetingUrl, "_blank")}
                      className={cn(
                        "flex items-center gap-2.5 px-7 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95",
                        isLive 
                          ? "bg-linear-to-br from-[#0058be] to-[#2170e4] text-white shadow-lg shadow-[#0058be20]" 
                          : "bg-[#191b23] text-white hover:bg-black shadow-lg shadow-black/10"
                      )}
                    >
                      <Play size={12} strokeWidth={2.5} className="fill-current" />
                      Join Session
                    </button>
                  ) : (
                    <div className="px-7 py-4 rounded-2xl bg-[#f2f3fd] text-[10px] font-bold uppercase tracking-widest text-[#424754]/40">
                      Syncing URL
                    </div>
                  )}

                  {!isLive ? (
                    <button className="flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-[#f2f3fd] text-[#191b23] text-[10px] font-bold uppercase tracking-widest hover:bg-[#e1e2ec] transition-all active:scale-95">
                      <Bot size={14} strokeWidth={2.5} /> Deploy Assistant
                    </button>
                  ) : (
                    <button
                      disabled={stoppingId === recording.id}
                      onClick={async (e) => {
                        e.preventDefault();
                        if (confirm("Deactivate neural assistant for this session?")) {
                          setStoppingId(recording.id);
                          try {
                            await fetch(`/api/meetings/${recording.id}/stop-bot`, { method: "POST" });
                            window.location.reload();
                          } catch (err) {
                            setStoppingId(null);
                          }
                        }
                      }}
                      className="px-5 py-4 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition-all active:scale-95 group/btn"
                    >
                      {stoppingId === recording.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <XCircle size={18} strokeWidth={2.5} />
                      )}
                    </button>
                  )}
                  
                  <button 
                    onClick={() => {
                        const link = generateGoogleCalendarLink({
                          title: `[Zap Bot] ${recording.title}`,
                          description: `Recorded by Zap Bot.`,
                          location: recording.meetingUrl || "",
                          startTime: recording.startTime,
                          endTime: recording.endTime || new Date(new Date(recording.startTime).getTime() + 60 * 60 * 1000).toISOString(),
                        });
                        window.open(link, "_blank");
                    }}
                    className="p-4 rounded-2xl bg-[#f2f3fd] text-[#424754] hover:text-[#191b23] hover:bg-[#e1e2ec] transition-all active:scale-95"
                  >
                    <Calendar size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default memo(UpcomingRecordingPanel);
