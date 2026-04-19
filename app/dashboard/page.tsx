"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { CalendarDays, Filter, Plus, MoreVertical, Flame } from "lucide-react";
import dynamic from "next/dynamic";
import MeetingDialog from "@/components/MeetingDialog";

const ResponsiveContainer = dynamic(
    () => import("recharts").then((mod) => mod.ResponsiveContainer),
    { ssr: false, loading: () => <div className="h-57.5 w-full animate-pulse rounded-lg bg-slate-100" /> }
);

const LineChart = dynamic(
    () => import("recharts").then((mod) => mod.LineChart),
    { ssr: false }
);

const Line = dynamic(
    () => import("recharts").then((mod) => mod.Line),
    { ssr: false }
);

const XAxis = dynamic(
    () => import("recharts").then((mod) => mod.XAxis),
    { ssr: false }
);

const YAxis = dynamic(
    () => import("recharts").then((mod) => mod.YAxis),
    { ssr: false }
);

const CartesianGrid = dynamic(
    () => import("recharts").then((mod) => mod.CartesianGrid),
    { ssr: false }
);

const Tooltip = dynamic(
    () => import("recharts").then((mod) => mod.Tooltip),
    { ssr: false }
);

const BarChart = dynamic(
    () => import("recharts").then((mod) => mod.BarChart),
    { ssr: false }
);

const Bar = dynamic(
    () => import("recharts").then((mod) => mod.Bar),
    { ssr: false }
);

const Cell = dynamic(
    () => import("recharts").then((mod) => mod.Cell),
    { ssr: false }
);

type DashboardStats = {
    totalMeetings: number;
    todayMeetings: number;
    processedMeetings: number;
    pendingMeetings: number;
    openActionItems: number;
    overdue: number;
    hours: number;
    upcomingStatusCounts: {
        scheduled: number;
        needsBot: number;
        live: number;
    };
};

type WeeklyPoint = {
    label: string;
    completed: number;
    pending: number;
};

type RecentMeeting = {
    id: string;
    title: string;
    startTime: string;
    platform: string;
    transcriptReady: boolean;
    hasRecording: boolean;
};

const PLATFORM_LABELS: Record<string, string> = {
    google_meet: "Google Meet",
    zoom: "Zoom",
    microsoft_teams: "Microsoft Teams",
    webex: "Webex",
    other: "Other",
    unknown: "Unknown",
};

function formatMeetingMeta(meeting: RecentMeeting): string {
    const date = new Date(meeting.startTime);
    const dayLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const timeLabel = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    const platformLabel = PLATFORM_LABELS[meeting.platform] || "Meeting";
    return `${dayLabel} at ${timeLabel} / ${platformLabel}`;
}

function formatDashboardRangeLabel(): string {
    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - 27);

    const startLabel = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const endLabel = end.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${startLabel} - ${endLabel}`;
}

export default function DashboardPage() {
    const { user } = useUser();
    const router = useRouter();
    const firstName = user?.firstName || "Operator";
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        totalMeetings: 0,
        todayMeetings: 0,
        processedMeetings: 0,
        pendingMeetings: 0,
        openActionItems: 0,
        overdue: 0,
        hours: 0,
        upcomingStatusCounts: {
            scheduled: 0,
            needsBot: 0,
            live: 0,
        },
    });
    const [weeklyTrend, setWeeklyTrend] = useState<WeeklyPoint[]>([]);
    const [recentMeetings, setRecentMeetings] = useState<RecentMeeting[]>([]);

    useEffect(() => {
        async function loadData() {
            try {
                const overviewRes = await fetch("/api/dashboard/overview");
                if (!overviewRes.ok) {
                    throw new Error("Failed to fetch dashboard overview");
                }

                const { data } = await overviewRes.json();
                const weekly = Array.isArray(data.insights?.weekly) ? data.insights.weekly : [];
                const totalHours = weekly.reduce((acc: number, point: any) => acc + (point.hours || 0), 0);

                setWeeklyTrend(
                    weekly.map((point: any, idx: number) => ({
                        label: point.label || point.week || `W${idx + 1}`,
                        completed: point.processed || 0,
                        pending: point.pending || 0,
                    }))
                );

                setRecentMeetings(
                    Array.isArray(data.meetingIndex) ? data.meetingIndex.slice(0, 4) : []
                );

                setStats({
                    totalMeetings: data.overview?.totalMeetings || 0,
                    todayMeetings: data.overview?.todayMeetings || 0,
                    processedMeetings: data.overview?.processedMeetings || 0,
                    pendingMeetings: data.overview?.pendingMeetings || 0,
                    openActionItems: data.overview?.openActionItems || 0,
                    overdue: data.insights?.overdueTasks || 0,
                    hours: Math.round(totalHours),
                    upcomingStatusCounts: data.analytics?.upcomingStatusCounts || {
                        scheduled: 0,
                        needsBot: 0,
                        live: 0,
                    },
                });
            } catch (error) {
                console.error("Dashboard error:", error);
            } finally {
                setIsLoading(false);
            }
        }

        void loadData();
    }, []);

    const statusBars = [
        { name: "Scheduled", value: stats.upcomingStatusCounts.scheduled, color: "#0ea5e9" },
        { name: "Needs Bot", value: stats.upcomingStatusCounts.needsBot, color: "#f97316" },
        { name: "Live", value: stats.upcomingStatusCounts.live, color: "#16a34a" },
    ];

    const cards = [
        { label: "Total Meetings", value: stats.totalMeetings, sub: `${stats.todayMeetings} today`, color: "bg-sky-100 text-sky-600" },
        { label: "Processed", value: stats.processedMeetings, sub: `${stats.hours} hrs captured`, color: "bg-emerald-100 text-emerald-600" },
        { label: "Pending Review", value: stats.pendingMeetings, sub: `${stats.pendingMeetings} in pipeline`, color: "bg-orange-100 text-orange-600" },
        { label: "Action Items", value: stats.openActionItems, sub: `${stats.overdue} overdue tasks`, color: "bg-fuchsia-100 text-fuchsia-600" },
    ];

    return (
        <div className="flex h-[calc(100vh-100px)] w-full flex-col overflow-hidden bg-[#f7f8fb] px-6 py-5">
            <div className="custom-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
                <div className="flex items-center gap-2 text-sm font-medium text-[#6b7280]">
                    <span>Main Menu</span>
                    <span>{">"}</span>
                    <span className="text-[#111827]">Dashboard</span>
                </div>

                <div className="flex flex-col gap-3 rounded-2xl border border-[#e6e8ee] bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                    <button className="inline-flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-3 py-2 text-xs font-medium text-[#374151]">
                        <CalendarDays size={14} strokeWidth={2.2} />
                        {formatDashboardRangeLabel()}
                    </button>
                    <div className="flex items-center gap-2">
                        <button className="inline-flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-xs font-semibold text-[#374151]">
                            <Filter size={14} strokeWidth={2.2} />
                            Filter
                        </button>
                        <button
                            onClick={() => setIsDialogOpen(true)}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#1f2937] px-3 py-2 text-xs font-semibold text-white hover:bg-[#111827]"
                        >
                            Add Meeting
                            <Plus size={14} strokeWidth={2.4} />
                        </button>
                    </div>
                </div>

                <div>
                    <h1 className="text-[34px] font-bold tracking-tight text-[#111827]">
                        Stay Organized, Stay Productive {firstName} <Flame className="inline h-7 w-7 text-orange-500" />
                    </h1>
                    <p className="mt-1 text-[15px] text-[#6b7280]">
                        Effortlessly manage meetings, track insights, and achieve goals all in one place.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, idx) => (
                            <div key={idx} className="animate-pulse rounded-xl border border-[#e6e8ee] bg-white p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-7 w-7 rounded-md bg-slate-200" />
                                        <div className="h-4 w-24 rounded bg-slate-200" />
                                    </div>
                                    <div className="h-4 w-4 rounded bg-slate-200" />
                                </div>
                                <div className="mt-2 h-10 w-16 rounded bg-slate-200" />
                                <div className="mt-1 h-4 w-20 rounded bg-slate-200" />
                            </div>
                        ))
                    ) : (
                        cards.map((card) => (
                            <div key={card.label} className="rounded-xl border border-[#e6e8ee] bg-white p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`h-7 w-7 rounded-md ${card.color}`} />
                                        <p className="text-[15px] font-semibold text-[#1f2937]">{card.label}</p>
                                    </div>
                                    <MoreVertical size={16} className="text-[#9ca3af]" />
                                </div>
                                <p className="mt-2 text-[34px] font-bold leading-none text-[#111827]">{card.value}</p>
                                <p className="mt-1 text-sm text-[#6b7280]">{card.sub}</p>
                            </div>
                        ))
                    )}
                </div>

                <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
                    <div className="rounded-xl border border-[#e6e8ee] bg-white p-4 xl:col-span-2">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-[22px] font-semibold text-[#111827]">Meeting Activity Over Time</h3>
                            <button className="inline-flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-xs font-semibold text-[#4b5563]">
                                <CalendarDays size={14} strokeWidth={2.2} />
                                Date Range
                            </button>
                        </div>
                        <div className="h-57.5 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={weeklyTrend} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
                                    <CartesianGrid stroke="#eef2f7" strokeDasharray="4 4" vertical={false} />
                                    <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="completed" stroke="#0ea5e9" strokeWidth={2.5} dot={false} />
                                    <Line type="monotone" dataKey="pending" stroke="#10b981" strokeWidth={2.5} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="rounded-xl border border-[#e6e8ee] bg-white p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-[22px] font-semibold text-[#111827]">Upcoming Meetings by Bot Status</h3>
                            <button className="inline-flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-xs font-semibold text-[#4b5563]">
                                <CalendarDays size={14} strokeWidth={2.2} />
                                Date Range
                            </button>
                        </div>
                        <div className="h-57.5 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={statusBars} margin={{ top: 5, right: 0, left: -22, bottom: 0 }}>
                                    <CartesianGrid stroke="#eef2f7" strokeDasharray="4 4" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip />
                                    <Bar dataKey="value" radius={[7, 7, 0, 0]} barSize={26}>
                                        {statusBars.map((entry) => (
                                            <Cell key={entry.name} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-[#e6e8ee] bg-white p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-[22px] font-semibold text-[#111827]">Recent Meetings</h3>
                        <button
                            onClick={() => router.push("/dashboard/meetings")}
                            className="inline-flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-xs font-semibold text-[#4b5563]"
                        >
                            View All
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-4">
                        {isLoading ? (
                            <p className="col-span-full text-center text-sm text-[#6b7280]">Loading meetings...</p>
                        ) : recentMeetings.length === 0 ? (
                            <p className="col-span-full text-center text-sm text-[#6b7280]">No recent meetings found</p>
                        ) : (
                            recentMeetings.map((meeting) => (
                                <div key={meeting.id} className="rounded-lg border border-[#e6e8ee] bg-[#fcfcfd] p-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="truncate text-sm font-semibold text-[#111827]">{meeting.title || "Untitled Meeting"}</p>
                                        <MoreVertical size={14} className="text-[#9ca3af]" />
                                    </div>
                                    <p className="mt-1 text-xs text-[#6b7280]">{formatMeetingMeta(meeting)}</p>
                                    <span className="mt-3 inline-block rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-600">
                                        {meeting.transcriptReady ? "Summary Ready" : meeting.hasRecording ? "Recording Ready" : "Scheduled"}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <MeetingDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSuccess={() => {
                    window.location.reload();
                }}
            />

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #d9dfeb; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            `}</style>
        </div>
    );
}
