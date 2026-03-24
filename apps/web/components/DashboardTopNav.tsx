"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import { Bell, Search, Command } from "lucide-react";
import { cn } from "@/lib/utils";

const SEARCH_ITEMS = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Meetings", href: "/dashboard/meetings" },
    { label: "Recordings", href: "/dashboard/recordings" },
    { label: "Calendar", href: "/dashboard/calendar" },
    { label: "Upcoming", href: "/dashboard/upcoming" },
    { label: "History", href: "/dashboard/history" },
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
            className="fixed right-0 top-0 z-40 border-b border-zinc-800/40 bg-card-bg/80 backdrop-blur-md transition-all duration-150 ease-out"
            style={{ left: `${leftOffset}px` }}
        >
            <div className="flex h-14 items-center justify-between gap-4 px-6">
                
                {/* Search Engine */}
                <div className="flex min-w-0 flex-1 items-center max-w-md">
                    <form className="relative w-full group">
                        <Search 
                            className={cn(
                                "absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 transition-colors",
                                isFocused ? "text-blue-500" : "text-zinc-600"
                            )} 
                            strokeWidth={1.5}
                        />
                        <input
                            value={query}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search workspace..."
                            className="h-9 w-full rounded-lg border border-zinc-800/60 bg-zinc-900/30 pl-9 pr-12 text-[13px] text-zinc-200 outline-none transition-all placeholder:text-zinc-600 focus:border-blue-500/30 focus:bg-zinc-900/50"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-950 text-[9px] font-bold text-zinc-600 tracking-tighter pointer-events-none">
                            <Command size={8} /> K
                        </div>

                        {/* Search Results Dropdown */}
                        {isFocused && (
                            <div className="absolute left-0 right-0 top-11 overflow-hidden rounded-xl border border-zinc-800 bg-[#0d0d0f] shadow-2xl ring-1 ring-black">
                                <div className="p-1">
                                    <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600">Navigation</p>
                                    {matches.map((item) => (
                                        <button
                                            key={item.href}
                                            onMouseDown={() => handleNavigate(item.href)}
                                            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-[13px] text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                                        >
                                            <span>{item.label}</span>
                                            <span className="text-[10px] text-zinc-700 font-mono">{item.href}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <button
                        className="relative flex h-8 w-8 items-center justify-center rounded-md border border-zinc-800/60 text-zinc-500 transition-colors hover:border-zinc-700 hover:text-zinc-300 hover:bg-zinc-900/50"
                        aria-label="Notifications"
                    >
                        <Bell className="h-4 w-4" strokeWidth={1.5} />
                        <span className="absolute right-2 top-2 h-1 w-1 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]" />
                    </button>

                    <div className="h-4 w-px bg-zinc-800/60" />

                    <div className="flex items-center gap-3">
                        <div className="hidden text-right md:block">
                            <p className="text-[11px] font-semibold text-zinc-300 leading-none">
                                {user?.firstName || "User"}
                            </p>
                            <p className="mt-1 text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">Pro Tier</p>
                        </div>
                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: "h-7 w-7 rounded",
                                    userButtonPopoverCard: "bg-[#0d0d0f] border border-zinc-800 shadow-2xl",
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}