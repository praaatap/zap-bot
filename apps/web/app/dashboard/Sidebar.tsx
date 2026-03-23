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
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Meetings", href: "/dashboard/meetings", icon: Video },
    { label: "Recordings", href: "/dashboard/recordings", icon: FolderOpen },
    { label: "Calendar", href: "/dashboard/calendar", icon: Calendar },
    { label: "Upcoming", href: "/dashboard/upcoming", icon: CalendarCheck },
    { label: "History", href: "/dashboard/history", icon: Clock },
    { label: "Docs", href: "/dashboard/docs", icon: BookOpen },
];

const SIDEBAR_MIN_WIDTH = 96;
const SIDEBAR_MAX_WIDTH = 320;
const SIDEBAR_SNAP_POINTS = [112, 248, 300];
const COMPACT_THRESHOLD = 176;

// ─── Types / Helpers ─────────────────────────────────────────────────────────

type SidebarProps = {
    width: number;
    onWidthChange: (next: number) => void;
};

function getSnappedWidth(w: number): number {
    const first = SIDEBAR_SNAP_POINTS[0] ?? SIDEBAR_MIN_WIDTH;
    return SIDEBAR_SNAP_POINTS.reduce((closest, point) =>
        Math.abs(point - w) < Math.abs(closest - w) ? point : closest
        , first);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Sidebar({ width, onWidthChange }: SidebarProps) {
    const pathname = usePathname();
    const { stats, setStats } = useZapStore();
    const [isResizing, setIsResizing] = useState(false);
    const [resizeHovered, setResizeHovered] = useState(false);
    const widthRef = useRef(width);
    const isCompact = width < COMPACT_THRESHOLD;

    useEffect(() => { widthRef.current = width; }, [width]);

    // Stats polling
    useEffect(() => {
        let mounted = true;
        async function loadStats() {
            try {
                const res = await fetch("/api/meetings/stats", { cache: "no-store" });
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
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        return () => {
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };
    }, [isResizing, onWidthChange]);

    const isActive = (href: string) =>
        href === "/dashboard"
            ? pathname === "/dashboard" || pathname === "/dashboard/"
            : pathname.startsWith(href);

    const activeMeetings = stats?.activeMeetings ?? 0;

    return (
        <aside
            style={{ width }}
            className={cn(
                "fixed bottom-0 left-0 top-0 z-50 hidden flex-col md:flex",
                "bg-[#000] border-r border-white/5",
                "transition-[width] duration-150 ease-out",
                isResizing && "transition-none"
            )}
        >
            {/* ── Logo / Brand ── */}
            <div className={cn(
                "flex h-16 shrink-0 items-center border-b border-white/10 px-4",
                isCompact ? "justify-center" : "gap-3"
            )}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                    <Zap className="h-5 w-5 text-white fill-white" />
                </div>
                {!isCompact && (
                    <span className="truncate text-base font-bold tracking-tight text-white">
                        Zap Bot
                    </span>
                )}
            </div>

            {/* ── Navigation ── */}
            <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-0.5">
                {NAV_ITEMS.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            prefetch={false}
                            title={isCompact ? item.label : undefined}
                            className={cn(
                                "group relative flex w-full items-center rounded-xl text-sm",
                                "transition-all duration-200 ease-out",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60",
                                isCompact
                                    ? "flex-col gap-1 px-2 py-3 text-center"
                                    : "flex-row gap-3 px-3 py-2.5",
                                active
                                    ? "bg-white/10 text-white font-semibold border border-white/10"
                                    : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300 font-medium"
                            )}
                        >
                            {active && !isCompact && (
                                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-cyan-400" />
                            )}

                            <item.icon className={cn(
                                "shrink-0 transition-colors duration-200",
                                isCompact ? "h-5 w-5" : "h-4 w-4",
                                active ? "text-cyan-400" : "text-zinc-500 group-hover:text-zinc-300"
                            )} />

                            <span className={cn(
                                "truncate leading-tight",
                                isCompact ? "text-[9px] font-bold uppercase tracking-widest" : "text-sm"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}

                {/* ── LIVE MTG Badge ── */}
                <div className={cn(
                    "mt-5 overflow-hidden rounded-xl border backdrop-blur-md",
                    "bg-white/5 border-white/10",
                )}>
                    {isCompact ? (
                        <div className="flex flex-col items-center gap-1.5 py-3.5 px-2">
                            <div className="relative flex items-center justify-center w-4 h-4">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            </div>
                            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-blue-400 leading-none">LIVE</p>
                            <p className="text-xl font-extrabold text-white leading-none">{activeMeetings}</p>
                        </div>
                    ) : (
                        <div className="px-4 py-3.5">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-400">Live Meetings</p>
                                <div className="flex items-center gap-1.5">
                                    <div className="relative flex h-3 w-3 items-center justify-center">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">LIVE MTG</span>
                                </div>
                            </div>
                            <p className="text-3xl font-extrabold text-white tracking-tight">{activeMeetings}</p>
                            <p className="mt-1 text-[11px] text-zinc-500">Currently in progress</p>
                        </div>
                    )}
                </div>
            </nav>

            {/* ── User Footer ── */}
            <div className={cn(
                "shrink-0 border-t border-white/10 p-3.5",
                isCompact ? "flex flex-col items-center gap-2" : "flex items-center gap-3"
            )}>
                <UserButton
                    appearance={{
                        elements: { avatarBox: "h-8 w-8 rounded-xl" }
                    }}
                />
                {!isCompact && (
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-zinc-300">Workspace</p>
                        <p className="text-[10px] text-zinc-600 mt-0.5">Personal plan</p>
                    </div>
                )}
            </div>

            {/* ── Resize Handle ── */}
            <button
                type="button"
                aria-label="Resize sidebar"
                onMouseDown={(e) => { if (e.button !== 0) return; setIsResizing(true); }}
                onMouseEnter={() => setResizeHovered(true)}
                onMouseLeave={() => setResizeHovered(false)}
                className="absolute right-0 top-0 h-full w-1 -translate-x-0.5 cursor-col-resize group"
            >
                <span className={cn(
                    "absolute right-0 top-1/2 h-16 w-0.5 -translate-y-1/2 rounded-full transition-all duration-200",
                    isResizing
                        ? "bg-gradient-to-b from-cyan-500 to-indigo-500 h-24 opacity-100"
                        : resizeHovered
                            ? "bg-cyan-400 opacity-80"
                            : "bg-white/10 opacity-0 group-hover:opacity-40"
                )} />
            </button>
        </aside>
    );
}
