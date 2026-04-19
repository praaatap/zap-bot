"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { MessageSquare, Clock, ChevronDown, Sparkles, Zap } from "lucide-react";
import ChatInput from "./components/ChatInput";
import ChatMessages, { ChatMessage } from "./components/ChatMessages";
import ChatSuggestions from "./components/ChatSuggestions";

const DEFAULT_SUGGESTIONS = [
  "What were the key action items from all meetings this week?",
  "Summarize the recent discussions around the new Q3 roadmap.",
  "Did we decide on a vendor for the cloud migration?",
  "Who was assigned to the marketing campaign launch?"
];

type Workspace = { id: string; name: string; icon: string };

const WORKSPACES: Workspace[] = [
  { id: "all",       name: "All Workspaces",    icon: "🌐" },
  { id: "dashboard", name: "Dashboard Project",  icon: "☁️" },
  { id: "client",    name: "Client Project",     icon: "🔥" },
  { id: "sports",    name: "Sports Project",     icon: "🏀" },
  { id: "travel",    name: "Travel App Project", icon: "💎" },
];

export default function DashboardChatPage() {
  const [messages, setMessages]                     = useState<ChatMessage[]>([]);
  const [input, setInput]                           = useState("");
  const [isLoading, setIsLoading]                   = useState(false);
  const [selectedWorkspace, setSelectedWorkspace]   = useState<Workspace>(WORKSPACES[0]);
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const nextMessageIdRef = useRef(1);
  const dropdownRef      = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowWorkspaceDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSendMessage = useCallback(async (text?: string) => {
    const outgoingText = (text ?? input).trim();
    if (!outgoingText || isLoading) return;

    const userMsg: ChatMessage = {
      id: String(nextMessageIdRef.current++),
      content: outgoingText,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat/all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: outgoingText, workspace: selectedWorkspace.id }),
      });
      if (!response.ok) throw new Error("Chat request failed");
      const data = await response.json();

      setMessages(prev => [...prev, {
        id: String(nextMessageIdRef.current++),
        content: data.answer || "I couldn't process that request. Please try again.",
        isBot: true,
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: String(nextMessageIdRef.current++),
        content: "Sorry, I encountered an error. Please check your connection and try again.",
        isBot: true,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, selectedWorkspace.id]);

  const handleInputChange    = useCallback((v: string) => setInput(v), []);
  const handleSuggestionClick = useCallback((s: string) => { void handleSendMessage(s); }, [handleSendMessage]);
  const handleSendFromInput  = useCallback(() => { void handleSendMessage(); }, [handleSendMessage]);
  const toggleDropdown       = useCallback(() => setShowWorkspaceDropdown(p => !p), []);

  const handleWorkspaceSelect = useCallback((ws: Workspace) => {
    setSelectedWorkspace(ws);
    setShowWorkspaceDropdown(false);
  }, []);

  const workspaceDropdown = useMemo(() => (
    <div className="absolute right-0 mt-2 w-60 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-2xl shadow-sky-100/40 py-2 z-50 overflow-hidden">
      <div className="px-4 py-2 mb-1 border-b border-slate-100/80">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Switch Workspace</p>
      </div>
      {WORKSPACES.map(ws => (
        <button
          key={ws.id}
          onClick={() => handleWorkspaceSelect(ws)}
          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150 ${
            selectedWorkspace.id === ws.id
              ? "bg-gradient-to-r from-sky-50 to-indigo-50 text-sky-700"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <span className="text-base">{ws.icon}</span>
          <span className="font-medium flex-1 text-left">{ws.name}</span>
          {selectedWorkspace.id === ws.id && <Sparkles className="w-3.5 h-3.5 text-sky-500" />}
        </button>
      ))}
    </div>
  ), [selectedWorkspace.id, handleWorkspaceSelect]);

  return (
    <div className="relative flex flex-col h-[calc(100vh-64px)] text-slate-900 font-sans overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-sky-50/40 to-indigo-50/60 -z-10" />
      <div className="absolute top-[-80px] right-[-80px] w-[340px] h-[340px] rounded-full bg-sky-200/25 blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-[-60px] left-[-60px] w-[280px] h-[280px] rounded-full bg-indigo-200/20 blur-3xl -z-10" />

      {/* Header */}
      <header className="px-6 py-4 border-b border-white/60 bg-white/70 backdrop-blur-xl shrink-0 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">

          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 shadow-lg shadow-sky-200/60">
              <MessageSquare className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-[17px] font-extrabold leading-none tracking-tight">
                Intelligence{" "}
                <span className="bg-gradient-to-r from-sky-500 to-indigo-500 bg-clip-text text-transparent">
                  Hub
                </span>
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <span className="text-[11px] font-semibold text-slate-400">AI Online</span>
                <span className="text-[11px] text-slate-300">•</span>
                <span className="text-[11px] font-semibold text-slate-400">48 Sessions Indexed</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">

            {/* Workspace selector */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                  showWorkspaceDropdown
                    ? "bg-sky-50 border-sky-300 text-sky-700 shadow-inner"
                    : "bg-white/80 border-slate-200 text-slate-600 hover:border-sky-200 hover:text-sky-600 hover:shadow-md hover:shadow-sky-50/50"
                }`}
              >
                <span className="text-base leading-none">{selectedWorkspace.icon}</span>
                <span className="max-w-[120px] truncate">{selectedWorkspace.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  showWorkspaceDropdown ? "rotate-180 text-sky-500" : "text-slate-400"
                }`} />
              </button>
              {showWorkspaceDropdown && workspaceDropdown}
            </div>

            {/* History */}
            <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/80 border border-slate-200 text-sm font-semibold text-slate-600 hover:border-indigo-200 hover:text-indigo-600 hover:shadow-md hover:shadow-indigo-50/50 transition-all duration-200">
              <Clock className="w-3.5 h-3.5" />
              <span>History</span>
            </button>

            {/* Pro badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-bold text-amber-600">Pro</span>
            </div>

          </div>
        </div>
      </header>

      {/* Chat area */}
      <main className="flex-1 overflow-y-auto scroll-smooth">
        <div className="max-w-3xl mx-auto h-full px-4 py-6 md:px-6">
          {messages.length === 0 ? (
            <ChatSuggestions
              suggestions={DEFAULT_SUGGESTIONS}       // ← was missing!
              onSuggestionClick={handleSuggestionClick}
              workspace={selectedWorkspace}
            />
          ) : (
            <ChatMessages messages={messages} isLoading={isLoading} />
          )}
        </div>
      </main>

      {/* Input */}
      <div className="shrink-0 px-4 pb-5 pt-3 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/80 backdrop-blur-xl border border-white/70 rounded-2xl shadow-xl shadow-slate-200/50 ring-1 ring-inset ring-slate-100/50">
            <ChatInput
              chatInput={input}
              onInputChange={handleInputChange}
              onSendMessage={handleSendFromInput}
              isLoading={isLoading}
              workspace={selectedWorkspace}
            />
          </div>
          <p className="text-center text-[11px] text-slate-400 mt-2.5 font-medium">
            Intelligence Hub can make mistakes. Verify important info.
          </p>
        </div>
      </div>

    </div>
  );
}