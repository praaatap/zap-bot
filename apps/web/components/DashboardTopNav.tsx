"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import { Bell, Search, Command, HelpCircle, Activity, Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";


const SEARCH_ITEMS = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Library", href: "/dashboard/recordings" },
    { label: "Analytics", href: "/dashboard/analytics" },
    { label: "Calendar", href: "/dashboard/calendar" },
    { label: "Integrations", href: "/dashboard/settings/integrations" },
    { label: "Querent Chat", href: "/dashboard/chat" },
    { label: "Docs", href: "/dashboard/docs" },
    { label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardTopNav({ leftOffset = 0 }: { leftOffset?: number }) {
    const router = useRouter();
    const { user } = useUser();
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const matches = useMemo(() => {
        const cleaned = query.trim().toLowerCase();
        if (!cleaned) return SEARCH_ITEMS.slice(0, 4);
        return SEARCH_ITEMS.filter((item) => item.label.toLowerCase().includes(cleaned)).slice(0, 5);
    }, [query]);

    function handleNavigate(href: string) {
        setQuery("");
        setIsFocused(false);
        router.push(href);
    }

    return (
        <header
            className={cn(
                "fixed top-0 right-0 h-16 bg-white/70 backdrop-blur-2xl border-b border-slate-200/50 z-40 transition-all duration-300 flex items-center px-4 md:px-8",
            )}
            style={{ left: `${leftOffset}px` }}
        >
            <div className="flex w-full items-center justify-between gap-8">

                {/* ── Search/Command Bar ── */}
                <div className="flex w-full max-w-[440px] items-center relative">
                    <form className="relative w-full group">
                        <Search
                            className={cn(
                                "absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-all duration-300 z-10",
                                isFocused ? "text-blue-600 scale-110" : "text-slate-400"
                            )}
                            strokeWidth={2.5}
                        />
                        <input
                            value={query}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Quantum search..."
                            className="h-10 w-full rounded-xl border border-slate-200 bg-white/50 pl-10 pr-12 text-[13.5px] font-bold text-slate-900 outline-none transition-all placeholder:text-slate-400 placeholder:font-medium focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 shadow-sm"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-lg border border-slate-200 bg-white text-[10px] font-black text-slate-400 shadow-xs">
                            <Command size={10} strokeWidth={3} /> K
                        </div>

                        {/* Search Results Dropdown */}
                        <AnimatePresence>
                            {isFocused && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                    className="absolute left-0 right-0 top-[calc(100%+8px)] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-2xl shadow-blue-900/10 z-50 p-2"
                                >
                                    <div className="flex items-center justify-between px-3 py-2 mb-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contextual Pilot</p>
                                        <Sparkles size={10} className="text-blue-500" />
                                    </div>
                                    <div className="space-y-0.5">
                                        {matches.map((item) => (
                                            <button
                                                key={item.href}
                                                onMouseDown={() => handleNavigate(item.href)}
                                                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[13px] font-bold text-slate-600 transition-all hover:bg-blue-50 hover:text-blue-700 group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-blue-500 transition-all group-hover:scale-125" />
                                                    {item.label}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-black text-slate-300 group-hover:text-blue-400 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Jump to node</span>
                                                    <ChevronRight size={12} className="text-slate-300 group-hover:text-blue-400" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                </div>

                {/* ── Right Section ── */}
                <div className="flex items-center gap-4 sm:gap-6">

                    {/* Live Indicator (Sleeker Version) */}
                    <div className="hidden xl:flex items-center gap-3 bg-white/50 border border-slate-200 rounded-full pl-2 pr-4 py-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:bg-white">
                        <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center relative">
                            <Activity size={12} className="text-emerald-600" />
                            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 border-2 border-emerald-50 animate-pulse" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black text-slate-900 leading-none">Standup Node Live</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">00:42:12 Tracking</span>
                        </div>
                    </div>

                    {/* Usage Meter */}
                    <div className="hidden sm:flex flex-col items-end">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "72%" }}
                                    transition={{ duration: 1, ease: "circOut" }}
                                    className="h-full bg-linear-to-r from-blue-500 to-indigo-600 rounded-full"
                                />
                            </div>
                            <p className="text-[12px] font-black text-slate-900 tracking-tight">86%</p>
                        </div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">Compute Saturation</p>
                    </div>

                    {/* Action Icons */}
                    <div className="flex items-center gap-1 md:gap-1.5">
                        <button className="h-9 w-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all group">
                            <Bell className="h-5 w-5" strokeWidth={2.5} />
                            <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-blue-600 ring-2 ring-white" />
                        </button>
                        <button className="h-9 w-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all">
                            <HelpCircle className="h-5 w-5" strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* Profile Section */}
                    <div className="flex items-center gap-3 pl-6 border-l border-slate-200/60">
                        <div className="hidden md:flex flex-col items-end text-right">
                            <p className="text-[13px] font-black text-slate-900 leading-none mb-1">
                                {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : "Operator"}
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md uppercase tracking-wider border border-blue-100/50">Lvl 4 Admin</span>
                            </div>
                        </div>
                        <div className="relative hover:scale-105 active:scale-95 transition-all duration-300">
                            <UserButton
                                appearance={{
                                    elements: {
                                        avatarBox: "h-9 w-9 rounded-xl border-2 border-white shadow-md",
                                        userButtonPopoverCard: "rounded-2xl border border-slate-200 shadow-2xl",
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}