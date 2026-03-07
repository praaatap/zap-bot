"use client";

import { useState, useEffect } from "react";

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

    // Calculate participation
    const participation = transcript?.entries ?
        transcript.entries.reduce((acc: any, curr: any) => {
            acc[curr.speaker] = (acc[curr.speaker] || 0) + 1;
            return acc;
        }, {}) : {};

    const totalEntries = transcript?.entries?.length || 0;

    const highlightIcons: Record<string, string> = {
        decision: "🎯",
        blocker: "🛑",
        question: "❓",
        insight: "💡"
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex border-b border-white/10 gap-6">
                <button
                    onClick={() => setActiveTab("summary")}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "summary" ? "border-cyan-400 text-white" : "border-transparent text-gray-400 hover:text-gray-200"}`}
                >
                    Summary
                </button>
                <button
                    onClick={() => setActiveTab("transcript")}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "transcript" ? "border-cyan-400 text-white" : "border-transparent text-gray-400 hover:text-gray-200"}`}
                >
                    Transcript
                </button>
                <button
                    onClick={() => setActiveTab("insights")}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "insights" ? "border-cyan-400 text-white" : "border-transparent text-gray-400 hover:text-gray-200"}`}
                >
                    Insights
                </button>
            </div>

            {activeTab === "summary" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    {meeting.summary ? (
                        <div className="summaryCard">
                            <h2 className="summaryCardTitle">🧠 AI Summary</h2>
                            <p className="summaryText">{meeting.summary as string}</p>
                        </div>
                    ) : (
                        <div className="summaryCard flex items-center justify-center py-12 opacity-50 italic text-sm">
                            {(meeting.botStatus === "completed" || meeting.botStatus === "processing")
                                ? "✨ AI is distilling the meeting notes..."
                                : "Waiting for meeting to complete to generate summary..."}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="summaryCard">
                            <h2 className="summaryCardTitle">✅ Action Items</h2>
                            {meeting.actionItems && meeting.actionItems.length > 0 ? (
                                <ul className="list-none space-y-3 mt-4">
                                    {meeting.actionItems.map((item: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3 text-sm group">
                                            <div className="w-5 h-5 rounded-md border border-white/20 shrink-0 mt-0.5 group-hover:border-cyan-500/50 transition-colors"></div>
                                            <div className="flex-1 text-gray-300 group-hover:text-white transition-colors">{item}</div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-sm mt-4 italic">
                                    {meeting.botStatus === "completed" ? "No specific action items detected." : "Processing after completion..."}
                                </p>
                            )}
                        </div>

                        <div className="summaryCard">
                            <h2 className="summaryCardTitle">⭐ Top Highlights</h2>
                            {meeting.highlights && meeting.highlights.length > 0 ? (
                                <div className="space-y-4 mt-4">
                                    {meeting.highlights.map((h: any, i: number) => (
                                        <div key={i} className="flex gap-3 group">
                                            <span className="text-lg shrink-0">{highlightIcons[h.type] || "✨"}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] text-gray-300 line-clamp-2">{h.text}</p>
                                                <button
                                                    onClick={() => onSeek?.(h.timestamp)}
                                                    className="text-[10px] text-cyan-400 font-bold hover:underline mt-1"
                                                >
                                                    Jump to {formatTimestamp(h.timestamp)}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm mt-4 italic">No highlights recorded yet.</p>
                            )}
                        </div>
                    </div>

                    {meeting.followUpDraft && (
                        <div className="summaryCard border-cyan-500/20 bg-cyan-500/5">
                            <h2 className="summaryCardTitle flex items-center gap-2">
                                ✉️ Email Follow-up Draft
                                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded uppercase font-bold">Pro</span>
                            </h2>
                            <pre className="mt-4 p-4 rounded-lg bg-black/40 text-xs text-gray-300 whitespace-pre-wrap leading-relaxed font-mono border border-white/5">
                                {meeting.followUpDraft}
                            </pre>
                            <button className="mt-4 text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-2 transition-colors underline decoration-dotted">
                                📋 Copy to Clipboard
                            </button>
                        </div>
                    )}
                </div>
            )}

            {activeTab === "transcript" && (
                <div className="transcriptCard animate-in fade-in duration-300 border-none pt-0 bg-transparent">
                    <h2 className="transcriptTitle mb-6 flex items-center gap-3">
                        🎙️ Full Transcript
                        {transcript?.entries && (
                            <span className="text-xs text-gray-500 font-normal">
                                {transcript.entries.length} entries
                            </span>
                        )}
                        {["joining", "in_meeting", "recording"].includes(meeting.botStatus) && (
                            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-bold uppercase tracking-wider animate-pulse border border-cyan-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                                Live Now
                            </span>
                        )}
                    </h2>

                    {transcript?.entries && transcript.entries.length > 0 ? (
                        <div className="transcriptEntries h-[600px] overflow-y-auto pr-2 scrollbar-thin">
                            {transcript.entries.map((entry: { speaker: string; text: string; startTime: number; endTime: number }, i: number) => (
                                <div key={i} className="flex gap-4 group hover:bg-white/2 p-3 rounded-xl transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-sm font-semibold text-gray-300 shrink-0 mt-1">
                                        {getInitials(entry.speaker)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-gray-200">{entry.speaker}</span>
                                            <span
                                                className="text-xs text-gray-500 cursor-pointer hover:text-cyan-400 hover:underline"
                                                onClick={() => onSeek?.(entry.startTime)}
                                            >
                                                {formatTimestamp(entry.startTime)}
                                            </span>
                                        </div>
                                        <p className="text-gray-400 text-sm leading-relaxed">{entry.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 px-5 text-gray-500">
                            <div className="text-3xl mb-3">📝</div>
                            <p>No transcript available yet</p>
                            <p className="text-xs mt-1">
                                {meeting.botStatus === "joining"
                                    ? "Bot is currently joining the meeting..."
                                    : "Recording has started. Live messages will appear here."}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === "insights" && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="summaryCard">
                            <h2 className="summaryCardTitle flex items-center justify-between">
                                🔥 Meeting Health
                                <span className={`${(meeting.healthScore || 8) >= 7 ? 'text-emerald-400' : 'text-amber-400'} font-normal`}>
                                    {(meeting.healthScore || 8).toFixed(1)}/10
                                </span>
                            </h2>
                            <div className="mt-4 h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-linear-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${(meeting.healthScore || 8) * 10}%` }}
                                ></div>
                            </div>
                            <p className="mt-4 text-xs text-gray-400 leading-relaxed">
                                {meeting.healthScore >= 8 ? "Highly collaborative session. Good distribution of speaking time." : "Standard synchronization session. Clear outcomes achieved."}
                            </p>
                        </div>
                        <div className="summaryCard">
                            <h2 className="summaryCardTitle">😊 Sentiment Analysis</h2>
                            <div className="mt-4 flex items-center gap-4">
                                <div className="text-2xl font-bold bg-white/5 w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 text-emerald-400 shadow-inner">
                                    {(meeting.healthScore || 8) > 7 ? "✨" : "🤝"}
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-emerald-300">{meeting.sentiment || "Collaborative & Positive"}</div>
                                    <div className="text-[11px] text-gray-400 mt-0.5">Overall tone is constructive and focused on solutions.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="summaryCard">
                        <h2 className="summaryCardTitle mb-6">👥 Speaker Participation</h2>
                        <div className="space-y-5">
                            {Object.entries(participation).length > 0 ? (
                                Object.entries(participation).map(([name, count]: [string, any]) => (
                                    <div key={name}>
                                        <div className="flex justify-between text-xs mb-1.5 font-medium">
                                            <span className="text-gray-300">{name}</span>
                                            <span className="text-gray-500">{Math.round((count / totalEntries) * 100)}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-linear-to-r from-purple-500/60 to-cyan-500/60 rounded-full transition-all duration-1000"
                                                style={{ width: `${(count / totalEntries) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-6 text-gray-500 italic text-sm">Waiting for live data to calculate participation...</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
