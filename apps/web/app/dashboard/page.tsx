"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Activity, Globe, Plus, Sparkles, ChevronRight, Video, ArrowRight, Zap, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import DashboardActions from "./DashboardActions";
import QuickJoinPanel from "./QuickJoinPanel";
import SystemStatus from "./SystemStatus";
import CalendarWidget from "@/components/CalendarWidget";
import UpcomingRecordingPanel from "./UpcomingRecordingPanel";

function formatTime(iso: string) {
    if (!iso) return "--:--";
    return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function MeetingCard({ m }: { m: any }) {
    const status = m.botStatus || "pending";
    const isLive = ["recording", "in_meeting"].includes(status);

    return (
        <a href={`/meetings/${m.id}`} className="group block relative w-full">
            <div className={cn(
                "p-5 rounded-2xl border transition-all duration-300 bg-white shadow-sm hover:shadow-md",
                isLive
                    ? "border-blue-500/30 hover:border-blue-500/50 bg-blue-50/30"
                    : "border-slate-200 hover:border-slate-300"
            )}>
                <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1.5">
                        <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                            {m.title || "Untitled Meeting"}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1.5 capitalize">
                                <Globe size={12} className="text-slate-400" /> {(m.platform || "meeting").replace('_', ' ')}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="flex items-center gap-1.5"><Clock size={12} className="text-slate-400" /> {formatTime(m.startTime)}</span>
                        </div>
                    </div>
                    <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border flex items-center gap-1.5 transition-all",
                        status === 'completed' ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                            isLive ? "bg-blue-50 text-blue-600 border-blue-200" :
                                "bg-slate-50 text-slate-500 border-slate-200"
                    )}>
                        {isLive && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
                        {status}
                    </span>
                </div>

                {m.summary && (
                    <div className="mb-5">
                        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                            {m.summary}
                        </p>
                    </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                    <div className="flex -space-x-2">
                        {(m.participants || []).slice(0, 3).map((p: string, i: number) => (
                            <div key={i} className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-medium text-slate-600 shadow-sm ring-1 ring-black/5">
                                {p[0]?.toUpperCase()}
                            </div>
                        ))}
                    </div>
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 group-hover:text-blue-600 transition-colors">
                        View Details <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
                </div>
            </div>
        </a>
    );
}

export default function DashboardPage() {
    const [meetings, setMeetings] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        async function fetchData() {
            try {
                const [mRes, sRes] = await Promise.all([
                    fetch("/api/meetings"),
                    fetch("/api/meetings/stats")
                ]);
                const mJson = await mRes.json();
                const sJson = await sRes.json();

                if (mJson.success) setMeetings(mJson.data);
                if (sJson.success) setStats(sJson.data);
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const statCards = [
        { label: "Total Meetings", value: stats?.totalMeetings ?? 0, trend: stats?.percentChange || "+0%" },
        { label: "Hours Transcribed", value: `${stats?.hoursTranscribed ?? 0}h`, trend: "+5%" },
        { label: "Active Meetings", value: stats?.activeMeetings ?? 0, trend: "Live" },
        { label: "This Week", value: stats?.weekMeetings ?? 0, trend: `+${stats?.weekMeetings ?? 0}` },
    ];

    const subNav = [
        { id: "overview", label: "Overview" },
        { id: "activity", label: "Activity" },
        { id: "usage", label: "Usage" },
        { id: "integrations", label: "Integrations" },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* --- MAIN DASHBOARD CONTENT --- */}
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {loading && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 size={40} className="text-slate-900 animate-spin" />
                            <p className="text-sm font-medium text-slate-600">Loading dashboard...</p>
                        </div>
                    </div>
                )}

                {/* Quick Join, System Status & Calendar */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 space-y-6">
                        <QuickJoinPanel />
                    </div>
                    <div className="xl:col-span-1">
                        <SystemStatus />
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((card) => (
                        <div key={card.label} className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 group">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-700 transition-colors">
                                    {card.label}
                                </span>
                                <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                                    <Activity size={14} />
                                </div>
                            </div>
                            <div className="flex items-end justify-between">
                                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                    {card.value}
                                </span>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Status</span>
                                    <span className="text-xs font-bold text-emerald-500">
                                        {card.trend}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Meeting Streams */}
                <div className="space-y-10">
                    <UpcomingRecordingPanel />
                </div>
            </div>
        </div>
    );
}