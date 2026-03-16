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
            // Optional: Refresh dashboard or redirect
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
        <div className="relative h-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md group/panel">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-cyan-100/60 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-100/60 blur-3xl" />
            </div>

            <div className="relative z-10 p-6 md:p-8 lg:p-10">
                <div className="mb-8 flex items-start justify-between gap-4">
                    <div className="space-y-4 max-w-140">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50">
                                <Zap className="h-5 w-5 text-cyan-700" />
                            </div>
                            <div className="space-y-1">
                                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-800">
                                    <Sparkles className="h-3 w-3" />
                                    Instant Deployment
                                </div>
                                <p className="text-xs font-semibold text-slate-500">AI Bot Engine v2.0</p>
                            </div>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                            Deploy a bot instantly
                        </h2>
                        <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                            Paste a meeting URL to dispatch an assistant. Recording and transcription are handled automatically.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 md:p-4">
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 border-r border-slate-200 pr-3">
                                <Link className="h-4 w-4 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                            </div>
                            <input
                                required
                                type="url"
                                value={meetingUrl}
                                onChange={(e) => setMeetingUrl(e.target.value)}
                                disabled={status === "loading" || status === "success"}
                                className="w-full rounded-xl border border-white bg-white pl-14 pr-4 py-4 text-sm text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50"
                                placeholder="meet.google.com/xxx-xxxx-xxx"
                            />
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
                            <select
                                value={service}
                                onChange={(e) => setService(e.target.value as "meetingbaas" | "livekit")}
                                disabled={status === "loading" || status === "success"}
                                className="w-full rounded-xl border border-white bg-white px-4 py-3 text-xs text-slate-900 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50"
                            >
                                <option value="meetingbaas">Service: MeetingBaaS</option>
                                <option value="livekit">Service: LiveKit</option>
                            </select>
                            <input
                                type="text"
                                value={botName}
                                onChange={(e) => setBotName(e.target.value)}
                                disabled={status === "loading" || status === "success"}
                                className="w-full rounded-xl border border-white bg-white px-4 py-3 text-xs text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50"
                                placeholder="Bot display name"
                            />
                            <select
                                value={recordingMode}
                                onChange={(e) => setRecordingMode(e.target.value as "speaker_view" | "gallery_view")}
                                disabled={status === "loading" || status === "success"}
                                className="w-full rounded-xl border border-white bg-white px-4 py-3 text-xs text-slate-900 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50"
                            >
                                <option value="speaker_view">Speaker View (free-trial default)</option>
                                <option value="gallery_view">Gallery View (advanced)</option>
                            </select>
                            <select
                                value={speechToTextProvider}
                                onChange={(e) => setSpeechToTextProvider(e.target.value)}
                                disabled={status === "loading" || status === "success" || service === "livekit"}
                                className="w-full rounded-xl border border-white bg-white px-4 py-3 text-xs text-slate-900 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50"
                            >
                                <option value="Default">STT: Default (free-trial)</option>
                                <option value="AssemblyAI">STT: AssemblyAI</option>
                                <option value="Deepgram">STT: Deepgram</option>
                            </select>
                            {service === "livekit" ? (
                                <select
                                    value={numBots}
                                    onChange={(e) => setNumBots(Number(e.target.value))}
                                    disabled={status === "loading" || status === "success"}
                                    className="w-full rounded-xl border border-white bg-white px-4 py-3 text-xs text-slate-900 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50"
                                >
                                    <option value={2}>Bots: 2</option>
                                    <option value={3}>Bots: 3</option>
                                    <option value={4}>Bots: 4</option>
                                    <option value={5}>Bots: 5</option>
                                </select>
                            ) : (
                                <div className="w-full rounded-xl border border-dashed border-slate-200 bg-white px-4 py-3 text-xs text-slate-400 flex items-center">
                                    Multi-bot available with LiveKit
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={status === "loading" || status === "success" || !meetingUrl}
                        className={cn(
                            "w-full rounded-xl py-4 text-sm font-semibold transition-all active:scale-[0.99] flex items-center justify-center gap-2",
                            status === "success"
                                ? "bg-emerald-500 text-white"
                                : status === "error"
                                    ? "bg-red-500 text-white"
                                    : "bg-linear-to-r from-cyan-600 to-blue-700 text-white hover:from-cyan-500 hover:to-blue-600"
                        )}
                    >
                        {status === "loading" ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Deploying Bot...
                            </>
                        ) : status === "success" ? (
                            <>
                                <CheckCircle2 size={16} />
                                Bot Dispatched!
                            </>
                        ) : status === "error" ? (
                            <>
                                <AlertCircle size={16} />
                                {errorMessage || "Failed to Join"}
                            </>
                        ) : (
                            <>
                                Join Meeting
                                <ArrowRight size={16} className="transition-transform group-hover/panel:translate-x-1" />
                            </>
                        )}
                    </button>

                    <div className="pt-2">
                        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Enterprise Ready Integrations
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {["Google Meet", "Zoom", "MS Teams", "Webex"].map((platform) => (
                                <span
                                    key={platform}
                                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700"
                                >
                                    {platform}
                                </span>
                            ))}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}