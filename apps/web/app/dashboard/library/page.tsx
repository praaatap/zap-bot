"use client";

import { useEffect, useState } from "react";
import { Search, MapPin, Clock, Users, Play, Download, MoreVertical, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import MeetingPlayer from "@/components/MeetingPlayer";

type Meeting = {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    meetingUrl: string;
    attendees: string[];
    transcriptReady: boolean;
    recordingUrl: string | null;
};

export default function LibraryPage() {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Player State
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
    const [isPlayerOpen, setIsPlayerOpen] = useState(false);

    useEffect(() => {
        async function loadMeetings() {
            try {
                const res = await fetch("/api/meetings?scope=past&take=50");
                const data = await res.json();
                if (data.success) {
                    setMeetings(data.data);
                }
            } catch (err) {
                console.error("Failed to fetch meetings", err);
            } finally {
                setIsLoading(false);
            }
        }
        loadMeetings();
    }, []);

    const formatDuration = (start: string, end: string) => {
        const ms = new Date(end).getTime() - new Date(start).getTime();
        const mins = Math.round(ms / 60000);
        return `${mins}m`;
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
    };

    const inferPlatform = (url?: string) => {
        if (!url) return "Virtual";
        if (url.includes("meet.google")) return "Google Meet";
        if (url.includes("zoom")) return "Zoom";
        if (url.includes("teams")) return "Microsoft Teams";
        return "Virtual";
    };

    const filteredMeetings = meetings.filter(m => 
        m.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full w-full gap-6 p-6 xl:p-8 max-w-[1400px] mx-auto overflow-y-auto custom-scrollbar">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Meeting Library</h1>
                    <p className="text-sm font-semibold text-slate-500">Access and review all your past transcribed meetings.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" strokeWidth={2.5} />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Find a meeting..."
                            className="h-10 w-[260px] rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-[13px] text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10"
                        />
                    </div>
                </div>
            </div>

            {/* Data Grid / Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#f8f9fa] border-b border-slate-100 text-[12px] font-bold text-slate-500 uppercase tracking-wider">
                            <th className="py-4 px-6 font-bold">Meeting Title</th>
                            <th className="py-4 px-6 font-bold">Platform</th>
                            <th className="py-4 px-6 font-bold">Duration</th>
                            <th className="py-4 px-6 font-bold">Attendees</th>
                            <th className="py-4 px-6 font-bold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-[14px]">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                                    Loading your history...
                                </td>
                            </tr>
                        ) : filteredMeetings.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                                    No meetings found.
                                </td>
                            </tr>
                        ) : (
                            filteredMeetings.map((m) => (
                                <tr key={m.id} className="border-b border-slate-50 hover:bg-[#F8FAFC] transition-colors group">
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 text-[14px]">{m.title || "Untitled Meeting"}</span>
                                            <span className="font-semibold text-[11px] text-slate-400 mt-0.5">{formatDate(m.startTime)}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-1.5 text-slate-600 font-semibold text-[13px]">
                                            <MapPin size={14} strokeWidth={2.5} />
                                            {inferPlatform(m.meetingUrl)}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-1.5 text-slate-600 font-semibold text-[13px]">
                                            <Clock size={14} strokeWidth={2.5} />
                                            {formatDuration(m.startTime, m.endTime)}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-1.5 text-slate-600 font-semibold text-[13px]">
                                            <Users size={14} strokeWidth={2.5} />
                                            {m.attendees?.length || 1} Participant{(m.attendees?.length || 1) !== 1 ? 's' : ''}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {m.recordingUrl && (
                                                <button 
                                                    onClick={() => {
                                                        setSelectedMeeting(m);
                                                        setIsPlayerOpen(true);
                                                    }}
                                                    className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition cursor-pointer"
                                                >
                                                    <Play size={14} fill="currentColor" />
                                                </button>
                                            )}
                                            {m.transcriptReady && (
                                                <button className="h-8 pl-3 pr-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center gap-1.5 font-bold text-[11px] hover:bg-emerald-100 transition">
                                                    <Download size={14} strokeWidth={2.5} />
                                                    Transcript
                                                </button>
                                            )}
                                            <button className="h-8 w-8 rounded-full text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-slate-600 transition">
                                                <MoreVertical size={16} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Meeting Player Modal */}
            {selectedMeeting && (
                <MeetingPlayer
                    isOpen={isPlayerOpen}
                    onClose={() => setIsPlayerOpen(false)}
                    recordingUrl={selectedMeeting.recordingUrl || ""}
                    title={selectedMeeting.title || "Untitled Meeting"}
                    startTime={selectedMeeting.startTime}
                />
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>
        </div>
    );
}
