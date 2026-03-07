"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Message = {
    role: "user" | "bot";
    content: string;
};

type ApiStatus = "checking" | "ok" | "down";

const API_URL = ""; // Empty string for relative requests within Next.js

const QUICK_QA = [
    "What are the top action items?",
    "Who owns the next deliverable?",
    "Summarize the latest discussion in 3 bullets.",
];

const QUICK_SUGGEST = [
    "timeline risk",
    "budget concern",
    "pushback on scope",
];

function withTimeout(ms: number): AbortController {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), ms);
    return controller;
}

export default function Chat({ meetingId }: { meetingId: string }) {
    const [messages, setMessages] = useState<Message[]>([
        { role: "bot", content: "Hi! Ask me about this meeting or request a live reply suggestion." },
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
            setMessages((prev) => [...prev, { role: "bot", content: "I could not answer right now. Please retry." }]);
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
        setMessages((prev) => [...prev, { role: "user", content: `Need help answering: ${prompt}` }]);

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
            setMessages((prev) => [...prev, { role: "bot", content: "Suggestion failed right now. Please try again." }]);
        } finally {
            setLoading(null);
        }
    }

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        void askQuestion(input);
    }

    return (
        <div className="bg-[#161618] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 mt-6 flex flex-col h-[520px]">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold">Meeting Assistant</h2>
                <span
                    className={`text-[11px] px-2 py-1 rounded-full border ${apiStatus === "ok"
                            ? "text-emerald-300 border-emerald-500/30 bg-emerald-500/10"
                            : apiStatus === "down"
                                ? "text-rose-300 border-rose-500/30 bg-rose-500/10"
                                : "text-amber-300 border-amber-500/30 bg-amber-500/10"
                        }`}
                >
                    {apiStatus === "ok" ? "API OK" : apiStatus === "down" ? "API Unreachable" : "Checking API"}
                </span>
            </div>

            {error ? (
                <div className="mb-3 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                    {error}
                </div>
            ) : null}

            <div className="flex flex-wrap gap-2 mb-3">
                {QUICK_QA.map((q) => (
                    <button
                        key={q}
                        type="button"
                        disabled={busy}
                        onClick={() => setInput(q)}
                        className="text-[11px] px-2.5 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-50"
                    >
                        {q}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2 mb-4 scrollbar-thin">
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={`max-w-[88%] p-3 text-sm leading-relaxed rounded-xl ${m.role === "user"
                                ? "self-end bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)] text-white rounded-br-sm"
                                : "self-start bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)] text-white rounded-bl-sm"
                            }`}
                    >
                        {m.content}
                    </div>
                ))}
                {busy && (
                    <div className="self-start text-xs text-gray-400 italic mt-1 ml-1 opacity-80 animate-pulse">
                        {loading === "suggest" ? "Preparing suggestion..." : "Thinking..."}
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            <div className="flex flex-wrap gap-2 mb-2.5">
                {QUICK_SUGGEST.map((s) => (
                    <button
                        key={s}
                        type="button"
                        disabled={busy}
                        onClick={() => setSuggestionPrompt(`Need help answering ${s}`)}
                        className="text-[11px] px-2.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/15 disabled:opacity-50"
                    >
                        {s}
                    </button>
                ))}
            </div>

            <div className="flex gap-2.5 mb-2.5">
                <input
                    type="text"
                    value={suggestionPrompt}
                    onChange={(e) => setSuggestionPrompt(e.target.value)}
                    placeholder="Need help answering timeline or budget objection"
                    disabled={busy}
                    className="flex-1 px-3.5 py-2.5 bg-[#1e1e21] border border-[rgba(255,255,255,0.06)] rounded-xl text-white text-sm focus:outline-none focus:border-[#00d4ff] focus:ring-2 focus:ring-[rgba(0,212,255,0.1)] transition-colors disabled:opacity-50"
                />
                <button
                    type="button"
                    onClick={() => void suggestReply(suggestionPrompt)}
                    disabled={!canSuggest}
                    className="px-4 py-2.5 bg-[#5eead4] border-none rounded-xl text-black font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading === "suggest" ? "Thinking..." : "Suggest Reply"}
                </button>
            </div>

            <form onSubmit={onSubmit} className="flex gap-2.5">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a meeting question..."
                    disabled={busy}
                    className="flex-1 px-3.5 py-2.5 bg-[#1e1e21] border border-[rgba(255,255,255,0.06)] rounded-xl text-white text-sm focus:outline-none focus:border-[#00d4ff] focus:ring-2 focus:ring-[rgba(0,212,255,0.1)] transition-colors disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={!canSend}
                    className="flex items-center justify-center px-4 bg-gradient-to-br from-[#00d4ff] to-[#8b5cf6] border-none rounded-xl text-black font-semibold text-sm cursor-pointer transition-transform hover:scale-105 hover:shadow-[0_0_20px_rgba(0,212,255,0.2)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                >
                    Send
                </button>
            </form>
        </div>
    );
}
