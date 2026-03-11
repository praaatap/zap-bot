"use client";

import { useEffect, useState } from "react";
import { Clock, Calendar, Video, CheckCircle2, AlertCircle, RadioTower, History, FileText, Play, ArrowRight, Activity } from "lucide-react";
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
            <div className="space-y-6">
                <div className="h-8 w-56 bg-slate-100 rounded-lg animate-pulse" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, idx) => (
                        <div key={idx} className="p-6 rounded-3xl bg-white border border-slate-200">
                            <div className="h-3 w-24 bg-slate-100 rounded animate-pulse mb-3" />
                            <div className="h-5 w-2/3 bg-slate-100 rounded animate-pulse mb-4" />
                            <div className="h-4 w-full bg-slate-100 rounded animate-pulse mb-2" />
                            <div className="h-4 w-5/6 bg-slate-100 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (meetings.length === 0) {
        return (
            <div className="p-12 rounded-2xl bg-white border border-slate-100 border-dashed flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
                    <History className="w-6 h-6 text-slate-300" />
                </div>
                <div className="text-center space-y-1">
                    <p className="text-sm font-bold text-slate-900 uppercase">No recordings yet</p>
                    <p className="text-xs text-slate-500">Your completed meetings will appear here with insights.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                        <History className="w-5 h-5 text-blue-600" /> Past Recordings
                    </h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Capture insights from your previous meetings.</p>
                </div>
                <button className="text-xs font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4 decoration-2 decoration-blue-100 uppercase tracking-widest transition-all">
                    View Archive
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {meetings.map((meeting) => (
                    <a
                        key={meeting.id}
                        href={`/meetings/${meeting.id}`}
                        className="group relative block"
                    >
                        <div className="relative p-6 rounded-3xl bg-white border border-slate-200 hover:border-blue-400/50 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 overflow-hidden group/card">
                            {/* Accent Dot Background Effect */}
                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover/card:opacity-[0.1] transition-opacity">
                                <History className="w-24 h-24 rotate-[-15deg] text-blue-600" />
                            </div>

                            <div className="relative flex flex-col h-full space-y-5">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                                <Activity className="w-2.5 h-2.5" />
                                                {(meeting.platform || "generic").replace('_', ' ')}
                                            </div>
                                            {meeting.transcriptReady && (
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-600 uppercase tracking-tight">
                                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                                    Ready
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-1">
                                            {meeting.title || "Quick Meeting"}
                                        </h3>
                                        <div className="flex items-center gap-3 text-xs text-slate-400 font-bold uppercase tracking-widest">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(meeting.startTime).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(meeting.startTime).toLocaleTimeString("en-US", { hour: 'numeric', minute: '2-digit', hour12: true })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {meeting.summary ? (
                                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed font-medium pr-8">
                                        {meeting.summary}
                                    </p>
                                ) : (
                                    <div className="py-2 flex items-center gap-2 text-slate-400 italic text-xs font-medium">
                                        <FileText className="w-4 h-4 opacity-50" />
                                        Summary processing...
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    {/* Participants Dots */}
                                    <div className="flex -space-x-2">
                                        {(meeting.participants || ["User"]).slice(0, 4).map((p, i) => (
                                            <div key={i} className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600 shadow-sm ring-1 ring-black/5">
                                                {p[0]?.toUpperCase()}
                                            </div>
                                        ))}
                                        {(meeting.participants?.length || 1) > 4 && (
                                            <div className="w-7 h-7 rounded-full bg-blue-50 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-600">
                                                +{(meeting.participants?.length || 1) - 4}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {meeting.recordingUrl && (
                                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center transition-transform group-hover/card:scale-110">
                                                <Play className="w-3 h-3 fill-current" />
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-blue-600 transition-all">
                                            Insights
                                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>

                                {/* Status Dot Highlight */}
                                <div className="absolute bottom-6 right-6">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        meeting.transcriptReady ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                                    )} />
                                </div>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
