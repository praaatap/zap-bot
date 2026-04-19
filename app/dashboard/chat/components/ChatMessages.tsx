import { memo, useEffect, useRef } from "react";
import { User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

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

const MessageRow = memo(function MessageRow({ message }: { message: ChatMessage }) {
  const isUser = !message.isBot;
  return (
    <div className={cn("flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("flex max-w-[85%] sm:max-w-[75%] gap-3 items-end", isUser ? "flex-row-reverse" : "flex-row")}>

        {/* Avatar */}
        <div className={cn(
          "shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-sm mb-1",
          isUser
            ? "bg-gradient-to-br from-sky-500 to-indigo-500"
            : "bg-white/80 backdrop-blur-sm border border-slate-200/80"
        )}>
          {isUser
            ? <User className="w-3.5 h-3.5 text-white" />
            : <Sparkles className="w-3.5 h-3.5 text-sky-500" />}
        </div>

        {/* Bubble + timestamp */}
        <div className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}>
          <div className={cn(
            "px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-gradient-to-br from-sky-500 to-indigo-500 text-white rounded-2xl rounded-br-sm shadow-md shadow-sky-200/50"
              : "bg-white/80 backdrop-blur-sm border border-slate-200/60 text-slate-800 rounded-2xl rounded-bl-sm shadow-sm"
          )}>
            {message.content}
          </div>
          <span className="text-[10px] font-medium text-slate-400 px-1">
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

      </div>
    </div>
  );
});

function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  return (
    <div className="space-y-5 py-6 pb-2">
      {messages.map(msg => <MessageRow key={msg.id} message={msg} />)}

      {/* Typing indicator */}
      {isLoading && (
        <div className="flex justify-start animate-in fade-in duration-300">
          <div className="flex gap-3 items-end">
            <div className="w-8 h-8 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/80 flex items-center justify-center shadow-sm mb-1">
              <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
            </div>
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}

export default memo(ChatMessages);