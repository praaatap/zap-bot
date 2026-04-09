"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bot, Loader2, RefreshCw, Send, Terminal, User, X } from "lucide-react";

type Role = "user" | "assistant";
type Backend = "python" | "node" | "unknown";
type Mode = "auto" | "python" | "node";

type Message = {
    id: string;
    role: Role;
    content: string;
};

type AgentHealth = {
    node: string;
    pythonAgent: string;
    mode: string;
    pythonUrl: string;
};

const QUICK_PROMPTS = [
    "Summarize my latest two meetings and key decisions.",
    "What action items are still open from recent calls?",
    "Draft a follow-up message for stakeholders after today's meeting.",
    "What should I ask next if timeline risk comes up?",
];

export default function AgentPage() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content:
                "I am Zap Bot. Ask about meeting decisions, action items, follow-ups, or live response strategy.",
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [backend, setBackend] = useState<Backend>("unknown");
    const [mode, setMode] = useState<Mode>("auto");
    const [health, setHealth] = useState<AgentHealth | null>(null);
    const [healthError, setHealthError] = useState<string>("");
    const [requestError, setRequestError] = useState<string>("");

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    useEffect(() => {
        void refreshHealth();
    }, []);

    const canSend = useMemo(() => input.trim().length > 0 && !isLoading, [input, isLoading]);

    async function refreshHealth() {
        setHealthError("");
        try {
            const res = await fetch(`${apiUrl}/api/agent/health`);
            const json = await res.json();
            if (!res.ok || !json?.success) throw new Error(json?.error || "Health check failed");
            setHealth(json.data as AgentHealth);
            setBackend(json.data?.pythonAgent === "ok" ? "python" : "node");
        } catch (err) {
            setHealth(null);
            setHealthError(err instanceof Error ? err.message : "Health check failed");
        }
    }

    async function sendMessage(raw: string) {
        const text = raw.trim();
        if (!text || isLoading) return;

        const userMsg: Message = { id: `${Date.now()}-u`, role: "user", content: text };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);
        setRequestError("");

        try {
            const res = await fetch(`${apiUrl}/api/agent/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: text,
                    history: messages.map((m) => ({ role: m.role, content: m.content })),
                    mode,
                }),
            });

            const json = await res.json();
            if (!res.ok || !json?.success) {
                throw new Error(json?.error || "Agent request failed");
            }

            setBackend((json.backend as Backend) || "unknown");
            setMessages((prev) => [
                ...prev,
                {
                    id: `${Date.now()}-a`,
                    role: "assistant",
                    content: json.response || "No response",
                },
            ]);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Agent request failed";
            setRequestError(msg);
            setMessages((prev) => [
                ...prev,
                {
                    id: `${Date.now()}-e`,
                    role: "assistant",
                    content:
                        "I could not complete that request. Check API server and Python agent status, then retry.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        void sendMessage(input);
    }

    return (
        <div className="flex h-screen bg-[#050510] text-gray-100 overflow-hidden">
            <div className="relative z-10 flex flex-col w-full max-w-6xl mx-auto h-full px-4 py-6">
                <header className="flex items-center justify-between px-6 py-4 mb-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 hover:bg-white/10 rounded-lg transition-colors group">
                            <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                        </Link>
                        <div className="h-6 w-px bg-white/10" />
                        <div>
                            <h1 className="text-lg font-semibold">Zap Intelligence Core</h1>
                            <p className="text-xs text-gray-400 font-mono">Unified Node + Python Agent Bridge</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => void refreshHealth()}
                            className="px-3 py-1.5 rounded-lg text-xs bg-black/40 border border-white/10 text-gray-300 inline-flex items-center gap-2"
                            type="button"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Refresh Health
                        </button>
                        <div className="px-3 py-1.5 rounded-lg text-xs bg-black/40 border border-white/10 text-gray-300 inline-flex items-center gap-2">
                            <Terminal className="w-3.5 h-3.5 text-cyan-500" />
                            backend: {backend}
                        </div>
                    </div>
                </header>

                <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2 p-3 rounded-xl border border-white/10 bg-white/5 text-xs text-gray-300">
                        {health ? (
                            <div className="flex flex-wrap items-center gap-3">
                                <span>node: {health.node}</span>
                                <span>python: {health.pythonAgent}</span>
                                <span>mode(default): {health.mode}</span>
                                <span className="truncate">pythonUrl: {health.pythonUrl}</span>
                            </div>
                        ) : (
                            <span className="text-amber-300">health unavailable{healthError ? `: ${healthError}` : ""}</span>
                        )}
                    </div>

                    <div className="p-3 rounded-xl border border-white/10 bg-white/5">
                        <label className="text-xs text-gray-400 block mb-1">Request Mode</label>
                        <select
                            className="w-full bg-[#10131c] border border-white/10 rounded-lg px-3 py-2 text-sm"
                            value={mode}
                            onChange={(e) => setMode(e.target.value as Mode)}
                            disabled={isLoading}
                        >
                            <option value="auto">auto (recommended)</option>
                            <option value="python">python only</option>
                            <option value="node">node only</option>
                        </select>
                    </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                    {QUICK_PROMPTS.map((prompt) => (
                        <button
                            key={prompt}
                            type="button"
                            disabled={isLoading}
                            onClick={() => {
                                setInput(prompt);
                            }}
                            className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-50"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>

                <main className="flex-1 flex flex-col bg-black/40 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`flex max-w-[88%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} gap-3 items-start`}>
                                    <div className={`flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full border ${msg.role === "user" ? "bg-white/10 border-white/20" : "bg-cyan-500/10 border-cyan-500/30"}`}>
                                        {msg.role === "user" ? <User className="w-4 h-4 text-gray-300" /> : <Bot className="w-4 h-4 text-cyan-400" />}
                                    </div>
                                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user" ? "bg-gray-800 border border-gray-700 rounded-tr-sm" : "bg-white/5 border border-white/10 rounded-tl-sm"}`}>
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isLoading ? (
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Thinking...
                            </div>
                        ) : null}

                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 bg-black/60 border-t border-white/10">
                        {requestError ? (
                            <div className="mb-2 text-xs text-rose-300">{requestError}</div>
                        ) : null}

                        <form onSubmit={handleSubmit} className="relative flex items-center max-w-5xl mx-auto">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isLoading}
                                placeholder="Ask about meetings, decisions, follow-ups, or suggested replies..."
                                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 focus:border-cyan-500/50 rounded-2xl py-3.5 pl-5 pr-14 text-gray-100 placeholder:text-gray-500 focus:outline-none transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!canSend}
                                className="absolute right-2 p-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-xl transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}
