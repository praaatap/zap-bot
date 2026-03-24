"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
    BookOpen,
    Calendar,
    CalendarCheck,
    Clock,
    FolderOpen,
    LayoutDashboard,
    Video,
    Zap,
    ChevronDown,
    Settings
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useZapStore } from "../../lib/store";

const NAV_GROUPS = [
    {
        label: "Overview",
        items: [
            { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { label: "Calendar", href: "/dashboard/calendar", icon: Calendar },
        ]
    },
    {
        label: "Management",
        items: [
            { label: "Meetings", href: "/dashboard/meetings", icon: Video },
            { label: "Upcoming", href: "/dashboard/upcoming", icon: CalendarCheck },
        ]
    },
    {
        label: "Archives",
        items: [
            { label: "Recordings", href: "/dashboard/recordings", icon: FolderOpen },
            { label: "History", href: "/dashboard/history", icon: Clock },
            { label: "Docs", href: "/dashboard/docs", icon: BookOpen },
        ]
    }
];

const SIDEBAR_MIN_WIDTH = 80;
const SIDEBAR_MAX_WIDTH = 280;
const COMPACT_THRESHOLD = 180;

export default function Sidebar({ width, onWidthChange }: { width: number; onWidthChange: (n: number) => void }) {
    const pathname = usePathname();
    const { stats } = useZapStore();
    const [isResizing, setIsResizing] = useState(false);
    const widthRef = useRef(width);
    const isCompact = width < COMPACT_THRESHOLD;

    useEffect(() => { widthRef.current = width; }, [width]);

    useEffect(() => {
        if (!isResizing) return;
        const onMove = (e: MouseEvent) => {
            const next = Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, e.clientX));
            onWidthChange(next);
        };
        const onUp = () => setIsResizing(false);
        document.body.style.cursor = "col-resize";
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        return () => {
            document.body.style.cursor = "";
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };
    }, [isResizing, onWidthChange]);

    const isActive = (href: string) =>
        href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

    return (
        <aside
            style={{ width }}
            className={cn(
                "fixed bottom-0 left-0 top-0 z-50 hidden flex-col md:flex",
                "bg-[#080809] border-r border-zinc-800/40 font-sans",
                "transition-[width] duration-150 ease-out",
                isResizing && "transition-none"
            )}
        >
            {/* ── Workspace Selector (Pinecone Style) ── */}
            <div className={cn(
                "flex h-14 shrink-0 items-center px-4 border-b border-zinc-800/40",
                isCompact ? "justify-center" : "justify-between"
            )}>
                <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-blue-600">
                        <Zap size={12} className="text-white fill-current" />
                    </div>
                    {!isCompact && (
                        <span className="text-[13px] font-semibold text-zinc-200 truncate tracking-tight">
                            Personal Workspace
                        </span>
                    )}
                </div>
                {!isCompact && <ChevronDown size={14} className="text-zinc-500" />}
            </div>

            {/* ── Navigation Groups ── */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-7 custom-scrollbar">
                {NAV_GROUPS.map((group) => (
                    <div key={group.label} className="space-y-1">
                        {!isCompact && (
                            <h3 className="px-3 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.15em] mb-2">
                                {group.label}
                            </h3>
                        )}
                        <div className="space-y-0.5">
                            {group.items.map((item) => {
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "group flex items-center rounded-md transition-all duration-150",
                                            isCompact ? "justify-center p-2" : "px-3 py-1.5 gap-3",
                                            active 
                                                ? "bg-zinc-800/60 text-white" 
                                                : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50"
                                        )}
                                    >
                                        <item.icon 
                                            size={isCompact ? 18 : 15} 
                                            strokeWidth={active ? 2 : 1.5}
                                            className={cn(active ? "text-blue-500" : "group-hover:text-zinc-300")}
                                        />
                                        {!isCompact && (
                                            <span className="text-[13px] font-medium tracking-tight">
                                                {item.label}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* ── Bottom Section: Active Status & Profile ── */}
            <div className="mt-auto space-y-4 p-3 border-t border-zinc-800/40 bg-[#080809]">
                {!isCompact && (
                    <div className="flex items-center justify-between px-2 py-1 bg-zinc-900/30 rounded-lg border border-zinc-800/30">
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Active</span>
                        </div>
                        <span className="text-[11px] font-bold text-zinc-400">{stats?.activeMeetings || 0}</span>
                    </div>
                )}

                <div className={cn(
                    "flex items-center gap-3",
                    isCompact ? "justify-center" : "px-2"
                )}>
                    <UserButton appearance={{ elements: { avatarBox: "h-6 w-6 rounded" } }} />
                    {!isCompact && (
                        <div className="flex-1 min-w-0">
                            <p className="truncate text-[12px] font-semibold text-zinc-300">Pratap Sisodiya</p>
                        </div>
                    )}
                    {!isCompact && <Settings size={14} className="text-zinc-600 hover:text-zinc-300 cursor-pointer" />}
                </div>
            </div>

            {/* ── Precision Resize Handle ── */}
            <div
                onMouseDown={() => setIsResizing(true)}
                className={cn(
                    "absolute -right-0.5 top-0 h-full w-1 cursor-col-resize z-50 transition-colors",
                    isResizing ? "bg-blue-600" : "hover:bg-zinc-700/50"
                )}
            />

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 2px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #1f1f23; border-radius: 10px; }
            `}</style>
        </aside>
    );
}