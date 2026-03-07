import { useState, useEffect } from 'react';

export interface Message {
    id: string;
    content: string;
    isBot: boolean;
    timestamp: Date;
}

const chatSuggestions = [
    "What were the key decisions made in yesterday's product meeting?",
    "Summarize the action items from last week's standup",
    "Who attended the client presentation on Monday?",
    "What deadlines were discussed in recent meetings?",
    "Generate a follow-up email for the marketing meeting",
    "What feedback was given about the new feature?"
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function useChatAll() {
    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);

    const handleInputChange = (value: string) => {
        setChatInput(value);
    };

    const handleSendMessage = async (overrideText?: string) => {
        const textToSend = overrideText || chatInput;
        if (!textToSend.trim() || isLoading) return;

        setChatInput('');
        setShowSuggestions(false);

        const newUserMsg: Message = {
            id: Date.now().toString(),
            content: textToSend,
            isBot: false,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newUserMsg]);
        setIsLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/chat/all`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: textToSend })
            });

            const json = await res.json();

            const newBotMsg: Message = {
                id: (Date.now() + 1).toString(),
                content: json.success ? json.answer : "I encountered an error searching your meetings.",
                isBot: true,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, newBotMsg]);
        } catch (error) {
            console.error(error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                content: "I'm sorry, I encountered an error searching your meetings. Please try again.",
                isBot: true,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        handleSendMessage(suggestion);
    };

    return {
        chatInput,
        messages,
        showSuggestions,
        isLoading,
        chatSuggestions,
        handleSendMessage,
        handleSuggestionClick,
        handleInputChange
    };
}
