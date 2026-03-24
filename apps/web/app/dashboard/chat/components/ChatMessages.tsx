import { memo, useEffect, useRef } from "react";
import { User, Sparkles, BrainCircuit } from "lucide-react";
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
  return (
    <div
      className={cn(
        "flex animate-in fade-in slide-in-from-bottom-4 duration-500",
        message.isBot ? "justify-start" : "justify-end"
      )}
    >
      <div className={cn(
        "flex max-w-[85%] sm:max-w-[75%] gap-4 items-start",
        !message.isBot ? "flex-row-reverse" : "flex-row"
      )}>
        <div className={cn(
          "shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center border backdrop-blur-xl relative overflow-hidden group",
          !message.isBot
            ? "bg-zinc-800 border-white/10"
            : "bg-indigo-500/10 border-indigo-500/30 ring-4 ring-indigo-500/5"
        )}>
          {message.isBot && <div className="absolute inset-0 bg-linear-to-br from-indigo-500/20 to-violet-500/20 animate-pulse" />}
          {!message.isBot ? (
            <User className="w-5 h-5 text-zinc-400" />
          ) : (
            <BrainCircuit className="w-5 h-5 text-indigo-400 relative z-10" />
          )}
        </div>

        <div className="space-y-2">
          <div className={cn(
            "px-6 py-4 rounded-3xl text-[15px] leading-relaxed relative overflow-hidden",
            !message.isBot
              ? "bg-indigo-600 text-white rounded-tr-sm shadow-xl shadow-indigo-500/10"
              : "bg-white/5 border border-white/10 text-zinc-200 rounded-tl-sm backdrop-blur-xl"
          )}>
            {message.isBot && (
              <div className="absolute top-0 left-0 w-1 h-full bg-linear-to-b from-indigo-500 to-violet-500 opacity-50" />
            )}
            {message.content}
          </div>

          <div className={cn(
            "flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600 px-2",
            !message.isBot ? "justify-end" : "justify-start"
          )}>
            {message.isBot && <Sparkles className="w-3 h-3 text-indigo-500/50" />}
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            {!message.isBot && <span className="text-zinc-500">Sent by you</span>}
          </div>
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
    <div className="space-y-10 py-8">
      {messages.map((message) => (
        <MessageRow key={message.id} message={message} />
      ))}

      {isLoading && (
        <div className="flex justify-start animate-in fade-in duration-300">
          <div className="flex gap-4 items-center">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-linear-to-br from-indigo-500/20 to-violet-500/20 animate-spin-slow" />
               <BrainCircuit className="w-5 h-5 text-indigo-400 relative z-10 animate-pulse" />
            </div>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-6 py-4 backdrop-blur-xl">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
              </div>
              <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Synthesizing intelligence...</span>
            </div>
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}

export default memo(ChatMessages);
