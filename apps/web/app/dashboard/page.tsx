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
    completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    recording: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    transcribing: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    summarizing: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    failed: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    queued: "bg-white/5 text-zinc-500 border-white/10",
};

const STAGE_DOTS: Record<DashboardOverview["processing"][number]["stage"], string> = {
    completed: "bg-emerald-400",
    recording: "bg-cyan-400",
    transcribing: "bg-amber-400",
    summarizing: "bg-indigo-400",
    failed: "bg-rose-400",
    queued: "bg-zinc-600",
};

const ACTION_COLUMN_STYLES: Record<ActionStatus, { header: string; dot: string; count: string; border: string }> = {
    new: { header: "text-cyan-400", dot: "bg-cyan-400", count: "bg-cyan-500/10 text-cyan-400", border: "border-cyan-500/20" },
    in_progress: { header: "text-amber-400", dot: "bg-amber-400", count: "bg-amber-500/10 text-amber-400", border: "border-amber-500/20" },
    done: { header: "text-emerald-400", dot: "bg-emerald-400", count: "bg-emerald-500/10 text-emerald-400", border: "border-emerald-500/20" },
};

const QUICK_ACTIONS = [
    { href: "/dashboard/meetings", label: "Schedule Meeting", icon: Calendar, color: "from-cyan-600 to-indigo-700", shadow: "shadow-cyan-500/25" },
    { href: "/dashboard/upcoming", label: "Add Bot to Meeting", icon: Bot, color: "from-indigo-600 to-violet-700", shadow: "shadow-indigo-500/25" },
    { href: "/dashboard/recordings", label: "Upload Audio", icon: Mic, color: "from-zinc-800 to-black", shadow: "shadow-zinc-900/40" },
    { href: "/dashboard/chat", label: "Open AI Assistant", icon: Sparkles, color: "from-amber-600 to-orange-700", shadow: "shadow-amber-500/25" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ className, children }: { className?: string; children: React.ReactNode }) {
    return (
        <div className={cn(
            "rounded-2xl border border-white/5 bg-white/2 backdrop-blur-sm",
            className
        )}>
            {children}
        </div>
    );
}

function SectionHeader({ title, icon: Icon, right }: { title: string; icon?: React.ElementType; right?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/5">
            <div className="flex items-center gap-2.5">
                {Icon && <Icon className="h-4 w-4 text-cyan-400" />}
                <h2 className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-zinc-500 uppercase">{title}</h2>
            </div>
            {right}
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <p className="rounded-xl border border-dashed border-white/8 bg-white/2 p-5 text-center text-xs text-zinc-600">
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
                    <div className="h-44 rounded-2xl bg-white/4" />
                    <div className="h-32 rounded-2xl bg-white/4" />
                    <div className="h-64 rounded-2xl bg-white/4" />
                </div>
                <div className="space-y-5 xl:col-span-4">
                    <div className="h-56 rounded-2xl bg-white/4" />
                    <div className="h-40 rounded-2xl bg-white/4" />
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
            new: items.filter((i) => i.status === "new"),
            in_progress: items.filter((i) => i.status === "in_progress"),
            done: items.filter((i) => i.status === "done"),
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
        { label: "Meetings Today", value: data.overview.todayMeetings, icon: Calendar, accent: "text-cyan-400" },
        { label: "Recordings Processed", value: data.overview.recordingsProcessed, icon: Database, accent: "text-indigo-400" },
        { label: "Open Action Items", value: data.overview.openActionItems, icon: Workflow, accent: "text-amber-400" },
        { label: "Summaries Sent", value: data.overview.summariesSent, icon: CheckCircle2, accent: "text-emerald-400" },
    ];

    return (
        <div className="min-h-screen px-4 py-8 md:px-8">
            <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 xl:grid-cols-12">

                {/* ── Main Column ── */}
                <section className="space-y-6 xl:col-span-8">

                    {/* Header + Overview Cards */}
                    <SectionCard>
                        <div className="p-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-400 border border-cyan-500/20 backdrop-blur-md">
                                            <Sparkles className="h-3 w-3" /> Live
                                        </span>
                                    </div>
                                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tighter text-white">Dashboard</h1>
                                    <p className="mt-1 text-sm text-zinc-500 font-medium">Live operations — meetings, summaries & follow-ups.</p>
                                </div>
                                <div className="flex flex-wrap items-center justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => void fetchDashboardData({ silent: true })}
                                        disabled={refreshing}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <Loader2 className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
                                        Refresh
                                    </button>
                                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium bg-white/5 rounded-xl px-4 py-2.5 border border-white/10 whitespace-nowrap backdrop-blur-md">
                                        <Clock className="h-4 w-4 text-cyan-400" />
                                        {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                                    </div>
                                </div>
                            </div>

                            {(error || lastUpdatedAt) && (
                                <div className={cn(
                                    "mt-3 rounded-xl border px-3 py-2 text-xs font-medium",
                                    error
                                        ? "border-rose-500/20 bg-rose-500/10 text-rose-400"
                                        : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                )}>
                                    {error
                                        ? `Live refresh issue: ${error}`
                                        : `Live data updated at ${lastUpdatedAt?.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" })}`}
                                </div>
                            )}

                            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                                {overviewCards.map((card) => (
                                    <article key={card.label} className="relative rounded-2xl border border-white/5 p-5 bg-white/1">
                                        <card.icon className={cn("h-6 w-6 mb-3", card.accent)} />
                                        <p className="text-3xl font-black text-white">{card.value}</p>
                                        <p className="mt-1 text-[10px] font-bold text-zinc-500 leading-tight uppercase tracking-widest">{card.label}</p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </SectionCard>

                    {/* Quick Actions */}
                    <SectionCard>
                        <SectionHeader title="Quick Actions" icon={Zap} />
                        <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
                            {QUICK_ACTIONS.map((action) => (
                                <Link
                                    key={action.href}
                                    href={action.href}
                                    className="group flex items-center gap-3.5 rounded-xl border border-white/5 bg-white/2 p-3.5"
                                >
                                    <div className={cn(
                                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br",
                                        action.color
                                    )}>
                                        <action.icon className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="truncate text-xs font-bold text-white tracking-tight leading-tight">{action.label}</span>
                                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">Start Protocol</span>
                                    </div>
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
                                <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                    {data.timeline.length} upcoming
                                </span>
                            }
                        />
                        <div className="space-y-3 p-6">
                            {data.timeline.length === 0 ? (
                                <EmptyState message="No upcoming meetings found." />
                            ) : (
                                data.timeline.map((meeting) => (
                                    <article key={meeting.id} className="group flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/1 p-4 md:flex-row md:items-center md:justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                                                <Calendar className="h-5 w-5 text-cyan-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-white">
                                                    {meeting.title || "Untitled Meeting"}
                                                </p>
                                                <p className="mt-0.5 text-xs text-zinc-500 font-medium">
                                                    {new Date(meeting.startTime).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                                                    <span className="mx-1.5 text-zinc-700">•</span>
                                                    {meeting.platform.replace(/_/g, " ")}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 pl-11 md:pl-0">
                                            <span className={cn(
                                                "rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                                                meeting.botScheduled
                                                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                                    : "border-amber-500/20 bg-amber-500/10 text-amber-400"
                                            )}>
                                                {meeting.botScheduled ? "Bot Ready" : "No Bot"}
                                            </span>
                                            {meeting.meetingUrl && (
                                                <a
                                                    href={meeting.meetingUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="rounded-lg bg-white text-black px-3 py-1 text-[11px] font-bold transition hover:bg-zinc-200 active:scale-95"
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
                        <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
                            {(["new", "in_progress", "done"] as const).map((key) => {
                                const labels = { new: "New", in_progress: "In Progress", done: "Done" };
                                const styles = ACTION_COLUMN_STYLES[key];
                                const items = actionColumns[key];
                                return (
                                    <div key={key} className="rounded-2xl border border-white/5 bg-white/1 p-4">
                                        <div className="mb-4 flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <span className={cn("h-2.5 w-2.5 rounded-full", styles.dot)} />
                                                <p className={cn("text-xs font-bold uppercase tracking-widest", styles.header)}>
                                                    {labels[key]}
                                                </p>
                                            </div>
                                            <span className={cn("rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest", styles.count)}>
                                                {items.length}
                                            </span>
                                        </div>
                                        <div className="space-y-2.5">
                                            {items.slice(0, 8).map((item) => (
                                                <div key={item.id} className="rounded-xl border border-white/5 bg-white/5 p-3 group">
                                                    <p className="text-xs font-semibold text-zinc-300 leading-snug">{item.text}</p>
                                                    <div className="mt-2 flex items-center gap-1.5 text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                                                        <span className="truncate">{item.owner ?? "Unassigned"}</span>
                                                        {item.dueDate && (
                                                            <>
                                                                <span className="text-zinc-800 font-normal opacity-50">•</span>
                                                                <span className="text-amber-400">Due {item.dueDate}</span>
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
                        <div className="space-y-2 p-6">
                            {data.processing.length === 0 ? (
                                <EmptyState message="No meetings being processed." />
                            ) : (
                                data.processing.slice(0, 10).map((item) => (
                                    <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.01] px-4 py-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className={cn("h-2 w-2 shrink-0 rounded-full", STAGE_DOTS[item.stage])} />
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-white">{item.title}</p>
                                                <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">{new Date(item.startTime).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <span className={cn(
                                            "shrink-0 rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wider",
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
                        <div className="p-6 space-y-4">
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search by title, summary, or platform…"
                                    className="w-full rounded-2xl border border-white/10 bg-white/5 pl-9 pr-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-500/30 focus:bg-white/8 focus:ring-4 focus:ring-cyan-500/10"
                                />
                            </div>
                            <div className="space-y-2">
                                {searchResults.length === 0 ? (
                                    <EmptyState message="No matching meetings found." />
                                ) : (
                                    searchResults.map((meeting) => (
                                        <Link
                                            key={meeting.id}
                                            href={`/meetings/${meeting.id}`}
                                            className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/1 p-3 group"
                                        >
                                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10">
                                                <Calendar className="h-4 w-4 text-cyan-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-zinc-300 truncate">{meeting.title}</p>
                                                <p className="mt-0.5 text-[10px] text-zinc-500 line-clamp-1 italic font-medium">"{meeting.summary ?? "No summary yet."}"</p>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>
                    </SectionCard>
                </section>

                {/* ── Sidebar Column ── */}
                <aside className="space-y-6 xl:col-span-4">

                    {/* Productivity Insights */}
                    <SectionCard>
                        <SectionHeader title="Productivity Insights" icon={TrendingUp} />
                        <div className="p-6 space-y-4">
                            {data.insights.weekly.map((week) => {
                                const pct = Math.min(100, (week.meetings / 5) * 100);
                                return (
                                    <div key={week.label}>
                                        <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                            <span>{week.label}</span>
                                            <span className="text-zinc-600">{week.meetings} mtgs · {week.hours}h</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                            <div
                                                className="h-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-700"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="grid grid-cols-2 gap-4 border-t border-white/5 p-6">
                            <div className="rounded-2xl bg-indigo-500/10 border border-indigo-500/20 p-4">
                                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Decisions Found</p>
                                <p className="mt-2 text-3xl font-black text-white tracking-tighter">{data.insights.decisionCount}</p>
                            </div>
                            <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4">
                                <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Overdue Tasks</p>
                                <p className="mt-2 text-3xl font-black text-white tracking-tighter">{data.insights.overdueTasks}</p>
                            </div>
                        </div>
                    </SectionCard>

                    {/* Integrations Health */}
                    <SectionCard>
                        <SectionHeader title="Integrations" />
                        <div className="space-y-2 p-6">
                            {[
                                { label: "Google Calendar", connected: data.integrations.calendarConnected },
                                { label: "Slack", connected: data.integrations.slackConnected },
                            ].map(({ label, connected }) => (
                                <div key={label} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/1 px-4 py-3.5">
                                    <div className="flex items-center gap-3">
                                        <span className={cn("h-2 w-2 rounded-full", connected ? "bg-emerald-400" : "bg-zinc-700")} />
                                        <span className="text-sm font-semibold text-zinc-300">{label}</span>
                                    </div>
                                    {connected
                                        ? <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                        : <XCircle className="h-5 w-5 text-zinc-600" />
                                    }
                                </div>
                            ))}
                            <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/1 px-4 py-3.5">
                                <span className="text-sm font-semibold text-zinc-400">Current Plan</span>
                                <span className="rounded-lg bg-cyan-500 text-black px-3 py-1.5 text-[10px] font-black uppercase tracking-widest leading-none">
                                    {data.integrations.plan}
                                </span>
                            </div>
                        </div>
                    </SectionCard>

                    {/* Team & Permissions */}
                    <SectionCard>
                        <SectionHeader title="Team & Permissions" icon={Shield} />
                        <div className="space-y-2 p-6">
                            {[
                                { label: "Role", value: data.team.role },
                                { label: "Members", value: String(data.team.workspaceMembers) },
                                { label: "Mode", value: data.team.mode.replace(/_/g, " ") },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/1 px-4 py-3">
                                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{label}</span>
                                    <span className="text-sm font-bold text-zinc-300 capitalize">{value}</span>
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
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-black text-black">
                                        {data.notifications.length}
                                    </span>
                                )
                            }
                        />
                        <div className="space-y-2 p-6">
                            {data.notifications.length === 0 ? (
                                <EmptyState message="You're all caught up — no alerts." />
                            ) : (
                                data.notifications.map((note) => {
                                    const styles = {
                                        error: { bar: "bg-rose-500", bg: "bg-rose-500/10 border-rose-500/20", icon: <AlertTriangle className="h-4 w-4 text-rose-400" />, label: "text-rose-400" },
                                        warning: { bar: "bg-amber-500", bg: "bg-amber-500/10 border-amber-500/20", icon: <Clock3 className="h-4 w-4 text-amber-400" />, label: "text-amber-400" },
                                        info: { bar: "bg-cyan-500", bg: "bg-cyan-500/10 border-cyan-500/20", icon: <Bell className="h-4 w-4 text-cyan-400" />, label: "text-cyan-400" },
                                    }[note.level];

                                    return (
                                        <div key={note.id} className={cn("relative overflow-hidden rounded-2xl border pl-4 pr-4 py-3.5", styles.bg)}>
                                            <div className={cn("absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl", styles.bar)} />
                                            <div className="flex items-center gap-2.5 mb-2">
                                                {styles.icon}
                                                <span className={cn("text-[9px] font-black uppercase tracking-[0.2em]", styles.label)}>
                                                    {note.level}
                                                </span>
                                                <span className="ml-auto text-[9px] text-zinc-600 font-bold tracking-widest">
                                                    {new Date(note.at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                                                </span>
                                            </div>
                                            <p className="text-xs font-semibold text-zinc-300 leading-relaxed">{note.message}</p>
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
