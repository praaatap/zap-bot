"use client";

import { useEffect, useState } from "react";
import { Activity, CheckCircle2, AlertCircle, Server, Database, Globe, RefreshCcw } from "lucide-react";
import { cn } from "../../lib/utils";

export default function SystemStatus() {
    const [lastSync, setLastSync] = useState<string>("Just now");

    useEffect(() => {
        const timer = setInterval(() => {
            setLastSync(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="p-8 rounded-[2.5rem] bg-white shadow-[0_20px_40px_rgba(25,27,35,0.04)] flex flex-col h-full hover:translate-y-[-2px] transition-all relative overflow-hidden group">

            <div className="flex items-center justify-between mb-10 relative z-10 transition-transform group-hover:translate-x-1">
                <div className="space-y-1.5 font-bold">
                    <h3 className="text-sm text-[#191b23] flex items-center gap-2.5">
                        <Server size={16} strokeWidth={2.5} className="text-[#0058be]" /> System Health
                    </h3>
                    <p className="text-[10px] text-[#424754]/40 uppercase tracking-[0.2em]">Last Sync: {lastSync}</p>
                </div>
                <div className="px-3.5 py-1.5 rounded-full bg-[#0058be10] text-[#0058be] text-[9px] font-bold flex items-center gap-2 uppercase tracking-[0.2em] shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0058be] animate-pulse" />
                    Operational
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 relative z-10 flex-1">
                {[
                    { label: 'Neural Gateway', ok: true, icon: Globe },
                    { label: 'Vector Storage', ok: true, icon: Database },
                    { label: 'Compute Nodes', ok: true, icon: Activity },
                ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-4 rounded-2xl bg-[#f2f3fd]/50 group/item hover:bg-[#f2f3fd] transition-colors border-none shadow-sm shadow-black/5">
                        <div className="flex items-center gap-4">
                            <item.icon size={16} strokeWidth={2.5} className="text-[#0058be]/40 group-hover/item:text-[#0058be] transition-colors" />
                            <span className="text-xs font-bold text-[#424754]/60 group-hover/item:text-[#191b23] transition-colors">{item.label}</span>
                        </div>
                        {item.ok ?
                            <CheckCircle2 size={16} strokeWidth={2.5} className="text-emerald-500" /> :
                            <AlertCircle size={16} strokeWidth={2.5} className="text-red-500" />
                        }
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2.5 text-[10px] font-bold text-[#424754]/30 uppercase tracking-[0.2em]">
                    <RefreshCcw size={12} strokeWidth={2.5} className="animate-spin-slow text-[#0058be]/20" />
                    Auto-refresh active
                </div>
                <span className="text-[9px] text-[#424754]/20 font-bold uppercase tracking-[0.2em]">us-east-1 — v3.4.0</span>
            </div>
        </div>
    );
}