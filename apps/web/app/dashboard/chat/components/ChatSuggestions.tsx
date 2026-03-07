import { Sparkles } from "lucide-react";

interface ChatSuggestionsProps {
    suggestions: string[];
    onSuggestionClick: (suggestion: string) => void;
}

export default function ChatSuggestions({ suggestions, onSuggestionClick }: ChatSuggestionsProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full max-w-3xl mx-auto space-y-10 animate-in fade-in duration-500">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-white/10 mb-2">
                    <Sparkles className="w-8 h-8 text-cyan-400" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-100">
                    Ask Zap Bot about your meetings
                </h2>
                <p className="text-gray-400 max-w-lg mx-auto">
                    I can search across all your recorded meetings to find information, summarize recurring themes, and retrieve key decisions.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {suggestions.map((suggestion, index) => (
                    <button
                        key={index}
                        onClick={() => onSuggestionClick(suggestion)}
                        className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-cyan-500/30 transition-all text-left group"
                    >
                        <p className="text-sm text-gray-300 group-hover:text-cyan-400 transition-colors line-clamp-2">
                            {suggestion}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
}
