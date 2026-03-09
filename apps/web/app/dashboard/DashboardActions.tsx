"use client";

import { useState } from "react";
import { cn } from "../../lib/utils";
import { Calendar, RefreshCcw, Plus, AlertCircle, CheckCircle2 } from "lucide-react";
import ScheduleMeetingModal from "./ScheduleMeetingModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type ActionState = "connect" | "sync" | null;

export default function DashboardActions() {
    const [loading, setLoading] = useState<ActionState>(null);
    const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    async function handleConnectCalendar() {
        setLoading("connect");
        setNotice(null);
        try {
            const res = await fetch(`${API_URL}/api/auth/google`);
            const json = await res.json();
            const url = json?.data?.url as string | undefined;
            if (!url) throw new Error("Missing OAuth URL");
            window.location.href = url;
        } catch (error) {
            console.error(error);
            setNotice({ tone: "error", text: "Failed to connect." });
        } finally {
            setLoading(null);
        }
    }

    async function handleSyncCalendar() {
        setLoading("sync");
        setNotice(null);
        try {
            await fetch(`${API_URL}/api/calendar/events`);
            const res = await fetch(`${API_URL}/api/calendar/sync`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            const json = await res.json();
            if (!res.ok || !json?.success) throw new Error(json?.error || "Sync failed");
            setNotice({
                tone: "ok",
                text: `Synced ${json.data?.synced || 0} meetings.`,
            });
            window.setTimeout(() => window.location.reload(), 900);
        } catch (error) {
            console.error(error);
            setNotice({ tone: "error", text: "Sync failed." });
        } finally {
            setLoading(null);
        }
    }

    return (
        <div className="flex flex-col md:flex-row items-center gap-3">
            {notice && (
                <div className={cn(
                    "text-xs font-bold px-3 py-1.5 rounded-full border flex items-center gap-1.5 shadow-sm",
                    notice.tone === "ok"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                        : "bg-red-50 text-red-600 border-red-200"
                )}>
                    {notice.tone === "ok" ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                    {notice.text}
                </div>
            )}

            <button
                className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-bold text-slate-700 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                onClick={handleSyncCalendar}
                disabled={loading !== null}
            >
                {loading === "sync" ? (
                    <RefreshCcw size={16} className="animate-spin text-slate-400" />
                ) : (
                    <RefreshCcw size={16} className="text-slate-500" />
                )}
                Sync
            </button>
            <button
                className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-bold text-slate-700 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                onClick={handleConnectCalendar}
                disabled={loading !== null}
            >
                <Calendar size={16} className="text-slate-500" />
                {loading === "connect" ? "Connecting..." : "Add Calendar"}
            </button>
            <button
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold transition-all shadow-sm flex items-center gap-2 active:scale-95 group/btn"
            >
                <Plus size={16} className="group-hover/btn:rotate-90 transition-transform" />
                New Meeting
            </button>

            <ScheduleMeetingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
