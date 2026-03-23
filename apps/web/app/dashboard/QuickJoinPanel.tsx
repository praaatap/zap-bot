'use client';
import { useState } from "react";
import { cn } from "../../lib/utils";
import { ArrowRight, Zap, Link, Loader2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

export default function QuickJoinPanel() {
    const [meetingUrl, setMeetingUrl] = useState("");
    const [botName, setBotName] = useState("Zap Bot");
    const [service, setService] = useState<"meetingbaas" | "livekit">("meetingbaas");
    const [numBots, setNumBots] = useState(2);
    const [recordingMode, setRecordingMode] = useState<"speaker_view" | "gallery_view">("speaker_view");
    const [speechToTextProvider, setSpeechToTextProvider] = useState("Default");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!meetingUrl) return;

        setStatus("loading");
        setErrorMessage("");

        try {
            const trimmedUrl = meetingUrl.trim();
            const isLiveKitRoom = service === "livekit" && !/^https?:\/\//i.test(trimmedUrl) && !trimmedUrl.startsWith("livekit:");
            const normalizedMeetingUrl = service === "livekit"
                ? (isLiveKitRoom ? `livekit:${trimmedUrl}` : trimmedUrl)
                : (/^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`);

            const endpoint = service === "livekit" ? "/api/bot/dispatch-livekit" : "/api/bot/dispatch";

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    meetingUrl: normalizedMeetingUrl,
                    title: "Quick Join Meeting",
                    startTime: new Date().toISOString(),
                    botName,
                    recordingMode,
                    speechToTextProvider,
                    numBots: service === "livekit" ? numBots : 1,
                }),
            });

            const json = await res.json();

            if (!res.ok || !json.success || json?.data?.botDispatched === false) {
                throw new Error(json.warning || json.error || "Failed to dispatch bot");
            }

            setStatus("success");
            setMeetingUrl("");
            setNumBots(2);
            setTimeout(() => {
                setStatus("idle");
                window.location.reload();
            }, 2000);
        } catch (err) {
            console.error(err);
            setStatus("error");
            setErrorMessage(err instanceof Error ? err.message : "Failed to join meeting");
            setTimeout(() => setStatus("idle"), 4000);
        }
    }

    return (
        <div className="relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <div className="relative z-10 p-6 md:p-8">
                <div className="mb-8 flex items-start justify-between gap-4">
                    <div className="space-y-4 max-w-140">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
                                <Zap className="h-5 w-5 text-blue-400" />
                            </div>
                            <div className="space-y-1">
                                <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-blue-400">
                                    <Sparkles className="h-3 w-3" />
                                    Instant
                                </div>
                                <p className="text-xs font-semibold text-zinc-500">Bot Engine v2.0</p>
                            </div>
                        </div>

                        <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">
                            DEPLOY BOT <span className="text-blue-400">INSTANTLY</span>
                        </h2>
                        <p className="text-sm text-zinc-400">
                            Paste a meeting URL to dispatch an assistant.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 border-r border-white/10 pr-3">
                                <Link className="h-4 w-4 text-zinc-500" />
                            </div>
                            <input
                                required
                                type="url"
                                value={meetingUrl}
                                onChange={(e) => setMeetingUrl(e.target.value)}
                                disabled={status === "loading" || status === "success"}
                                className="w-full rounded-xl border border-white/10 bg-black/40 pl-14 pr-4 py-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/40 disabled:opacity-50"
                                placeholder="Meeting URL..."
                            />
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                            <select
                                value={service}
                                onChange={(e) => setService(e.target.value as "meetingbaas" | "livekit")}
                                disabled={status === "loading" || status === "success"}
                                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-xs text-white focus:outline-none"
                            >
                                <option value="meetingbaas">MeetingBaaS</option>
                                <option value="livekit">LiveKit</option>
                            </select>
                            <input
                                type="text"
                                value={botName}
                                onChange={(e) => setBotName(e.target.value)}
                                disabled={status === "loading" || status === "success"}
                                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-xs text-white focus:outline-none"
                                placeholder="Bot Name"
                            />
                            <select
                                value={recordingMode}
                                onChange={(e) => setRecordingMode(e.target.value as "speaker_view" | "gallery_view")}
                                disabled={status === "loading" || status === "success"}
                                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-xs text-white focus:outline-none"
                            >
                                <option value="speaker_view">Speaker View</option>
                                <option value="gallery_view">Gallery View</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={status === "loading" || status === "success" || !meetingUrl}
                        className={cn(
                            "w-full rounded-xl py-4 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2",
                            status === "success"
                                ? "bg-emerald-600 text-white"
                                : status === "error"
                                    ? "bg-red-600 text-white"
                                    : "bg-blue-600 text-white shadow-xl shadow-blue-500/20"
                        )}
                    >
                        {status === "loading" ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Deploying...
                            </>
                        ) : status === "success" ? (
                            <>
                                <CheckCircle2 size={16} />
                                Dispatched
                            </>
                        ) : status === "error" ? (
                            <>
                                <AlertCircle size={16} />
                                Error
                            </>
                        ) : (
                            <>
                                Join Session
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}