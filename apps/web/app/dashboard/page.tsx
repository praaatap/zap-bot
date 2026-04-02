"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import {
    Briefcase,
    CheckCircle2,
    Clock,
    Smile,
    Image as ImageIcon,
    ChevronRight,
    MapPin,
    ChevronDown,
    Plus,
    Bot,
    UploadCloud,
    Video,
    Send
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- TYPES ---
type TimelineMeeting = {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    platform: string;
    participants: string[];
};

type StatData = {
    open: number;
    closed: number;
    hours: number;
};

type Message = {
    id: string;
    role: "user" | "assistant";
    text: string;
    time: string;
};

// --- HELPER COMPONENTS ---
function TrendingUpIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
        </svg>
    );
}

export default function DashboardPage() {
    const { user } = useUser();
    const firstName = user?.firstName || "Operator";

    // --- STATE ---
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<StatData>({ open: 0, closed: 0, hours: 0 });
    const [upcoming, setUpcoming] = useState<TimelineMeeting[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            text: "Hi! How can I help you today? Ask me anything about your past meetings.",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // --- DATA FETCHING ---
    useEffect(() => {
        async function loadData() {
            try {
                const res = await fetch("/api/dashboard/overview");
                if (!res.ok) throw new Error("Failed to fetch");
                const { data } = await res.json();

                let totalHours = 0;
                if (data.insights?.weekly) {
                    totalHours = data.insights.weekly.reduce((acc: number, w: any) => acc + w.hours, 0);
                }

                setStats({
                    open: data.overview.openActionItems || 0,
                    closed: data.overview.closedActionItems || 0,
                    hours: Math.round(totalHours),
                });

                setUpcoming(data.timeline?.slice(0, 4) || []);
            } catch (error) {
                console.error("Dashboard error:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    // --- CHAT LOGIC ---
    const handleSendChat = async () => {
        if (!chatInput.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            text: chatInput.trim(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setChatInput("");
        setIsTyping(true);

        try {
            const res = await fetch("/api/meetings/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    meetingId: "all",
                    question: userMsg.text,
                }),
            });
            const data = await res.json();

            const assistantMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                text: data.success ? data.answer : "Sorry, I ran into an issue finding that information.",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, assistantMsg]);
        } catch (error) {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                text: "I'm currently unable to reach the engine. Check your connection.",
                time: "Now"
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const formatTimeInterval = (start: string, end: string) => {
        const s = new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const e = new Date(end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `${s} - ${e}`;
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] w-full gap-6 overflow-hidden bg-slate-50">

            {/* ── Main Content (Left) ── */}
            <div className="flex-1 flex flex-col gap-8 overflow-y-auto pr-2 custom-scrollbar pb-10">

                {/* Header Section */}
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        Welcome back, {firstName}
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Here is a summary of your workspace activities.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stat 1 */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-[14px] font-semibold text-slate-500">Open Action Items</p>
                            <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                                <Briefcase className="h-5 w-5 text-amber-600" strokeWidth={2.5} />
                            </div>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 mb-2">{isLoading ? "--" : stats.open}</h2>
                        <p className="text-[12px] font-bold text-emerald-500 flex items-center gap-1">
                            <TrendingUpIcon className="h-3.5 w-3.5" /> +7% <span className="text-slate-400 font-medium ml-1">vs last month</span>
                        </p>
                    </div>

                    {/* Stat 2 */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-[14px] font-semibold text-slate-500">Closed Tasks</p>
                            <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600" strokeWidth={2.5} />
                            </div>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 mb-2">{isLoading ? "--" : stats.closed}</h2>
                        <p className="text-[12px] font-bold text-emerald-500 flex items-center gap-1">
                            <TrendingUpIcon className="h-3.5 w-3.5" /> +12% <span className="text-slate-400 font-medium ml-1">vs last month</span>
                        </p>
                    </div>

                    {/* Stat 3 */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-[14px] font-semibold text-slate-500">Hours Saved</p>
                            <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-blue-600" strokeWidth={2.5} />
                            </div>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 mb-2">{isLoading ? "--" : `${stats.hours}h`}</h2>
                        <p className="text-[12px] font-bold text-emerald-500 flex items-center gap-1">
                            <TrendingUpIcon className="h-3.5 w-3.5" /> +4.2% <span className="text-slate-400 font-medium ml-1">vs last month</span>
                        </p>
                    </div>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <button className="group bg-slate-900 hover:bg-slate-800 text-white h-[60px] rounded-xl flex items-center gap-3 justify-center font-semibold text-[14px] transition-all shadow-md active:scale-[0.98]">
                        <Plus className="w-5 h-5 text-blue-400" /> Schedule Meeting
                    </button>
                    <button className="bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md text-slate-700 h-[60px] rounded-xl flex items-center gap-3 justify-center font-semibold text-[14px] transition-all">
                        <Bot className="w-5 h-5 text-blue-600" /> Dispatch Bot
                    </button>
                    <button className="bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md text-slate-700 h-[60px] rounded-xl flex items-center gap-3 justify-center font-semibold text-[14px] transition-all">
                        <UploadCloud className="w-5 h-5 text-indigo-500" /> Upload Audio
                    </button>
                    <button className="bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md text-slate-700 h-[60px] rounded-xl flex items-center gap-3 justify-center font-semibold text-[14px] transition-all">
                        <Video className="w-5 h-5 text-emerald-500" /> Start Recording
                    </button>
                </div>

                {/* Upcoming Schedule Section */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/80">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-slate-900">Upcoming Schedule</h3>
                        <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-600 cursor-pointer hover:bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                            Today <ChevronDown size={14} className="text-slate-400" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {upcoming.length > 0 ? upcoming.map((m) => (
                            <div key={m.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all group">
                                <h4 className="text-[15px] font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{m.title}</h4>
                                <div className="space-y-2.5 mb-5">
                                    <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
                                        <Clock size={14} className="text-slate-400" />
                                        {formatTimeInterval(m.startTime, m.endTime)}
                                    </div>
                                    <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500 capitalize">
                                        <MapPin size={14} className="text-slate-400" />
                                        {m.platform.replace('_', ' ')}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
                                    <button className="bg-white border border-slate-200 text-slate-900 text-[12px] font-bold px-5 py-2 rounded-lg hover:bg-slate-50 transition shadow-sm">
                                        Join Session
                                    </button>
                                    <div className="flex -space-x-2">
                                        {/* Mock Avatars */}
                                        <div className="h-6 w-6 rounded-full bg-blue-100 border-2 border-white" />
                                        <div className="h-6 w-6 rounded-full bg-indigo-100 border-2 border-white" />
                                        <div className="h-6 w-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-bold">+2</div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-2 py-10 text-center text-slate-500 font-medium text-sm border-2 border-dashed border-slate-200 rounded-2xl">
                                {isLoading ? "Synchronizing calendar..." : "No upcoming meetings for this date."}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Querent Sidebar (Right) ── */}
            <div className="hidden lg:flex w-[400px] shrink-0 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/80 flex-col overflow-hidden">
                {/* Chat Header */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-[16px] font-bold text-slate-900 flex items-center gap-2">
                        <Bot className="w-5 h-5 text-blue-600" /> ZapBot Assistant
                    </h2>
                    <p className="text-[13px] font-medium text-slate-500 mt-1">Ask anything about your meeting history.</p>
                </div>

                {/* Chat Message History */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col custom-scrollbar">
                    {messages.map((msg) => (
                        <div key={msg.id} className={cn("flex flex-col max-w-[85%]", msg.role === "user" ? "self-end items-end" : "self-start items-start")}>
                            <div className={cn(
                                "rounded-2xl px-4 py-3 shadow-sm border",
                                msg.role === "user"
                                    ? "bg-blue-600 text-white border-blue-700 rounded-tr-sm"
                                    : "bg-white text-slate-700 border-slate-200 rounded-tl-sm"
                            )}>
                                <p className="text-[13px] font-medium leading-relaxed">{msg.text}</p>
                            </div>
                            <span className="text-[10px] font-semibold text-slate-400 mt-1.5 px-1 uppercase tracking-wider">{msg.time}</span>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="self-start max-w-[85%]">
                            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-4 shadow-sm inline-flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" />
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0.15s' }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0.3s' }} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Chat Input Area */}
                <div className="p-4 bg-white border-t border-slate-100">
                    <div className="flex items-center gap-2 w-full bg-slate-50 rounded-xl border border-slate-200 px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all shadow-sm">
                        <button className="text-slate-400 hover:text-blue-500 transition p-1">
                            <Smile size={18} />
                        </button>
                        <input
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSendChat();
                            }}
                            placeholder="Type your question..."
                            className="bg-transparent border-none outline-none text-[13px] text-slate-900 flex-1 font-medium placeholder:text-slate-400"
                        />
                        <button className="text-slate-400 hover:text-blue-500 transition p-1">
                            <ImageIcon size={18} />
                        </button>
                        <button
                            onClick={handleSendChat}
                            disabled={!chatInput.trim() || isTyping}
                            className="h-8 w-8 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg flex items-center justify-center transition shadow-sm shrink-0 ml-1"
                        >
                            <Send size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Global Style Injection for the scrollbar */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            `}</style>
        </div>
    );
}