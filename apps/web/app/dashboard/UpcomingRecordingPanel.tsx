"use client";

import { useEffect, useState } from "react";
import { Clock, Calendar, Video, CheckCircle2, AlertCircle, Loader2, RadioTower } from "lucide-react";
import { cn } from "@/lib/utils";

type UpcomingRecording = {
    id: string;
    title: string;
    startTime: string;
    endTime?: string;
    platform?: string;
    botScheduled?: boolean;
    botSent?: boolean;
    botStatus?: string;
    participants?: string[];
};

export default function UpcomingRecordingPanel() {
    const [recordings, setRecordings] = useState<UpcomingRecording[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUpcomingRecordings() {
            try {
                const res = await fetch("/api/meetings/upcoming-recordings");
                const data = await res.json();

                if (data.success) {
                    setRecordings(data.data || []);
                } else {
                    setError(data.error || "Failed to fetch upcoming recordings");
                }
            } catch (err) {
                console.error("Error fetching upcoming recordings:", err);
                setError("Failed to fetch upcoming recordings");
            } finally {
                setLoading(false);
            }
        }

        fetchUpcomingRecordings();
        // Refresh every 5 minutes
        const interval = setInterval(fetchUpcomingRecordings, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    if (error) {
        return (
            <div className="p-6 rounded-2xl bg-white border border-red-100 flex gap-4">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-semibold text-slate-900">Error Loading Recordings</h3>
                    <p className="text-sm text-slate-600 mt-1">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Video className="w-5 h-5 text-blue-600" /> Upcoming Recordings
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Meetings scheduled for recording in the next 30 days</p>
                </div>
                {!(loading || recordings.length === 0) && (
                    <span className="text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                        {recordings.length} {recordings.length === 1 ? "meeting" : "meetings"}
                    </span>
                )}
            </div>

            {loading ? (
                <div className="p-12 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                    <p className="text-sm text-slate-500 font-medium">Loading upcoming recordings...</p>
                </div>
            ) : recordings.length === 0 ? (
                <div className="p-12 rounded-2xl bg-white border border-slate-200 border-dashed flex flex-col items-center justify-center gap-3">
                    <RadioTower className="w-8 h-8 text-slate-300" />
                    <p className="text-sm text-slate-500 font-medium">No upcoming recordings found</p>
                    <p className="text-xs text-slate-400">Meetings will appear here once you schedule them</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recordings.map((recording) => {
                        const startDate = new Date(recording.startTime);
                        const botActive = recording.botScheduled || recording.botSent;

                        return (
                            <a
                                key={recording.id}
                                href={`/meetings/${recording.id}`}
                                className="group block relative"
                            >
                                <div className="p-5 rounded-2xl border border-slate-200 hover:border-blue-300 bg-white hover:shadow-lg hover:shadow-blue-100 transition-all duration-300">
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 text-sm">
                                                {recording.title || "Untitled Meeting"}
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-2 flex-wrap">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {startDate.toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {startDate.toLocaleTimeString("en-US", {
                                                        hour: "numeric",
                                                        minute: "2-digit",
                                                        hour12: true,
                                                    })}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Bot Status Badge */}
                                        <div className={cn(
                                            "ml-2 shrink-0 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all",
                                            botActive
                                                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                                : "bg-amber-50 text-amber-600 border-amber-200"
                                        )}>
                                            {botActive ? (
                                                <div className="flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Ready
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" />
                                                    Pending
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Platform Info */}
                                    {recording.platform && (
                                        <div className="text-xs text-slate-500 capitalize mb-3 flex items-center gap-1">
                                            <span className="inline-block w-2 h-2 rounded-full bg-blue-400"></span>
                                            {recording.platform.replace(/_/g, " ")}
                                        </div>
                                    )}

                                    {/* Participants */}
                                    {recording.participants && recording.participants.length > 0 && (
                                        <div className="flex -space-x-2 pt-2 border-t border-slate-100">
                                            {recording.participants.slice(0, 3).map((p, i) => (
                                                <div
                                                    key={i}
                                                    className="w-7 h-7 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xs font-medium text-blue-600"
                                                    title={p}
                                                >
                                                    {p[0]?.toUpperCase()}
                                                </div>
                                            ))}
                                            {recording.participants.length > 3 && (
                                                <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-medium text-slate-600">
                                                    +{recording.participants.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </a>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
