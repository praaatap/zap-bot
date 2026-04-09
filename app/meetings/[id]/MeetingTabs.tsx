"use client";

import { useState, useEffect } from "react";
import { cn } from "../../../lib/utils";
import { Layout, List, BarChart3, Brain, ClipboardCheck, Star, Mail, Zap, MessageSquare, Quote } from "lucide-react";

export function MeetingTabs({
    meeting: initialMeeting,
    transcript: initialTranscript,
    formatTimestamp,
    getInitials,
    meetingId,
    onSeek
}: {
    meeting: any;
    transcript: any;
    formatTimestamp: (s: number) => string;
    getInitials: (n: string) => string;
    meetingId: string;
    onSeek?: (seconds: number) => void;
}) {
    const [activeTab, setActiveTab] = useState<"summary" | "transcript" | "insights">("summary");
    const [meeting, setMeeting] = useState(initialMeeting);
    const [transcript, setTranscript] = useState(initialTranscript);
    const [analytics, setAnalytics] = useState<any>(null);

    // Poll for updates if the meeting is in progress
    useEffect(() => {
        const isInProgress = ["joining", "in_meeting", "recording", "processing"].includes(meeting.botStatus);
        if (!isInProgress) return;

        const interval = setInterval(async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
                const res = await fetch(`${API_URL}/api/meetings/${meetingId}`);
                if (res.ok) {
                    const json = await res.json();
                    if (json.success && json.data) {
                        setMeeting(json.data.meeting);
                        setTranscript(json.data.transcript);
                    }
                }
            } catch (err) {
                console.error("Failed to poll meeting updates:", err);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [meeting.botStatus, meetingId]);

    useEffect(() => {
        let mounted = true;

        async function fetchAnalytics() {
            try {
                const res = await fetch(`/api/meetings/${meetingId}/analytics`, { cache: "no-store" });
                if (!res.ok) return;
                const json = await res.json();
                if (mounted && json?.success) {
                    setAnalytics(json.data);
                }
            } catch (err) {
                console.error("Failed to load meeting analytics:", err);
            }
        }

        void fetchAnalytics();
        const interval = setInterval(fetchAnalytics, 10000);

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [meetingId]);

    // Calculate participation
    const participation = transcript?.entries ?
        transcript.entries.reduce((acc: any, curr: any) => {
            acc[curr.speaker] = (acc[curr.speaker] || 0) + 1;
            return acc;
        }, {}) : {};

    const totalEntries = transcript?.entries?.length || 0;

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center p-1 bg-zinc-900 border border-white/5 rounded-xl w-fit">
                {[
                    { id: "summary", label: "Summary", icon: Layout },
                    { id: "transcript", label: "Transcript", icon: List },
                    { id: "insights", label: "Insights", icon: BarChart3 }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-tighter italic",
                            activeTab === tab.id
                                ? "bg-white text-black shadow-lg"
                                : "text-zinc-500 hover:text-white"
                        )}
                    >
                        <tab.icon className="w-3.5 h-3.5" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === "summary" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="pro-card p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Brain className="w-5 h-5 text-white" />
                            <h2 className="text-xl font-bold text-white italic tracking-tight">AI Intelligence</h2>
                        </div>
                        {meeting.summary ? (
                            <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                                {meeting.summary as string}
                            </p>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-zinc-600 gap-3 border border-dashed border-white/5 rounded-xl bg-white/2">
                                <Zap className="w-6 h-6 animate-pulse" />
                                <p className="text-xs font-bold uppercase tracking-widest italic">
                                    {(meeting.botStatus === "completed" || meeting.botStatus === "processing")
                                        ? "Distilling meeting intelligence..."
                                        : "Waiting for wrap-up..."}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="pro-card p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <ClipboardCheck className="w-5 h-5 text-white" />
                                <h2 className="text-xl font-bold text-white italic tracking-tight">Decisions</h2>
                            </div>
                            {meeting.actionItems && meeting.actionItems.length > 0 ? (
                                <ul className="space-y-4">
                                    {meeting.actionItems.map((item: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3 group">
                                            <div className="w-5 h-5 rounded-md border border-white/10 bg-white/5 shrink-0 mt-0.5 group-hover:border-white/30 transition-all flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest italic">No items distilled.</p>
                            )}
                        </div>

                        <div className="pro-card p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <Star className="w-5 h-5 text-white" />
                                <h2 className="text-xl font-bold text-white italic tracking-tight">Key Moments</h2>
                            </div>
                            {meeting.highlights && meeting.highlights.length > 0 ? (
                                <div className="space-y-6">
                                    {meeting.highlights.map((h: any, i: number) => (
                                        <div key={i} className="flex flex-col gap-2 group">
                                            <p className="text-sm font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors line-clamp-2">
                                                &ldquo;{h.text}&rdquo;
                                            </p>
                                            <button
                                                onClick={() => onSeek?.(h.timestamp)}
                                                className="text-[10px] font-bold text-zinc-500 hover:text-white flex items-center gap-1.5 uppercase tracking-tighter w-fit transition-colors"
                                            >
                                                <Zap className="w-3 h-3" />
                                                Jump to {formatTimestamp(h.timestamp)}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest italic">No highlights recorded.</p>
                            )}
                        </div>
                    </div>

                    {meeting.followUpDraft && (
                        <div className="pro-card p-8 border-white/20 bg-white/[0.03]">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-white" />
                                    <h2 className="text-xl font-bold text-white italic tracking-tight">Follow-up Blueprint</h2>
                                </div>
                                <span className="text-[10px] font-bold bg-white text-black px-2 py-0.5 rounded uppercase tracking-tighter italic">Enterprise</span>
                            </div>
                            <div className="relative group">
                                <pre className="p-6 rounded-xl bg-black border border-white/5 text-xs text-zinc-400 font-mono leading-relaxed whitespace-pre-wrap">
                                    {meeting.followUpDraft}
                                </pre>
                                <button className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100">
                                    <ClipboardCheck className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === "transcript" && (
                <div className="pro-card p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-3">
                            <MessageSquare className="w-5 h-5 text-white" />
                            <h2 className="text-xl font-bold text-white italic tracking-tight">Dialogue</h2>
                            {transcript?.entries && (
                                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest bg-zinc-900 border border-white/5 px-2 py-0.5 rounded ml-2">
                                    {transcript.entries.length} Lines
                                </span>
                            )}
                        </div>
                        {["joining", "in_meeting", "recording"].includes(meeting.botStatus) && (
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest animate-pulse border border-emerald-500/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                Syncing Live
                            </div>
                        )}
                    </div>

                    {transcript?.entries && transcript.entries.length > 0 ? (
                        <div className="space-y-2 h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                            {transcript.entries.map((entry: any, i: number) => (
                                <div key={i} className="flex gap-6 group p-4 rounded-xl hover:bg-white/2 transition-colors border border-transparent hover:border-white/5">
                                    <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500 shrink-0 group-hover:border-white/10 transition-all">
                                        {getInitials(entry.speaker)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-bold text-white italic">{entry.speaker}</span>
                                            <button
                                                onClick={() => onSeek?.(entry.startTime)}
                                                className="text-[10px] font-bold text-zinc-600 hover:text-white tracking-widest transition-colors uppercase"
                                            >
                                                {formatTimestamp(entry.startTime)}
                                            </button>
                                        </div>
                                        <p className="text-zinc-400 text-sm font-medium leading-relaxed group-hover:text-zinc-300 transition-colors">
                                            {entry.text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                            <Quote className="w-10 h-10 text-zinc-800" />
                            <div className="flex flex-col gap-1">
                                <p className="text-white font-bold italic">Silence in session</p>
                                <p className="text-xs text-zinc-600 font-medium uppercase tracking-widest">
                                    {meeting.botStatus === "joining" ? "Awaiting first synchronization..." : "Recordings will manifest here."}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === "insights" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="pro-card p-8 flex flex-col gap-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest italic">Health Score</h2>
                                <span className={cn(
                                    "text-lg font-bold italic",
                                    (meeting.healthScore || 8) >= 7 ? 'text-emerald-500' : 'text-amber-500'
                                )}>
                                    {(meeting.healthScore || 8).toFixed(1)}<span className="text-xs text-zinc-600 ml-0.5">/10</span>
                                </span>
                            </div>
                            <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white transition-all duration-1000"
                                    style={{ width: `${(meeting.healthScore || 8) * 10}%` }}
                                />
                            </div>
                            <p className="text-xs font-medium text-zinc-400 leading-relaxed italic">
                                {meeting.healthScore >= 8 ? "Peak productivity. All channels open and active." : "Nominal performance detected."}
                            </p>
                        </div>

                        <div className="pro-card p-8 flex flex-col gap-6">
                            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest italic">Tone Analysis</h2>
                            <div className="flex items-center gap-6 mt-2">
                                <div className="w-14 h-14 rounded-2xl bg-white/3 border border-white/10 flex items-center justify-center text-2xl shadow-2xl">
                                    {(meeting.healthScore || 8) > 7 ? "⚡" : "🤝"}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-lg font-bold text-white italic leading-none">{meeting.sentiment || "Constructive"}</span>
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Overall Atmosphere</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="pro-card p-5">
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Turns</p>
                            <p className="text-2xl font-bold text-white mt-2">{analytics?.totals?.turns ?? totalEntries}</p>
                        </div>
                        <div className="pro-card p-5">
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Words</p>
                            <p className="text-2xl font-bold text-white mt-2">{analytics?.totals?.words ?? 0}</p>
                        </div>
                        <div className="pro-card p-5">
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Questions</p>
                            <p className="text-2xl font-bold text-white mt-2">{analytics?.totals?.questions ?? 0}</p>
                        </div>
                        <div className="pro-card p-5">
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">RAG</p>
                            <p className={cn("text-lg font-bold mt-2", analytics?.pipeline?.ragReady ? "text-emerald-400" : "text-amber-400")}>
                                {analytics?.pipeline?.ragReady ? "Ready" : "Indexing"}
                            </p>
                        </div>
                    </div>

                    <div className="pro-card p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Zap className="w-5 h-5 text-white" />
                            <h2 className="text-xl font-bold text-white italic tracking-tight">Processing Pipeline</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                            {[
                                { key: "botDispatched", label: "Bot Dispatched", done: analytics?.pipeline?.botDispatched },
                                { key: "joinedConfirmed", label: "Join Confirmed", done: analytics?.pipeline?.joinedConfirmed },
                                { key: "meetingCompleted", label: "Meeting Complete", done: analytics?.pipeline?.meetingCompleted },
                                { key: "transcriptReady", label: "Transcript Ready", done: analytics?.pipeline?.transcriptReady },
                                { key: "recordingStoredInR2", label: "Stored In R2", done: analytics?.pipeline?.recordingStoredInR2 },
                                { key: "ragReady", label: "RAG Indexed", done: analytics?.pipeline?.ragReady },
                            ].map((item) => (
                                <div
                                    key={item.key}
                                    className={cn(
                                        "rounded-xl border px-3 py-3 text-xs font-bold uppercase tracking-wider",
                                        item.done
                                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                            : "border-zinc-800 bg-zinc-900 text-zinc-500"
                                    )}
                                >
                                    {item.done ? "Completed" : "Pending"}
                                    <div className="mt-1 text-[10px] tracking-normal font-semibold">
                                        {item.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pro-card p-8">
                        <div className="flex items-center gap-3 mb-10">
                            <BarChart3 className="w-5 h-5 text-white" />
                            <h2 className="text-xl font-bold text-white italic tracking-tight">Contribution Spectrum</h2>
                        </div>
                        <div className="space-y-8">
                            {Object.entries(participation).length > 0 ? (
                                Object.entries(participation).map(([name, count]: [string, any]) => (
                                    <div key={name} className="flex flex-col gap-3 group">
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs font-bold text-white italic group-hover:translate-x-1 transition-transform">{name}</span>
                                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{Math.round((count / totalEntries) * 100)}%</span>
                                        </div>
                                        <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-white opacity-40 group-hover:opacity-100 transition-all duration-700"
                                                style={{ width: `${(count / totalEntries) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center text-zinc-600 font-bold uppercase tracking-widest text-[10px] italic border border-dashed border-white/5 rounded-xl bg-white/2">
                                    Manifesting participation data...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
