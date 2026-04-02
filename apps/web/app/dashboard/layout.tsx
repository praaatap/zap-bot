"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import DashboardTopNav from "@/components/DashboardTopNav";
import { X, Sparkles } from "lucide-react";

const SIDEBAR_MIN_WIDTH = 80;
const SIDEBAR_MAX_WIDTH = 320;
const SIDEBAR_DEFAULT_WIDTH = 240; // Expanded by default for a better desktop experience

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT_WIDTH);
    const [isDesktop, setIsDesktop] = useState(false);
    const [showBanner, setShowBanner] = useState(true);

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
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200 selection:text-blue-900 overflow-x-hidden relative">
            
            {/* Premium Background Gradients (Matches Landing Page) */}
            <div className="absolute top-0 inset-x-0 h-[800px] bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-100/40 via-white to-slate-50 -z-10 pointer-events-none" />
            <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] bg-blue-200/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="absolute bottom-[20%] -right-[10%] w-[30%] h-[30%] bg-indigo-200/20 rounded-full blur-[100px] -z-10 pointer-events-none" />

            {/* Premium Promo Banner (Ghosted/Commented) */}
            {/* {showBanner && (
                <div className="h-10 w-full bg-linear-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-[13px] font-medium text-white z-50 fixed top-0 left-0 right-0 shadow-sm">
                    <span className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                        Your free trial ends in 7 days. 
                        <a href="/pricing" className="text-white font-bold ml-1 hover:text-blue-200 underline decoration-blue-400 underline-offset-2 transition-colors">
                            Upgrade now
                        </a>
                    </span>
                    <button 
                        onClick={() => setShowBanner(false)}
                        className="absolute right-4 text-white/70 hover:text-white hover:bg-white/10 p-1 rounded-md transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )} */}

            <div className={`flex flex-1 ${showBanner ? "mt-10" : "mt-0"} transition-all duration-300 relative z-10`}>
                <Sidebar width={isDesktop ? sidebarWidth : 0} onWidthChange={handleSidebarWidthChange} />
                
                {/* Assuming DashboardTopNav exists in your project */}
                <DashboardTopNav leftOffset={isDesktop ? sidebarWidth : 0} />

                <div 
                    className="flex flex-1 flex-col transition-all duration-150 ease-out" 
                    style={isDesktop ? { marginLeft: `${sidebarWidth}px` } : undefined}
                >
                    <main className="flex-1 pt-16 px-4 md:px-8 pb-8">
                        <div className="max-w-7xl mx-auto w-full h-full">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}