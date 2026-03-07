import React from 'react'
import { Bot, User } from 'lucide-react'
import { Message } from '../hooks/useChatAll'

interface ChatMessagesProps {
    messages: Message[]
    isLoading: boolean
}

function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
    return (
        <div className='space-y-6 pb-4'>
            {messages.map((message) => (
                <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                    <div className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${message.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${message.isBot ? 'bg-gradient-to-br from-cyan-500 to-purple-600' : 'bg-white/10'}`}>
                            {message.isBot ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
                        </div>
                        <div className={`rounded-2xl p-4 text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${message.isBot
                            ? 'bg-[#1e1e21] border border-white/5 text-gray-200 rounded-tl-sm'
                            : 'bg-gradient-to-br from-cyan-600 to-purple-600 text-white rounded-tr-sm'
                            }`}>
                            {message.content}
                        </div>
                    </div>
                </div>
            ))}

            {isLoading && (
                <div className='flex justify-start'>
                    <div className='flex gap-3 max-w-[85%] md:max-w-[75%] flex-row'>
                        <div className='w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-cyan-500 to-purple-600'>
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className='bg-[#1e1e21] border border-white/5 rounded-2xl rounded-tl-sm p-4 text-sm text-gray-400 flex flex-col gap-2'>
                            <div className='flex items-center gap-2'>
                                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                            <span>Searching through all your meetings...</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ChatMessages
