"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    BarChart3, TrendingUp, Users, Video, Clock,
    ArrowUpRight, ArrowDownRight, Activity,
    BrainCircuit, Zap, Filter, Calendar
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { cn } from "@/lib/utils";

// --- ANIMATION VARIANTS ---
const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

// --- CUSTOM TOOLTIP ---
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-xl ring-1 ring-black/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
                <p className="text-sm font-bold text-slate-900">{payload[0].value} Sessions</p>
            </div>
        );
    }
    return null;
};

export default function AnalyticsPage() {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch("/api/meetings/stats");
                const { data } = await res.json();
                setStats(data);
            } catch (error) {
                // Mock data fallback if API fails during design
                setStats({
                    totalMeetings: 124,
                    hoursTranscribed: 482,
                    recordingsCount: 89,
                    activeMeetings: 3,
                    trendData: [
                        { name: "Mon", meetings: 12 },
                        { name: "Tue", meetings: 18 },
                        { name: "Wed", meetings: 15 },
                        { name: "Thu", meetings: 24 },
                        { name: "Fri", meetings: 20 },
                        { name: "Sat", meetings: 8 },
                        { name: "Sun", meetings: 5 },
                    ]
                });
            } finally {
                setIsLoading(false);
            }
        }
        fetchStats();
    }, []);

    const metricCards = [
        { title: "Total Sessions", value: stats?.totalMeetings, trend: "+12.5%", icon: Users, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
        { title: "Compute Hours", value: `${stats?.hoursTranscribed}h`, trend: "+4.2%", icon: Clock, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
        { title: "Vault Storage", value: stats?.recordingsCount, trend: "Stable", icon: Video, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
        { title: "Neural Nodes", value: stats?.activeMeetings, trend: "Live", icon: Zap, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" }
    ];

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col h-full w-full gap-8 max-w-7xl mx-auto"
        >
            {/* ── HEADER AREA ── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-200 mb-4 shadow-sm">
                        <Activity size={12} className="text-blue-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Workspace Intelligence</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Performance Analytics</h1>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                        <Calendar size={16} /> Last 30 Days
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-900 rounded-xl text-[13px] font-bold text-white hover:bg-slate-800 transition-all shadow-md">
                        <Filter size={16} /> Filter
                    </button>
                </div>
            </div>

            {/* ── METRIC CARDS ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {metricCards.map((card, idx) => (
                    <motion.div
                        variants={item}
                        whileHover={{ y: -4 }}
                        key={idx}
                        className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex flex-col relative overflow-hidden group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={cn("p-2.5 rounded-xl border shadow-sm transition-transform group-hover:scale-110", card.bg, card.border, card.color)}>
                                <card.icon size={20} strokeWidth={2.5} />
                            </div>
                            <div className={cn(
                                "flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-md",
                                card.trend.includes('+') ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                            )}>
                                {card.trend.includes('+') ? <ArrowUpRight size={12} /> : null}
                                {card.trend}
                            </div>
                        </div>

                        <div className="mt-2">
                            <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">{card.title}</p>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mt-1">
                                {isLoading ? "---" : card.value}
                            </h2>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ── MAIN CHART AREA ── */}
            <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Large Chart */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200/80 shadow-sm p-8 flex flex-col min-h-[450px]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Meeting Frequency</h3>
                            <p className="text-sm font-medium text-slate-400">Activity volume distributed over the last week.</p>
                        </div>
                        <BarChart3 className="text-slate-300" size={24} />
                    </div>

                    <div className="flex-1 w-full">
                        {isLoading ? (
                            <div className="h-full w-full flex items-center justify-center">
                                <div className="h-8 w-8 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats?.trendData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }}
                                        dy={15}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#cbd5e1", fontSize: 12 }}
                                        allowDecimals={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9', radius: 10 }} />
                                    <Bar
                                        dataKey="meetings"
                                        radius={[10, 10, 10, 10]}
                                        barSize={40}
                                    >
                                        {stats?.trendData.map((entry: any, index: number) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={index === stats.trendData.length - 2 ? "#2563eb" : "#e2e8f0"}
                                                className="transition-all duration-500 hover:fill-blue-500"
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Small Sidebar Bento (Intelligence Insights) */}
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-xl">
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent" />

                    <div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-6">
                            <BrainCircuit className="text-blue-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Neural Efficiency</h3>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed">
                            ZapBot has identified a 14% increase in decision-making clarity this week across engineering syncs.
                        </p>
                    </div>

                    <div className="space-y-4 relative z-10">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">
                                <span>Sentiment</span>
                                <span className="text-emerald-400">Positive</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: "82%" }} transition={{ duration: 1 }} className="h-full bg-emerald-500 rounded-full" />
                            </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">
                                <span>Automation Rate</span>
                                <span className="text-blue-400">High</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: "65%" }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-blue-500 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>

            </motion.div>

            {/* Minor custom scrollbar CSS */}
            <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}</style>
        </motion.div>
    );
}