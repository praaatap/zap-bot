'use client';
import { useState } from "react";
import { cn } from "../../lib/utils";
import { Plus, Search, Video, ArrowRight, Zap, Link, Globe, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function QuickJoinPanel() {
    const [meetingUrl, setMeetingUrl] = useState("");
    const [botName, setBotName] = useState("Zap Bot");
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
            const normalizedMeetingUrl = /^https?:\/\//i.test(meetingUrl.trim())
                ? meetingUrl.trim()
                : `https://${meetingUrl.trim()}`;

            const res = await fetch("/api/bot/dispatch", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    meetingUrl: normalizedMeetingUrl,
                    title: "Quick Join Meeting",
                    startTime: new Date().toISOString(),
                    botName,
                    recordingMode,
                    speechToTextProvider,
                }),
            });

            const json = await res.json();

            if (!res.ok || !json.success || json?.data?.botDispatched === false) {
                throw new Error(json.warning || json.error || "Failed to dispatch bot");
            }

            setStatus("success");
            setMeetingUrl("");
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
        <div className="relative p-8 lg:p-10 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden hover:border-slate-300 transition-all h-full flex flex-col justify-center group/panel">

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-12">
                <div className="space-y-4 max-w-[320px]">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center transition-transform group-hover/panel:scale-105">
                            <Zap className="w-5 h-5 text-blue-600 fill-blue-600/20" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em]">Instant Deployment</span>
                            <span className="text-xs text-slate-500 font-bold tracking-tight">AI Bot Engine v2.0</span>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                        Deploy a bot instantly
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                        Paste a meeting URL to dispatch an assistant. We'll handle the recording and transcription.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 w-full max-w-lg space-y-4">
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-2 border-r border-slate-200">
                            <Link className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            required
                            type="url"
                            value={meetingUrl}
                            onChange={(e) => setMeetingUrl(e.target.value)}
                            disabled={status === "loading" || status === "success"}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-14 pr-4 py-4 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-400 font-medium disabled:opacity-50"
                            placeholder="meet.google.com/xxx-xxxx-xxx"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                            type="text"
                            value={botName}
                            onChange={(e) => setBotName(e.target.value)}
                            disabled={status === "loading" || status === "success"}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-400 font-medium disabled:opacity-50"
                            placeholder="Bot display name"
                        />
                        <select
                            value={recordingMode}
                            onChange={(e) => setRecordingMode(e.target.value as "speaker_view" | "gallery_view")}
                            disabled={status === "loading" || status === "success"}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium disabled:opacity-50"
                        >
                            <option value="speaker_view">Speaker View (free-trial default)</option>
                            <option value="gallery_view">Gallery View (advanced)</option>
                        </select>
                        <select
                            value={speechToTextProvider}
                            onChange={(e) => setSpeechToTextProvider(e.target.value)}
                            disabled={status === "loading" || status === "success"}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium disabled:opacity-50"
                        >
                            <option value="Default">STT: Default (free-trial)</option>
                            <option value="AssemblyAI">STT: AssemblyAI</option>
                            <option value="Deepgram">STT: Deepgram</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={status === "loading" || status === "success" || !meetingUrl}
                        className={cn(
                            "w-full py-4 font-bold rounded-xl transition-all shadow-sm active:scale-[0.98] text-sm flex items-center justify-center gap-2 group",
                            status === "success"
                                ? "bg-emerald-500 text-white"
                                : status === "error"
                                    ? "bg-red-500 text-white"
                                    : "bg-slate-900 hover:bg-slate-800 text-white"
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
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <div className="flex flex-col items-center gap-3">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
                            Enterprise Ready Integrations
                        </p>
                        <div className="flex items-center gap-5 opacity-40 grayscale group-hover/panel:opacity-70 group-hover/panel:grayscale-0 transition-all duration-500">
                            {['Google Meet', 'Zoom', 'MS Teams', 'Webex'].map((p) => (
                                <span key={p} className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter border-b border-slate-200 pb-0.5">{p}</span>
                            ))}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}