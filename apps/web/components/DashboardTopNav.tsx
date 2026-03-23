"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import { Bell, Search, Plus } from "lucide-react";
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
    { label: "Help", href: "/dashboard/help" },
];

type DashboardTopNavProps = {
    leftOffset?: number;
};

export default function DashboardTopNav({ leftOffset = 0 }: DashboardTopNavProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useUser();
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const profileName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "John Doe";

    const matches = useMemo(() => {
        const cleaned = query.trim().toLowerCase();
        if (!cleaned) return SEARCH_ITEMS.slice(0, 5);
        return SEARCH_ITEMS.filter((item) => item.label.toLowerCase().includes(cleaned)).slice(0, 5);
    }, [query]);

    function handleNavigate(href: string) {
        setQuery("");
        setIsFocused(false);
        router.push(href);
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const firstMatch = matches[0];
        if (firstMatch) {
            handleNavigate(firstMatch.href);
        }
    }

    return (
        <div
            className="fixed right-0 top-0 z-40 border-b border-white/6 bg-[#030303]/90 backdrop-blur-md"
            style={{ left: `${leftOffset}px` }}
        >
            <div className="flex h-16 items-center justify-between gap-4 px-6 md:px-8">
                {/* Left: Search */}
                <div className="flex min-w-0 flex-1 items-center gap-4 md:max-w-lg">
                    <form onSubmit={handleSubmit} className="relative min-w-0 flex-1">
                        <label className={cn(
                            "flex min-w-0 items-center gap-2.5 rounded-xl border transition-all px-4 py-2.5 cursor-text",
                            isFocused
                                ? "border-blue-500/50 bg-blue-500/5 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                                : "border-white/8 bg-white/4 hover:border-white/12 hover:bg-white/5"
                        )}>
                            <Search className={cn("h-4 w-4 shrink-0", isFocused ? "text-blue-400" : "text-zinc-500")} />
                            <input
                                value={query}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => {
                                    window.setTimeout(() => setIsFocused(false), 120);
                                }}
                                onChange={(event) => setQuery(event.target.value)}
                                className="w-full bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-600"
                                placeholder="Search dashboards…"
                                aria-label="Search"
                            />
                        </label>

                        {isFocused && matches.length > 0 && (
                            <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl border border-white/8 bg-[#13131F] shadow-2xl shadow-black/60">
                                {matches.map((item) => (
                                    <button
                                        key={item.href}
                                        type="button"
                                        onMouseDown={() => handleNavigate(item.href)}
                                        className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
                                    >
                                        <span>{item.label}</span>
                                        <span className="text-xs text-zinc-600">{item.href.replace("/dashboard", "") || "/"}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </form>
                </div>

                {/* Right: Actions & Profile */}
                <div className="flex items-center gap-2.5 md:gap-3">
                    <Link
                        href="/dashboard/meetings"
                        className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98]"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">New Meeting</span>
                    </Link>

                    <button
                        className="relative grid h-9 w-9 place-items-center rounded-xl border border-white/8 text-zinc-500 transition-all hover:border-white/12 hover:text-zinc-300 hover:bg-white/4"
                        aria-label="Notifications"
                    >
                        <Bell className="h-4 w-4" />
                        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-1 ring-[#0A0A0F]" />
                    </button>

                    <div className="hidden h-5 w-px bg-white/8 xl:block" />

                    <div className="flex items-center gap-2.5">
                        <UserButton
                            appearance={{
                                elements: { avatarBox: "h-8 w-8 rounded-xl" }
                            }}
                        />
                        <div className="hidden leading-tight md:block">
                            <p className="text-xs font-semibold text-zinc-300">{profileName}</p>
                            <p className="text-[10px] text-zinc-600">Admin</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
