"use client";

import { useState, useEffect } from "react";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import DashboardActions from "./DashboardActions";
import QuickJoinPanel from "./QuickJoinPanel";
import SystemStatus from "./SystemStatus";
import CalendarWidget from "@/components/CalendarWidget";
import UpcomingRecordingPanel from "./UpcomingRecordingPanel";
import MeetingHistoryPanel from "./MeetingHistoryPanel";

function formatTime(iso: string) {
    if (!iso) return "--:--";
    return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const sRes = await fetch("/api/meetings/stats");
                const sJson = await sRes.json();
                if (sJson.success) setStats(sJson.data);
            } catch (err) {
                console.error("Failed to fetch dashboard stats:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const statCards = [
        { label: "Total Meetings", value: stats?.totalMeetings ?? 0, trend: stats?.percentChange || "+0%" },
        { label: "Hours Transcribed", value: `${stats?.hoursTranscribed ?? 0}h`, trend: "+5%" },
        { label: "Recorded", value: stats?.recordingsCount ?? 0, trend: "Synced" },
        { label: "This Week", value: stats?.weekMeetings ?? 0, trend: `+${stats?.weekMeetings ?? 0}` },
    ];

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto p-6 space-y-12">
                {loading && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, idx) => (
                            <div key={idx} className="p-6 rounded-3xl bg-white border border-slate-100">
                                <div className="h-3 w-24 bg-slate-100 rounded animate-pulse mb-5" />
                                <div className="h-10 w-20 bg-slate-100 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                )}

                {/* --- HERO SECTION --- */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 space-y-6">
                        <QuickJoinPanel />
                    </div>
                    <div className="xl:col-span-1">
                        <SystemStatus />
                    </div>
                </div>

                {/* --- ANALYTICS HIGHLIGHTS --- */}
                {!loading && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {statCards.map((card) => (
                            <div key={card.label} className="p-6 rounded-3xl bg-white border border-slate-100 hover:border-blue-200 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all flex flex-col gap-4 group">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 group-hover:text-blue-500 transition-colors">
                                        {card.label}
                                    </span>
                                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
                                        <Activity size={14} />
                                    </div>
                                </div>
                                <div className="flex items-end justify-between">
                                    <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                                        {card.value}
                                    </span>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">Trend</span>
                                        <span className="text-xs font-bold text-emerald-500 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100">
                                            {card.trend}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- MEETINGS STREAMS --- */}
                <div className="space-y-16">
                    <UpcomingRecordingPanel />
                    <MeetingHistoryPanel />
                </div>
            </div>
        </div>
    );
}
