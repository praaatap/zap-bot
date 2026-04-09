import Chat from "../../components/Chat";
import MeetingActions from "./MeetingActions";
import MeetingContainer from "./MeetingContainer";
import { ChevronLeft, Calendar, Clock, Video, CheckCircle2, Info, Users } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// ── Demo Data ──────────────────────────────────────────────────────
const DEMO_DATA: Record<string, { meeting: Record<string, unknown>; transcript: { entries: Array<{ speaker: string; text: string; startTime: number; endTime: number }> } | null }> = {
    "mtg-001": {
        meeting: {
            id: "mtg-001",
            title: "Weekly Team Standup",
            platform: "google_meet",
            meetingUrl: "https://meet.google.com/abc-defg-hij",
            recordingUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
            duration: 1800,
            botStatus: "completed",
            participants: ["Alice Johnson", "Bob Smith", "Charlie Park"],
            summary:
                "Discussed sprint progress. Alice completed the auth module. Bob needs help with the API integration. Charlie will review the test suite by Friday.",
            chapters: [
                { title: "Introduction", startTime: 0 },
                { title: "API Integration Blockers", startTime: 6 },
                { title: "Test Suite Progress", startTime: 26 },
                { title: "Wrap Up", startTime: 40 }
            ],
            highlights: [
                { type: "decision", text: "Alice will walk Bob through the auth module after the call.", timestamp: 15 },
                { type: "insight", text: "Test suite should have full coverage by Friday.", timestamp: 30 }
            ]
        },
        transcript: {
            entries: [
                { speaker: "Alice Johnson", text: "Good morning everyone. Let's get started with the standup.", startTime: 0, endTime: 5 },
                { speaker: "Bob Smith", text: "Hey Alice! I've been working on the API integration but hit a blocker with the authentication flow.", startTime: 6, endTime: 14 },
                { speaker: "Alice Johnson", text: "I actually just finished the auth module yesterday. I can walk you through it after this call.", startTime: 15, endTime: 22 },
                { speaker: "Bob Smith", text: "That would be amazing, thanks!", startTime: 23, endTime: 25 },
                { speaker: "Charlie Park", text: "On my end, I'm almost done with the test suite. Should have full coverage by Friday.", startTime: 26, endTime: 33 },
                { speaker: "Alice Johnson", text: "Great progress everyone. Let's sync again tomorrow. Charlie, feel free to reach out if you need any help with the test mocks.", startTime: 34, endTime: 43 },
                { speaker: "Charlie Park", text: "Will do. Thanks everyone!", startTime: 44, endTime: 47 },
            ],
        },
    },
    "mtg-002": {
        meeting: {
            id: "mtg-002",
            title: "Product Design Review",
            platform: "zoom",
            meetingUrl: "https://zoom.us/j/123456789",
            startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
            duration: 3600,
            botStatus: "completed",
            participants: ["Diana Lee", "Eric Wang", "Fiona Martinez"],
            summary:
                "Reviewed new dashboard mockups. Team agreed on the dark theme approach. Need to finalize the color palette by next week. Action item: Diana will create high-fidelity prototypes.",
        },
        transcript: {
            entries: [
                { speaker: "Diana Lee", text: "Welcome to the design review. I have three mockup variants to show you today.", startTime: 0, endTime: 7 },
                { speaker: "Eric Wang", text: "Looking forward to it. Are we going with the dark theme we discussed last time?", startTime: 8, endTime: 14 },
                { speaker: "Diana Lee", text: "Yes, all three variants use a dark base. Let me share my screen.", startTime: 15, endTime: 21 },
                { speaker: "Fiona Martinez", text: "I really like variant B. The glassmorphism cards give it a premium feel.", startTime: 22, endTime: 29 },
                { speaker: "Eric Wang", text: "Agreed. The gradient accents in variant B are much more polished.", startTime: 30, endTime: 36 },
                { speaker: "Diana Lee", text: "Perfect. I'll create high-fidelity prototypes based on variant B by next week.", startTime: 37, endTime: 44 },
            ],
        },
    },
};

// ── Helpers ────────────────────────────────────────────────────────
function getInitials(name: string): string {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatTimestamp(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDuration(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
}

function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

const PLATFORM_NAMES: Record<string, string> = {
    google_meet: "Google Meet",
    zoom: "Zoom",
    teams: "Microsoft Teams",
};

async function fetchMeetingDetail(id: string) {
    try {
        const res = await fetch(`${API_URL}/api/meetings/${id}`, {
            cache: "no-store",
        });
        if (!res.ok) throw new Error("API not available");
        const json = await res.json();
        return json.data;
    } catch {
        return DEMO_DATA[id] || null;
    }
}

// ── Page ───────────────────────────────────────────────────────────
export default async function MeetingDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const data = await fetchMeetingDetail(id);

    if (!data) {
        return (
            <div className="pt-20 pb-20 px-4 md:px-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500">
                    <Video className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Meeting not found</h1>
                <p className="text-zinc-500 max-w-xs">
                    This meeting may not exist or hasn&apos;t been recorded yet.
                </p>
                <Link
                    href="/dashboard"
                    className="mt-4 px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors inline-flex items-center gap-2"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    const { meeting, transcript } = data;
    const participants = (meeting.participants as string[]) || [];

    return (
        <div className="min-h-screen bg-black text-zinc-100 pt-20 pb-20 px-4 md:px-8 flex flex-col gap-10">
            <div className="max-w-7xl mx-auto w-full flex flex-col gap-10">

                {/* ── Top Nav ────────────────────────────────────── */}
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Back to Dashboard
                </Link>

                <div className="flex flex-col gap-10">
                    {/* ── Header ──────────────────────────────────── */}
                    <div className="flex flex-col gap-4">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white italic">
                            {meeting.title as string}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-zinc-300">
                                <Video className="w-3.5 h-3.5 text-zinc-500" />
                                {PLATFORM_NAMES[meeting.platform as string] || "Meeting"}
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-zinc-300">
                                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                                {formatDateTime(meeting.startTime as string)}
                            </div>
                            {meeting.duration && (
                                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-zinc-300">
                                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                                    {formatDuration(meeting.duration as number)}
                                </div>
                            )}
                            <div className={cn(
                                "flex items-center gap-2 px-3 py-1 border rounded-full text-xs font-bold uppercase tracking-wider",
                                meeting.botStatus === 'completed' ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5" : "border-zinc-800 text-zinc-500 bg-zinc-900"
                            )}>
                                {meeting.botStatus === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                {(meeting.botStatus as string).replace("_", " ")}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* ── Left: Summary + Transcript (Tabbed) ─────────────── */}
                        <div className="lg:col-span-2">
                            <MeetingContainer
                                meeting={meeting}
                                transcript={transcript}
                                meetingId={id}
                                formatTimestamp={formatTimestamp}
                                getInitials={getInitials}
                            />
                        </div>

                        {/* ── Right: Sidebar ─────────────────────────── */}
                        <div className="flex flex-col gap-8">
                            {/* Actions */}
                            <MeetingActions
                                meetingId={id}
                                title={(meeting.title as string) || "Meeting"}
                                summary={(meeting.summary as string) || ""}
                                transcriptEntries={(transcript?.entries as Array<{ speaker: string; text: string; startTime: number; endTime: number }>) || []}
                                recordingUrl={(meeting.recordingUrl as string) || ""}
                            />

                            {/* Meeting Info */}
                            <div className="pro-card p-6 flex flex-col gap-6">
                                <div className="flex items-center gap-2">
                                    <Info className="w-4 h-4 text-white" />
                                    <h3 className="text-sm font-bold text-white uppercase italic tracking-widest">Metadata</h3>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Platform</span>
                                        <span className="text-xs font-bold text-white italic">{PLATFORM_NAMES[meeting.platform as string]}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Status</span>
                                        <span className="text-xs font-bold text-white italic capitalize">{(meeting.botStatus as string).replace("_", " ")}</span>
                                    </div>
                                    {meeting.duration && (
                                        <div className="flex items-center justify-between py-2 border-b border-white/5">
                                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Duration</span>
                                            <span className="text-xs font-bold text-white italic">{formatDuration(meeting.duration as number)}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Participants</span>
                                        <span className="text-xs font-bold text-white italic">{participants.length}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Participants */}
                            {participants.length > 0 && (
                                <div className="pro-card p-6 flex flex-col gap-6">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-white" />
                                        <h3 className="text-sm font-bold text-white uppercase italic tracking-widest">Attendance</h3>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        {participants.map((name) => (
                                            <div key={name} className="flex items-center gap-3 group">
                                                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 group-hover:border-white/20 transition-all">
                                                    {getInitials(name)}
                                                </div>
                                                <span className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors">{name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Chatbot */}
                            <Chat meetingId={id} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

}

