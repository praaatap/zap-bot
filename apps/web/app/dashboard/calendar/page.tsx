"use client";

import { useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Link as LinkIcon,
  Loader2,
  Users,
  Video,
  Bot,
  ChevronRight,
  Plus,
  ArrowRight,
  Info
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type MeetingEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  meetingUrl?: string;
  attendees: string[];
  organizer?: string;
};

const toDateKey = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const formatDateTime = (isoString: string) => {
  return new Date(isoString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const getMeetingStatus = (start: string, end: string) => {
  const now = new Date();
  const startTime = new Date(start);
  const endTime = new Date(end);
  if (now >= startTime && now <= endTime) return "now";
  if (now < startTime) return "upcoming";
  return "completed";
};

export default function CalendarPage() {
  const searchParams = useSearchParams();
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<MeetingEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [sendingBotId, setSendingBotId] = useState<string | null>(null);
  const [botMessages, setBotMessages] = useState<Record<string, string>>({});

  useEffect(() => {
    void fetchCalendarEvents();
  }, [searchParams]);

  async function fetchCalendarEvents() {
    try {
      const res = await fetch("/api/calendar/events");
      const data = await res.json();
      if (data.success) {
        setConnected(Boolean(data.connected));
        setEvents((data.data || []) as MeetingEvent[]);
      }
    } catch (err) {
      console.error("Error fetching calendar:", err);
    } finally {
      setLoading(false);
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
    return (eventsByDay.get(toDateKey(selectedDate)) || []).sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );
  }, [eventsByDay, selectedDate]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#09090b] text-zinc-100 font-sans">
      {/* SIDEBAR: Navigation & Mini Calendar */}
      <aside className="w-80 flex flex-col border-r border-zinc-800/50 bg-[#0c0c0e]">
        <div className="p-6 border-b border-zinc-800/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-zinc-400">Calendar</h2>
            {!connected && (
              <button onClick={() => window.location.href = "/api/calendar/connect"} className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                <Plus size={16} />
              </button>
            )}
          </div>

          <div className="calendar-modern-wrap">
            <Calendar
              onChange={(value: unknown) => {
                const next = Array.isArray(value) ? value[0] : value;
                if (next instanceof Date) setSelectedDate(next);
              }}
              value={selectedDate}
              tileContent={({ date, view }: { date: Date; view: string }) => {
                if (view !== "month") return null;
                const hasEvents = eventsByDay.has(toDateKey(date));
                return hasEvents ? (
                  <div className="mt-1 flex justify-center">
                    <div className="h-1 w-1 rounded-full bg-blue-500" />
                  </div>
                ) : null;
              }}
            />
          </div>
        </div>

        <div className="flex-1 p-6 space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 mb-2">
              <Info size={14} />
              Link Status
            </div>
            <p className="text-[13px] text-zinc-300">
              {connected ? "Workspace synced." : "Calendar not connected."}
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN VIEW: Schedule Feed */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-8 border-b border-zinc-800/50 bg-[#09090b]/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">
              {selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </h1>
          </div>
          <div className="flex items-center gap-3">
             {connected && (
               <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[11px] font-medium text-emerald-400">Live Sync</span>
               </div>
             )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto w-full">
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-40 text-zinc-500">
                  <Loader2 className="animate-spin mb-4" size={24} />
                  <p className="text-sm">Fetching meetings...</p>
                </div>
              ) : selectedDayEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-40 text-center border-2 border-dashed border-zinc-800/50 rounded-3xl">
                  <CalendarIcon className="text-zinc-700 mb-4" size={40} />
                  <h3 className="text-zinc-200 font-medium">No meetings scheduled</h3>
                  <p className="text-zinc-500 text-sm mt-1">Enjoy your free time!</p>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {selectedDayEvents.map((evt) => {
                    const status = getMeetingStatus(evt.start, evt.end);
                    const isNow = status === "now";
                    
                    return (
                      <div
                        key={evt.id}
                        className={cn(
                          "group relative flex items-center gap-6 p-5 rounded-2xl border transition-all duration-200",
                          isNow 
                            ? "bg-blue-600/5 border-blue-500/30 ring-1 ring-blue-500/10" 
                            : "bg-zinc-900/40 border-zinc-800/50 hover:border-zinc-700"
                        )}
                      >
                        {/* Timeline Marker */}
                        <div className="flex flex-col items-center w-16 text-center">
                          <span className="text-xs font-semibold text-zinc-100 uppercase tracking-tighter">
                            {formatDateTime(evt.start).split(" ")[0]}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-medium">
                            {formatDateTime(evt.start).split(" ")[1]}
                          </span>
                        </div>

                        {/* Event Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-medium text-white truncate mb-1">
                            {evt.title}
                          </h3>
                          <div className="flex items-center gap-4 text-xs text-zinc-500">
                            <span className="flex items-center gap-1.5">
                              <Users size={14} />
                              {evt.attendees.length} participants
                            </span>
                            {isNow && (
                              <span className="text-blue-400 font-semibold uppercase tracking-widest text-[10px]">
                                • In Progress
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {evt.meetingUrl && (
                            <a
                              href={evt.meetingUrl}
                              target="_blank"
                              className={cn(
                                "h-10 px-4 rounded-lg flex items-center gap-2 text-xs font-medium transition-all",
                                isNow 
                                  ? "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20" 
                                  : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                              )}
                            >
                              Join
                              <ChevronRight size={14} />
                            </a>
                          )}
                          <button className="h-10 w-10 flex items-center justify-center rounded-lg bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                            <Bot size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .calendar-modern-wrap .react-calendar {
          width: 100%;
          background: transparent;
          border: none;
          font-family: inherit;
        }
        .calendar-modern-wrap .react-calendar__navigation {
          display: flex;
          margin-bottom: 1rem;
        }
        .calendar-modern-wrap .react-calendar__navigation button {
          min-width: 32px;
          height: 32px;
          background: none;
          border: none;
          color: #a1a1aa;
          font-size: 14px;
        }
        .calendar-modern-wrap .react-calendar__navigation button:hover {
          color: white;
        }
        .calendar-modern-wrap .react-calendar__month-view__weekdays {
          text-align: center;
          font-size: 10px;
          font-weight: 600;
          color: #52525b;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .calendar-modern-wrap .react-calendar__month-view__weekdays__weekday abbr {
          text-decoration: none;
        }
        .calendar-modern-wrap .react-calendar__tile {
          padding: 10px 0;
          background: none;
          color: #d4d4d8;
          font-size: 13px;
          border-radius: 8px;
        }
        .calendar-modern-wrap .react-calendar__tile:hover {
          background: #18181b;
          color: white;
        }
        .calendar-modern-wrap .react-calendar__tile--now {
          background: #1e1b4b !important;
          color: #818cf8 !important;
        }
        .calendar-modern-wrap .react-calendar__tile--active {
          background: #2563eb !important;
          color: white !important;
        }
        .calendar-modern-wrap .react-calendar__month-view__days__day--neighboringMonth {
          color: #27272a !important;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
      `}</style>
    </div>
  );
}