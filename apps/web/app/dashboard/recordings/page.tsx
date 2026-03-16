"use client";

import { useEffect, useState } from "react";
import {
    Clock,
    Calendar,
    Video,
    Loader2,
    History,
    Play,
    Search,
    MoreVertical,
    Download,
    Share2,
    Monitor
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
        <div className="min-h-screen px-4 py-5 md:px-6">
            <div className="mx-auto max-w-350 space-y-5">
                <header className="animate-fade-in rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                            <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-slate-900">
                                <span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-600 text-white">
                                    <Monitor size={20} />
                                </span>
                                Recordings Library
                            </h1>
                            <p className="text-sm text-slate-500">Manage and review your captured meeting sessions.</p>
                        </div>

                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search recordings"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                            />
                        </div>
                    </div>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-24">
                        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Loading recordings</p>
                    </div>
                ) : filteredRecordings.length === 0 ? (
                    <div className="animate-fade-in flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
                        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                            <History size={40} className="text-slate-300" />
                        </div>
                        <h2 className="mb-2 text-2xl font-bold text-slate-900">No recordings found</h2>
                        <p className="max-w-sm text-sm text-slate-500">
                            {searchQuery ? `We couldn't find anything matching "${searchQuery}"` : "Your recorded meetings will appear here once they are processed by Zap Bot."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {filteredRecordings.map((rec, idx) => (
                            <div
                                key={rec.id}
                                className="animate-fade-in group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
                                style={{ animationDelay: `${idx * 40}ms` }}
                            >
                                <div className="relative aspect-video overflow-hidden bg-slate-900">
                                    {rec.thumbnailUrl ? (
                                        <img src={rec.thumbnailUrl} alt={rec.title} className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-900 to-slate-700">
                                            <Video size={44} className="text-slate-500" />
                                        </div>
                                    )}

                                    <div className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                                        {rec.duration || "45:00"}
                                    </div>

                                    <a href={`/meetings/${rec.id}`} className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition group-hover:opacity-100">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-xl">
                                            <Play size={20} className="ml-0.5 text-indigo-600 fill-current" />
                                        </div>
                                    </a>

                                    <div className="absolute left-3 top-3 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-md">
                                        {(rec.platform || "Video").replace('_', ' ')}
                                    </div>
                                </div>

                                <div className="flex flex-1 flex-col p-5">
                                    <div className="mb-4 flex items-start justify-between">
                                        <div className="space-y-1 pr-3">
                                            <h3 className="line-clamp-1 text-lg font-bold text-slate-900 transition-colors group-hover:text-indigo-700">
                                                {rec.title || "Quick Sync"}
                                            </h3>
                                            <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={11} />
                                                    {new Date(rec.startTime).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock size={11} />
                                                    {rec.duration || "45m"}
                                                </span>
                                            </div>
                                        </div>
                                        <button className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100">
                                            <MoreVertical size={18} />
                                        </button>
                                    </div>

                                    <p className="mb-6 line-clamp-2 text-sm text-slate-600">
                                        {rec.summary || "AI summary is processing for this recording and will be available shortly."}
                                    </p>

                                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex -space-x-2">
                                                {(rec.participants || ["U"]).slice(0, 3).map((p, i) => (
                                                    <div key={i} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-bold text-slate-600">
                                                        {p[0]?.toUpperCase()}
                                                    </div>
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                                {rec.participants?.length || 1} Present
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button className="p-1.5 text-slate-400 transition-colors hover:text-indigo-700" title="Download">
                                                <Download size={16} />
                                            </button>
                                            <button className="p-1.5 text-slate-400 transition-colors hover:text-indigo-700" title="Share">
                                                <Share2 size={16} />
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
