"use client";

import { useEffect, useState } from "react";
import {
    Clock,
    Calendar as CalendarIcon,
    Video,
    Loader2,
    History,
    Play,
    Search,
    MoreVertical,
    Download,
    Share2,
    Monitor,
    ChevronRight
} from "lucide-react";

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
                    const past = (data.data || []).filter((m: any) => 
                        m.recordingUrl || new Date(m.startTime) < new Date()
                    );
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
        <div className="relative min-h-screen bg-[#09090b] text-zinc-100 selection:bg-blue-500/30">
            {/* THE "DOTI" BACKGROUND GRID */}
            <div className="absolute inset-0 z-0 opacity-[0.15] [background-image:radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]" />

            <div className="relative z-10 mx-auto max-w-6xl px-6 py-12 space-y-10">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-zinc-500">
                            <Monitor size={14} strokeWidth={1.5} />
                            <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">Media Assets Vault</span>
                        </div>
                        <h1 className="text-4xl font-semibold tracking-tight text-white">
                            Recordings <span className="text-zinc-500">Library</span>
                        </h1>
                    </div>

                    <div className="relative w-full md:w-72 group">
                        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search archives..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/40 py-2.5 pl-10 pr-4 text-sm text-zinc-200 outline-none transition-all placeholder:text-zinc-600 focus:border-zinc-700 focus:bg-zinc-900/60"
                        />
                    </div>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-32 text-zinc-500">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-500" strokeWidth={1.5} />
                        <p className="text-[10px] font-medium uppercase tracking-widest italic">Syncing session data...</p>
                    </div>
                ) : filteredRecordings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/10 px-6 py-24 text-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 text-zinc-600">
                            <History size={24} strokeWidth={1.5} />
                        </div>
                        <h2 className="text-lg font-medium text-white">No recordings localized</h2>
                        <p className="max-w-xs text-sm text-zinc-500 mt-1">
                            {searchQuery ? `Zero matches for "${searchQuery}"` : "Session logs will appear here once the sync is complete."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredRecordings.map((rec, idx) => (
                            <div
                                key={rec.id}
                                className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/20 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/40 hover:shadow-2xl hover:shadow-black/60"
                            >
                                {/* Thumbnail Section */}
                                <div className="relative aspect-video overflow-hidden border-b border-zinc-800/50">
                                    {rec.thumbnailUrl ? (
                                        <img src={rec.thumbnailUrl} alt={rec.title} className="h-full w-full object-cover opacity-60 transition duration-700 group-hover:scale-105 group-hover:opacity-80" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-[#0d0d0f]">
                                            <Video size={32} strokeWidth={1} className="text-zinc-800" />
                                        </div>
                                    )}

                                    {/* Overlays */}
                                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                    
                                    <div className="absolute bottom-3 right-3 rounded-md border border-zinc-700/50 bg-black/60 px-2 py-0.5 text-[9px] font-bold text-zinc-300 backdrop-blur-md">
                                        {rec.duration || "45:00"}
                                    </div>

                                    <a href={`/meetings/${rec.id}`} className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl shadow-blue-500/40 transition-transform hover:scale-110">
                                            <Play size={18} fill="currentColor" strokeWidth={0} className="ml-0.5" />
                                        </div>
                                    </a>
                                </div>

                                {/* Content Section */}
                                <div className="flex flex-1 flex-col p-5 space-y-4">
                                    <div className="space-y-1.5 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-blue-500/80">
                                                {rec.platform || "Session"}
                                            </span>
                                            <button className="text-zinc-600 hover:text-zinc-300 transition-colors">
                                                <MoreVertical size={14} />
                                            </button>
                                        </div>
                                        <h3 className="line-clamp-1 text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors">
                                            {rec.title || "Untitled Session"}
                                        </h3>
                                        <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-medium uppercase tracking-tight">
                                            <span className="flex items-center gap-1.5"><CalendarIcon size={12} strokeWidth={1.5} /> {new Date(rec.startTime).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1.5"><Clock size={12} strokeWidth={1.5} /> {rec.duration || "45m"}</span>
                                        </div>
                                    </div>

                                    <p className="line-clamp-2 text-[11px] text-zinc-500 leading-relaxed font-medium italic">
                                        {rec.summary || "AI summarization pending pipeline completion..."}
                                    </p>

                                    {/* Action Footer */}
                                    <div className="mt-auto flex items-center justify-between border-t border-zinc-800/50 pt-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex -space-x-1.5">
                                                {(rec.participants || ["U"]).slice(0, 3).map((p, i) => (
                                                    <div key={i} className="flex h-5 w-5 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-[8px] font-bold text-zinc-400">
                                                        {p[0]?.toUpperCase()}
                                                    </div>
                                                ))}
                                            </div>
                                            <span className="text-[9px] font-semibold uppercase tracking-tight text-zinc-600">
                                                {rec.participants?.length || 1} present
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <button className="rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-800 hover:text-blue-400 transition-all" title="Download">
                                                <Download size={14} strokeWidth={1.5} />
                                            </button>
                                            <button className="rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-800 hover:text-violet-400 transition-all" title="Share">
                                                <Share2 size={14} strokeWidth={1.5} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
            `}</style>
        </div>
    );
}