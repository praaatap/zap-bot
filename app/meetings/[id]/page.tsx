import Chat from "../../components/Chat";
import MeetingActions from "./MeetingActions";
import MeetingContainer from "./MeetingContainer";
import { ChevronLeft, Calendar, Clock, Video, CheckCircle2, Info, Users } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import { cn } from "@/lib/utils";

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
    microsoft_teams: "Microsoft Teams",
    webex: "Webex",
    other: "Meeting",
    unknown: "Meeting",
};

async function fetchMeetingDetail(id: string) {
    try {
        const requestHeaders = await headers();
        const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host");
        if (!host) {
            return null;
        }

        const protocol = requestHeaders.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
        const cookie = requestHeaders.get("cookie") || "";

        const res = await fetch(`${protocol}://${host}/api/meetings/${id}`, {
            cache: "no-store",
            headers: cookie ? { cookie } : undefined,
        });

        if (!res.ok) {
            return null;
        }

        const json = await res.json();
        return json?.data || null;
    } catch {
        return null;
    }
}

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
                    href="/dashboard/meetings"
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
    const platformLabel = PLATFORM_NAMES[meeting.platform as string] || "Meeting";
    const botStatus = String(meeting.botStatus || "pending");

    return (
        <div className="min-h-screen bg-black text-zinc-100 pt-20 pb-20 px-4 md:px-8 flex flex-col gap-10">
            <div className="max-w-7xl mx-auto w-full flex flex-col gap-10">
                <Link
                    href="/dashboard/meetings"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Back to Dashboard
                </Link>

                <div className="flex flex-col gap-10">
                    <div className="flex flex-col gap-4">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white italic">
                            {meeting.title as string}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-zinc-300">
                                <Video className="w-3.5 h-3.5 text-zinc-500" />
                                {platformLabel}
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-zinc-300">
                                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                                {formatDateTime(meeting.startTime as string)}
                            </div>
                            {meeting.duration ? (
                                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-zinc-300">
                                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                                    {formatDuration(meeting.duration as number)}
                                </div>
                            ) : null}
                            <div className={cn(
                                "flex items-center gap-2 px-3 py-1 border rounded-full text-xs font-bold uppercase tracking-wider",
                                botStatus === "completed" ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5" : "border-zinc-800 text-zinc-500 bg-zinc-900"
                            )}>
                                {botStatus === "completed" && <CheckCircle2 className="w-3.5 h-3.5" />}
                                {botStatus.replace("_", " ")}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-2">
                            <MeetingContainer
                                meeting={meeting}
                                transcript={transcript}
                                meetingId={id}
                                formatTimestamp={formatTimestamp}
                                getInitials={getInitials}
                            />
                        </div>

                        <div className="flex flex-col gap-8">
                            <MeetingActions
                                meetingId={id}
                                title={(meeting.title as string) || "Meeting"}
                                summary={(meeting.summary as string) || ""}
                                transcriptEntries={(transcript?.entries as Array<{ speaker: string; text: string; startTime: number; endTime: number }>) || []}
                                recordingUrl={(meeting.recordingUrl as string) || ""}
                                botStatus={botStatus}
                                botId={meeting.botId}
                                botSent={meeting.botSent}
                            />

                            <div className="pro-card p-6 flex flex-col gap-6">
                                <div className="flex items-center gap-2">
                                    <Info className="w-4 h-4 text-white" />
                                    <h3 className="text-sm font-bold text-white uppercase italic tracking-widest">Metadata</h3>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Platform</span>
                                        <span className="text-xs font-bold text-white italic">{platformLabel}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Status</span>
                                        <span className="text-xs font-bold text-white italic capitalize">{botStatus.replace("_", " ")}</span>
                                    </div>
                                    {meeting.duration ? (
                                        <div className="flex items-center justify-between py-2 border-b border-white/5">
                                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Duration</span>
                                            <span className="text-xs font-bold text-white italic">{formatDuration(meeting.duration as number)}</span>
                                        </div>
                                    ) : null}
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Participants</span>
                                        <span className="text-xs font-bold text-white italic">{participants.length}</span>
                                    </div>
                                </div>
                            </div>

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

                            <Chat meetingId={id} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
