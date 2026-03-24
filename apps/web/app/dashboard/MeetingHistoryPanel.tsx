"use client";

import { memo, useEffect, useRef, useState } from "react";
import { 
  Clock, 
  Calendar, 
  Video, 
  History, 
  Play, 
  ArrowRight, 
} from "lucide-react";

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

function MeetingHistoryPanel() {
  const [meetings, setMeetings] = useState<PastMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    async function fetchPastMeetings() {
      try {
        const res = await fetch("/api/meetings?scope=past&take=8&compact=1");
        const data = await res.json();
        if (isMountedRef.current && data.success) {
          setMeetings(data.data || []);
        }
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    }

    fetchPastMeetings();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[...Array(4)].map((_, idx) => (
          <div key={idx} className="h-48 rounded-xl border border-zinc-800/50 bg-zinc-900/10 animate-pulse" />
        ))}
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center rounded-2xl border border-dashed border-zinc-800/50 bg-zinc-900/5">
        <History className="text-zinc-800 mb-3" size={32} strokeWidth={1} />
        <p className="text-sm text-zinc-500">No archived sessions found in this quadrant.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Sub-header */}
      <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
        <h2 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.2em]">Archived Records</h2>
        <button className="flex items-center gap-2 text-[11px] font-semibold text-zinc-500 hover:text-blue-400 transition-colors uppercase tracking-tight">
          Explore All <ArrowRight size={12} />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {meetings.map((meeting) => (
          <a
            key={meeting.id}
            href={`/meetings/${meeting.id}`}
            className="group flex flex-col bg-zinc-900/20 border border-zinc-800/50 rounded-xl p-5 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900/40"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 group-hover:text-blue-400 transition-colors">
                <Video size={16} strokeWidth={1.5} />
              </div>
              <div className="flex gap-2">
                {meeting.transcriptReady && (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/5 text-emerald-400">
                    Ready
                  </span>
                )}
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-600 transition-colors group-hover:border-zinc-700">
                  {(meeting.platform || "Video").replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="space-y-1.5">
                <h3 className="text-[15px] font-medium text-zinc-100 line-clamp-1 group-hover:text-white transition-colors">
                  {meeting.title || "Quick Session"}
                </h3>
                <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-medium">
                  <span className="flex items-center gap-1.5 border-r border-zinc-800 pr-3">
                    <Calendar size={12} strokeWidth={1.5} />
                    {new Date(meeting.startTime).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={12} strokeWidth={1.5} />
                    {new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {meeting.summary && (
                <p className="line-clamp-2 text-[11px] text-zinc-500 leading-relaxed italic">
                  {meeting.summary}
                </p>
              )}

              {/* Footer Section */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                <div className="flex -space-x-1">
                  {(meeting.participants || ["U"]).slice(0, 3).map((p, i) => (
                    <div key={i} className="w-5 h-5 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[8px] font-bold text-zinc-400 uppercase ring-1 ring-card-bg">
                      {p[0]}
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center gap-3">
                   {meeting.recordingUrl && (
                     <div className="h-7 w-7 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                       <Play size={10} fill="currentColor" strokeWidth={0} />
                     </div>
                   )}
                   <span className="text-[10px] font-semibold text-zinc-400 group-hover:text-white flex items-center gap-1 transition-colors uppercase">
                     Details <ChevronRight size={12} />
                   </span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default memo(MeetingHistoryPanel);

// Simple internal helper for the arrow
function ChevronRight({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} height={size} viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}