"use client";

import { useEffect, useState } from "react";
import { Calendar as CalendarIcon, Clock, Video, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
        <div className="bg-[#030303] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <CalendarIcon size={18} className="text-zinc-400" />
                    <h3 className="font-black text-white uppercase tracking-widest text-[10px] italic">Calendar</h3>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={previousMonth}
                        className="p-1.5 rounded-xl text-zinc-400"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-sm font-black text-white min-w-[140px] text-center uppercase tracking-tighter italic">
                        {monthYear}
                    </span>
                    <button
                        onClick={nextMonth}
                        className="p-1.5 rounded-xl text-zinc-400"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-6">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 size={24} className="text-zinc-600 animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Weekday headers */}
                        <div className="grid grid-cols-7 gap-2 mb-4">
                            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                                <div
                                    key={day}
                                    className="text-[10px] font-black text-zinc-600 text-center uppercase tracking-widest"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar days */}
                        <div className="grid grid-cols-7 gap-2">
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
                                        className={cn(
                                            "aspect-square flex flex-col items-center justify-center rounded-2xl text-sm relative border",
                                            isToday(day)
                                                ? "bg-white text-black font-black border-white"
                                                : isSelected
                                                    ? "bg-blue-600 text-white font-black border-blue-500 shadow-xl shadow-blue-500/20"
                                                    : "bg-white/5 text-zinc-400 border-white/5"
                                        )}
                                    >
                                        <span className="relative z-10">{day}</span>
                                        {dayEvents.length > 0 && !isToday(day) && (
                                            <div className="absolute bottom-2 flex gap-1 justify-center w-full px-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
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
                <div className="border-t border-white/5 px-6 py-5 bg-white/5">
                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 italic">
                        Events / {selectedDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                        })}
                    </h4>
                    <div className="space-y-3">
                        {selectedDateEvents.map((event) => (
                            <div
                                key={event.id}
                                className="flex items-start gap-4 text-xs bg-black/40 rounded-2xl p-4 border border-white/5"
                            >
                                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                                    <Video size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-black text-white italic uppercase truncate text-sm">
                                        {event.title}
                                    </div>
                                    <div className="text-zinc-500 flex items-center gap-2 mt-1">
                                        <Clock size={12} />
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
