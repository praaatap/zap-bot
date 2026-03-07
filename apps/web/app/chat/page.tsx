'use client';

import React, { useEffect, useRef } from 'react';
import useChatAll from './hooks/useChatAll';
import ChatSuggestions from './components/ChatSuggestions';
import ChatMessages from './components/ChatMessages';
import ChatInput from './components/ChatInput';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

function Chat() {
    const {
        chatInput,
        messages,
        showSuggestions,
        isLoading,
        chatSuggestions,
        handleSendMessage,
        handleSuggestionClick,
        handleInputChange
    } = useChatAll();

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    return (
        <div className='min-h-screen bg-[#050510] flex flex-col selection:bg-cyan-500/30 font-sans'>

            {/* Header Navigation */}
            <header className="fixed top-0 inset-x-0 z-50 bg-black/70 backdrop-blur-xl border-b border-white/10 py-3 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center font-bold text-sm shadow-[0_0_15px_-3px_var(--tw-shadow-color)] shadow-cyan-500/50">
                            Z
                        </div>
                        <span className="font-semibold text-white tracking-tight">AI Assistant</span>
                    </div>
                    <div className="w-[124px]"></div> {/* Spacer for symmetry */}
                </div>
            </header>

            {/* Main Chat Area */}
            <main className='flex-1 flex flex-col pt-16'>
                <div className='flex-1 flex flex-col w-full'>
                    {/* Scrollable messages area */}
                    <div className='flex-1 overflow-y-auto w-full'>
                        <div className='max-w-4xl mx-auto w-full px-4 lg:px-8 pt-6 pb-2'>
                            {messages.length === 0 && showSuggestions ? (
                                <ChatSuggestions
                                    suggestions={chatSuggestions}
                                    onSuggestionClick={handleSuggestionClick}
                                />
                            ) : (
                                <ChatMessages
                                    messages={messages}
                                    isLoading={isLoading}
                                />
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Fixed input at bottom */}
                    <div className='w-full border-t border-white/10 bg-black/50 backdrop-blur-xl'>
                        <div className='max-w-5xl mx-auto w-full'>
                            <ChatInput
                                chatInput={chatInput}
                                onInputChange={handleInputChange}
                                onSendMessage={handleSendMessage}
                                isLoading={isLoading}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Chat;
