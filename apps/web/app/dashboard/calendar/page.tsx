"use client";

import { useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import {
    AlertCircle,
    Calendar as CalendarIcon,
    CheckCircle2,
    Clock,
    Link as LinkIcon,
    Loader2,
    Users,
    Video,
    Bot,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

type MeetingEvent = {
    id: string;
    title: string;
    start: string;
    end: string;
    meetingUrl?: string;
    attendees: string[];
    organizer?: string;
};

function toDateKey(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function formatDateTime(isoString: string) {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

function getMeetingStatus(start: string, end: string) {
    const now = new Date();
    const startTime = new Date(start);
    const endTime = new Date(end);

    if (now >= startTime && now <= endTime) return "now";
    if (now < startTime) return "upcoming";
    return "completed";
}

export default function CalendarPage() {
    const searchParams = useSearchParams();
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<MeetingEvent[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [sendingBotId, setSendingBotId] = useState<string | null>(null);
    const [botMessages, setBotMessages] = useState<Record<string, string>>({});

    useEffect(() => {
        const successParam = searchParams.get("success");
        const errorParam = searchParams.get("error");
        const detailsParam = searchParams.get("details");

        if (successParam) {
            setSuccess("Google Calendar connected successfully!");
            window.history.replaceState({}, "", "/dashboard/calendar");
        }

        if (errorParam) {
            setError(`Failed to connect: ${errorParam}${detailsParam ? ` (${detailsParam})` : ""}`);
            window.history.replaceState({}, "", "/dashboard/calendar");
        }

        void fetchCalendarEvents();
    }, [searchParams]);

    async function fetchCalendarEvents() {
        try {
            const res = await fetch("/api/calendar/events");
            const data = await res.json();

            if (!res.ok) {
                setError(data?.error || "Failed to fetch calendar events");
                setConnected(false);
                setEvents([]);
                return;
            }

            if (data.success) {
                setConnected(Boolean(data.connected));
                setEvents((data.data || []) as MeetingEvent[]);
            } else if (data.error) {
                setError(data.error);
            }
        } catch (err) {
            console.error("Error fetching calendar:", err);
            setError("Failed to fetch calendar events");
        } finally {
            setLoading(false);
        }
    }

    function handleConnect() {
        window.location.href = "/api/calendar/connect";
    }

    async function sendBotToMeeting(meetingId: string) {
        setSendingBotId(meetingId);
        try {
            const res = await fetch(`/api/meetings/${meetingId}/bot-toggle`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ botScheduled: true }),
            });

            const data = await res.json();

            if (!res.ok) {
                setBotMessages({
                    ...botMessages,
                    [meetingId]: `Error: ${data.error || "Failed to send bot"}`,
                });
            } else {
                setBotMessages({
                    ...botMessages,
                    [meetingId]: "Bot sent successfully!",
                });
                // Clear message after 3 seconds
                setTimeout(() => {
                    setBotMessages((prev) => {
                        const updated = { ...prev };
                        delete updated[meetingId];
                        return updated;
                    });
                }, 3000);
            }
        } catch (err) {
            setBotMessages({
                ...botMessages,
                [meetingId]: "Error sending bot",
            });
        } finally {
            setSendingBotId(null);
        }
    }

    const eventsByDay = useMemo(() => {
        const map = new Map<string, MeetingEvent[]>();

        for (const evt of events) {
            const key = toDateKey(new Date(evt.start));
            const list = map.get(key) || [];
            list.push(evt);
            map.set(key, list);
        }

        return map;
    }, [events]);

    const selectedDayEvents = useMemo(() => {
        return (eventsByDay.get(toDateKey(selectedDate)) || []).sort((a, b) =>
            new Date(a.start).getTime() - new Date(b.start).getTime()
        );
    }, [eventsByDay, selectedDate]);

    return (
        <div className="p-8">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Calendar</h1>
                    <p className="text-slate-600">Connect Google Calendar and review meetings by day</p>
                </div>
                {!connected && !loading && (
                    <button
                        onClick={handleConnect}
                        className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                    >
                        <LinkIcon size={16} />
                        Connect Calendar
                    </button>
                )}
                {connected && !loading && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-xs font-medium text-green-700">Connected</span>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                {success && (
                    <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                        <CheckCircle2 size={18} className="shrink-0 text-green-600" />
                        <p className="text-sm font-medium text-green-800 flex-1">{success}</p>
                        <button onClick={() => setSuccess(null)} className="text-green-600 hover:text-green-800 font-medium">×</button>
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                        <AlertCircle size={18} className="shrink-0 text-red-600" />
                        <p className="text-sm font-medium text-red-800 flex-1">{error}</p>
                        <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 font-medium">×</button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Left Column - Calendar */}
                    <div className="md:col-span-5 lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
                                <CalendarIcon size={18} className="text-slate-600" />
                                <h2 className="font-semibold text-slate-900">Select Date</h2>
                            </div>

                            <div className="calendar-plain-wrap">
                                <Calendar
                                    onChange={(value: unknown) => {
                                        const next = Array.isArray(value) ? value[0] : value;
                                        if (next instanceof Date) setSelectedDate(next);
                                    }}
                                    value={selectedDate}
                                    className="w-full border-0 bg-transparent text-sm"
                                    tileContent={({ date, view }: { date: Date; view: string }) => {
                                        if (view !== "month") return null;
                                        const count = eventsByDay.get(toDateKey(date))?.length || 0;
                                        if (!count) return null;

                                        return (
                                            <div className="mt-1 flex justify-center">
                                                <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                                            </div>
                                        );
                                    }}
                                />
                            </div>
                        </div>

                        {!connected && !loading && (
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
                                <LinkIcon size={24} className="mx-auto text-slate-400 mb-3" />
                                <h3 className="font-semibold text-slate-900 mb-1">No Calendar Connected</h3>
                                <p className="text-sm text-slate-500 mb-4">Connect your calendar to automatically track meetings.</p>
                                <button
                                    onClick={handleConnect}
                                    className="w-full justify-center inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                                >
                                    Connect Now
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Meetings */}
                    <div className="md:col-span-7 lg:col-span-8">
                        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Meetings for {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        {selectedDate.toLocaleDateString("en-US", { weekday: "long" })}
                                    </p>
                                </div>
                            </div>

                            {loading ? (
                                <div className="py-12 flex flex-col items-center justify-center text-slate-500">
                                    <Loader2 className="animate-spin mb-2" size={24} />
                                    <p className="text-sm">Loading meetings...</p>
                                </div>
                            ) : !connected ? (
                                <div className="py-12 text-center text-slate-500">
                                    <p className="text-sm">Connect your calendar to see your schedule here.</p>
                                </div>
                            ) : selectedDayEvents.length === 0 ? (
                                <div className="py-12 text-center text-slate-500">
                                    <p className="text-sm">No meetings scheduled for this day.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {selectedDayEvents.map((evt) => {
                                        const status = getMeetingStatus(evt.start, evt.end);
                                        const isNow = status === "now";

                                        return (
                                            <div
                                                key={evt.id}
                                                className={`flex flex-col sm:flex-row sm:items-start gap-4 p-4 rounded-lg border transition-colors ${isNow ? "bg-blue-50/50 border-blue-200" : "bg-white border-slate-200 hover:border-slate-300"
                                                    }`}
                                            >
                                                <div className="w-24 shrink-0">
                                                    <p className={`text-sm font-bold ${isNow ? "text-blue-700" : "text-slate-900"}`}>
                                                        {formatDateTime(evt.start)}
                                                    </p>
                                                    {isNow && <span className="text-[10px] font-semibold text-blue-600 uppercase">Now</span>}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Video size={14} className={isNow ? "text-blue-600" : "text-slate-400"} />
                                                        <h3 className={`font-semibold truncate ${isNow ? "text-blue-900" : "text-slate-900"}`}>
                                                            {evt.title}
                                                        </h3>
                                                    </div>

                                                    {evt.attendees.length > 0 && (
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                                                            <Users size={12} />
                                                            <span>{evt.attendees.length} attendees</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 sm:mt-0 mt-2">
                                                    {evt.meetingUrl && (
                                                        <a
                                                            href={evt.meetingUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${isNow
                                                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                                                }`}
                                                        >
                                                            Join
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => sendBotToMeeting(evt.id)}
                                                        disabled={sendingBotId === evt.id}
                                                        className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                                            sendingBotId === evt.id
                                                                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                                                                : isNow
                                                                ? "bg-green-600 text-white hover:bg-green-700"
                                                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                                        }`}
                                                    >
                                                        {sendingBotId === evt.id ? (
                                                            <>
                                                                <Loader2 size={14} className="animate-spin" />
                                                                Sending...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Bot size={14} />
                                                                Send Bot
                                                            </>
                                                        )}
                                                    </button>
                                                    {botMessages[evt.id] && (
                                                        <span className={`text-xs font-medium ${
                                                            botMessages[evt.id].includes("Error")
                                                                ? "text-red-600"
                                                                : "text-green-600"
                                                        }`}>
                                                            {botMessages[evt.id]}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .calendar-plain-wrap .react-calendar {
                    width: 100%;
                    background: transparent;
                    border: none;
                    font-family: inherit;
                }

                .calendar-plain-wrap .react-calendar__navigation {
                    display: flex;
                    margin-bottom: 1rem;
                }

                .calendar-plain-wrap .react-calendar__navigation button {
                    min-width: 44px;
                    background: transparent;
                    border-radius: 6px;
                    padding: 8px;
                    font-weight: 500;
                }

                .calendar-plain-wrap .react-calendar__navigation button:disabled {
                    opacity: 0.5;
                }

                .calendar-plain-wrap .react-calendar__navigation button:enabled:hover {
                    background-color: #f1f5f9;
                }

                .calendar-plain-wrap .react-calendar__month-view__weekdays {
                    text-align: center;
                    text-transform: uppercase;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #64748b;
                    margin-bottom: 0.5rem;
                }

                .calendar-plain-wrap .react-calendar__month-view__weekdays__weekday abbr {
                    text-decoration: none;
                }

                .calendar-plain-wrap .react-calendar__tile {
                    padding: 0.75em 0.5em;
                    background: none;
                    border-radius: 6px;
                    color: #334155;
                }

                .calendar-plain-wrap .react-calendar__tile:enabled:hover,
                .calendar-plain-wrap .react-calendar__tile:enabled:focus {
                    background-color: #f1f5f9;
                }

                .calendar-plain-wrap .react-calendar__tile--now {
                    background: #eff6ff;
                    color: #1d4ed8;
                    font-weight: 600;
                }

                .calendar-plain-wrap .react-calendar__tile--active {
                    background: #2563eb !important;
                    color: white !important;
                    font-weight: 600;
                }
                
                .calendar-plain-wrap .react-calendar__month-view__days__day--neighboringMonth {
                    color: #cbd5e1;
                }
            `}</style>
        </div>
    );
}
