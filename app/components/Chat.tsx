"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MessageSquare, Sparkles, Send, Activity, Info, Zap, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
    role: "user" | "bot";
    content: string;
};

type ApiStatus = "checking" | "ok" | "down";

const API_URL = ""; // Empty string for relative requests within Next.js

const QUICK_QA = [
    "Identify action items",
    "Summarize decisions",
    "Synthesize risks",
];

const QUICK_SUGGEST = [
    "Timeline objection",
    "Budget constraint",
    "Scope expansion",
];

function withTimeout(ms: number): AbortController {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), ms);
    return controller;
}

export default function Chat({ meetingId }: { meetingId: string }) {
    const [messages, setMessages] = useState<Message[]>([
        { role: "bot", content: "Meeting intelligence is ready. How can I assist you with this session?" },
    ]);
    const [input, setInput] = useState("");
    const [suggestionPrompt, setSuggestionPrompt] = useState("");
    const [loading, setLoading] = useState<null | "ask" | "suggest">(null);
    const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");
    const [error, setError] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    useEffect(() => {
        let mounted = true;
        async function checkHealth() {
            try {
                const controller = withTimeout(5000);
                const res = await fetch(`${API_URL}/api/health`, { signal: controller.signal });
                if (!mounted) return;
                setApiStatus(res.ok ? "ok" : "down");
            } catch {
                if (mounted) setApiStatus("down");
            }
        }
        void checkHealth();
        return () => {
            mounted = false;
        };
    }, []);

    const busy = loading !== null;
    const canSend = useMemo(() => input.trim().length > 0 && !busy, [input, busy]);
    const canSuggest = useMemo(() => suggestionPrompt.trim().length > 0 && !busy, [suggestionPrompt, busy]);

    async function askQuestion(text: string) {
        const userMsg = text.trim();
        if (!userMsg || busy) return;

        setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
        setInput("");
        setLoading("ask");
        setError("");

        try {
            const controller = withTimeout(15000);
            const res = await fetch(`${API_URL}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ meetingId, query: userMsg }),
                signal: controller.signal,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Chat API error");

            setMessages((prev) => [...prev, { role: "bot", content: data.answer || "No response." }]);
            setApiStatus("ok");
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Request failed";
            setError(msg);
            setApiStatus("down");
            setMessages((prev) => [...prev, { role: "bot", content: "Intelligence sync failed. Please re-attempt." }]);
        } finally {
            setLoading(null);
        }
    }

    async function suggestReply(rawPrompt: string) {
        const prompt = rawPrompt.trim();
        if (!prompt || busy) return;

        setSuggestionPrompt("");
        setLoading("suggest");
        setError("");
        setMessages((prev) => [...prev, { role: "user", content: `Suggest response for: ${prompt}` }]);

        try {
            const controller = withTimeout(15000);
            const res = await fetch(`${API_URL}/api/chat/suggest`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ meetingId, prompt }),
                signal: controller.signal,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Suggestion API error");

            setMessages((prev) => [...prev, { role: "bot", content: data.suggestion || "No suggestion available." }]);
            setApiStatus("ok");
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Suggestion request failed";
            setError(msg);
            setApiStatus("down");
            setMessages((prev) => [...prev, { role: "bot", content: "Suggestion generation failed. Try again." }]);
        } finally {
            setLoading(null);
        }
    }

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        void askQuestion(input);
    }

    return (
        <div className="pro-card p-6 flex flex-col h-[600px] mt-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full -ml-16 -mt-16" />

            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5">
                        <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-sm font-bold text-white uppercase italic tracking-widest">Meeting Intelligence</h2>
                </div>

                <div className={cn(
                    "flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-widest transition-all",
                    apiStatus === "ok" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        apiStatus === "down" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                            "bg-amber-500/10 text-amber-500 border-amber-500/20"
                )}>
                    <Activity className={cn("w-2.5 h-2.5", apiStatus === "checking" && "animate-pulse")} />
                    {apiStatus === "ok" ? "Live" : apiStatus === "down" ? "Offline" : "Checking"}
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-bold uppercase tracking-widest italic flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" />
                    {error}
                </div>
            )}

            <div className="flex-1 overflow-y-auto flex flex-col gap-4 mb-6 pr-2 custom-scrollbar">
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={cn(
                            "max-w-[85%] p-4 text-sm font-medium leading-relaxed rounded-2xl relative group/msg",
                            m.role === "user"
                                ? "self-end bg-white text-black rounded-tr-none shadow-xl"
                                : "self-start bg-zinc-900 border border-white/5 text-zinc-300 rounded-tl-none"
                        )}
                    >
                        {m.content}
                        <div className={cn(
                            "absolute top-0 text-[8px] font-bold uppercase tracking-widest text-zinc-600 opacity-0 group-hover/msg:opacity-100 transition-opacity whitespace-nowrap",
                            m.role === "user" ? "-top-5 right-0" : "-top-5 left-0"
                        )}>
                            {m.role === "user" ? "You" : "Meteor Intelligence"}
                        </div>
                    </div>
                ))}
                {busy && (
                    <div className="self-start flex items-center gap-3 p-4 bg-zinc-900 border border-white/5 rounded-2xl animate-pulse">
                        <div className="flex gap-1.5">
                            <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 italic">Distilling...</span>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            <div className="flex flex-col gap-4 pt-4 border-t border-white/5">
                <div className="flex flex-wrap gap-2">
                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest italic w-full mb-1">Suggested Inquiries</span>
                    {QUICK_QA.map((q) => (
                        <button
                            key={q}
                            disabled={busy}
                            onClick={() => askQuestion(q)}
                            className="text-[10px] px-3 py-1.5 rounded-lg border border-white/5 bg-zinc-900 text-zinc-400 font-bold hover:text-white hover:border-white/20 transition-all uppercase tracking-tighter italic"
                        >
                            {q}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={suggestionPrompt}
                            onChange={(e) => setSuggestionPrompt(e.target.value)}
                            placeholder="Objection context (e.g. Budget)..."
                            disabled={busy}
                            className="flex-1 px-4 py-3 bg-zinc-900 border border-white/5 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-zinc-700 uppercase italic tracking-widest"
                        />
                        <button
                            onClick={() => void suggestReply(suggestionPrompt)}
                            disabled={!canSuggest}
                            className="px-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-[10px] rounded-xl uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            <Zap className="w-3 h-3 fill-current" />
                            Suggest
                        </button>
                    </div>

                    <form onSubmit={onSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Sync with meeting context..."
                            disabled={busy}
                            className="flex-1 px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-white/30 transition-all placeholder:text-zinc-600"
                        />
                        <button
                            type="submit"
                            disabled={!canSend}
                            className="px-6 bg-white hover:bg-zinc-200 text-black font-bold text-[10px] rounded-xl uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-2xl active:scale-95"
                        >
                            <Send className="w-3.5 h-3.5" />
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
