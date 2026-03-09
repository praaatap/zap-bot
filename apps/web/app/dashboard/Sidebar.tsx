"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
    LayoutDashboard,
    Calendar,
    Zap,
    Video,
    Clock,
    FolderOpen,
    CalendarCheck,
    BookOpen,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useZapStore } from "../../lib/store";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Meetings", href: "/dashboard/meetings", icon: Video },
    { label: "Recordings", href: "/dashboard/recordings", icon: FolderOpen },
    { label: "Calendar", href: "/dashboard/calendar", icon: Calendar },
    { label: "Upcoming", href: "/dashboard/upcoming", icon: CalendarCheck },
    { label: "History", href: "/dashboard/history", icon: Clock },
    { label: "Docs", href: "/dashboard/docs", icon: BookOpen },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { stats, setStats } = useZapStore();

    useEffect(() => {
        let mounted = true;

        async function loadStats() {
            try {
                const res = await fetch("/api/meetings/stats", { cache: "no-store" });
                const json = await res.json();
                if (mounted && json?.success) {
                    setStats(json.data || {});
                }
            } catch {
                // Keep UI usable with defaults when API is unavailable.
            }
        }

        // Only fetch immediately if we haven't fetched them yet or want to force refresh initially
        if (!stats) {
            void loadStats();
        }

        // Background sync to keep it fresh
        const timer = setInterval(loadStats, 45000);

        return () => {
            mounted = false;
            clearInterval(timer);
        };
    }, [stats, setStats]);

    const isActive = (href: string) => {
        if (href === "/dashboard") {
            return pathname === "/dashboard" || pathname === "/dashboard/";
        }
        return pathname.startsWith(href);
    };

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-60 bg-slate-900 border-r border-slate-800 flex-col z-50 hidden md:flex transform-gpu will-change-transform">
            {/* Logo */}
            <div className="h-14 flex items-center gap-2 px-4 border-b border-slate-800">
                <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 text-slate-900 fill-slate-900" />
                </div>
                <span className="text-sm font-semibold text-white">Zap Bot</span>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 px-2 py-4 overflow-y-auto overscroll-contain scroll-smooth">
                <div className="space-y-0.5">
                    {NAV_ITEMS.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                prefetch={false}
                                className={cn(
                                    "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-normal transition-colors duration-150 ease-out motion-reduce:transition-none",
                                    active
                                        ? "bg-slate-800 text-white font-medium"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                )}
                            >
                                <item.icon className="w-4 h-4 shrink-0" />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>

                {/* Quick Stats */}
                <div className="mt-6 px-3">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                        Quick Stats
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">Active Meetings</span>
                            <span className="text-white font-medium">{stats?.activeMeetings ?? 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">Recordings</span>
                            <span className="text-white font-medium">{stats?.recordingsCount ?? 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">This Week</span>
                            <span className="text-white font-medium">{stats?.weekMeetings ?? 0}</span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Bottom Section */}
            <div className="border-t border-slate-800">
                {/* User Profile */}
                <div className="p-3">
                    <div className="flex items-center gap-2.5">
                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: "w-8 h-8"
                                }
                            }}
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-white truncate">Workspace</p>
                            <p className="text-[11px] text-slate-400">Free Plan</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}