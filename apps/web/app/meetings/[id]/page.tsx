import "./meeting.css";
import Chat from "../../components/Chat";
import MeetingActions from "./MeetingActions";
import { MeetingTabs } from "./MeetingTabs";
import AudioPlayer from "./AudioPlayer";
import MeetingContainer from "./MeetingContainer";

// Empty string for relative requests mapped to Next.js API Routes (Serverless)
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
    "mtg-005": {
        meeting: {
            id: "mtg-005",
            title: "Sprint Retrospective",
            platform: "google_meet",
            meetingUrl: "https://meet.google.com/ret-rosp-ect",
            startTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString(),
            duration: 2700,
            botStatus: "completed",
            participants: ["Alice Johnson", "Bob Smith", "Diana Lee", "Eric Wang"],
            summary:
                "Team reflected on the sprint. Key wins: improved deployment pipeline, reduced bug backlog. Areas to improve: better estimation, more pair programming.",
        },
        transcript: null,
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
            <div className="meetingDetail">
                <div className="meetingDetailNav">
                    <a href="/dashboard" className="backLink">← Back to Dashboard</a>
                </div>
                <div className="meetingDetailContent">
                    <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--text-tertiary)" }}>
                        <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔍</div>
                        <h2>Meeting not found</h2>
                        <p style={{ marginTop: 8 }}>This meeting may not exist or hasn&apos;t been recorded yet.</p>
                    </div>
                </div>
            </div>
        );
    }

    const { meeting, transcript } = data;
    const participants = (meeting.participants as string[]) || [];

    return (
        <div className="meetingDetail">
            {/* ── Top Nav ────────────────────────────────────── */}
            <div className="meetingDetailNav">
                <a href="/dashboard" className="backLink">← Back to Dashboard</a>
            </div>

            <div className="meetingDetailContent">
                {/* ── Header ──────────────────────────────────── */}
                <div className="meetingDetailHeader">
                    <h1 className="meetingDetailTitle">{meeting.title as string}</h1>
                    <div className="meetingDetailMeta">
                        <span className="metaChip">
                            📹 {PLATFORM_NAMES[meeting.platform as string] || "Meeting"}
                        </span>
                        <span className="metaChip">
                            🕐 {formatDateTime(meeting.startTime as string)}
                        </span>
                        {meeting.duration && (
                            <span className="metaChip">
                                ⏱️ {formatDuration(meeting.duration as number)}
                            </span>
                        )}
                        <span className="metaChip">
                            {meeting.botStatus === "completed" ? "✅" : "⏳"}{" "}
                            {(meeting.botStatus as string).replace("_", " ")}
                        </span>
                    </div>
                </div>

                <div className="meetingDetailGrid">
                    {/* ── Left: Summary + Transcript (Tabbed) ─────────────── */}
                    <MeetingContainer
                        meeting={meeting}
                        transcript={transcript}
                        meetingId={id}
                        formatTimestamp={formatTimestamp}
                        getInitials={getInitials}
                    />

                    {/* ── Right: Sidebar ─────────────────────────── */}
                    <div className="detailSidebar">
                        {/* Actions */}
                        <MeetingActions
                            meetingId={id}
                            title={(meeting.title as string) || "Meeting"}
                            summary={(meeting.summary as string) || ""}
                            transcriptEntries={(transcript?.entries as Array<{ speaker: string; text: string; startTime: number; endTime: number }>) || []}
                            recordingUrl={(meeting.recordingUrl as string) || ""}
                        />

                        {/* Meeting Info */}
                        <div className="infoCard">
                            <h3 className="infoCardTitle">ℹ️ Meeting Info</h3>
                            <div className="infoRow">
                                <span className="infoLabel">Platform</span>
                                <span className="infoValue">{PLATFORM_NAMES[meeting.platform as string]}</span>
                            </div>
                            <div className="infoRow">
                                <span className="infoLabel">Status</span>
                                <span className="infoValue" style={{ textTransform: "capitalize" }}>
                                    {(meeting.botStatus as string).replace("_", " ")}
                                </span>
                            </div>
                            {meeting.duration && (
                                <div className="infoRow">
                                    <span className="infoLabel">Duration</span>
                                    <span className="infoValue">{formatDuration(meeting.duration as number)}</span>
                                </div>
                            )}
                            <div className="infoRow">
                                <span className="infoLabel">Participants</span>
                                <span className="infoValue">{participants.length}</span>
                            </div>
                        </div>

                        {/* Participants */}
                        {participants.length > 0 && (
                            <div className="infoCard">
                                <h3 className="infoCardTitle">👥 Participants</h3>
                                <div className="participantsList">
                                    {participants.map((name) => (
                                        <div key={name} className="participantItem">
                                            <div className="participantDot">{getInitials(name)}</div>
                                            {name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Chatbot using Tailwind */}
                        <Chat meetingId={id} />
                    </div>
                </div>
            </div>
        </div>
    );
}

