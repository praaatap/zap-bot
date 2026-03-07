"use client";

import { useState } from "react";

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
            setNotice({ tone: "error", text: "Failed to start Google connection flow." });
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
                text: `Synced ${json.data?.synced || 0} meetings and dispatched ${json.data?.botsDispatched || 0} bot(s).`,
            });
            window.setTimeout(() => window.location.reload(), 900);
        } catch (error) {
            console.error(error);
            setNotice({ tone: "error", text: "Calendar sync failed. Check API config and retry." });
        } finally {
            setLoading(null);
        }
    }

    return (
        <div className="actionWrap">
            <div className="actionRow">
                <button
                    className="btnGhost"
                    id="sync-calendar-btn"
                    onClick={handleSyncCalendar}
                    disabled={loading !== null}
                >
                    {loading === "sync" ? "Syncing..." : "Sync Calendar"}
                </button>
                <button
                    className="btnGhost"
                    id="connect-calendar-btn"
                    onClick={handleConnectCalendar}
                    disabled={loading !== null}
                >
                    {loading === "connect" ? "Connecting..." : "Connect Google"}
                </button>
                <a href="/settings" className="btnPrimary" id="new-meeting-btn">New Meeting</a>
            </div>

            {notice ? (
                <div className={`actionNotice ${notice.tone === "ok" ? "ok" : "error"}`}>
                    {notice.text}
                </div>
            ) : null}
        </div>
    );
}
