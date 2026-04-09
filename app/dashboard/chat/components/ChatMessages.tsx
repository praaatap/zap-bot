import { memo, useEffect, useRef } from "react";
import { User, Bot } from "lucide-react";
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
    <div className={cn("flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300", message.isBot ? "justify-start" : "justify-end")}>
      <div className={cn("flex max-w-[85%] sm:max-w-[75%] gap-4 items-end", !message.isBot ? "flex-row-reverse" : "flex-row")}>
        
        {/* Avatar */}
        <div className={cn(
          "shrink-0 w-8 h-8 rounded-full flex items-center justify-center border shadow-sm mb-1",
          !message.isBot ? "bg-slate-900 border-slate-900" : "bg-white border-slate-200"
        )}>
          {!message.isBot ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-slate-700" />
          )}
        </div>

        {/* Message Bubble */}
        <div className="flex flex-col gap-1">
          <div className={cn(
            "px-5 py-3.5 text-sm leading-relaxed shadow-sm",
            !message.isBot
              ? "bg-slate-900 text-white rounded-2xl rounded-br-sm"
              : "bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-sm"
          )}>
            {message.content}
          </div>
          <span className={cn(
            "text-[10px] font-medium text-slate-400 px-1",
            !message.isBot ? "text-right" : "text-left"
          )}>
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
    <div className="space-y-6 py-6 pb-2">
      {messages.map((message) => (
        <MessageRow key={message.id} message={message} />
      ))}

      {isLoading && (
        <div className="flex justify-start animate-in fade-in duration-300">
          <div className="flex gap-4 items-end">
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm mb-1">
               <Bot className="w-4 h-4 text-slate-400" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm flex items-center gap-1.5 h-[52px]">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
            </div>
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}

export default memo(ChatMessages);