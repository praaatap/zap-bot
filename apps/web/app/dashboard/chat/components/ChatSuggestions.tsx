import { memo } from "react";
import { Sparkles, MessageSquare, Brain } from "lucide-react";

interface ChatSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

function ChatSuggestions({ suggestions, onSuggestionClick }: ChatSuggestionsProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-4xl mx-auto px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="text-center space-y-6 mb-12">
        <div className="relative inline-flex group">
          <div className="absolute -inset-4 bg-linear-to-r from-indigo-500/20 to-violet-500/20 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-700 opacity-50" />
          <div className="relative w-24 h-24 rounded-4xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-2xl shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 to-transparent animate-pulse" />
            <Brain className="w-10 h-10 text-indigo-400 relative z-10" />
          </div>
          <div className="absolute -top-2 -right-2 p-2 rounded-xl bg-violet-500 shadow-lg shadow-violet-500/25 animate-bounce-subtle">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Intelligence <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-violet-400">Hub</span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto leading-relaxed">
            Harness the power of AI to synthesize insights across your entire meeting history. What information can I retrieve for you today?
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="group relative p-6 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/8 hover:border-indigo-500/30 transition-all duration-500 text-left overflow-hidden backdrop-blur-sm"
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
              <MessageSquare className="w-12 h-12 text-indigo-400" />
            </div>
            
            <div className="flex items-center gap-4 mb-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                 <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-indigo-400 transition-colors">Query Suggestion</span>
            </div>
            
            <p className="text-[15px] font-bold text-zinc-300 group-hover:text-white transition-colors leading-relaxed line-clamp-2">
              {suggestion}
            </p>
          </button>
        ))}
      </div>
      
      <div className="mt-12 flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
        <span className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          Global Context
        </span>
        <span className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
          Instant Retrieval
        </span>
        <span className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
          End-to-End Encrypted
        </span>
      </div>
    </div>
  );
}

export default memo(ChatSuggestions);
