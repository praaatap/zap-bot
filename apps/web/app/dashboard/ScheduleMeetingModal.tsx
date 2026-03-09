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

            // In a real app, you'd call your API here
            // const res = await fetch("/api/meetings/schedule", { ... });

            // For now, we simulate success and provide the calendar link
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" /> Schedule Meeting
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-8">
                    {!success ? (
                        <form onSubmit={handleSchedule} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Meeting Title</label>
                                <input
                                    required
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    placeholder="e.g. Weekly Sync"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Meeting URL</label>
                                <div className="relative">
                                    <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        required
                                        type="url"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        placeholder="https://meet.google.com/..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Date</label>
                                    <input
                                        required
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Time</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            required
                                            type="time"
                                            value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2 group disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Scheduling...
                                    </>
                                ) : (
                                    <>
                                        Schedule & Prepare Bot
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-6 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h4 className="text-2xl font-bold text-slate-900 mb-2">Meeting Scheduled!</h4>
                            <p className="text-sm text-slate-600 mb-8 px-4">
                                Zap Bot is prepared to join <b>{title}</b>. Would you like to add this to your primary calendar?
                            </p>

                            <div className="space-y-3">
                                <a
                                    href={calendarLink}
                                    target="_blank"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                                >
                                    <Calendar className="w-5 h-5" />
                                    Add to Google Calendar
                                </a>
                                <button
                                    onClick={onClose}
                                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-xl transition-all"
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
