"use client";

import { useEffect, useState } from "react";
import { Clock, Calendar, Video, CheckCircle2, AlertCircle, Loader2, RadioTower, ExternalLink, Square } from "lucide-react";
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

export default function UpcomingRecordingPanel() {
    const [recordings, setRecordings] = useState<UpcomingRecording[]>([]);
    const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stoppingId, setStoppingId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUpcomingRecordings() {
            try {
                const params = new URLSearchParams();
                params.set("source", sourceFilter);
                if (searchQuery.trim()) {
                    params.set("q", searchQuery.trim());
                }

                const res = await fetch(`/api/meetings/upcoming-recordings?${params.toString()}`);
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

        setLoading(true);
        fetchUpcomingRecordings();
        // Refresh every 5 minutes
        const interval = setInterval(fetchUpcomingRecordings, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [sourceFilter, searchQuery]);

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

            <div className="flex flex-col md:flex-row gap-3">
                <div className="flex items-center gap-2">
                    {([
                        { key: "all", label: "All" },
                        { key: "calendar", label: "Calendar" },
                        { key: "manual", label: "Manual" },
                    ] as const).map((item) => (
                        <button
                            key={item.key}
                            onClick={() => setSourceFilter(item.key)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all",
                                sourceFilter === item.key
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                            )}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search title or meeting URL"
                    className="w-full md:max-w-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-400"
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, idx) => (
                        <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-white">
                            <div className="h-4 w-1/2 bg-slate-100 rounded animate-pulse mb-3" />
                            <div className="h-3 w-2/3 bg-slate-100 rounded animate-pulse mb-2" />
                            <div className="h-3 w-1/3 bg-slate-100 rounded animate-pulse mb-4" />
                            <div className="h-9 w-full bg-slate-100 rounded-xl animate-pulse" />
                        </div>
                    ))}
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

                                        {/* Status Badge */}
                                        <div className={cn(
                                            "ml-2 shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center gap-2 shadow-sm",
                                            recording.botSent && !recording.endTime
                                                ? "bg-blue-50 text-blue-600 border-blue-200 ring-2 ring-blue-100" // Active / Recording
                                                : recording.botScheduled
                                                    ? "bg-emerald-50 text-emerald-600 border-emerald-200" // Scheduled / Ready
                                                    : "bg-slate-50 text-slate-500 border-slate-200" // Generic Pending
                                        )}>
                                            {recording.botSent && !recording.endTime ? (
                                                <>
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                                    </span>
                                                    Live Now
                                                </>
                                            ) : recording.botScheduled ? (
                                                <>
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                    Ready
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-2 h-2 rounded-full bg-slate-300" />
                                                    Pending
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Platform Info */}
                                    {recording.platform && (
                                        <div className="text-xs text-slate-500 capitalize mb-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="flex items-center gap-1">
                                                    <span className="inline-block w-2 h-2 rounded-full bg-blue-400"></span>
                                                    {recording.platform.replace(/_/g, " ")}
                                                </span>
                                                {recording.isFromCalendar && (
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-indigo-600">
                                                        <Calendar className="w-3 h-3" />
                                                        Calendar Sync
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    const link = generateGoogleCalendarLink({
                                                        title: `[Zap Bot] ${recording.title}`,
                                                        description: `Recorded by Zap Bot. Join: ${recording.meetingUrl}`,
                                                        location: recording.meetingUrl || "",
                                                        startTime: recording.startTime,
                                                        endTime: recording.endTime || new Date(new Date(recording.startTime).getTime() + 60 * 60 * 1000).toISOString(),
                                                    });
                                                    window.open(link, "_blank");
                                                }}
                                                className="text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold px-2 py-1 rounded transition-colors flex items-center gap-1"
                                            >
                                                <Calendar className="w-3 h-3" />
                                                Add to My Calendar
                                            </button>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-50">
                                        {recording.meetingUrl && (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    window.open(recording.meetingUrl, "_blank");
                                                }}
                                                className={cn(
                                                    "flex-1 text-[11px] font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]",
                                                    recording.botSent && !recording.endTime
                                                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
                                                        : "bg-slate-900 text-white hover:bg-slate-800"
                                                )}
                                            >
                                                <Video className="w-3 h-3" />
                                                Join Meeting
                                            </button>
                                        )}
                                        {botActive && (
                                            <button
                                                disabled={stoppingId === recording.id}
                                                onClick={async (e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    if (confirm("Stop recording and remove bot?")) {
                                                        setStoppingId(recording.id);
                                                        try {
                                                            await fetch(`/api/meetings/${recording.id}/stop-bot`, { method: "POST" });
                                                            window.location.reload();
                                                        } catch (err) {
                                                            alert("Failed to stop bot");
                                                            setStoppingId(null);
                                                        }
                                                    }
                                                }}
                                                className="px-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                                title="Stop Bot"
                                            >
                                                {stoppingId === recording.id ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : (
                                                    <Square className="w-3 h-3 fill-red-600" />
                                                )}
                                            </button>
                                        )}
                                    </div>

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
