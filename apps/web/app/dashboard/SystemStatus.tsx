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
        <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col h-full hover:border-slate-300 hover:shadow-md transition-all relative overflow-hidden group">

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Server size={16} className="text-slate-500" /> System Health
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Last Check: {lastSync}</p>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-200 flex items-center gap-1.5 uppercase tracking-widest shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 relative z-10 flex-1">
                {[
                    { label: 'API Gateway', ok: true, icon: Globe },
                    { label: 'Database Cluster', ok: true, icon: Database },
                    { label: 'Worker Nodes', ok: true, icon: Activity },
                ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 group/item hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-3">
                            <item.icon size={14} className="text-slate-400 group-hover/item:text-slate-600 transition-colors" />
                            <span className="text-xs font-bold text-slate-600 group-hover/item:text-slate-900 transition-colors">{item.label}</span>
                        </div>
                        {item.ok ?
                            <CheckCircle2 size={14} className="text-emerald-500" /> :
                            <AlertCircle size={14} className="text-red-500" />
                        }
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <RefreshCcw size={10} className="animate-spin-slow" />
                    Auto-refreshing
                </div>
                <span className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase font-bold">us-east-1 — v2.4.0</span>
            </div>
        </div>
    );
}