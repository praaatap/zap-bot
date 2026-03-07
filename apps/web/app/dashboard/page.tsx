import QuickJoinPanel from "./QuickJoinPanel";
import DashboardActions from "./DashboardActions";
import SystemStatus from "./SystemStatus";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type MeetingData = Record<string, unknown>;
type StatsData = {
    totalMeetings: number;
    hoursTranscribed: number;
    activeBots: number;
    meetingsThisWeek: number;
};

function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60 * 60 * 1000) return `${Math.round(diff / 60000)}m ago`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.round(diff / 3600000)}h ago`;
    if (d.toDateString() === now.toDateString()) return "Today";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function formatDuration(s: number) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const PLATFORM_LABELS: Record<string, string> = {
    google_meet: "Google Meet",
    zoom: "Zoom (In Dev)",
    teams: "Teams (In Dev)",
};

const PLATFORM_STATUS: Record<string, "available" | "in_dev"> = {
    google_meet: "available",
    zoom: "in_dev",
    teams: "in_dev",
};

const PLATFORM_MARKS: Record<string, string> = {
    google_meet: "G",
    zoom: "Z",
    teams: "T",
};

const BADGE_MAP: Record<string, string> = {
    completed: "badge-completed",
    pending: "badge-pending",
    joining: "badge-joining",
    in_meeting: "badge-in_meeting",
    recording: "badge-recording",
    processing: "badge-processing",
    failed: "badge-failed",
};

const BADGE_LABELS: Record<string, string> = {
    completed: "Completed",
    pending: "Pending",
    joining: "Joining",
    in_meeting: "In Meeting",
    recording: "Recording",
    processing: "Processing",
    failed: "Failed",
};

const DEMO_MEETINGS = [
    {
        id: "mtg-001",
        title: "Weekly Team Standup",
        platform: "google_meet",
        startTime: new Date(Date.now() - 2 * 3600000).toISOString(),
        duration: 1800,
        botStatus: "completed",
        participants: ["Alice Johnson", "Bob Smith", "Charlie Park"],
        summary: "Discussed sprint progress. Alice completed the auth module. Bob needs help with the API integration.",
    },
    {
        id: "mtg-002",
        title: "Product Design Review",
        platform: "zoom",
        startTime: new Date(Date.now() - 24 * 3600000).toISOString(),
        duration: 3600,
        botStatus: "completed",
        participants: ["Diana Lee", "Eric Wang", "Fiona Martinez"],
        summary: "Reviewed new dashboard mockups. Team agreed on the dark theme approach. Diana to create prototypes.",
    },
    {
        id: "mtg-003",
        title: "Client Onboarding Call",
        platform: "teams",
        startTime: new Date(Date.now() + 3600000).toISOString(),
        botStatus: "pending",
        participants: ["Grace Kim"],
    },
    {
        id: "mtg-004",
        title: "Engineering Architecture Review",
        platform: "google_meet",
        startTime: new Date(Date.now() + 3 * 3600000).toISOString(),
        botStatus: "pending",
        participants: ["Henry Chen", "Iris Patel", "Jake Thompson"],
    },
    {
        id: "mtg-005",
        title: "Sprint Retrospective",
        platform: "google_meet",
        startTime: new Date(Date.now() - 48 * 3600000).toISOString(),
        duration: 2700,
        botStatus: "completed",
        participants: ["Alice Johnson", "Bob Smith", "Diana Lee", "Eric Wang"],
        summary: "Key wins: improved deployment pipeline, reduced bug backlog by 40%.",
    },
    {
        id: "mtg-006",
        title: "Sales Pipeline Review",
        platform: "zoom",
        startTime: new Date(Date.now() - 4 * 3600000).toISOString(),
        duration: 2700,
        botStatus: "completed",
        participants: ["Lisa Wang", "Mark Davis"],
        summary: "Three enterprise deals closing next week. Need to prep demo for Acme Corp.",
    },
];

const DEMO_STATS = {
    totalMeetings: 142,
    hoursTranscribed: 89,
    activeBots: 3,
    meetingsThisWeek: 12,
};

async function fetchMeetings(): Promise<MeetingData[]> {
    try {
        const res = await fetch(`${API_URL}/api/meetings`, { cache: "no-store" });
        if (!res.ok) throw new Error("API not available");
        const j = await res.json() as { data?: MeetingData[] };
        return j.data || DEMO_MEETINGS;
    } catch {
        return DEMO_MEETINGS;
    }
}

async function fetchStats(): Promise<StatsData> {
    try {
        const res = await fetch(`${API_URL}/api/meetings/stats`, { cache: "no-store" });
        if (!res.ok) throw new Error("API not available");
        const j = await res.json() as { data?: StatsData };
        return j.data || DEMO_STATS;
    } catch {
        return DEMO_STATS;
    }
}

function MeetingCard({ m }: { m: MeetingData }) {
    const status = (m.botStatus as string) || "pending";
    const badgeClass = BADGE_MAP[status] || "badge-pending";
    const participants = (m.participants as string[]) || [];
    const isFuture = new Date(m.startTime as string) > new Date();
    const duration = typeof m.duration === "number" ? m.duration : null;
    const summary = typeof m.summary === "string" ? m.summary : "";

    return (
        <a href={`/meetings/${m.id}`} className="meetingCard" id={`meeting-${m.id}`}>
            <div className="cardHead">
                <span className="cardTitle">{m.title as string}</span>
                <span className={`badge ${badgeClass}`}>{BADGE_LABELS[status]}</span>
            </div>

            <div className="cardMeta">
                <span className="platformPill">
                    <span className="platformMark">{PLATFORM_MARKS[m.platform as string]}</span>
                    {PLATFORM_LABELS[m.platform as string]}
                </span>
                {PLATFORM_STATUS[m.platform as string] === "in_dev" && (
                    <span className="badge-pending text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                        Coming Soon
                    </span>
                )}
                <span className="cardMetaItem">
                    {isFuture ? formatTime(m.startTime as string) : formatDate(m.startTime as string)}
                </span>
                {duration !== null && <span className="cardMetaItem">{formatDuration(duration)}</span>}
            </div>

            {summary ? <p className="cardSummary">{summary}</p> : null}

            {participants.length > 0 && (
                <div className="cardParticipants">
                    <div className="avatarStack">
                        {participants.slice(0, 4).map((name) => (
                            <div key={name} className="pAvatar" title={name}>
                                {getInitials(name)}
                            </div>
                        ))}
                    </div>
                    <span className="cardParticipantCount">
                        {participants.length} participant{participants.length !== 1 ? "s" : ""}
                    </span>
                </div>
            )}
        </a>
    );
}

export default async function DashboardPage() {
    const [meetings, stats] = await Promise.all([fetchMeetings(), fetchStats()]);

    const live = meetings.filter((m) => ["recording", "in_meeting"].includes(m.botStatus as string));
    const upcoming = meetings
        .filter((m) => m.botStatus === "pending")
        .sort((a, b) => new Date(a.startTime as string).getTime() - new Date(b.startTime as string).getTime());
    const recent = meetings
        .filter((m) => ["completed", "failed"].includes(m.botStatus as string))
        .sort((a, b) => new Date(b.startTime as string).getTime() - new Date(a.startTime as string).getTime());

    const statCards = [
        { label: "Total Meetings", value: stats.totalMeetings, sub: "All time" },
        { label: "Hours Transcribed", value: `${stats.hoursTranscribed}h`, sub: "Across all sessions" },
        { label: "Active Bots", value: stats.activeBots, sub: "Running now" },
        { label: "Meetings This Week", value: stats.meetingsThisWeek, sub: "Current week" },
    ];

    return (
        <>
            <div className="topbar">
                <div className="topbarLeft">
                    <h1 className="topbarTitle">Dashboard</h1>
                    <span className="topbarSub">
                        {new Date().toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </span>
                </div>
                <DashboardActions />
            </div>

            <div className="pageContent">
                <div className="heroGrid">
                    <QuickJoinPanel />
                    <SystemStatus />
                </div>

                <div className="statsRow">
                    {statCards.map((card) => (
                        <div className="statCard" key={card.label}>
                            <div className="statCardTop">
                                <span className="statCardLabel">{card.label}</span>
                            </div>
                            <div className="statCardValue">{card.value}</div>
                            <div className="statCardSub">{card.sub}</div>
                        </div>
                    ))}
                </div>

                {live.length > 0 && (
                    <>
                        <div className="sectionRow">
                            <span className="sectionLabel">Live Now</span>
                        </div>
                        {live.map((m) => (
                            <div key={m.id as string} className="liveBanner">
                                <div className="liveDot" />
                                <div className="liveInfo">
                                    <div className="liveTitle">{m.title as string}</div>
                                    <div className="liveMeta">
                                        {PLATFORM_LABELS[m.platform as string]} | Started {formatDate(m.startTime as string)}
                                    </div>
                                </div>
                                <div className="liveActions">
                                    <a href={`/meetings/${m.id}`} className="btnLiveView">View Live</a>
                                </div>
                            </div>
                        ))}
                    </>
                )}

                <div className="sectionRow">
                    <span className="sectionLabel">Upcoming</span>
                    <a href="/settings" className="sectionAction">Manage calendar</a>
                </div>
                <div className="meetingsGrid">
                    {upcoming.length > 0
                        ? upcoming.map((m) => <MeetingCard key={m.id as string} m={m} />)
                        : (
                            <div className="emptyState">
                                <div className="emptyTitle">No upcoming meetings</div>
                                <div className="emptyDesc">Connect your calendar or join manually</div>
                            </div>
                        )}
                </div>

                <div className="sectionRow">
                    <span className="sectionLabel">Recent Meetings</span>
                    <a href="/dashboard" className="sectionAction">Refresh list</a>
                </div>
                <div className="meetingsGrid">
                    {recent.length > 0
                        ? recent.map((m) => <MeetingCard key={m.id as string} m={m} />)
                        : (
                            <div className="emptyState">
                                <div className="emptyTitle">No recorded meetings yet</div>
                                <div className="emptyDesc">Your bot will record meetings automatically</div>
                            </div>
                        )}
                </div>
            </div>
        </>
    );
}
