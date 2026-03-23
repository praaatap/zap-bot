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
  ExternalLink,
  ChevronRight,
  Sparkles,
  Zap,
  ArrowRight
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
      setSuccess("Neural link established successfully.");
      window.history.replaceState({}, "", "/dashboard/calendar");
    }
    if (errorParam) {
      setError(`Link Failure: ${errorParam}${detailsParam ? ` (${detailsParam})` : ""}`);
      window.history.replaceState({}, "", "/dashboard/calendar");
    }
    void fetchCalendarEvents();
  }, [searchParams]);

  async function fetchCalendarEvents() {
    try {
      const res = await fetch("/api/calendar/events");
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to fetch events");
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botScheduled: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBotMessages({ ...botMessages, [meetingId]: `Error: ${data.error || "Failed to send bot"}` });
      } else {
        setBotMessages({ ...botMessages, [meetingId]: "Bot deployed." });
        setTimeout(() => {
          setBotMessages((prev) => {
            const updated = { ...prev };
            delete updated[meetingId];
            return updated;
          });
        }, 3000);
      }
    } catch (err) {
      setBotMessages({ ...botMessages, [meetingId]: "Error sending bot" });
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
    <div className="h-[calc(100vh-64px)] overflow-hidden bg-[#000000] text-white selection:bg-blue-500/30 flex flex-col relative group/page">
      
      {/* Background Glows */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-900/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[120px]" />
      </div>

      {/* Header Bar */}
      <header className="px-8 py-8 border-b border-white/5 bg-white/[0.02] backdrop-blur-xl shrink-0">
        <div className="mx-auto max-w-[1600px] flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-600/20 text-[9px] font-black uppercase tracking-[0.2em] text-blue-400"
            >
              <Zap size={12} /> Temporal Grid System
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-[0.9]"
            >
              MEETING <span className="text-blue-500">SCHEDULE</span>
            </motion.h1>
          </div>

          <div className="flex items-center gap-4">
            {!connected && !loading ? (
              <button
                onClick={handleConnect}
                className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-white px-8 text-xs font-black uppercase tracking-widest text-black shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 transition-all"
              >
                <LinkIcon size={16} /> Establish Link
              </button>
            ) : connected && (
              <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Sync Pipeline Active</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Grid View */}
      <main className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        
        {/* Left: Calendar & Filters */}
        <aside className="w-full lg:w-[450px] border-r border-white/5 bg-white/[0.01] p-8 overflow-y-auto custom-scrollbar">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="calendar-landing-wrap rounded-[40px] border border-white/5 bg-white/[0.03] p-8 backdrop-blur-3xl shadow-2xl">
              <Calendar
                onChange={(value: unknown) => {
                  const next = Array.isArray(value) ? value[0] : value;
                  if (next instanceof Date) setSelectedDate(next);
                }}
                value={selectedDate}
                className="w-full border-0 bg-transparent"
                tileContent={({ date, view }: { date: Date; view: string }) => {
                  if (view !== "month") return null;
                  const count = eventsByDay.get(toDateKey(date))?.length || 0;
                  if (!count) return null;
                  return (
                    <div className="mt-1 flex justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                    </div>
                  );
                }}
              />
            </div>

            {/* Quick Status Cards */}
            <div className="grid grid-cols-1 gap-4">
              <div className="p-6 rounded-[32px] bg-white/[0.03] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600 italic">Total Events</div>
                  <Sparkles size={14} className="text-blue-500" />
                </div>
                <div className="text-4xl font-black text-white italic">{events.length}</div>
              </div>
              
              {!connected && (
                <div className="p-8 rounded-[40px] border border-dashed border-white/10 bg-white/2 text-center space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">No Signal Detected</p>
                  <p className="text-sm text-zinc-500 leading-relaxed uppercase italic">Connect your workspace to map your session coordinates.</p>
                </div>
              )}
            </div>
          </motion.div>
        </aside>

        {/* Right: Event Feed */}
        <section className="flex-1 overflow-hidden flex flex-col bg-black">
          {/* Day Label */}
          <div className="px-10 py-8 flex items-center justify-between border-b border-white/5">
            <div className="space-y-1">
              <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white leading-none">
                {selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
              </h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{selectedDate.toLocaleDateString("en-US", { weekday: "long" })} Grid</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center gap-4 py-40"
                >
                  <Loader2 className="animate-spin text-blue-500" size={40} />
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 italic">Scanning Timeline...</p>
                </motion.div>
              ) : selectedDayEvents.length === 0 ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center gap-6 py-40 text-center"
                >
                  <div className="w-24 h-24 rounded-[40px] bg-white/[0.02] border border-white/5 flex items-center justify-center text-zinc-800">
                    <CheckCircle2 size={48} />
                  </div>
                  <p className="text-lg font-black italic uppercase text-zinc-600 tracking-tighter">Negative signal for this segment.</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="list"
                  initial="hidden" animate="visible" variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                  }}
                  className="space-y-6"
                >
                  {selectedDayEvents.map((evt) => {
                    const status = getMeetingStatus(evt.start, evt.end);
                    const isNow = status === "now";
                    const message = botMessages[evt.id];

                    return (
                      <motion.div
                        key={evt.id}
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          visible: { opacity: 1, y: 0 }
                        }}
                        className={cn(
                          "group relative flex flex-col md:flex-row items-stretch overflow-hidden rounded-[40px] bg-white/[0.03] border border-white/5 transition-all hover:bg-white/[0.06] hover:border-white/10",
                          isNow && "border-blue-500/50 bg-blue-500/[0.03] shadow-[0_0_50px_rgba(59,130,246,0.15)]"
                        )}
                      >
                        {/* Time Panel */}
                        <div className={cn(
                          "md:w-48 p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/5",
                          isNow ? "bg-blue-600 text-white" : "bg-white/[0.02] text-zinc-500"
                        )}>
                          <div className={cn("text-3xl font-black italic uppercase tracking-tighter leading-none", !isNow && "text-white")}>
                            {formatDateTime(evt.start)}
                          </div>
                          <div className="text-[10px] font-black uppercase tracking-widest mt-2">
                            {isNow ? "Live Now" : "Scheduled"}
                          </div>
                        </div>

                        {/* Content Panel */}
                        <div className="flex-1 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                          <div className="space-y-4 min-w-0 flex-1">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "p-2 rounded-xl border shrink-0",
                                isNow ? "bg-white text-blue-600 border-white" : "bg-white/5 border-white/5 text-zinc-500"
                              )}>
                                <Video size={16} />
                              </div>
                              <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white truncate leading-none">
                                {evt.title}
                              </h3>
                            </div>

                            <div className="flex items-center gap-6">
                              <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                  {evt.attendees.slice(0, 3).map((a, i) => (
                                    <div key={i} className="w-7 h-7 rounded-lg border-2 border-black bg-zinc-800 flex items-center justify-center text-[10px] font-black text-white ring-1 ring-white/5 uppercase">
                                      {a[0]}
                                    </div>
                                  ))}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                                  {evt.attendees.length} Signals
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Block */}
                          <div className="flex items-center self-end md:self-center gap-3 w-full md:w-auto">
                            {evt.meetingUrl && (
                              <a
                                href={evt.meetingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                  "flex-1 md:flex-initial h-14 px-8 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest transition-all",
                                  isNow ? "bg-white text-black font-black" : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                                )}
                              >
                                Join Session
                              </a>
                            )}
                            <button
                              onClick={() => sendBotToMeeting(evt.id)}
                              disabled={sendingBotId === evt.id}
                              className={cn(
                                "h-14 w-14 rounded-2xl flex items-center justify-center transition-all",
                                isNow ? "bg-blue-600 text-white shadow-xl shadow-blue-500/30" : "bg-white/5 border border-white/10 text-zinc-500 hover:text-white"
                              )}
                            >
                              {sendingBotId === evt.id ? (
                                <Loader2 size={20} className="animate-spin" />
                              ) : (
                                <Bot size={20} />
                              )}
                            </button>
                            <Link 
                              href="/dashboard/upcoming"
                              className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 hover:text-white transition-all"
                            >
                              <ArrowRight size={20} />
                            </Link>
                          </div>
                        </div>

                        {message && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className={cn(
                              "absolute bottom-4 right-8 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-2xl",
                              message.includes("Error") ? "bg-red-600 border-red-500 text-white" : "bg-blue-600 border-blue-500 text-white"
                            )}
                          >
                            {message}
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      <style jsx global>{`
        .calendar-landing-wrap .react-calendar {
          width: 100%;
          background: transparent;
          border: none;
          font-family: inherit;
        }
        .calendar-landing-wrap .react-calendar__navigation {
          display: flex;
          margin-bottom: 2.5rem;
          gap: 12px;
        }
        .calendar-landing-wrap .react-calendar__navigation button {
          min-width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 18px;
          font-weight: 900;
          color: white;
          text-transform: uppercase;
          font-style: italic;
          font-size: 0.9rem;
        }
        .calendar-landing-wrap .react-calendar__navigation button:enabled:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.1);
        }
        .calendar-landing-wrap .react-calendar__month-view__weekdays {
          text-align: center;
          text-transform: uppercase;
          font-size: 0.6rem;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.2);
          margin-bottom: 1.5rem;
          letter-spacing: 0.2em;
        }
        .calendar-landing-wrap .react-calendar__month-view__weekdays__weekday abbr {
          text-decoration: none;
        }
        .calendar-landing-wrap .react-calendar__tile {
          padding: 1.25em 0.5em;
          background: none;
          border-radius: 18px;
          color: rgba(255, 255, 255, 0.4);
          font-weight: 900;
          font-size: 0.85rem;
          transition: all 0.2s;
        }
        .calendar-landing-wrap .react-calendar__tile:enabled:hover {
          background-color: rgba(255, 255, 255, 0.08);
          color: white;
          transform: translateY(-2px);
        }
        .calendar-landing-wrap .react-calendar__tile--now {
          background: rgba(59, 130, 246, 0.1) !important;
          color: #60a5fa !important;
          border: 1px solid rgba(59, 130, 246, 0.2) !important;
        }
        .calendar-landing-wrap .react-calendar__tile--active {
          background: #2563eb !important;
          color: white !important;
          box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.4) !important;
          transform: scale(1.05) !important;
        }
        .calendar-landing-wrap .react-calendar__month-view__days__day--neighboringMonth {
          color: rgba(255, 255, 255, 0.05) !important;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
