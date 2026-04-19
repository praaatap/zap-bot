import { memo } from "react";
import { Sparkles, ArrowRight } from "lucide-react";

interface ChatSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  workspace?: { id: string; name: string; icon: string };
}

function ChatSuggestions({ suggestions, onSuggestionClick, workspace }: ChatSuggestionsProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] max-w-3xl mx-auto px-4">

      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 shadow-lg shadow-sky-200/60 mb-5">
          <Sparkles className="w-6 h-6 text-white" />
        </div>

        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight leading-tight">
          How can AI assist{" "}
          <span className="bg-gradient-to-r from-sky-500 to-indigo-500 bg-clip-text text-transparent">
            you today?
          </span>
        </h2>
        <p className="text-slate-500 text-base max-w-lg mx-auto leading-relaxed">
          Search through your meeting history, extract action items, or summarize complex discussions instantly.
        </p>

        {/* Workspace scope pill — only shown when a specific workspace is active */}
        {workspace && workspace.id !== "all" && (
          <div className="inline-flex items-center gap-2 mt-4 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-sky-100 shadow-sm text-xs font-semibold text-sky-600">
            <span>{workspace.icon}</span>
            <span>Scoped to {workspace.name}</span>
          </div>
        )}
      </div>

      {/* Suggestion cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 w-full">
        {suggestions.map((suggestion, i) => (
          <button
            key={i}
            onClick={() => onSuggestionClick(suggestion)}
            className="group relative p-5 rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-sm
                       hover:border-sky-200 hover:bg-white/90 hover:shadow-lg hover:shadow-sky-100/40
                       transition-all duration-200 text-left flex flex-col gap-3 overflow-hidden"
          >
            {/* Hover tint overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-sky-50/0 to-indigo-50/0 group-hover:from-sky-50/50 group-hover:to-indigo-50/30 rounded-2xl transition-all duration-200 pointer-events-none" />

            {/* Badge */}
            <div className="relative flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sky-50 group-hover:bg-sky-100 transition-colors">
                <Sparkles className="w-3 h-3 text-sky-500" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-sky-500 transition-colors">
                Suggestion
              </span>
            </div>

            {/* Text */}
            <p className="relative text-sm font-medium text-slate-600 group-hover:text-slate-900 leading-relaxed">
              {suggestion}
            </p>

            {/* CTA */}
            <div className="relative flex items-center gap-1 text-[11px] font-semibold text-slate-300 group-hover:text-sky-500 transition-all duration-200">
              <span>Ask this</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-200" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default memo(ChatSuggestions);