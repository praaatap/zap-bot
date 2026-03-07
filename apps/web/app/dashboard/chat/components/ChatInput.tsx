import { Send } from 'lucide-react';

interface ChatInputProps {
    chatInput: string;
    onInputChange: (value: string) => void;
    onSendMessage: () => void;
    isLoading: boolean;
}

export default function ChatInput({
    chatInput,
    onInputChange,
    onSendMessage,
    isLoading
}: ChatInputProps) {
    return (
        <div className="p-4 md:p-6 bg-[#0a0b0f] border-t border-white/10">
            <div className="flex gap-3 max-w-4xl mx-auto relative">
                <input
                    type="text"
                    value={chatInput}
                    onChange={e => onInputChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
                    placeholder="Ask about multiple meetings, deadlines, decisions, or action items..."
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 focus:border-cyan-500/50 rounded-2xl py-3.5 pl-5 pr-14 text-gray-100 placeholder:text-gray-500 focus:outline-none transition-all"
                    disabled={isLoading}
                />
                <button
                    onClick={onSendMessage}
                    disabled={isLoading || !chatInput.trim()}
                    className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 disabled:bg-white/5 disabled:text-gray-500 text-white rounded-xl transition-colors"
                >
                    <Send className="w-4 h-4 text-current" />
                </button>
            </div>
        </div>
    );
}
