"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
    Calendar as CalendarIcon,
    Clock,
    Link as LinkIcon,
    Loader2,
    MessageSquare,
    Play,
    Users,
    Video,
    Bot,
    FileText,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useZapStore } from "@/lib/store";
import type { Meeting } from "@/lib/store";

function formatMeetingDuration(start: string, end: string) {
    const s = new Date(start);
    const e = new Date(end);
    const m = Math.round((e.getTime() - s.getTime()) / 60000);
    return `${m} min`;
}

function getPlatformIcon(platform?: string) {
    switch (platform) {
        case "google_meet": return <Video size={16} className="text-green-600" />;
        case "zoom": return <Video size={16} className="text-blue-500" />;
        case "microsoft_teams": return <Video size={16} className="text-indigo-600" />;
        default: return <Video size={16} className="text-slate-500" />;
    }
}

export default function MeetingsPage() {
    const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

    // Zustand global state
    const {
        upcomingMeetings,
        pastMeetings,
        isLoadingMeetings,
        setUpcomingMeetings,
        setPastMeetings,
        setLoadingMeetings
    } = useZapStore();

    useEffect(() => {
        async function fetchMeetings() {
            setLoadingMeetings(true);
            try {
                // Fetch upcoming
                const upRes = await fetch("/api/meetings/upcoming-recordings");
                if (upRes.ok) {
                    const upData = await upRes.json();
                    if (upData.success) setUpcomingMeetings(upData.data || []);
                }

                // Fetch past
                const pastRes = await fetch("/api/meetings");
                if (pastRes.ok) {
                    const pastData = await pastRes.json();
                    if (pastData.success) {
                        const now = new Date();
                        const all: Meeting[] = pastData.data || [];
                        const pastM = all.filter(m => new Date(m.endTime) < now);
                        setPastMeetings(pastM);
                    }
                }
            } catch (err) {
                console.error("Error fetching meetings:", err);
            } finally {
                setLoadingMeetings(false);
            }
        }

        // Only fetch if we haven't already (simple caching mechanism)
        if (upcomingMeetings.length === 0 && pastMeetings.length === 0) {
            void fetchMeetings();
        }
    }, [setLoadingMeetings, setUpcomingMeetings, setPastMeetings, upcomingMeetings.length, pastMeetings.length]);

    return (
        <div className="p-8">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Meetings & Recordings</h1>
                    <p className="text-slate-600">Track your upcoming calls and review past recordings</p>
                </div>
            </div>

            <div className="mb-6 flex space-x-1 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab("upcoming")}
                    className={cn(
                        "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                        activeTab === "upcoming"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    )}
                >
                    Upcoming Calls
                </button>
                <button
                    onClick={() => setActiveTab("past")}
                    className={cn(
                        "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                        activeTab === "past"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    )}
                >
                    Past Recordings
                </button>
            </div>

            {isLoadingMeetings ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-500">
                    <Loader2 className="animate-spin mb-4" size={32} />
                    <p>Loading your meetings...</p>
                </div>
            ) : activeTab === "upcoming" ? (
                <div className="space-y-4">
                    {upcomingMeetings.length === 0 ? (
                        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center text-slate-500">
                            <CalendarIcon size={48} className="mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-1">No Upcoming Meetings</h3>
                            <p>You don't have any scheduled meetings that require Zap Bot.</p>
                        </div>
                    ) : (
                        upcomingMeetings.map((meeting) => (
                            <div key={meeting.id} className="bg-white rounded-lg border border-slate-200 p-5 hover:border-slate-300 transition-colors shadow-sm flex flex-col md:flex-row md:items-center gap-6">
                                <div className="md:w-48 shrink-0">
                                    <div className="bg-slate-50 border border-slate-100 rounded-md p-3 text-center">
                                        <p className="text-xs font-semibold text-slate-500 uppercase">
                                            {format(new Date(meeting.startTime), "MMM do")}
                                        </p>
                                        <p className="text-lg font-bold text-slate-900">
                                            {format(new Date(meeting.startTime), "h:mm a")}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        {getPlatformIcon(meeting.platform)}
                                        <h3 className="font-semibold text-lg text-slate-900 truncate">
                                            {meeting.title}
                                        </h3>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={14} />
                                            {formatMeetingDuration(meeting.startTime, meeting.endTime)}
                                        </span>
                                        {Array.isArray(meeting.participants) && meeting.participants.length > 0 && (
                                            <span className="flex items-center gap-1.5">
                                                <Users size={14} />
                                                {meeting.participants.length} Participant{meeting.participants.length > 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col md:items-end gap-3 shrink-0">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        {meeting.botScheduled ? (
                                            <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                                                <Bot size={14} />
                                                Bot Joining
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                                                <Bot size={14} />
                                                Bot Disabled
                                            </span>
                                        )}
                                    </div>
                                    {meeting.meetingUrl && (
                                        <a
                                            href={meeting.meetingUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                                        >
                                            <LinkIcon size={14} />
                                            Join Call
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {pastMeetings.length === 0 ? (
                        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center text-slate-500">
                            <Video size={48} className="mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-1">No Past Recordings</h3>
                            <p>Recordings and transcripts from Zap Bot will appear here.</p>
                        </div>
                    ) : (
                        pastMeetings.map((meeting) => (
                            <div key={meeting.id} className="bg-white rounded-lg border border-slate-200 p-5 hover:border-slate-300 transition-colors shadow-sm flex flex-col md:flex-row md:items-center gap-6">
                                <div className="md:w-32 shrink-0">
                                    <p className="text-sm font-medium text-slate-500">
                                        {format(new Date(meeting.startTime), "MMM do, yyyy")}
                                    </p>
                                    <p className="text-sm text-slate-400">
                                        {format(new Date(meeting.startTime), "h:mm a")}
                                    </p>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-lg text-slate-900 truncate mb-2">
                                        {meeting.title}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-3">
                                        {meeting.transcriptReady ? (
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200">
                                                <CheckCircle2 size={12} />
                                                Transcribed
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                                                <Loader2 size={12} className="animate-spin" />
                                                Processing
                                            </span>
                                        )}
                                        {meeting.summary && (
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-200">
                                                <FileText size={12} />
                                                Summary Ready
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full md:w-auto">
                                    {meeting.recordingUrl ? (
                                        <a
                                            href={meeting.recordingUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex flex-1 justify-center items-center gap-2 rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200"
                                        >
                                            <Play size={14} />
                                            Play
                                        </a>
                                    ) : (
                                        <button disabled className="inline-flex flex-1 justify-center items-center gap-2 rounded-md bg-slate-50 px-4 py-2 text-sm font-medium text-slate-400 border border-slate-200 cursor-not-allowed">
                                            <Play size={14} />
                                            Play
                                        </button>
                                    )}
                                    {meeting.transcriptReady && (
                                        <a
                                            href={`/dashboard/meetings/${meeting.id}`}
                                            className="inline-flex flex-1 justify-center items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                                        >
                                            <FileText size={14} />
                                            View
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
