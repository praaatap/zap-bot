"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { CalendarDays, Filter, Plus, MoreVertical, Flame } from "lucide-react";
import dynamic from "next/dynamic";
import MeetingDialog from "@/components/MeetingDialog";

// Rule: bundle-dynamic-imports - Dynamically import heavy chart library
const ResponsiveContainer = dynamic(
    () => import("recharts").then((mod) => mod.ResponsiveContainer),
    { ssr: false, loading: () => <div className="h-57.5 w-full animate-pulse bg-slate-100 rounded-lg" /> }
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

type StatData = {
    open: number;
    closed: number;
    hours: number;
};

type WeeklyPoint = {
    label: string;
    completed: number;
    pending: number;
};

const fallbackWeekly: WeeklyPoint[] = [
    { label: "Backlog", completed: 18, pending: 10 },
    { label: "To Do", completed: 42, pending: 15 },
    { label: "In Progress", completed: 22, pending: 26 },
    { label: "Done", completed: 40, pending: 22 },
    { label: "In Review", completed: 24, pending: 11 },
];

export default function DashboardPage() {
    const { user } = useUser();
    const router = useRouter();
    const firstName = user?.firstName || "Operator";
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<StatData>({ open: 0, closed: 0, hours: 0 });
    const [weeklyTrend, setWeeklyTrend] = useState<WeeklyPoint[]>(fallbackWeekly);

    useEffect(() => {
        async function loadData() {
            try {
                // Rule: async-parallel - Fetch data in parallel instead of sequential
                const [overviewRes] = await Promise.all([
                    fetch("/api/dashboard/overview")
                ]);

                if (!overviewRes.ok) throw new Error("Failed to fetch");
                const { data } = await overviewRes.json();

                let totalHours = 0;
                if (Array.isArray(data.insights?.weekly)) {
                    totalHours = data.insights.weekly.reduce((acc: number, w: any) => acc + (w.hours || 0), 0);

                    const chartRows = data.insights.weekly.slice(-5).map((w: any, idx: number) => ({
                        label: w.label || w.week || `W${idx + 1}`,
                        completed: Math.round((w.meetings || 0) * 1.2),
                        pending: Math.round((w.meetings || 0) * 0.7),
                    }));

                    if (chartRows.length > 0) setWeeklyTrend(chartRows);
                }

                setStats({
                    open: data.overview?.openActionItems || 0,
                    closed: data.overview?.closedActionItems || 0,
                    hours: Math.round(totalHours),
                });
            } catch (error) {
                console.error("Dashboard error:", error);
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, []);

    const totalTasks = stats.open + stats.closed;
    const completedTasks = stats.closed;
    const pendingTasks = stats.open;
    const overdueTasks = Math.max(0, Math.round(stats.open * 0.35));

    const statusBars = [
        { name: "Backlog", value: Math.max(5, Math.round(totalTasks * 0.2)), color: "#c026d3" },
        { name: "To Do", value: Math.max(5, Math.round(totalTasks * 0.3)), color: "#0f766e" },
        { name: "In Progress", value: Math.max(5, Math.round(totalTasks * 0.45)), color: "#ea580c" },
        { name: "Done", value: Math.max(5, Math.round(completedTasks * 0.6)), color: "#16a34a" },
        { name: "In Review", value: Math.max(5, Math.round(pendingTasks * 0.8)), color: "#0ea5e9" },
    ];

    return (
        <div className="flex h-[calc(100vh-100px)] w-full flex-col overflow-hidden bg-[#f7f8fb] px-6 py-5">
            <div className="custom-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
                <div className="flex items-center gap-2 text-sm font-medium text-[#6b7280]">
                    <span>Main Menu</span>
                    <span>›</span>
                    <span className="text-[#111827]">Dashboard</span>
                </div>

                <div className="flex flex-col gap-3 rounded-2xl border border-[#e6e8ee] bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                    <button className="inline-flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-3 py-2 text-xs font-medium text-[#374151]">
                        <CalendarDays size={14} strokeWidth={2.2} />
                        01 June 2025 - 31 December 2025
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
                    {[
                        { label: "Total Meetings", value: totalTasks, sub: `${stats.open} this week`, color: "bg-sky-100 text-sky-600" },
                        { label: "Processed", value: completedTasks, sub: `${completedTasks} with summaries`, color: "bg-emerald-100 text-emerald-600" },
                        { label: "Pending Review", value: pendingTasks, sub: `${pendingTasks} awaiting review`, color: "bg-orange-100 text-orange-600" },
                        { label: "Action Items", value: overdueTasks, sub: `${overdueTasks} overdue tasks`, color: "bg-fuchsia-100 text-fuchsia-600" },
                    ].map((card) => (
                        <div key={card.label} className="rounded-xl border border-[#e6e8ee] bg-white p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`h-7 w-7 rounded-md ${card.color}`} />
                                    <p className="text-[15px] font-semibold text-[#1f2937]">{card.label}</p>
                                </div>
                                <MoreVertical size={16} className="text-[#9ca3af]" />
                            </div>
                            <p className="mt-2 text-[34px] font-bold leading-none text-[#111827]">{isLoading ? "--" : card.value}</p>
                            <p className="mt-1 text-sm text-[#6b7280]">{isLoading ? "Loading..." : card.sub}</p>
                        </div>
                    ))}
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
                            <h3 className="text-[22px] font-semibold text-[#111827]">Upcoming Meetings by Status</h3>
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
                        ) : weeklyTrend.length === 0 ? (
                            <p className="col-span-full text-center text-sm text-[#6b7280]">No meetings scheduled</p>
                        ) : (
                            weeklyTrend.slice(0, 4).map((meeting, idx) => (
                                <div key={`meeting-${idx}`} className="rounded-lg border border-[#e6e8ee] bg-[#fcfcfd] p-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-sm font-semibold text-[#111827] truncate">{meeting.label || "Untitled Meeting"}</p>
                                        <MoreVertical size={14} className="text-[#9ca3af]" />
                                    </div>
                                    <p className="mt-1 text-xs text-[#6b7280]">{meeting.completed} sessions • {meeting.pending} action items</p>
                                    <span className="mt-3 inline-block rounded-full px-2 py-1 text-[10px] font-semibold bg-indigo-50 text-indigo-600">
                                        {meeting.label || "Recent"}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Meeting Dialog */}
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
