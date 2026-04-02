"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    PieChart, Folder, LayoutDashboard, Layers, Bot, Box, Settings, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Library", href: "/dashboard/recordings", icon: Folder },
    { label: "Analytics", href: "/dashboard/analytics", icon: PieChart },
    { label: "Integrations", href: "/dashboard/settings/integrations", icon: Layers },
    { label: "Querent Chat", href: "/dashboard/chat", icon: Bot },
    { label: "Brainiac", href: "/dashboard/docs", icon: Box },
];

const SIDEBAR_MIN_WIDTH = 80;
const SIDEBAR_MAX_WIDTH = 320;
const COMPACT_THRESHOLD = 140;

export default function Sidebar({ width, onWidthChange }: { width: number; onWidthChange: (n: number) => void }) {
    const pathname = usePathname();
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

    const isActive = (href: string) => href === "/dashboard" ? pathname === "/dashboard" : pathname?.startsWith(href);

    if (width === 0) return null; // Hide completely on mobile (let a drawer component handle mobile)

    return (
        <aside
            style={{ width }}
            className={cn(
                "fixed bottom-0 left-0 top-0 z-40 hidden flex-col md:flex",
                "bg-white/70 backdrop-blur-2xl border-r border-slate-200/50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]",
                "transition-[width] duration-300 ease-in-out",
                isResizing && "transition-none"
            )}
        >
            {/* Logo Section */}
            <div className="flex h-20 shrink-0 items-center px-6 w-full mb-2">
                <Link href="/dashboard" className="flex items-center gap-3 group w-full overflow-hidden">
                    <div className="bg-linear-to-b from-blue-500 to-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20 border border-blue-400/20 shrink-0 group-hover:scale-110 transition-all duration-300">
                        <Zap className="w-4 h-4 text-white fill-current" />
                    </div>
                    {!isCompact && (
                        <div className="flex flex-col">
                            <span className="text-[17px] font-black text-slate-900 tracking-tight whitespace-nowrap leading-none">ZapBot</span>
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">Control Node</span>
                        </div>
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-4 flex flex-col gap-1 custom-scrollbar">
                <p className={cn("text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2 px-2", isCompact && "text-center px-0")}>
                    {isCompact ? "·" : "Management"}
                </p>
                {NAV_ITEMS.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group relative flex items-center rounded-xl transition-all duration-300 py-2.5 px-3 gap-3.5 overflow-hidden",
                                active 
                                    ? "bg-white shadow-sm border border-slate-200/60 text-blue-700" 
                                    : "text-slate-500 hover:text-slate-900 hover:bg-white/50 border border-transparent"
                            )}
                        >
                            {active && (
                                <motion.div 
                                    layoutId="sidebar-active"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-600 rounded-r-full"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <item.icon 
                                className={cn("shrink-0 transition-all duration-300", active ? "text-blue-600 scale-110" : "text-slate-400 group-hover:text-slate-600 group-hover:scale-110")}
                                size={18} 
                                strokeWidth={active ? 2.5 : 2}
                            />
                            {!isCompact && (
                                <span className={cn("text-[13.5px] font-bold tracking-tight whitespace-nowrap transition-colors", active ? "text-slate-900" : "text-slate-600 group-hover:text-slate-900")}>
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    );
                })}

                <div className="mt-auto pt-6 pb-2 border-t border-slate-100/60">
                     <Link
                        href="/dashboard/settings"
                        className={cn(
                            "group relative flex items-center rounded-xl transition-all duration-300 py-2.5 px-3 gap-3.5 overflow-hidden",
                            isActive("/dashboard/settings") 
                                ? "bg-white shadow-sm border border-slate-200/60 text-blue-700" 
                                : "text-slate-500 hover:text-slate-900 hover:bg-white/50 border border-transparent"
                        )}
                    >
                        {isActive("/dashboard/settings") && (
                            <motion.div 
                                layoutId="sidebar-active"
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-600 rounded-r-full"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                        <Settings 
                            size={18} 
                            strokeWidth={isActive("/dashboard/settings") ? 2.5 : 2}
                            className={cn("shrink-0 transition-all duration-300", isActive("/dashboard/settings") ? "text-blue-600 scale-110" : "text-slate-400 group-hover:text-slate-600 group-hover:scale-110")}
                        />
                        {!isCompact && (
                            <span className={cn("text-[13.5px] font-bold tracking-tight whitespace-nowrap transition-colors", isActive("/dashboard/settings") ? "text-slate-900" : "text-slate-600 group-hover:text-slate-900")}>
                                Settings
                            </span>
                        )}
                    </Link>
                </div>
            </nav>

            {/* Precision Resize Handle */}
            <div
                onMouseDown={() => setIsResizing(true)}
                className={cn(
                    "absolute -right-0.5 top-0 h-full w-1 cursor-col-resize z-50 transition-colors duration-300",
                    isResizing ? "bg-blue-500" : "hover:bg-blue-400 group/resize"
                )}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-8 bg-slate-200 rounded-full opacity-0 group-hover/resize:opacity-100 transition-opacity" />
            </div>
        </aside>
    );
}