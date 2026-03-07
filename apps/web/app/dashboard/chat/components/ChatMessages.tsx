import { Bot, User, Loader2 } from 'lucide-react';

export interface ChatMessage {
    id: string;
    content: string;
    isBot: boolean;
    timestamp: Date;
}

interface ChatMessagesProps {
    messages: ChatMessage[];
    isLoading: boolean;
}

export default function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
    return (
        <div className="space-y-6">
            {messages.map((message) => (
                <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                    <div className={`flex max-w-[85%] ${!message.isBot ? "flex-row-reverse" : "flex-row"} gap-3 items-start`}>
                        <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border ${!message.isBot ? "bg-white/10 border-white/20" : "bg-cyan-500/10 border-cyan-500/30"}`}>
                            {!message.isBot ? <User className="w-4 h-4 text-gray-300" /> : <Bot className="w-4 h-4 text-cyan-400" />}
                        </div>
                        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${!message.isBot ? "bg-gray-800 border border-gray-700 rounded-tr-sm text-gray-100" : "bg-white/5 border border-white/10 rounded-tl-sm text-gray-200"}`}>
                            {message.content}
                        </div>
                    </div>
                </div>
            ))}

            {isLoading && (
                <div className="flex justify-start">
                    <div className="flex gap-3 items-center">
                        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border bg-cyan-500/10 border-cyan-500/30">
                            <Bot className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Searching through your meetings...
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
