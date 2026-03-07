"use client";

import { useState } from "react";
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

    const handleSendMessage = async (text: string = input) => {
        if (!text.trim() || isLoading) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            content: text,
            isBot: false,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            // In a real app, this would call /api/chat/all
            // For now, we simulate a network delay and a mock response
            await new Promise(resolve => setTimeout(resolve, 1500));

            const botMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                content: "I searched through your meetings. Based on recent transcripts, the key action items are: 1. Sarah is finalizing the API docs. 2. David is scheduling the vendor review. (Mock Response)",
                isBot: true,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("Chat error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] bg-[#050510] text-gray-100">
            {/* Header */}
            <header className="px-6 py-4 border-b border-white/10 bg-[#0a0b0f] shrink-0">
                <h1 className="text-xl font-semibold">Global Knowledge Base</h1>
                <p className="text-sm text-gray-400">Search and chat across all your recorded meetings</p>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
                <div className="max-w-4xl mx-auto h-full">
                    {messages.length === 0 ? (
                        <ChatSuggestions
                            suggestions={DEFAULT_SUGGESTIONS}
                            onSuggestionClick={handleSendMessage}
                        />
                    ) : (
                        <ChatMessages
                            messages={messages}
                            isLoading={isLoading}
                        />
                    )}
                </div>
            </div>

            {/* Input Area */}
            <div className="shrink-0">
                <ChatInput
                    chatInput={input}
                    onInputChange={setInput}
                    onSendMessage={() => handleSendMessage()}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}
