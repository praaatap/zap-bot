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
                    "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border flex items-center gap-1.5",
                    notice.tone === "ok"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-red-500/10 text-red-100 border-red-500/20"
                )}>
                    {notice.tone === "ok" ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                    {notice.text}
                </div>
            )}

            <button
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 disabled:opacity-50 flex items-center gap-2"
                onClick={handleSyncCalendar}
                disabled={loading !== null}
            >
                <RefreshCcw size={14} className={cn(loading === "sync" && "animate-spin")} />
                Sync
            </button>
            <button
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 disabled:opacity-50 flex items-center gap-2"
                onClick={handleConnectCalendar}
                disabled={loading !== null}
            >
                <Calendar size={14} />
                {loading === "connect" ? "Connecting..." : "Add Source"}
            </button>
            <button
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-blue-500/20"
            >
                <Plus size={14} />
                New Session
            </button>

            <ScheduleMeetingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
