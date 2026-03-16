"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import DashboardTopNav from "@/components/DashboardTopNav";

const SIDEBAR_MIN_WIDTH = 96;
const SIDEBAR_MAX_WIDTH = 320;
const SIDEBAR_DEFAULT_WIDTH = 112;

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
        const saved = window.localStorage.getItem("dashboard.sidebar.width");
        if (!saved) return;

        const parsed = Number(saved);
        if (!Number.isNaN(parsed)) {
            setSidebarWidth(Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, parsed)));
        }
    }, []);

    useEffect(() => {
        window.localStorage.setItem("dashboard.sidebar.width", String(sidebarWidth));
    }, [sidebarWidth]);

    function handleSidebarWidthChange(nextWidth: number) {
        setSidebarWidth(Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, nextWidth)));
    }

    return (
        <div className="flex min-h-screen bg-[#f4f5f8]">
            <Sidebar width={sidebarWidth} onWidthChange={handleSidebarWidthChange} />
            <DashboardTopNav leftOffset={isDesktop ? sidebarWidth : 0} />

            <div className="flex min-h-screen flex-1 flex-col" style={isDesktop ? { marginLeft: `${sidebarWidth}px` } : undefined}>
                <main className="flex-1 pt-16">
                    {children}
                </main>
            </div>
        </div>
    );
}