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
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useZapStore } from "../../lib/store";

// ─── Constants ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
    { label: "Dashboard",  href: "/dashboard",            icon: LayoutDashboard },
    { label: "Meetings",   href: "/dashboard/meetings",   icon: Video },
    { label: "Recordings", href: "/dashboard/recordings", icon: FolderOpen },
    { label: "Calendar",   href: "/dashboard/calendar",   icon: Calendar },
    { label: "Upcoming",   href: "/dashboard/upcoming",   icon: CalendarCheck },
    { label: "History",    href: "/dashboard/history",    icon: Clock },
    { label: "Docs",       href: "/dashboard/docs",       icon: BookOpen },
];

const SIDEBAR_MIN_WIDTH  = 96;
const SIDEBAR_MAX_WIDTH  = 320;
const SIDEBAR_SNAP_POINTS = [112, 248, 300];
const COMPACT_THRESHOLD  = 176;

// ─── Types ────────────────────────────────────────────────────────────────────

type SidebarProps = {
    width: number;
    onWidthChange: (next: number) => void;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSnappedWidth(w: number): number {
    const first = SIDEBAR_SNAP_POINTS[0] ?? SIDEBAR_MIN_WIDTH;
    return SIDEBAR_SNAP_POINTS.reduce((closest, point) =>
        Math.abs(point - w) < Math.abs(closest - w) ? point : closest
    , first);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Sidebar({ width, onWidthChange }: SidebarProps) {
    const pathname   = usePathname();
    const { stats, setStats } = useZapStore();
    const [isResizing, setIsResizing]         = useState(false);
    const [resizeHovered, setResizeHovered]   = useState(false);
    const widthRef = useRef(width);
    const isCompact = width < COMPACT_THRESHOLD;

    // Keep ref in sync for use inside event listeners
    useEffect(() => { widthRef.current = width; }, [width]);

    // Stats polling
    useEffect(() => {
        let mounted = true;

        async function loadStats() {
            try {
                const res  = await fetch("/api/meetings/stats", { cache: "no-store" });
                const json = await res.json();
                if (mounted && json?.success) setStats(json.data ?? {});
            } catch { /* keep defaults */ }
        }

        if (!stats) void loadStats();
        const timer = setInterval(loadStats, 45_000);
        return () => { mounted = false; clearInterval(timer); };
    }, [stats, setStats]);

    // Resize drag listeners
    useEffect(() => {
        if (!isResizing) return;

        const onMove = (e: MouseEvent) => {
            const next = Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, e.clientX));
            onWidthChange(next);
        };
        const onUp = () => {
            onWidthChange(getSnappedWidth(widthRef.current));
            setIsResizing(false);
        };

        document.body.style.cursor     = "col-resize";
        document.body.style.userSelect = "none";
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup",   onUp);
        return () => {
            document.body.style.cursor     = "";
            document.body.style.userSelect = "";
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup",   onUp);
        };
    }, [isResizing, onWidthChange]);

    const isActive = (href: string) =>
        href === "/dashboard"
            ? pathname === "/dashboard" || pathname === "/dashboard/"
            : pathname.startsWith(href);

    return (
        <aside
            style={{ width }}
            className={cn(
                "fixed bottom-0 left-0 top-0 z-50 hidden flex-col md:flex",
                "bg-white border-r border-slate-200/80",
                "transition-[width] duration-150 ease-out",
                isResizing && "transition-none"
            )}
        >
            {/* ── Logo / Brand ── */}
            <div className={cn(
                "flex h-14 shrink-0 items-center border-b border-slate-100 px-3",
                isCompact ? "justify-center" : "gap-2.5 px-4"
            )}>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 shadow-sm shadow-indigo-200">
                    <Zap className="h-4 w-4 text-white" />
                </div>
                {!isCompact && (
                    <span className="truncate text-sm font-bold tracking-tight text-slate-900">
                        MeetSync
                    </span>
                )}
            </div>

            {/* ── Navigation ── */}
            <nav className="flex-1 overflow-y-auto overscroll-contain px-2 py-3 space-y-0.5">
                {NAV_ITEMS.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            prefetch={false}
                            title={isCompact ? item.label : undefined}
                            className={cn(
                                "group relative flex w-full items-center rounded-xl text-sm font-medium",
                                "transition-all duration-150 ease-out motion-reduce:transition-none",
                                isCompact
                                    ? "flex-col gap-1 px-2 py-3 text-center"
                                    : "flex-row gap-3 px-3 py-2.5",
                                active
                                    ? "bg-indigo-50 text-indigo-700"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                            )}
                        >
                            {/* Active indicator pill */}
                            {active && (
                                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-indigo-500" />
                            )}

                            <item.icon className={cn(
                                "shrink-0 transition-colors",
                                isCompact ? "h-5 w-5" : "h-4 w-4",
                                active
                                    ? "text-indigo-600"
                                    : "text-slate-400 group-hover:text-slate-600"
                            )} />

                            <span className={cn(
                                "truncate leading-tight font-medium",
                                isCompact ? "text-[10px]" : "text-sm"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}

                {/* ── Stats Widget ── */}
                <div className={cn(
                    "mt-4 rounded-xl overflow-hidden border border-slate-100",
                    "bg-gradient-to-br from-indigo-50 via-indigo-50 to-violet-50",
                )}>
                    {isCompact ? (
                        <div className="flex flex-col items-center gap-0.5 py-3 px-2">
                            <p className="text-lg font-extrabold text-indigo-700">{stats?.activeMeetings ?? 0}</p>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-400">Live</p>
                        </div>
                    ) : (
                        <div className="px-3.5 py-3">
                            <div className="flex items-center justify-between">
                                <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">Active Meetings</p>
                                <span className={cn(
                                    "h-1.5 w-1.5 rounded-full",
                                    (stats?.activeMeetings ?? 0) > 0 ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
                                )} />
                            </div>
                            <p className="mt-1 text-2xl font-extrabold text-slate-900">{stats?.activeMeetings ?? 0}</p>
                        </div>
                    )}
                </div>
            </nav>

            {/* ── User Footer ── */}
            <div className={cn(
                "shrink-0 border-t border-slate-100 p-3",
                isCompact ? "flex flex-col items-center gap-1" : "flex items-center gap-3 px-3.5 py-3"
            )}>
                <UserButton
                    appearance={{
                        elements: { avatarBox: "h-8 w-8 ring-2 ring-slate-100 rounded-full" }
                    }}
                />
                {!isCompact && (
                    <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-700">Workspace</p>
                        <p className="text-[10px] text-slate-400 font-medium">Personal plan</p>
                    </div>
                )}
                {isCompact && (
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">You</p>
                )}
            </div>

            {/* ── Resize Handle ── */}
            <button
                type="button"
                aria-label="Resize sidebar"
                onMouseDown={(e) => { if (e.button !== 0) return; setIsResizing(true); }}
                onMouseEnter={() => setResizeHovered(true)}
                onMouseLeave={() => setResizeHovered(false)}
                className="absolute right-0 top-0 h-full w-3 -translate-x-0.5 cursor-col-resize"
            >
                {/* Visual line that appears on hover/drag */}
                <span className={cn(
                    "absolute right-1 top-1/2 h-12 w-0.5 -translate-y-1/2 rounded-full transition-all duration-150",
                    isResizing
                        ? "bg-indigo-500 h-20 opacity-100"
                        : resizeHovered
                        ? "bg-indigo-300 opacity-100"
                        : "bg-transparent opacity-0"
                )} />
            </button>
        </aside>
    );
}
