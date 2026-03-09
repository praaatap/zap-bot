"use client";

import { useEffect, useState } from "react";
import {
    Clock,
    Calendar,
    Video,
    CheckCircle2,
    Loader2,
    History,
    FileText,
    Play,
    ArrowRight,
    Search,
    Filter,
    MoreVertical,
    Download,
    Share2,
    Monitor
} from "lucide-react";
import { cn } from "@/lib/utils";

type Recording = {
    id: string;
    title: string;
    startTime: string;
    endTime?: string;
    platform?: string;
    summary?: string;
    transcriptReady?: boolean;
    recordingUrl?: string;
    participants?: string[];
    thumbnailUrl?: string;
    duration?: string;
};

export default function RecordingsPage() {
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        async function fetchRecordings() {
            try {
                const res = await fetch("/api/meetings");
                const data = await res.json();
                if (data.success) {
                    // Show meetings that have recordings or have ended
                    const past = (data.data || []).filter((m: any) => m.recordingUrl || new Date(m.startTime) < new Date());
                    setRecordings(past);
                }
            } catch (err) {
                console.error("Failed to fetch recordings:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchRecordings();
    }, []);

    const filteredRecordings = recordings.filter(r =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-white p-6 lg:p-10">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto mb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-4">
                            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
                                <Monitor size={28} />
                            </div>
                            Recordings Library
                        </h1>
                        <p className="text-slate-500 font-medium text-lg ml-16">
                            Manage and review your AI-captured meeting insights.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search recordings..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all w-full md:w-80 font-medium text-slate-700"
                            />
                        </div>
                        <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-colors">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid Section */}
            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-sm">Initializing Library...</p>
                    </div>
                ) : filteredRecordings.length === 0 ? (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] py-20 flex flex-col items-center text-center px-6">
                        <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6">
                            <History size={40} className="text-slate-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">No recordings found</h2>
                        <p className="text-slate-500 max-w-sm font-medium">
                            {searchQuery ? `We couldn't find anything matching "${searchQuery}"` : "Your recorded meetings will appear here once they are processed by Zap Bot."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredRecordings.map((rec) => (
                            <div key={rec.id} className="group relative flex flex-col bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 border-b-4 hover:border-b-blue-500 border-b-transparent">

                                {/* Thumbnail / Platform State */}
                                <div className="aspect-video bg-slate-900 relative overflow-hidden">
                                    {rec.thumbnailUrl ? (
                                        <img src={rec.thumbnailUrl} alt={rec.title} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
                                            <Video size={48} className="text-slate-700 opacity-50" />
                                        </div>
                                    )}

                                    {/* Duration Badge */}
                                    <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white uppercase tracking-widest">
                                        {rec.duration || "45:00"}
                                    </div>

                                    {/* Play Overlay */}
                                    <a href={`/meetings/${rec.id}`} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px]">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
                                            <Play size={24} className="text-blue-600 fill-current ml-1" />
                                        </div>
                                    </a>

                                    {/* Platform Indicator */}
                                    <div className="absolute top-4 left-4 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-bold text-white uppercase tracking-tighter">
                                        {(rec.platform || "Video").replace('_', ' ')}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="space-y-1 pr-4">
                                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                                {rec.title || "Quick Sync"}
                                            </h3>
                                            <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar size={12} />
                                                    {new Date(rec.startTime).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
                                            <MoreVertical size={18} />
                                        </button>
                                    </div>

                                    <p className="text-sm text-slate-500 line-clamp-2 mb-8 font-medium leading-relaxed">
                                        {rec.summary || "This meeting is being analyzed by Zap Bot's AI engine to extract key takeaways and action items."}
                                    </p>

                                    {/* Meta Footer */}
                                    <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
                                        <div className="flex items-center gap-3">
                                            <div className="flex -space-x-2">
                                                {(rec.participants || ["U"]).slice(0, 3).map((p, i) => (
                                                    <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600 shadow-sm">
                                                        {p[0]?.toUpperCase()}
                                                    </div>
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {rec.participants?.length || 1} Present
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Download">
                                                <Download size={18} />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Share">
                                                <Share2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
