"use client";

import { useState, useRef, useEffect } from "react";
import { Smile, Image as ImageIcon, ChevronRight, Bot, User, Search, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
    id: string;
    role: "assistant" | "user";
    text: string;
    time: string;
    citations?: { meeting: string; date: string }[];
};

export default function QuarentPage() {
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            text: "Hello! I am Quarent, your deep-search AI assistant. You can ask me questions spanning across all of your past transcribed meetings and I will synthesize an answer with citations.",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userText = input.trim();
        const newMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            text: userText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, newMsg]);
        setInput("");
        setIsTyping(true);

        try {
            const res = await fetch("/api/meetings/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    meetingId: "all",
                    question: userText,
                }),
            });
            const data = await res.json();
            
            if (data.success) {
                // Deduplicate and format citations nicely
                const uniqueCitations = data.sources?.reduce((acc: any[], source: any) => {
                    const title = source.meetingTitle || "Meeting Transcript";
                    if (!acc.find(c => c.meeting === title)) {
                        acc.push({ meeting: title, date: "Archive" });
                    }
                    return acc;
                }, []);

                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    text: data.answer,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    citations: uniqueCitations?.length > 0 ? uniqueCitations : undefined
                }]);
            } else {
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    text: "Sorry, I ran into an issue finding that information.",
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                text: "Sorry, I am currently offline.",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-72px)] w-full p-6 xl:p-8 max-w-[1400px] mx-auto">
            {/* Header Area */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1 flex items-center gap-2">
                        <Bot className="text-indigo-600 h-6 w-6" strokeWidth={2.5}/> 
                        Quarent AI Chat
                    </h1>
                    <p className="text-sm font-semibold text-slate-500">Deep-search your entire meeting repository via RAG.</p>
                </div>
                <div className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-indigo-100 flex items-center gap-1.5">
                    <Search size={14} strokeWidth={3} />
                    Connected to 437 Transcripts
                </div>
            </div>

            {/* Chat Interface */}
            <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col">
                
                {/* Messages Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar scroll-smooth">
                    {messages.map((msg) => (
                        <div key={msg.id} className={cn("flex w-full", msg.role === "user" ? "justify-end" : "justify-start")}>
                            <div className={cn("flex gap-4 max-w-[80%]", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                                {/* Avatar */}
                                <div className={cn(
                                    "shrink-0 h-10 w-10 rounded-full flex items-center justify-center mt-1 shadow-sm",
                                    msg.role === "user" ? "bg-indigo-100 text-indigo-600" : "bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-white"
                                )}>
                                    {msg.role === "user" ? <User size={20} strokeWidth={2.5} /> : <Bot size={20} strokeWidth={2.5}/>}
                                </div>
                                
                                {/* Bubble */}
                                <div className={cn(
                                    "flex flex-col",
                                    msg.role === "user" ? "items-end" : "items-start"
                                )}>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-[13px] font-bold text-slate-900">{msg.role === "user" ? "You" : "Quarent"}</span>
                                        <span className="text-[11px] font-semibold text-slate-400">{msg.time}</span>
                                    </div>
                                    <div className={cn(
                                        "px-5 py-4 rounded-[20px] shadow-sm text-[15px] leading-relaxed",
                                        msg.role === "user" 
                                            ? "bg-[#4F46E5] text-white rounded-tr-sm" 
                                            : "bg-[#F8FAFC] text-slate-700 rounded-tl-sm border border-slate-100"
                                    )}>
                                        {msg.text}
                                    </div>
                                    
                                    {/* Citations block */}
                                    {msg.citations && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {msg.citations.map((cite, i) => (
                                                <div key={i} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer transition">
                                                    <MapPin size={12} className="text-slate-400" />
                                                    {cite.meeting} <span className="text-slate-400 font-medium ml-1">({cite.date})</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex w-full justify-start">
                             <div className="flex gap-4 max-w-[80%] flex-row">
                                <div className="shrink-0 h-10 w-10 rounded-full flex items-center justify-center mt-1 shadow-sm bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-white">
                                    <Bot size={20} strokeWidth={2.5}/>
                                </div>
                                <div className="flex flex-col items-start">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-[13px] font-bold text-slate-900">Quarent</span>
                                    </div>
                                    <div className="bg-[#F8FAFC] border border-slate-100 rounded-[20px] rounded-tl-sm px-5 py-5 inline-flex items-center gap-1.5 shadow-sm">
                                        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                                        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.15s' }} />
                                        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
                                    </div>
                                </div>
                             </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white border-t border-slate-100">
                    <div className="max-w-4xl mx-auto flex items-center gap-3 w-full bg-[#f8f9fa] rounded-2xl border border-slate-200 px-4 py-3 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 transition-all shadow-sm">
                        <button className="text-slate-400 hover:text-slate-600 transition p-1">
                            <Smile size={22} strokeWidth={2.5} />
                        </button>
                        <input 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Ask Quarent anything about your meetings..."
                            className="bg-transparent border-none outline-none text-[15px] text-slate-900 flex-1 font-medium placeholder:text-slate-400"
                        />
                        <button className="text-slate-400 hover:text-slate-600 transition p-1">
                            <ImageIcon size={22} strokeWidth={2.5} />
                        </button>
                        <button 
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                            className="h-10 w-10 bg-[#4F46E5] hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-[#4F46E5] text-white rounded-full flex items-center justify-center transition shadow-md shrink-0 ml-1"
                        >
                            <ChevronRight size={20} strokeWidth={3} />
                        </button>
                    </div>
                    <p className="text-center text-[11px] font-medium text-slate-400 mt-3">Quarent uses Retrieval-Augmented Generation to scan your transcripts. Context windows may vary.</p>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>
        </div>
    );
}
