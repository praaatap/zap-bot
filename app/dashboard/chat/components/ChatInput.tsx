import { memo } from "react";
import { Send, Command } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  chatInput: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
}

function ChatInput({ chatInput, onInputChange, onSendMessage, isLoading }: ChatInputProps) {
  return (
    <div className="px-6 pb-8 pt-2">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-center bg-white border border-slate-200 shadow-sm rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-slate-100 focus-within:border-slate-300 transition-all">
          
          <div className="pl-3 pr-2 text-slate-400">
            <Command className="w-5 h-5" />
          </div>
          
          <input
            type="text"
            value={chatInput}
            onChange={e => onInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
            placeholder="Ask anything about your meetings..."
            className="flex-1 bg-transparent py-3 px-2 text-slate-900 placeholder:text-slate-400 focus:outline-none text-sm font-medium"
            disabled={isLoading}
          />
          
          <button
            onClick={onSendMessage}
            disabled={isLoading || !chatInput.trim()}
            className={cn(
              "flex items-center justify-center p-2.5 rounded-lg transition-all duration-200 ml-2",
              chatInput.trim() && !isLoading
                ? "bg-slate-900 text-white shadow-sm hover:bg-slate-800 active:scale-95"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        <div className="mt-2.5 flex justify-center gap-4 text-xs font-medium text-slate-400">
          <span>Press <kbd className="font-sans px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] mx-1">Enter</kbd> to send</span>
        </div>
      </div>
    </div>
  );
}

export default memo(ChatInput);