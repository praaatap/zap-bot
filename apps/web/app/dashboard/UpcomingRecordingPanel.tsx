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
    <div className="space-y-6">
      {/* Controls: Search and Filter Row */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-4 border-b border-white/5">
        <div className="relative flex-1 w-full max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search active missions..."
            className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50"
          />
        </div>
        
        <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-2xl border border-white/5">
          {([
            { key: "all", label: "Global Sync" },
            { key: "calendar", label: "External" },
            { key: "manual", label: "Direct" },
          ] as const).map((item) => (
            <button
              key={item.key}
              onClick={() => setSourceFilter(item.key)}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                sourceFilter === item.key
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-zinc-500 hover:text-zinc-300"
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
            <div key={idx} className="h-24 w-full bg-white/3 rounded-4xl border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : recordings.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center px-6 bg-white/2 rounded-[40px] border border-dashed border-white/10">
          <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-6 text-zinc-700">
            <RadioTower size={32} />
          </div>
          <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px] italic">Zero active session coordinates detected.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recordings.map((recording) => {
            const startDate = new Date(recording.startTime);
            const isLive = recording.botSent && !recording.endTime;
            const isArmed = recording.botScheduled && !isLive;

            return (
              <div
                key={recording.id}
                className={cn(
                  "flex flex-col lg:flex-row lg:items-center gap-6 p-6 md:p-8 rounded-4xl border transition-all",
                  isLive 
                    ? "bg-blue-600/5 border-blue-500/20" 
                    : "bg-white/3 border-white/5"
                )}
              >
                {/* Visual Status Container */}
                <div className="flex items-center gap-6 flex-1 min-w-0">
                  <div className={cn(
                    "w-16 h-16 rounded-3xl shrink-0 flex items-center justify-center border",
                    isLive ? "bg-blue-600/20 border-blue-500/30 text-blue-400" : "bg-white/5 border-white/10 text-zinc-500"
                  )}>
                    <Video size={28} />
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-black text-white truncate uppercase italic">
                        {recording.title || "Untitled Session"}
                      </h3>
                      {isLive && (
                        <div className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest">Live</div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5">
                        <Calendar size={10} className="text-blue-500" />
                        {startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5">
                        <Clock size={10} className="text-blue-500" />
                        {startDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                      </span>
                      {recording.platform && (
                        <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400">
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
                        "flex items-center gap-2 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                        isLive 
                          ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20" 
                          : "bg-white text-black hover:bg-zinc-200"
                      )}
                    >
                      <Play size={12} className={cn(isLive ? "fill-white" : "fill-black")} />
                      Join Session
                    </button>
                  ) : (
                    <div className="px-6 py-3.5 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-600">
                      Syncing URL...
                    </div>
                  )}

                  {!isArmed && !isLive ? (
                    <button className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">
                      <Bot size={14} /> Deploy Assistant
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
                      className="px-4 py-3.5 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 disabled:opacity-50 transition-all"
                    >
                      {stoppingId === recording.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <XCircle size={16} />
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
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-zinc-500 hover:text-white transition-all"
                  >
                    <Calendar size={16} />
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
