"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { MessageSquare, Clock, ChevronDown, Sparkles } from "lucide-react";
import ChatInput from "./components/ChatInput";
import ChatMessages, { ChatMessage } from "./components/ChatMessages";
import ChatSuggestions from "./components/ChatSuggestions";

// Rule: js-hoist-regexp - Hoist static data outside component
const DEFAULT_SUGGESTIONS = [
  "What were the key action items from all meetings this week?",
  "Summarize the recent discussions around the new Q3 roadmap.",
  "Did we decide on a vendor for the cloud migration?",
  "Who was assigned to the marketing campaign launch?"
];

type Workspace = {
  id: string;
  name: string;
  icon: string;
};

// Rule: js-hoist-regexp - Hoist static constants
const WORKSPACES: Workspace[] = [
  { id: "all", name: "All Workspaces", icon: "🌐" },
  { id: "dashboard", name: "Dashboard Project", icon: "☁️" },
  { id: "client", name: "Client Project", icon: "🔥" },
  { id: "sports", name: "Sports Project", icon: "🏀" },
  { id: "travel", name: "Travel App Project", icon: "💎" },
];

export default function DashboardChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace>(WORKSPACES[0]);
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const nextMessageIdRef = useRef(1);

  // Rule: rerender-dependencies - Use primitive dependency (selectedWorkspace.id) instead of object
  const handleSendMessage = useCallback(async (text?: string) => {
    const outgoingText = (text ?? input).trim();
    if (!outgoingText || isLoading) return;

    const userMsg: ChatMessage = {
      id: String(nextMessageIdRef.current++),
      content: outgoingText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat/all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: outgoingText, workspace: selectedWorkspace.id })
      });

      if (!response.ok) throw new Error("Chat request failed");

      const data = await response.json();

      const botMsg: ChatMessage = {
        id: String(nextMessageIdRef.current++),
        content: data.answer || "I couldn't process that request. Please try again.",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: String(nextMessageIdRef.current++),
        content: "Sorry, I encountered an error. Please check your connection and try again.",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, selectedWorkspace.id]);

  // Rule: rerender-functional-setstate - Use functional setState for stable callbacks
  const handleInputChange = useCallback((value: string) => setInput(value), []);
  const handleSuggestionClick = useCallback((suggestion: string) => { void handleSendMessage(suggestion); }, [handleSendMessage]);
  const handleSendFromInput = useCallback(() => { void handleSendMessage(); }, [handleSendMessage]);

  // Rule: rerender-functional-setstate - Functional setState
  const toggleWorkspaceDropdown = useCallback(() => {
    setShowWorkspaceDropdown(prev => !prev);
  }, []);

  const handleWorkspaceSelect = useCallback((workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setShowWorkspaceDropdown(false);
  }, []);

  // Rule: rerender-memo - Memoize expensive dropdown rendering
  const workspaceDropdown = useMemo(() => (
    <div className="absolute right-0 mt-2 w-56 bg-white border border-[#e6e8ee] rounded-lg shadow-lg py-1 z-50">
      {WORKSPACES.map((workspace) => (
        <button
          key={workspace.id}
          onClick={() => handleWorkspaceSelect(workspace)}
          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${
            selectedWorkspace.id === workspace.id ? "bg-sky-50 text-sky-700" : "text-[#374151]"
          }`}
        >
          <span>{workspace.icon}</span>
          <span className="font-medium">{workspace.name}</span>
          {selectedWorkspace.id === workspace.id && (
            <Sparkles className="w-4 h-4 text-sky-600 ml-auto" />
          )}
        </button>
      ))}
    </div>
  ), [selectedWorkspace.id, handleWorkspaceSelect]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#f7f8fb] text-slate-900 font-sans">
      {/* Header */}
      <header className="px-8 py-5 border-b border-[#e6e8ee] bg-white shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-sky-100">
              <MessageSquare className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#111827] leading-none">
                Intelligence <span className="text-sky-600">Hub</span>
              </h1>
              <div className="flex items-center gap-2 text-xs font-medium text-[#6b7280] mt-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                AI Online • 48 Sessions Indexed
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Workspace Selector */}
            <div className="relative">
              <button
                onClick={toggleWorkspaceDropdown}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-[#e5e7eb] text-sm font-semibold text-[#374151] hover:bg-slate-50 transition-colors"
              >
                <span>{selectedWorkspace.icon}</span>
                <span>{selectedWorkspace.name}</span>
                <ChevronDown className="w-4 h-4 text-[#9ca3af]" />
              </button>

              {showWorkspaceDropdown && workspaceDropdown}
            </div>

            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-[#e5e7eb] text-sm font-semibold text-[#374151] hover:bg-slate-50 transition-colors">
              <Clock className="w-4 h-4 text-[#6b7280]" />
              History
            </button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth custom-scrollbar bg-[#f7f8fb]">
        <div className="max-w-4xl mx-auto h-full">
          {messages.length === 0 ? (
            <ChatSuggestions 
              suggestions={DEFAULT_SUGGESTIONS} 
              onSuggestionClick={handleSuggestionClick}
              workspace={selectedWorkspace}
            />
          ) : (
            <ChatMessages messages={messages} isLoading={isLoading} />
          )}
        </div>
      </main>

      {/* Input Area */}
      <div className="shrink-0 bg-[#f7f8fb] border-t border-[#e6e8ee]">
        <ChatInput 
          chatInput={input} 
          onInputChange={handleInputChange} 
          onSendMessage={handleSendFromInput} 
          isLoading={isLoading}
          workspace={selectedWorkspace}
        />
      </div>
    </div>
  );
}
