"use client";

import { useMemo, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type TranscriptEntry = {
    speaker: string;
    text: string;
    startTime: number;
    endTime: number;
};

function timestamp(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function MeetingActions({
    meetingId,
    title,
    summary,
    transcriptEntries,
    recordingUrl,
}: {
    meetingId: string;
    title: string;
    summary?: string;
    transcriptEntries: TranscriptEntry[];
    recordingUrl?: string;
}) {
    const [busy, setBusy] = useState<null | "process" | "copy" | "export" | "download" | "slack" | "pm">(null);
    const [notice, setNotice] = useState<string>("");

    const transcriptText = useMemo(() => {
        if (!transcriptEntries.length) return "";
        return transcriptEntries
            .map((entry) => `[${timestamp(entry.startTime)}-${timestamp(entry.endTime)}] ${entry.speaker}: ${entry.text}`)
            .join("\n");
    }, [transcriptEntries]);

    async function handleReprocess() {
        setBusy("process");
        setNotice("");
        try {
            const res = await fetch(`${API_URL}/api/meetings/${meetingId}/process`, { method: "POST" });
            const json = await res.json();
            if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to re-process");
            setNotice("Re-processing started. Refresh in a moment for updated summary.");
        } catch (err) {
            setNotice(err instanceof Error ? err.message : "Re-process failed");
        } finally {
            setBusy(null);
        }
    }

    async function handleCopySummary() {
        if (!summary) {
            setNotice("No summary available yet.");
            return;
        }
        setBusy("copy");
        setNotice("");
        try {
            await navigator.clipboard.writeText(summary);
            setNotice("Summary copied to clipboard.");
        } catch {
            setNotice("Could not copy summary.");
        } finally {
            setBusy(null);
        }
    }

    function handleExportTranscript() {
        if (!transcriptText) {
            setNotice("No transcript to export yet.");
            return;
        }
        setBusy("export");
        setNotice("");
        const blob = new Blob([`Meeting: ${title}\nID: ${meetingId}\n\n${transcriptText}`], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${meetingId}-transcript.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        setNotice("Transcript exported.");
        setBusy(null);
    }

    async function handlePostToSlack() {
        setBusy("slack");
        setNotice("");
        try {
            const res = await fetch(`${API_URL}/api/meetings/${meetingId}/share-slack`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ channelId: "C12345" }) // Mock channel ID
            });
            const json = await res.json();
            if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to post to Slack");
            setNotice("Shared summary to Slack channel.");
        } catch (err) {
            setNotice(err instanceof Error ? err.message : "Slack post failed");
        } finally {
            setBusy(null);
        }
    }

    async function handleSyncToPM() {
        setBusy("pm");
        setNotice("");
        try {
            const res = await fetch(`${API_URL}/api/meetings/${meetingId}/sync-pm`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ platform: "jira", workspaceId: "ws_1", projectId: "proj_1" }) // Mock data
            });
            const json = await res.json();
            if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to sync to PM");
            setNotice("Action items synced to Jira.");
        } catch (err) {
            setNotice(err instanceof Error ? err.message : "PM sync failed");
        } finally {
            setBusy(null);
        }
    }

    function handleDownloadRecording() {
        if (!recordingUrl) {
            setNotice("Recording URL not available yet.");
            return;
        }
        setBusy("download");
        window.open(recordingUrl, "_blank", "noopener,noreferrer");
        setNotice("Opened recording in a new tab.");
        setBusy(null);
    }

    return (
        <div className="infoCard">
            <h3 className="infoCardTitle">Actions</h3>
            <div className="actionButtons">
                <button className="actionBtn actionBtnPrimary" onClick={handleReprocess} disabled={busy !== null}>
                    {busy === "process" ? "Processing..." : "Re-process with AI"}
                </button>
                <button className="actionBtn" onClick={handleDownloadRecording} disabled={busy !== null}>
                    Download Recording
                </button>
                <button className="actionBtn" onClick={handleExportTranscript} disabled={busy !== null}>
                    Export Transcript
                </button>
                <button className="actionBtn" onClick={handleCopySummary} disabled={busy !== null}>
                    Copy Summary
                </button>
                <div className="flex gap-2 w-full mt-2">
                    <button className="actionBtn flex-1 bg-[#4A154B] text-white hover:bg-[#350d35]" onClick={handlePostToSlack} disabled={busy !== null}>
                        {busy === "slack" ? "Posting..." : "Post to Slack"}
                    </button>
                    <button className="actionBtn flex-1 bg-[#0052CC] text-white hover:bg-[#0747a6]" onClick={handleSyncToPM} disabled={busy !== null}>
                        {busy === "pm" ? "Syncing..." : "Sync to Jira"}
                    </button>
                </div>
            </div>
            {notice ? <p className="actionNotice">{notice}</p> : null}
        </div>
    );
}
