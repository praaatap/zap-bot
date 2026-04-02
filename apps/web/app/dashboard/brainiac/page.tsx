"use client";

import { useState, useEffect } from "react";
import { BrainCircuit, Mail, Slack, Trello, CheckCircle2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BrainiacPage() {
    const [workflows, setWorkflows] = useState({
        followUpEmail: false,
        slackSummary: false,
        jiraTasks: false,
        crmSync: false,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/bot/workflows");
                const { data } = await res.json();
                if (data) setWorkflows(data);
            } catch (err) {
                console.error("Failed to fetch workflows", err);
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, []);

    const toggleWorkflow = async (key: keyof typeof workflows) => {
        const newValue = !workflows[key];
        setWorkflows(prev => ({ ...prev, [key]: newValue }));

        try {
            await fetch("/api/bot/workflows", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [key]: newValue }),
            });
        } catch (err) {
            console.error("Failed to update workflow", err);
            // Revert on failure
            setWorkflows(prev => ({ ...prev, [key]: !newValue }));
        }
    };

    const agents = [
        {
            id: "followUpEmail",
            name: "Auto-Draft Follow Ups",
            desc: "Zap Bot will automatically draft a follow up email containing a high-level summary to all meeting attendees. You can review it before sending.",
            icon: Mail,
            color: "text-blue-500",
            bg: "bg-blue-50",
            gradient: "from-blue-500 to-cyan-400",
        },
        {
            id: "slackSummary",
            name: "Slack Channel Broadcast",
            desc: "Extracts a 3-bullet point summary and pushes it directly to your designated #general or #updates channel immediately after the meeting.",
            icon: Slack,
            color: "text-purple-600",
            bg: "bg-purple-50",
            gradient: "from-purple-600 to-[#E01E5A]",
        },
        {
            id: "jiraTasks",
            name: "Task Extraction to Jira",
            desc: "Analyzes the transcript for action items and automatically creates Jira tickets assigned to the mentioned team members.",
            icon: Trello,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            gradient: "from-[#0052CC] to-indigo-400",
        },
        {
            id: "crmSync",
            name: "Salesforce / Hubspot Sync",
            desc: "Identifies potential leads and updates Salesforce or Hubspot records with notes gathered during discovery calls.",
            icon: Zap,
            color: "text-orange-500",
            bg: "bg-orange-50",
            gradient: "from-orange-500 to-amber-400",
        }
    ];

    return (
        <div className="flex flex-col h-full w-full gap-6 p-6 xl:p-8 max-w-[1400px] mx-auto overflow-y-auto custom-scrollbar">
            {/* Header Area */}
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1 flex items-center gap-2">
                        <BrainCircuit className="text-indigo-600 h-6 w-6" strokeWidth={2.5}/> 
                        Brainiac Automations
                    </h1>
                    <p className="text-sm font-semibold text-slate-500">Put your meetings on autopilot with intelligent background workflows.</p>
                </div>
            </div>

            {/* Workflows Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {agents.map((agent) => {
                    const isActive = workflows[agent.id as keyof typeof workflows];

                    return (
                        <div key={agent.id} className={cn(
                            "relative bg-white rounded-3xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] border transition-all overflow-hidden",
                            isActive ? "border-indigo-200 ring-4 ring-indigo-500/5" : "border-slate-100"
                        )}>
                            {/* Gradient active glow */}
                            {isActive && (
                                <div className={cn("absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 rounded-bl-full blur-2xl", agent.gradient)} />
                            )}
                            
                            <div className="flex items-start justify-between mb-4 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center", agent.bg)}>
                                        <agent.icon className={cn("h-7 w-7", agent.color)} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h3 className="text-[17px] font-bold text-slate-900 mb-0.5">{agent.name}</h3>
                                        <div className="flex items-center gap-1.5">
                                            {isActive ? (
                                                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                                                </span>
                                            ) : (
                                                <span className="text-[11px] font-bold text-slate-400">Idle</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Custom Toggle Switch */}
                                <button
                                    onClick={() => toggleWorkflow(agent.id as keyof typeof workflows)}
                                    className={cn(
                                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2",
                                        isActive ? "bg-indigo-600" : "bg-slate-200"
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                            isActive ? "translate-x-5" : "translate-x-0"
                                        )}
                                    />
                                </button>
                            </div>

                            <p className="text-[13px] font-medium text-slate-500 leading-relaxed max-w-[90%] relative z-10">
                                {agent.desc}
                            </p>

                            {/* Configuration / Status footer */}
                            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between relative z-10">
                                {isActive ? (
                                    <span className="text-[11px] font-semibold text-slate-400">Successfully fired 12 times this week.</span>
                                ) : (
                                    <span className="text-[11px] font-semibold text-slate-400">Toggle above to enable this agent.</span>
                                )}
                                <button className={cn(
                                    "text-[12px] font-bold transition",
                                    isActive ? "text-indigo-600 hover:text-indigo-800" : "text-slate-400 hover:text-slate-600"
                                )}>
                                    Configure &rarr;
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>
        </div>
    );
}
