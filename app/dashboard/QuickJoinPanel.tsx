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
        <div className="relative h-full overflow-hidden rounded-[2.5rem] bg-white shadow-[0_20px_40px_rgba(25,27,35,0.04)]">
            <div className="relative z-10 p-10">
                <div className="mb-10 flex items-start justify-between gap-4">
                    <div className="space-y-5 max-w-140">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0058be10] text-[#0058be]">
                                <Zap className="h-6 w-6" strokeWidth={2.5} />
                            </div>
                            <div className="space-y-1.5">
                                <div className="inline-flex items-center gap-2 rounded-full bg-[#0058be10] px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#0058be]">
                                    <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
                                    Instant
                                </div>
                                <p className="text-xs font-bold text-[#424754]/40 uppercase tracking-widest">Bot Engine v3.0</p>
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold tracking-tight text-[#191b23]">
                            Deploy Assistant <span className="text-[#0058be]">Instantly</span>
                        </h2>
                        <p className="text-[#424754]/60 font-medium leading-relaxed">
                            Paste a meeting URL to dispatch an AI assistant. Captured automatically in high-definition.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="rounded-3xl bg-[#f2f3fd]/50 p-6 space-y-4">
                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2">
                                <Link className="h-4 w-4 text-[#424754]/40" strokeWidth={2.5} />
                            </div>
                            <input
                                required
                                type="url"
                                value={meetingUrl}
                                onChange={(e) => setMeetingUrl(e.target.value)}
                                disabled={status === "loading" || status === "success"}
                                className="w-full rounded-2xl bg-white border-none pl-14 pr-5 py-5 text-sm text-[#191b23] placeholder:text-[#424754]/40 focus:ring-2 focus:ring-[#0058be]/10 transition-all outline-none"
                                placeholder="Meeting URL..."
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <select
                                value={service}
                                onChange={(e) => setService(e.target.value as "meetingbaas" | "livekit")}
                                disabled={status === "loading" || status === "success"}
                                className="w-full rounded-2xl bg-white border-none px-5 py-4 text-xs font-bold text-[#191b23] focus:ring-2 focus:ring-[#0058be]/10 transition-all outline-none appearance-none"
                            >
                                <option value="meetingbaas">MeetingBaaS</option>
                                <option value="livekit">LiveKit</option>
                            </select>
                            <input
                                type="text"
                                value={botName}
                                onChange={(e) => setBotName(e.target.value)}
                                disabled={status === "loading" || status === "success"}
                                className="w-full rounded-2xl bg-white border-none px-5 py-4 text-xs font-bold text-[#191b23] placeholder:text-[#424754]/40 focus:ring-2 focus:ring-[#0058be]/10 transition-all outline-none"
                                placeholder="Bot Name"
                            />
                            <select
                                value={recordingMode}
                                onChange={(e) => setRecordingMode(e.target.value as "speaker_view" | "gallery_view")}
                                disabled={status === "loading" || status === "success"}
                                className="w-full rounded-2xl bg-white border-none px-5 py-4 text-xs font-bold text-[#191b23] focus:ring-2 focus:ring-[#0058be]/10 transition-all outline-none appearance-none"
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
                            "w-full rounded-2xl py-5 text-[11px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl",
                            status === "success"
                                ? "bg-emerald-600 text-white"
                                : status === "error"
                                    ? "bg-red-600 text-white"
                                    : "bg-linear-to-br from-[#0058be] to-[#2170e4] text-white shadow-[#0058be20]"
                        )}
                    >
                        {status === "loading" ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Deploying Neural Link...
                            </>
                        ) : status === "success" ? (
                            <>
                                <CheckCircle2 size={18} strokeWidth={2.5} />
                                Link Established
                            </>
                        ) : status === "error" ? (
                            <>
                                <AlertCircle size={18} strokeWidth={2.5} />
                                Deployment Failed
                            </>
                        ) : (
                            <>
                                Join Session
                                <ArrowRight size={18} strokeWidth={2.5} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}