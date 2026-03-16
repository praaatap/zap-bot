"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    AlertTriangle,
    Bell,
    Bot,
    Calendar,
    CheckCircle2,
    Clock,
    Clock3,
    Database,
    Loader2,
    Mic,
    Search,
    Shield,
    Sparkles,
    TrendingUp,
    Workflow,
    XCircle,
    Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type ActionStatus = "new" | "in_progress" | "done";

type DashboardOverview = {
    overview: {
        todayMeetings: number;
        recordingsProcessed: number;
        openActionItems: number;
        closedActionItems: number;
        summariesSent: number;
    };
    integrations: {
        calendarConnected: boolean;
        slackConnected: boolean;
        plan: string;
    };
    timeline: Array<{
        id: string;
        title: string;
        startTime: string;
        endTime: string;
        meetingUrl?: string | null;
        isFromCalendar: boolean;
        botScheduled: boolean;
        botSent: boolean;
        platform: string;
        participants: string[];
    }>;
    meetingIndex: Array<{
        id: string;
        title: string;
        summary?: string | null;
        startTime: string;
        endTime: string;
        platform: string;
        transcriptReady: boolean;
        hasRecording: boolean;
    }>;
    actionItems: Array<{
        id: string;
        text: string;
        owner: string | null;
        dueDate: string | null;
        status: ActionStatus;
        meetingId: string;
        meetingTitle: string;
    }>;
    processing: Array<{
        id: string;
        title: string;
        startTime: string;
        endTime: string;
        stage: "queued" | "recording" | "transcribing" | "summarizing" | "completed" | "failed";
    }>;
    insights: {
        weekly: Array<{ label: string; meetings: number; hours: number }>;
        decisionCount: number;
        overdueTasks: number;
    };
    notifications: Array<{
        id: string;
        level: "info" | "warning" | "error";
        message: string;
        at: string;
    }>;
    team: {
        role: string;
        workspaceMembers: number;
        mode: string;
    };
};

// ─── Constants ────────────────────────────────────────────────────────────────

const STAGE_STYLES: Record<DashboardOverview["processing"][number]["stage"], string> = {
    completed:    "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100",
    recording:    "bg-blue-50 text-blue-700 border-blue-200 ring-blue-100",
    transcribing: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-100",
    summarizing:  "bg-violet-50 text-violet-700 border-violet-200 ring-violet-100",
    failed:       "bg-red-50 text-red-700 border-red-200 ring-red-100",
    queued:       "bg-slate-50 text-slate-600 border-slate-200 ring-slate-100",
};

const STAGE_DOTS: Record<DashboardOverview["processing"][number]["stage"], string> = {
    completed:    "bg-emerald-500",
    recording:    "bg-blue-500 animate-pulse",
    transcribing: "bg-amber-500 animate-pulse",
    summarizing:  "bg-violet-500 animate-pulse",
    failed:       "bg-red-500",
    queued:       "bg-slate-400",
};

const ACTION_COLUMN_STYLES: Record<ActionStatus, { header: string; dot: string; count: string }> = {
    new:         { header: "text-blue-700",   dot: "bg-blue-500",    count: "bg-blue-50 text-blue-700 border-blue-200" },
    in_progress: { header: "text-amber-700",  dot: "bg-amber-500 animate-pulse", count: "bg-amber-50 text-amber-700 border-amber-200" },
    done:        { header: "text-emerald-700",dot: "bg-emerald-500", count: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

const QUICK_ACTIONS = [
    { href: "/dashboard/meetings",   label: "Schedule Meeting",       icon: Calendar, color: "from-blue-600 to-blue-700",    ring: "ring-blue-200" },
    { href: "/dashboard/upcoming",   label: "Add Bot to Meeting",     icon: Bot,      color: "from-violet-600 to-violet-700", ring: "ring-violet-200" },
    { href: "/dashboard/recordings", label: "Upload Audio",           icon: Mic,      color: "from-slate-700 to-slate-800",   ring: "ring-slate-200" },
    { href: "/dashboard/chat",       label: "Open AI Assistant",      icon: Sparkles, color: "from-indigo-600 to-indigo-700", ring: "ring-indigo-200" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ className, children }: { className?: string; children: React.ReactNode }) {
    return (
        <div className={cn("rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-100/60", className)}>
            {children}
        </div>
    );
}

function SectionHeader({ title, icon: Icon, right }: { title: string; icon?: React.ElementType; right?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
                {Icon && <Icon className="h-4.5 w-4.5 text-slate-500" />}
                <h2 className="text-sm font-bold tracking-tight text-slate-800">{title}</h2>
            </div>
            {right}
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center text-xs text-slate-400">
            {message}
        </p>
    );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function DashboardSkeleton() {
    return (
        <div className="min-h-screen px-4 py-6 md:px-6 animate-pulse">
            <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-5 xl:grid-cols-12">
                <div className="space-y-5 xl:col-span-8">
                    <div className="h-44 rounded-2xl bg-slate-100" />
                    <div className="h-32 rounded-2xl bg-slate-100" />
                    <div className="h-64 rounded-2xl bg-slate-100" />
                </div>
                <div className="space-y-5 xl:col-span-4">
                    <div className="h-56 rounded-2xl bg-slate-100" />
                    <div className="h-40 rounded-2xl bg-slate-100" />
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DashboardPage() {
    const [data, setData] = useState<DashboardOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

    const fetchDashboardData = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
        if (silent) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setError(null);

        try {
            const res = await fetch("/api/dashboard/overview", {
                cache: "no-store",
            });
            const json = await res.json();
            if (!res.ok || !json?.success) throw new Error(json?.error ?? "Failed to fetch dashboard data");
            setData(json.data);
            setLastUpdatedAt(new Date());
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load dashboard");
        } finally {
            if (silent) {
                setRefreshing(false);
            } else {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        const initialLoad = async () => {
            if (!isMounted) return;
            await fetchDashboardData();
        };

        const refreshOnFocus = () => {
            void fetchDashboardData({ silent: true });
        };

        void initialLoad();

        const refreshInterval = window.setInterval(() => {
            void fetchDashboardData({ silent: true });
        }, 30_000);

        window.addEventListener("focus", refreshOnFocus);

        return () => {
            isMounted = false;
            window.clearInterval(refreshInterval);
            window.removeEventListener("focus", refreshOnFocus);
        };
    }, [fetchDashboardData]);

    const actionColumns = useMemo(() => {
        const items = data?.actionItems ?? [];
        return {
            new:         items.filter((i) => i.status === "new"),
            in_progress: items.filter((i) => i.status === "in_progress"),
            done:        items.filter((i) => i.status === "done"),
        };
    }, [data]);

    const searchResults = useMemo(() => {
        if (!data?.meetingIndex) return [];
        const q = query.trim().toLowerCase();
        if (!q) return data.meetingIndex.slice(0, 8);
        return data.meetingIndex
            .filter((m) => `${m.title} ${m.summary ?? ""} ${m.platform}`.toLowerCase().includes(q))
            .slice(0, 12);
    }, [data, query]);

    if (loading && !data) return <DashboardSkeleton />;

    if (!data) {
        return (
            <div className="flex min-h-screen items-center justify-center px-4">
                <div className="flex max-w-md flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
                    <XCircle className="h-8 w-8 text-red-400" />
                    <p className="text-sm font-semibold text-red-700">{error ?? "Unable to load dashboard data."}</p>
                </div>
            </div>
        );
    }

    const overviewCards = [
        { label: "Meetings Today",       value: data.overview.todayMeetings,        icon: Calendar,    gradient: "from-blue-50 to-indigo-50",   accent: "text-blue-600",   border: "border-blue-100" },
        { label: "Recordings Processed", value: data.overview.recordingsProcessed,  icon: Database,    gradient: "from-violet-50 to-purple-50", accent: "text-violet-600", border: "border-violet-100" },
        { label: "Open Action Items",    value: data.overview.openActionItems,      icon: Workflow,    gradient: "from-amber-50 to-orange-50",  accent: "text-amber-600",  border: "border-amber-100" },
        { label: "Summaries Sent",       value: data.overview.summariesSent,        icon: CheckCircle2,gradient: "from-emerald-50 to-teal-50",  accent: "text-emerald-600",border: "border-emerald-100" },
    ];

    return (
        <div className="min-h-screen bg-[#f7f8fa] px-4 py-6 md:px-6">
            <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-5 xl:grid-cols-12">

                {/* ── Main Column ── */}
                <section className="space-y-5 xl:col-span-8">

                    {/* Header + Overview Cards */}
                    <SectionCard>
                        <div className="p-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-indigo-600 border border-indigo-100">
                                            <Sparkles className="h-3 w-3" /> Live
                                        </span>
                                    </div>
                                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
                                    <p className="mt-0.5 text-sm text-slate-400 font-medium">Live operations — meetings, summaries & follow-ups.</p>
                                </div>
                                <div className="flex flex-wrap items-center justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => void fetchDashboardData({ silent: true })}
                                        disabled={refreshing}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <Loader2 className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
                                        Refresh
                                    </button>
                                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium bg-slate-50 rounded-xl px-3 py-2 border border-slate-100 whitespace-nowrap">
                                        <Clock className="h-3.5 w-3.5" />
                                        {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                                    </div>
                                </div>
                            </div>

                            {(error || lastUpdatedAt) && (
                                <div className={cn(
                                    "mt-3 rounded-xl border px-3 py-2 text-xs font-medium",
                                    error
                                        ? "border-amber-200 bg-amber-50 text-amber-700"
                                        : "border-emerald-200 bg-emerald-50 text-emerald-700"
                                )}>
                                    {error
                                        ? `Live refresh issue: ${error}`
                                        : `Live data updated at ${lastUpdatedAt?.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" })}`}
                                </div>
                            )}

                            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {overviewCards.map((card) => (
                                    <article key={card.label} className={cn(
                                        "relative rounded-xl border p-4 bg-gradient-to-br overflow-hidden",
                                        card.gradient, card.border
                                    )}>
                                        <card.icon className={cn("h-5 w-5 mb-2", card.accent)} />
                                        <p className="text-2xl font-extrabold text-slate-900">{card.value}</p>
                                        <p className="mt-0.5 text-[11px] font-semibold text-slate-500 leading-tight">{card.label}</p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </SectionCard>

                    {/* Quick Actions */}
                    <SectionCard>
                        <SectionHeader title="Quick Actions" icon={Zap} />
                        <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
                            {QUICK_ACTIONS.map((action) => (
                                <Link
                                    key={action.href}
                                    href={action.href}
                                    className={cn(
                                        "group flex flex-col items-center gap-2.5 rounded-xl p-4 text-center transition-all duration-200",
                                        "bg-gradient-to-br text-white hover:scale-[1.03] hover:shadow-lg active:scale-[0.98]",
                                        "ring-2 ring-offset-2 ring-transparent hover:ring-offset-white",
                                        action.color, action.ring
                                    )}
                                >
                                    <action.icon className="h-5 w-5 opacity-90 group-hover:scale-110 transition-transform" />
                                    <span className="text-[11px] font-bold leading-tight opacity-90">{action.label}</span>
                                </Link>
                            ))}
                        </div>
                    </SectionCard>

                    {/* Upcoming Meetings Timeline */}
                    <SectionCard>
                        <SectionHeader
                            title="Upcoming Meetings"
                            icon={Calendar}
                            right={
                                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-500">
                                    {data.timeline.length} upcoming
                                </span>
                            }
                        />
                        <div className="space-y-2 p-4">
                            {data.timeline.length === 0 ? (
                                <EmptyState message="No upcoming meetings found." />
                            ) : (
                                data.timeline.map((meeting) => (
                                    <article key={meeting.id} className="group flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:border-slate-200 hover:bg-white hover:shadow-sm md:flex-row md:items-center md:justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-sm">
                                                <Calendar className="h-4 w-4 text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                                                    {meeting.title || "Untitled Meeting"}
                                                </p>
                                                <p className="mt-0.5 text-xs text-slate-400 font-medium">
                                                    {new Date(meeting.startTime).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                                                    <span className="mx-1.5 text-slate-300">•</span>
                                                    {meeting.platform.replace(/_/g, " ")}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 pl-11 md:pl-0">
                                            <span className={cn(
                                                "rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                                                meeting.botScheduled
                                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                    : "border-amber-200 bg-amber-50 text-amber-700"
                                            )}>
                                                {meeting.botScheduled ? "Bot Ready" : "No Bot"}
                                            </span>
                                            {meeting.meetingUrl && (
                                                <a
                                                    href={meeting.meetingUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="rounded-lg bg-blue-600 px-3 py-1 text-[11px] font-bold text-white transition hover:bg-blue-700 active:scale-95"
                                                >
                                                    Join →
                                                </a>
                                            )}
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    </SectionCard>

                    {/* Action Items Board */}
                    <SectionCard>
                        <SectionHeader title="Action Items Board" icon={Workflow} />
                        <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-3">
                            {(["new", "in_progress", "done"] as const).map((key) => {
                                const labels = { new: "New", in_progress: "In Progress", done: "Done" };
                                const styles = ACTION_COLUMN_STYLES[key];
                                const items = actionColumns[key];
                                return (
                                    <div key={key} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                                        <div className="mb-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className={cn("h-2 w-2 rounded-full", styles.dot)} />
                                                <p className={cn("text-[11px] font-bold uppercase tracking-wider", styles.header)}>
                                                    {labels[key]}
                                                </p>
                                            </div>
                                            <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-bold", styles.count)}>
                                                {items.length}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {items.slice(0, 8).map((item) => (
                                                <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm shadow-slate-100/50">
                                                    <p className="text-xs font-semibold text-slate-800 leading-snug">{item.text}</p>
                                                    <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                                                        <span className="truncate">{item.owner ?? "Unassigned"}</span>
                                                        {item.dueDate && (
                                                            <>
                                                                <span className="text-slate-200">•</span>
                                                                <span className="text-amber-500 font-bold">Due {item.dueDate}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {items.length === 0 && <EmptyState message="No items" />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </SectionCard>

                    {/* Processing Status */}
                    <SectionCard>
                        <SectionHeader title="Processing Status" icon={Database} />
                        <div className="space-y-1.5 p-4">
                            {data.processing.length === 0 ? (
                                <EmptyState message="No meetings being processed." />
                            ) : (
                                data.processing.slice(0, 10).map((item) => (
                                    <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-3 transition hover:bg-white hover:border-slate-200 hover:shadow-sm">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className={cn("h-2 w-2 shrink-0 rounded-full", STAGE_DOTS[item.stage])} />
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-slate-900">{item.title}</p>
                                                <p className="text-[11px] text-slate-400">{new Date(item.startTime).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <span className={cn(
                                            "shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                                            STAGE_STYLES[item.stage]
                                        )}>
                                            {item.stage}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </SectionCard>

                    {/* Smart Search */}
                    <SectionCard>
                        <SectionHeader title="Smart Search" icon={Search} />
                        <div className="p-4 space-y-3">
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search by title, summary, or platform…"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                            <div className="space-y-1.5">
                                {searchResults.length === 0 ? (
                                    <EmptyState message="No matching meetings found." />
                                ) : (
                                    searchResults.map((meeting) => (
                                        <Link
                                            key={meeting.id}
                                            href={`/meetings/${meeting.id}`}
                                            className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 transition hover:border-slate-200 hover:bg-white hover:shadow-sm group"
                                        >
                                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 border border-blue-100">
                                                <Calendar className="h-3.5 w-3.5 text-blue-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors truncate">{meeting.title}</p>
                                                <p className="mt-0.5 text-xs text-slate-400 line-clamp-1">{meeting.summary ?? "No summary yet."}</p>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>
                    </SectionCard>
                </section>

                {/* ── Sidebar Column ── */}
                <aside className="space-y-5 xl:col-span-4">

                    {/* Productivity Insights */}
                    <SectionCard>
                        <SectionHeader title="Productivity Insights" icon={TrendingUp} />
                        <div className="p-4 space-y-3.5">
                            {data.insights.weekly.map((week) => {
                                const pct = Math.min(100, (week.meetings / 5) * 100);
                                return (
                                    <div key={week.label}>
                                        <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-600">
                                            <span>{week.label}</span>
                                            <span className="text-slate-400">{week.meetings} mtgs · {week.hours}h</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                            <div
                                                className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="grid grid-cols-2 gap-3 border-t border-slate-100 p-4">
                            <div className="rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 p-3.5">
                                <p className="text-[11px] font-semibold text-violet-500">Decisions Found</p>
                                <p className="mt-1 text-2xl font-extrabold text-slate-900">{data.insights.decisionCount}</p>
                            </div>
                            <div className="rounded-xl bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 p-3.5">
                                <p className="text-[11px] font-semibold text-red-500">Overdue Tasks</p>
                                <p className="mt-1 text-2xl font-extrabold text-slate-900">{data.insights.overdueTasks}</p>
                            </div>
                        </div>
                    </SectionCard>

                    {/* Integrations Health */}
                    <SectionCard>
                        <SectionHeader title="Integrations" />
                        <div className="space-y-1.5 p-4">
                            {[
                                { label: "Google Calendar", connected: data.integrations.calendarConnected },
                                { label: "Slack",           connected: data.integrations.slackConnected },
                            ].map(({ label, connected }) => (
                                <div key={label} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-3">
                                    <div className="flex items-center gap-2.5">
                                        <span className={cn("h-2 w-2 rounded-full", connected ? "bg-emerald-500" : "bg-red-400")} />
                                        <span className="text-sm font-semibold text-slate-700">{label}</span>
                                    </div>
                                    {connected
                                        ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        : <XCircle className="h-4 w-4 text-red-400" />
                                    }
                                </div>
                            ))}
                            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-3">
                                <span className="text-sm font-semibold text-slate-700">Current Plan</span>
                                <span className="rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                                    {data.integrations.plan}
                                </span>
                            </div>
                        </div>
                    </SectionCard>

                    {/* Team & Permissions */}
                    <SectionCard>
                        <SectionHeader title="Team & Permissions" icon={Shield} />
                        <div className="space-y-1.5 p-4">
                            {[
                                { label: "Role",               value: data.team.role },
                                { label: "Members",            value: String(data.team.workspaceMembers) },
                                { label: "Mode",               value: data.team.mode.replace(/_/g, " ") },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
                                    <span className="text-sm font-bold text-slate-800 capitalize">{value}</span>
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    {/* Notification Center */}
                    <SectionCard>
                        <SectionHeader
                            title="Notifications"
                            icon={Bell}
                            right={
                                data.notifications.length > 0 && (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                        {data.notifications.length}
                                    </span>
                                )
                            }
                        />
                        <div className="space-y-1.5 p-4">
                            {data.notifications.length === 0 ? (
                                <EmptyState message="You're all caught up — no alerts." />
                            ) : (
                                data.notifications.map((note) => {
                                    const styles = {
                                        error:   { bar: "bg-red-500",   bg: "bg-red-50 border-red-100",    icon: <AlertTriangle className="h-3.5 w-3.5 text-red-500" />,   label: "text-red-600" },
                                        warning: { bar: "bg-amber-500", bg: "bg-amber-50 border-amber-100",icon: <Clock3 className="h-3.5 w-3.5 text-amber-500" />,         label: "text-amber-600" },
                                        info:    { bar: "bg-blue-500",  bg: "bg-blue-50 border-blue-100",  icon: <Bell className="h-3.5 w-3.5 text-blue-500" />,            label: "text-blue-600" },
                                    }[note.level];

                                    return (
                                        <div key={note.id} className={cn("relative overflow-hidden rounded-xl border pl-4 pr-3.5 py-3", styles.bg)}>
                                            <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-xl", styles.bar)} />
                                            <div className="flex items-center gap-2 mb-1">
                                                {styles.icon}
                                                <span className={cn("text-[10px] font-bold uppercase tracking-wider", styles.label)}>
                                                    {note.level}
                                                </span>
                                                <span className="ml-auto text-[10px] text-slate-400 font-medium">
                                                    {new Date(note.at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                                                </span>
                                            </div>
                                            <p className="text-xs font-medium text-slate-700 leading-snug">{note.message}</p>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </SectionCard>
                </aside>
            </div>
        </div>
    );
}
