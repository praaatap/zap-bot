import { memo } from "react";
import { Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  chatInput: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
}

function ChatInput({
  chatInput,
  onInputChange,
  onSendMessage,
  isLoading
}: ChatInputProps) {
  return (
    <div className="p-6 md:p-8 bg-linear-to-t from-[#030303] to-transparent">
      <div className="max-w-4xl mx-auto relative group">
        {/* Animated border glow */}
        <div className="absolute -inset-0.5 bg-linear-to-r from-indigo-500/20 to-violet-500/20 rounded-[22px] blur opacity-0 group-focus-within:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        
        <div className="relative flex items-center gap-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[20px] p-2 transition-all duration-300 group-focus-within:border-indigo-500/30 group-focus-within:bg-white/8">
          <div className="pl-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
            <Sparkles className="w-5 h-5" />
          </div>
          
          <input
            type="text"
            value={chatInput}
            onChange={e => onInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
            placeholder="Ask anything about your meetings..."
            className="flex-1 bg-transparent py-4 px-2 text-white placeholder:text-zinc-600 focus:outline-none text-base"
            disabled={isLoading}
          />
          
          <button
            onClick={onSendMessage}
            disabled={isLoading || !chatInput.trim()}
            className={cn(
              "flex items-center justify-center p-3 rounded-xl transition-all duration-300",
              chatInput.trim() && !isLoading
                ? "bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 scale-100 hover:scale-105 active:scale-95"
                : "bg-white/5 text-zinc-600 scale-95"
            )}
          >
            <Send className={cn("w-5 h-5", chatInput.trim() && "animate-pulse-subtle")} />
          </button>
        </div>
        
        <div className="mt-3 flex justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
          <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-indigo-500/50" /> Press Enter to send</span>
          <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-violet-500/50" /> AI-Powered Synthesis</span>
        </div>
      </div>
    </div>
  );
}

export default memo(ChatInput);
