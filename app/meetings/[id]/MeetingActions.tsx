"use client";

import { useMemo, useState } from "react";
import { RotateCw, Download, FileJson, Copy, Slack, Briefcase, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "../../../lib/utils";

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
            setNotice("Intelligence refresh initiated.");
        } catch (err) {
            setNotice(err instanceof Error ? err.message : "Re-process failed");
        } finally {
            setBusy(null);
        }
    }

    async function handleCopySummary() {
        if (!summary) {
            setNotice("No intelligence available.");
            return;
        }
        setBusy("copy");
        try {
            await navigator.clipboard.writeText(summary);
            setNotice("Intelligence copied.");
        } catch {
            setNotice("Copy failed.");
        } finally {
            setBusy(null);
        }
    }

    function handleExportTranscript() {
        if (!transcriptText) {
            setNotice("No dialogue to export.");
            return;
        }
        setBusy("export");
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

    return (
        <div className="pro-card p-6 flex flex-col gap-6">
            <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-white" />
                <h3 className="text-sm font-bold text-white uppercase italic tracking-widest">Operations</h3>
            </div>

            <div className="flex flex-col gap-2">
                <button
                    className="w-full py-2.5 bg-white hover:bg-zinc-200 text-black font-bold rounded-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-tighter italic disabled:opacity-50"
                    onClick={handleReprocess}
                    disabled={busy !== null}
                >
                    <RotateCw className={cn("w-3.5 h-3.5", busy === "process" && "animate-spin")} />
                    {busy === "process" ? "Processing..." : "Sync Intelligence"}
                </button>

                <div className="grid grid-cols-2 gap-2">
                    <button
                        className="py-2.5 bg-zinc-900 border border-white/5 hover:border-white/20 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-tighter disabled:opacity-50"
                        onClick={handleExportTranscript}
                        disabled={busy !== null}
                    >
                        <FileJson className="w-3 h-3 text-zinc-500" />
                        Export
                    </button>
                    <button
                        className="py-2.5 bg-zinc-900 border border-white/5 hover:border-white/20 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-tighter disabled:opacity-50"
                        onClick={handleCopySummary}
                        disabled={busy !== null}
                    >
                        <Copy className="w-3 h-3 text-zinc-500" />
                        Copy
                    </button>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                    <button className="flex-1 py-2 bg-zinc-900 rounded-lg border border-white/5 flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-400 hover:text-white transition-colors">
                        <Slack className="w-3 h-3" />
                        Slack
                    </button>
                    <button className="flex-1 py-2 bg-zinc-900 rounded-lg border border-white/5 flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-400 hover:text-white transition-colors">
                        <Briefcase className="w-3 h-3" />
                        Jira
                    </button>
                </div>
            </div>

            {notice && (
                <div className={cn(
                    "p-3 rounded-lg text-[10px] font-bold uppercase tracking-widest italic flex items-center gap-2",
                    notice.includes("failed") ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                )}>
                    {notice.includes("failed") ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                    {notice}
                </div>
            )}
        </div>
    );
}
