import { memo } from "react";
import { Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Workspace = {
  id: string;
  name: string;
  icon: string;
};

interface ChatInputProps {
  chatInput: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  workspace: Workspace;
}

// Rule: rerender-memo - Already wrapped with memo to prevent unnecessary re-renders
function ChatInput({ chatInput, onInputChange, onSendMessage, isLoading, workspace }: ChatInputProps) {
  return (
    <div className="px-6 pb-6 pt-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-center bg-white border border-[#e6e8ee] shadow-sm rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-sky-100 focus-within:border-sky-300 transition-all">

          <div className="pl-3 pr-2 text-[#6b7280]">
            <Sparkles className="w-5 h-5 text-sky-600" />
          </div>

          <input
            type="text"
            value={chatInput}
            onChange={e => onInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
            placeholder={`Ask anything about ${workspace.name.toLowerCase()}...`}
            className="flex-1 bg-transparent py-3 px-2 text-[#111827] placeholder:text-[#9ca3af] focus:outline-none text-sm font-medium"
            disabled={isLoading}
          />

          <button
            onClick={onSendMessage}
            disabled={isLoading || !chatInput.trim()}
            className={cn(
              "flex items-center justify-center p-2.5 rounded-lg transition-all duration-200 ml-2",
              chatInput.trim() && !isLoading
                ? "bg-[#1f2937] text-white shadow-sm hover:bg-[#111827] active:scale-95"
                : "bg-slate-100 text-[#9ca3af] cursor-not-allowed"
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-2.5 flex justify-center gap-4 text-xs font-medium text-[#9ca3af]">
          <span>Press <kbd className="font-sans px-1.5 py-0.5 bg-white border border-[#e6e8ee] rounded text-[10px] mx-1">Enter</kbd> to send</span>
          <span className="text-[#6b7280]">•</span>
          <span>AI-Powered Synthesis</span>
        </div>
      </div>
    </div>
  );
}

export default memo(ChatInput);
