"use client";

import { useState } from "react";
import { X, Calendar, Link, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { generateGoogleCalendarLink } from "../../lib/calendar-links";

interface ScheduleMeetingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ScheduleMeetingModal({ isOpen, onClose }: ScheduleMeetingModalProps) {
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    async function handleSchedule(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const startTime = new Date(`${date}T${time}`).toISOString();
            setTimeout(() => {
                setLoading(false);
                setSuccess(true);
            }, 1000);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    }

    const calendarLink = success ? generateGoogleCalendarLink({
        title: `[Zap Bot] ${title}`,
        description: `Automated recording by Zap Bot.`,
        location: url,
        startTime: new Date(`${date}T${time}`).toISOString(),
        endTime: new Date(new Date(`${date}T${time}`).getTime() + 60 * 60 * 1000).toISOString(),
    }) : "";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#030303] border border-white/10 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <h3 className="text-xl font-black text-white flex items-center gap-2 uppercase italic">
                        <Calendar className="w-5 h-5 text-blue-400" /> SCHEDULE
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-full">
                        <X className="w-5 h-5 text-zinc-500" />
                    </button>
                </div>

                <div className="p-8">
                    {!success ? (
                        <form onSubmit={handleSchedule} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Meeting Title</label>
                                <input
                                    required
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-blue-500/40 outline-none"
                                    placeholder="e.g. Weekly Sync"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Meeting URL</label>
                                <div className="relative">
                                    <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                    <input
                                        required
                                        type="url"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:ring-1 focus:ring-blue-500/40 outline-none"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Date</label>
                                    <input
                                        required
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-blue-500/40 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Time</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                        <input
                                            required
                                            type="time"
                                            value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:ring-1 focus:ring-blue-500/40 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white font-black uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-blue-500/20"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Scheduling...
                                    </>
                                ) : (
                                    <>Schedule Session</>
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h4 className="text-2xl font-black text-white italic uppercase mb-2">Success</h4>
                            <p className="text-sm text-zinc-500 mb-8 px-4">
                                Bot is prepared for <b>{title}</b>.
                            </p>

                            <div className="space-y-3">
                                <a
                                    href={calendarLink}
                                    target="_blank"
                                    className="w-full bg-blue-600 text-white font-black uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20"
                                >
                                    <Calendar className="w-5 h-5" />
                                    Add to Calendar
                                </a>
                                <button
                                    onClick={onClose}
                                    className="w-full bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest py-4 rounded-xl"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
