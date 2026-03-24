"use client";

import { useCallback, useRef, useState } from "react";
import { Brain, History } from "lucide-react";
import ChatInput from "./components/ChatInput";
import ChatMessages, { ChatMessage } from "./components/ChatMessages";
import ChatSuggestions from "./components/ChatSuggestions";

const DEFAULT_SUGGESTIONS = [
  "What were the key action items from all meetings this week?",
  "Summarize the recent discussions around the new Q3 roadmap.",
  "Did we decide on a vendor for the cloud migration?",
  "Who was assigned to the marketing campaign launch?"
];

export default function DashboardChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const nextMessageIdRef = useRef(1);

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
      // Simulation of AI processing across multiple meeting transcripts
      await new Promise(resolve => setTimeout(resolve, 2000));

      const botMsg: ChatMessage = {
        id: String(nextMessageIdRef.current++),
        content: "I analyzed 4 recent meeting transcripts. Key insights found: (1) The cloud migration vendor is narrowed down to AWS and Azure, with a final decision due Friday. (2) Sarah highlighted the need for improved API documentation by EOD. (3) Marketing launch is confirmed for October 15th.",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
  }, []);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    void handleSendMessage(suggestion);
  }, [handleSendMessage]);

  const handleSendFromInput = useCallback(() => {
    void handleSendMessage();
  }, [handleSendMessage]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#030303] text-white selection:bg-indigo-500/30 overflow-hidden relative">
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-500/10 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="px-8 py-5 border-b border-white/10 bg-white/5 backdrop-blur-2xl shrink-0 relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
              Intelligence <span className="text-indigo-400">Hub</span>
            </h1>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 mt-0.5">
              <span className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-emerald-500" /> AI Online</span>
              <span className="text-zinc-700">•</span>
              <span>48 Sessions Indexed</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
            <History className="w-4 h-4" />
            Chat History
          </button>
          <div className="px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/30">
            Pro Model
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth relative z-0 custom-scrollbar">
        <div className="max-w-4xl mx-auto h-full space-y-8">
          {messages.length === 0 ? (
            <ChatSuggestions
              suggestions={DEFAULT_SUGGESTIONS}
              onSuggestionClick={handleSuggestionClick}
            />
          ) : (
            <ChatMessages
              messages={messages}
              isLoading={isLoading}
            />
          )}
        </div>
      </main>

      {/* Input Area */}
      <div className="shrink-0 relative z-10">
        <ChatInput
          chatInput={input}
          onInputChange={handleInputChange}
          onSendMessage={handleSendFromInput}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
