import { memo } from "react";
import { Sparkles } from "lucide-react";

interface ChatSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

function ChatSuggestions({ suggestions, onSuggestionClick }: ChatSuggestionsProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] max-w-3xl mx-auto px-4">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 tracking-tight">
          How can AI assist you today?
        </h2>
        <p className="text-slate-500 text-base max-w-xl mx-auto">
          Search through your meeting history, extract action items, or summarize complex discussions instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="group p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all duration-200 text-left flex flex-col gap-3"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Suggestion
              </span>
            </div>
            <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900 leading-relaxed">
              {suggestion}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default memo(ChatSuggestions);