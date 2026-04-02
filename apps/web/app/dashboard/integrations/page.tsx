"use client";

import { useEffect, useState } from "react";
import { Calendar, Slack, CreditCard, Mail, Trello, Plus, CheckCircle2, Webhook } from "lucide-react";
import { cn } from "@/lib/utils";

export default function IntegrationsPage() {
    const [connectState, setConnectState] = useState({ calendar: false, slack: false, stripe: false });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchState() {
            try {
                const res = await fetch("/api/dashboard/overview");
                const { data } = await res.json();
                setConnectState({
                    calendar: data?.integrations?.calendarConnected || false,
                    slack: data?.integrations?.slackConnected || false,
                    stripe: data?.integrations?.plan ? true : false,
                });
            } catch (err) {
                console.error("Failed to fetch integrations", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchState();
    }, []);

    const apps = [
        {
            id: "calendar",
            name: "Google Calendar",
            desc: "Automatically schedule and join your upcoming meetings.",
            icon: Calendar,
            color: "text-blue-500",
            bg: "bg-blue-50",
            connected: connectState.calendar,
        },
        {
            id: "slack",
            name: "Slack Workflow",
            desc: "Push meeting summaries and action items to channels.",
            icon: Slack,
            color: "text-purple-600",
            bg: "bg-purple-50",
            connected: connectState.slack,
        },
        {
            id: "stripe",
            name: "Stripe Billing",
            desc: "Manage your premium subscription and limits.",
            icon: CreditCard,
            color: "text-indigo-500",
            bg: "bg-indigo-50",
            connected: connectState.stripe,
        },
        {
            id: "outlook",
            name: "Outlook",
            desc: "Sync with Microsoft 365 calendar endpoints.",
            icon: Mail,
            color: "text-sky-500",
            bg: "bg-sky-50",
            connected: false,
        },
        {
            id: "jira",
            name: "Jira / Asana",
            desc: "Turn action items automatically into dev tickets.",
            icon: Trello,
            color: "text-blue-600",
            bg: "bg-blue-50",
            connected: false,
        },
        {
            id: "webhooks",
            name: "Custom Webhooks",
            desc: "Fire internal webhooks when a transcript finishes.",
            icon: Webhook,
            color: "text-slate-800",
            bg: "bg-slate-100",
            connected: false,
        }
    ];

    return (
        <div className="flex flex-col h-full w-full gap-6 p-6 xl:p-8 max-w-[1400px] mx-auto overflow-y-auto custom-scrollbar">
            {/* Header Area */}
            <div className="mb-4">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Integrations</h1>
                <p className="text-sm font-semibold text-slate-500">Connect Zap Bot to your favorite tools for seamless automation.</p>
            </div>

            {/* App Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {apps.map((app) => (
                    <div key={app.id} className="bg-white rounded-3xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col hover:border-slate-200 transition-colors group">
                        
                        <div className="flex justify-between items-start mb-4">
                            <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center", app.bg)}>
                                <app.icon className={cn("h-7 w-7", app.color)} strokeWidth={2.5} />
                            </div>
                            
                            {isLoading ? (
                                <div className="h-8 w-20 bg-slate-100 animate-pulse rounded-full" />
                            ) : app.connected ? (
                                <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 border border-emerald-100">
                                    <CheckCircle2 size={12} strokeWidth={3} /> Connected
                                </span>
                            ) : (
                                <a 
                                    href={`/api/oauth/${app.id}`} 
                                    className="bg-slate-50 hover:bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[12px] font-bold flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
                                >
                                    <Plus size={14} strokeWidth={2.5} /> Connect
                                </a>
                            )}
                        </div>

                        <div>
                            <h3 className="text-[17px] font-bold text-slate-900 mb-1.5">{app.name}</h3>
                            <p className="text-[13px] font-medium text-slate-500 leading-relaxed max-w-[90%]">
                                {app.desc}
                            </p>
                        </div>
                        
                        {/* Settings Button if connected */}
                        {app.connected && (
                            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                                <span className="text-[11px] font-semibold text-slate-400">Authenticated properly.</span>
                                <button className="text-indigo-600 text-[12px] font-bold hover:text-indigo-800 transition">
                                    Manage Settings &rarr;
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>
        </div>
    );
}
