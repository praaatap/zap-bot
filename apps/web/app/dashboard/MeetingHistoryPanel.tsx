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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, idx) => (
          <div key={idx} className="h-56 rounded-[2.5rem] bg-white shadow-[0_20px_40px_rgba(25,27,35,0.04)] animate-pulse" />
        ))}
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center rounded-[2.5rem] bg-white shadow-[0_20px_40px_rgba(25,27,35,0.04)]">
        <div className="w-20 h-20 rounded-3xl bg-[#f2f3fd] flex items-center justify-center mb-6">
          <History className="text-[#0058be]/20" size={32} strokeWidth={2.5} />
        </div>
        <p className="text-sm font-bold text-[#424754]/40 uppercase tracking-[0.2em]">No archived records found</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Sub-header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-[11px] font-bold text-[#424754]/40 uppercase tracking-[0.2em]">Archived Records</h2>
          <div className="h-1 w-8 rounded-full bg-[#0058be]/20" />
        </div>
        <button className="flex items-center gap-2.5 text-[10px] font-bold text-[#0058be] hover:translate-x-1 transition-transform uppercase tracking-[0.2em]">
          Explore All <ArrowRight size={14} strokeWidth={2.5} />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {meetings.map((meeting) => (
          <a
            key={meeting.id}
            href={`/meetings/${meeting.id}`}
            className="group flex flex-col bg-white rounded-[2.5rem] p-8 transition-all duration-300 hover:translate-y-[-4px] shadow-[0_20px_40px_rgba(25,27,35,0.04)] hover:shadow-[0_30px_60px_rgba(0,88,190,0.08)]"
          >
            <div className="flex items-start justify-between mb-8">
              <div className="w-14 h-14 rounded-2xl bg-[#0058be]/5 flex items-center justify-center text-[#0058be] group-hover:scale-110 transition-transform">
                <Video size={20} strokeWidth={2.5} />
              </div>
              <div className="flex gap-2.5">
                {meeting.transcriptReady && (
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600">
                    Neural Ready
                  </span>
                )}
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full bg-[#f2f3fd] text-[#424754]/60">
                  {(meeting.platform || "Video").replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-[#191b23] line-clamp-1 group-hover:text-[#0058be] transition-colors">
                  {meeting.title || "Untitled Session"}
                </h3>
                <div className="flex items-center gap-4 text-[10px] text-[#424754]/40 font-bold uppercase tracking-[0.15em]">
                  <span className="flex items-center gap-2">
                    <Calendar size={14} strokeWidth={2.5} className="text-[#0058be]/40" />
                    {new Date(meeting.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-[#424754]/10" />
                  <span className="flex items-center gap-2">
                    <Clock size={14} strokeWidth={2.5} className="text-[#0058be]/40" />
                    {new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {meeting.summary && (
                <p className="line-clamp-2 text-xs text-[#424754]/60 leading-relaxed font-medium">
                  {meeting.summary}
                </p>
              )}

              {/* Footer Section */}
              <div className="flex items-center justify-between pt-6 border-t border-[#f2f3fd]">
                <div className="flex -space-x-2">
                  {(meeting.participants || ["U"]).slice(0, 3).map((p, i) => (
                    <div key={i} className="w-8 h-8 rounded-xl bg-[#f2f3fd] border-2 border-white flex items-center justify-center text-[10px] font-bold text-[#0058be] uppercase shadow-sm">
                      {p[0]}
                    </div>
                  ))}
                  {(meeting.participants?.length || 0) > 3 && (
                    <div className="w-8 h-8 rounded-xl bg-[#0058be] border-2 border-white flex items-center justify-center text-[8px] font-bold text-white uppercase shadow-sm">
                      +{(meeting.participants?.length || 0) - 3}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                   {meeting.recordingUrl && (
                     <div className="h-10 w-10 rounded-2xl bg-[#0058be10] flex items-center justify-center text-[#0058be] group-hover:bg-[#0058be] group-hover:text-white transition-all shadow-sm">
                       <Play size={14} fill="currentColor" strokeWidth={0} />
                     </div>
                   )}
                   <span className="text-[10px] font-bold text-[#0058be] flex items-center gap-1.5 transition-colors uppercase tracking-[0.2em]">
                     Analyze <ChevronRight size={14} strokeWidth={2.5} />
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

function ChevronRight({ size, strokeWidth = 2, className }: { size: number, strokeWidth?: number, className?: string }) {
  return (
    <svg 
      width={size} height={size} viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}