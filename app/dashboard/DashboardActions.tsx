"use client";

import { useState } from "react";
import { cn } from "../../lib/utils";
import { Calendar, RefreshCcw, AlertCircle, CheckCircle2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type ActionState = "connect" | "sync" | null;

export default function DashboardActions() {
    const [loading, setLoading] = useState<ActionState>(null);
    const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

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
                    "text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm",
                    notice.tone === "ok"
                        ? "bg-[#0058be10] text-[#0058be]"
                        : "bg-red-50 text-red-600"
                )}>
                    {notice.tone === "ok" ? <CheckCircle2 size={12} strokeWidth={2.5} /> : <AlertCircle size={12} strokeWidth={2.5} />}
                    {notice.text}
                </div>
            )}

            <button
                className="px-5 py-2.5 bg-white/40 hover:bg-white/60 backdrop-blur-md rounded-xl text-[10px] font-bold uppercase tracking-widest text-[#424754] disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95 shadow-sm shadow-black/5"
                onClick={handleSyncCalendar}
                disabled={loading !== null}
            >
                <RefreshCcw size={14} strokeWidth={2.5} className={cn(loading === "sync" && "animate-spin")} />
                Sync
            </button>
            <button
                className="px-5 py-2.5 bg-[#0058be] hover:bg-[#2170e4] rounded-xl text-[10px] font-bold uppercase tracking-widest text-white disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-[#0058be20]"
                onClick={handleConnectCalendar}
                disabled={loading !== null}
            >
                <Calendar size={14} strokeWidth={2.5} />
                {loading === "connect" ? "Connecting..." : "Add Source"}
            </button>
        </div>
    );
}
