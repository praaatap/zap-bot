"use client";

import { useEffect, useState } from "react";
import { Calendar as CalendarIcon, Clock, Video, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    meetingUrl?: string;
}

export default function CalendarWidget() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await fetch("/api/calendar/events");
            const data = await res.json();
            if (data.success && data.connected) {
                setEvents(data.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch events:", err);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek, firstDay, lastDay };
    };

    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const getEventsForDate = (date: Date) => {
        return events.filter((event) => {
            const eventDate = new Date(event.start);
            return (
                eventDate.getDate() === date.getDate() &&
                eventDate.getMonth() === date.getMonth() &&
                eventDate.getFullYear() === date.getFullYear()
            );
        });
    };

    const isToday = (day: number) => {
        const today = new Date();
        return (
            day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear()
        );
    };

    const monthYear = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    const selectedDateEvents = getEventsForDate(selectedDate);

    return (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CalendarIcon size={18} className="text-slate-600" />
                    <h3 className="font-semibold text-slate-900">Calendar</h3>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={previousMonth}
                        className="p-1 hover:bg-slate-200 rounded transition-colors"
                    >
                        <ChevronLeft size={18} className="text-slate-600" />
                    </button>
                    <span className="text-sm font-medium text-slate-700 min-w-[120px] text-center">
                        {monthYear}
                    </span>
                    <button
                        onClick={nextMonth}
                        className="p-1 hover:bg-slate-200 rounded transition-colors"
                    >
                        <ChevronRight size={18} className="text-slate-600" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 size={24} className="text-slate-400 animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Weekday headers */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                                <div
                                    key={day}
                                    className="text-xs font-semibold text-slate-600 text-center py-1"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar days */}
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                                <div key={`empty-${i}`} className="aspect-square" />
                            ))}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const date = new Date(
                                    currentDate.getFullYear(),
                                    currentDate.getMonth(),
                                    day
                                );
                                const dayEvents = getEventsForDate(date);
                                const isSelected =
                                    selectedDate.getDate() === day &&
                                    selectedDate.getMonth() === currentDate.getMonth() &&
                                    selectedDate.getFullYear() === currentDate.getFullYear();

                                return (
                                    <button
                                        key={day}
                                        onClick={() => setSelectedDate(date)}
                                        className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all relative ${
                                            isToday(day)
                                                ? "bg-blue-600 text-white font-bold"
                                                : isSelected
                                                ? "bg-blue-100 text-blue-900 font-semibold"
                                                : "hover:bg-slate-100 text-slate-700"
                                        }`}
                                    >
                                        <span>{day}</span>
                                        {dayEvents.length > 0 && (
                                            <div className="absolute bottom-1 flex gap-0.5">
                                                {dayEvents.slice(0, 3).map((_, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`w-1 h-1 rounded-full ${
                                                            isToday(day) ? "bg-white" : "bg-blue-600"
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Selected Date Events */}
            {selectedDateEvents.length > 0 && (
                <div className="border-t border-slate-200 px-4 py-3 bg-slate-50">
                    <h4 className="text-xs font-semibold text-slate-600 uppercase mb-2">
                        {selectedDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                        })}
                    </h4>
                    <div className="space-y-2">
                        {selectedDateEvents.map((event) => (
                            <div
                                key={event.id}
                                className="flex items-start gap-2 text-xs bg-white rounded p-2 border border-slate-200"
                            >
                                <Video size={14} className="text-blue-600 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-slate-900 truncate">
                                        {event.title}
                                    </div>
                                    <div className="text-slate-600 flex items-center gap-1">
                                        <Clock size={10} />
                                        {new Date(event.start).toLocaleTimeString("en-US", {
                                            hour: "numeric",
                                            minute: "2-digit",
                                            hour12: true,
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
