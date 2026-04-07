"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import DashboardTopNav from "@/components/DashboardTopNav";

const SIDEBAR_MIN_WIDTH = 80;
const SIDEBAR_MAX_WIDTH = 320;
const SIDEBAR_DEFAULT_WIDTH = 240; // Expanded by default for a better desktop experience

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT_WIDTH);
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia("(min-width: 768px)");
        const update = () => setIsDesktop(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, []);

    useEffect(() => {
        const saved = window.localStorage.getItem("zapbot.sidebar.width");
        if (!saved) return;
        const parsed = Number(saved);
        if (!Number.isNaN(parsed)) {
            setSidebarWidth(Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, parsed)));
        }
    }, []);

    useEffect(() => {
        window.localStorage.setItem("zapbot.sidebar.width", String(sidebarWidth));
    }, [sidebarWidth]);

    function handleSidebarWidthChange(nextWidth: number) {
        setSidebarWidth(Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, nextWidth)));
    }

    return (
        <div className="relative flex min-h-screen overflow-x-hidden bg-[#f4f7fb] text-slate-900 font-sans selection:bg-blue-200 selection:text-blue-900">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-100/40 via-[#f8fbff] to-transparent" />

            <div className="relative z-10 flex flex-1">
                <Sidebar width={isDesktop ? sidebarWidth : 0} onWidthChange={handleSidebarWidthChange} />
                
                <DashboardTopNav leftOffset={isDesktop ? sidebarWidth : 0} />

                <div
                    className="flex flex-1 flex-col transition-all duration-150 ease-out"
                    style={isDesktop ? { marginLeft: `${sidebarWidth}px` } : undefined}
                >
                    <main className="flex-1 pt-20 px-4 pb-8 md:px-8 md:pb-10">
                        <div className="w-full h-full rounded-[28px] border border-[#e4eaf3] bg-white/70 shadow-[0_24px_60px_rgba(15,23,42,0.04)] backdrop-blur-sm">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}