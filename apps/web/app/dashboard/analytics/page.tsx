"use client";

import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import {
    BarChart3, Users, Video, Clock,
    ArrowUpRight, Activity, BrainCircuit, 
    Zap, Filter, Calendar, ChevronDown
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { cn } from "@/lib/utils";

// --- ANIMATION VARIANTS (Simpler) ---
const stagger: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-2 border border-slate-200 shadow-md rounded-lg">
                <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
                <p className="text-sm font-semibold text-slate-900">{payload[0].value} Sessions</p>
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

    const metrics = [
        { title: "Total Sessions", value: stats?.totalMeetings, trend: "+12.5%", icon: Users, color: "text-blue-600" },
        { title: "Compute Hours", value: `${stats?.hoursTranscribed}h`, trend: "+4.2%", icon: Clock, color: "text-slate-600" },
        { title: "Vault Storage", value: stats?.recordingsCount, trend: "Stable", icon: Video, color: "text-slate-600" },
        { title: "Neural Nodes", value: stats?.activeMeetings, trend: "Live", icon: Zap, color: "text-amber-600" }
    ];

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans p-6 md:p-10">
            <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto space-y-8"
            >
                {/* --- SIMPLIFIED HEADER --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-8">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Analytics Dashboard</h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Monitor your workspace activity and performance.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                            <Calendar size={14} /> 
                            Jan 1, 2026 - Jan 30, 2026
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm">
                            <Filter size={14} /> Export
                        </button>
                    </div>
                </div>

                {/* --- STATS GRID --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {metrics.map((m, idx) => (
                        <motion.div
                            variants={fadeUp}
                            key={idx}
                            className="p-5 border border-slate-200 rounded-xl bg-white shadow-sm"
                        >
                            <div className="flex justify-between items-start">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{m.title}</p>
                                <m.icon size={18} className={m.color} />
                            </div>
                            <div className="mt-3 flex items-baseline gap-2">
                                <h2 className="text-2xl font-bold">
                                    {isLoading ? "..." : m.value}
                                </h2>
                                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                    {m.trend}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* --- CHARTS AREA --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Main Frequency Chart */}
                    <motion.div variants={fadeUp} className="lg:col-span-2 p-6 border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col min-h-[400px]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-900">Meeting Activity</h3>
                            <button className="text-xs font-bold text-blue-600 hover:underline">View Report</button>
                        </div>

                        <div className="flex-1 w-full mt-2">
                            {isLoading ? (
                                <div className="h-full w-full flex items-center justify-center text-slate-300 animate-pulse">
                                    Loading Chart...
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats?.trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: "#94a3b8", fontSize: 11 }}
                                        />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                                        <Bar
                                            dataKey="meetings"
                                            fill="#3b82f6"
                                            radius={[4, 4, 0, 0]}
                                            barSize={32}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </motion.div>

                    {/* Simplified Insight Card */}
                    <motion.div variants={fadeUp} className="p-6 border border-slate-200 rounded-xl bg-slate-50 flex flex-col space-y-6">
                        <div>
                            <div className="flex items-center gap-2 text-blue-600 mb-2">
                                <BrainCircuit size={18} />
                                <h3 className="font-bold text-sm uppercase tracking-wide">AI Summary</h3>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                ZapBot is currently processing <span className="text-blue-600 font-bold">14% more data</span> than last week. Team engagement is trending upward.
                            </p>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-200">
                            <div>
                                <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-2">
                                    <span>Sentiment Score</span>
                                    <span>82%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }} 
                                        animate={{ width: "82%" }} 
                                        className="h-full bg-blue-500 rounded-full" 
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-2">
                                    <span>Task Completion</span>
                                    <span>65%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }} 
                                        animate={{ width: "65%" }} 
                                        className="h-full bg-slate-400 rounded-full" 
                                    />
                                </div>
                            </div>
                        </div>

                        <button className="w-full py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors mt-auto">
                            Download Detailed Insights
                        </button>
                    </motion.div>

                </div>
            </motion.div>
        </div>
    );
}