"use client";

import { useMemo, useState } from "react";
import { 
    Sparkles, 
    Wand2, 
    Copy, 
    Briefcase, 
    FileJson, 
    RotateCw, 
    AlertCircle, 
    CheckCircle2 
} from "lucide-react";
import { cn } from "../../../lib/utils";

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
    recordingUrl: _recordingUrl,
    botStatus,
    botId: _botId,
    botSent,
}: {
    meetingId: string;
    title: string;
    summary?: string;
    transcriptEntries: TranscriptEntry[];
    recordingUrl?: string;
    botStatus?: string;
    botId?: string;
    botSent?: boolean;
}) {
    const [busy, setBusy] = useState<null | "process" | "copy" | "export" | "download" | "slack" | "pm" | "stop" | "format">(null);
    const [notice, setNotice] = useState<string>("");
    const [selectedFormat, setSelectedFormat] = useState<string>("executive");

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
            const res = await fetch(`/api/meetings/${meetingId}/process`, { method: "POST" });
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

    async function handleStopBot() {
        setBusy("stop");
        setNotice("");
        try {
            const res = await fetch(`/api/meetings/${meetingId}/stop-bot`, { method: "POST" });
            const json = await res.json();
            if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to stop bot");
            setNotice("Bot termination requested. Refreshing...");
            // Optionally reload to update status
            setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
            setNotice(err instanceof Error ? err.message : "Stop failed");
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

    async function handleFormatSummary() {
        setBusy("format");
        setNotice("");
        try {
            const res = await fetch(`/api/meetings/${meetingId}/format-summary`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ format: selectedFormat })
            });
            const json = await res.json();
            if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to format summary");
            
            await navigator.clipboard.writeText(json.formattedText);
            setNotice(`${selectedFormat} summary copied!`);
        } catch (err) {
            setNotice(err instanceof Error ? err.message : "Format failed");
        } finally {
            setBusy(null);
        }
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

                {botSent && botStatus !== "completed" && (
                    <button
                        className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-tighter italic disabled:opacity-50"
                        onClick={handleStopBot}
                        disabled={busy !== null}
                    >
                        <RotateCw className={cn("w-3.5 h-3.5", busy === "stop" && "animate-spin")} />
                        {busy === "stop" ? "Stopping..." : "Stop Bot"}
                    </button>
                )}

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

                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                        <Wand2 className="w-4 h-4 text-white" />
                        <h3 className="text-[10px] font-bold text-white uppercase italic tracking-widest">Magic Formats</h3>
                    </div>
                    <div className="flex gap-2">
                        <select 
                            className="flex-1 py-2 bg-zinc-900 rounded-lg border border-white/5 text-[10px] font-bold text-zinc-400 capitalize px-2 outline-none"
                            value={selectedFormat}
                            onChange={(e) => setSelectedFormat(e.target.value)}
                            disabled={busy !== null}
                        >
                            <option value="executive">Executive Briefing</option>
                            <option value="developer">Developer Tickets</option>
                            <option value="casual">Casual Slack Post</option>
                        </select>
                        <button 
                            className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-white/10 flex items-center justify-center gap-1.5 text-[10px] font-bold text-white transition-colors disabled:opacity-50"
                            onClick={handleFormatSummary}
                            disabled={busy !== null}
                        >
                            <Sparkles className={cn("w-3 h-3", busy === "format" && "animate-pulse")} />
                            {busy === "format" ? "..." : "Format"}
                        </button>
                    </div>
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
