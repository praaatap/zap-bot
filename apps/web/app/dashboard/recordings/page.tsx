"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Clock,
  Calendar,
  Video,
  Loader2,
  History,
  Play,
  Search,
  MoreVertical,
  Download,
  Share2,
  Sparkles,
  ChevronRight,
  Maximize2,
  MessageSquare,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type Recording = {
  id: string;
  title: string;
  startTime: string;
  endTime?: string;
  platform?: string;
  summary?: string;
  transcriptReady?: boolean;
  recordingUrl?: string;
  participants?: string[];
  thumbnailUrl?: string;
  duration?: string;
};

export default function RecordingsPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecordings() {
      try {
        const res = await fetch("/api/meetings");
        const data = await res.json();
        if (data.success) {
          const past = (data.data || []).filter((m: any) => m.recordingUrl || new Date(m.startTime) < new Date());
          setRecordings(past);
          if (past.length > 0 && !selectedId) {
            setSelectedId(past[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch recordings:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRecordings();
  }, [selectedId]);

  const filteredRecordings = useMemo(() => 
    recordings.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase())),
    [recordings, searchQuery]
  );

  const selectedRecording = useMemo(() => 
    recordings.find(r => r.id === selectedId),
    [recordings, selectedId]
  );

  return (
    <div className="h-[calc(100vh-64px)] bg-[#030303] text-white overflow-hidden flex flex-col">
      {/* Top Header - Compact */}
      <header className="px-6 py-4 border-b border-white/5 flex items-center justify-between gap-4 shrink-0 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
            <Sparkles size={18} />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">
            RECORDINGS <span className="text-blue-400">VAULT</span>
          </h1>
        </div>

        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search vault..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500/40"
          />
        </div>
      </header>

      {/* Main Content Area - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: List of Recordings */}
        <div className="w-full md:w-80 lg:w-96 border-r border-white/5 flex flex-col bg-white/[0.02]">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Syncing Vault...</p>
              </div>
            ) : filteredRecordings.length === 0 ? (
              <div className="text-center py-20 px-6">
                <p className="text-zinc-500 text-sm font-medium italic">Zero coordinates match your query.</p>
              </div>
            ) : (
              filteredRecordings.map((rec) => (
                <button
                  key={rec.id}
                  onClick={() => setSelectedId(rec.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-3 group",
                    selectedId === rec.id
                      ? "bg-blue-600/10 border-blue-500/30 ring-1 ring-blue-500/10"
                      : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className={cn(
                      "text-sm font-black truncate flex-1 uppercase tracking-tight",
                      selectedId === rec.id ? "text-blue-400" : "text-zinc-200"
                    )}>
                      {rec.title}
                    </h3>
                    <div className="text-[9px] font-black text-zinc-600 uppercase">
                      {new Date(rec.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    <div className="flex items-center gap-1.5">
                      <Clock size={10} className="text-blue-500" />
                      {rec.duration || "45m"}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Video size={10} className="text-blue-500" />
                      {rec.platform || "Vid"}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Detailed View */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-black p-6 lg:p-10">
          <AnimatePresence mode="wait">
            {!selectedRecording ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="w-20 h-20 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center text-zinc-700">
                  <History size={40} />
                </div>
                <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">Initialize session selection to view intelligence</p>
              </motion.div>
            ) : (
              <motion.div
                key={selectedRecording.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto space-y-10"
              >
                {/* Hero Detail Section */}
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="px-3 py-1 rounded-full bg-blue-600 text-[10px] font-black uppercase tracking-widest text-white">
                          {selectedRecording.platform || "Standard"}
                        </div>
                        <div className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                          selectedRecording.transcriptReady 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        )}>
                          {selectedRecording.transcriptReady ? "AI PROCESSED" : "PROCESSING..."}
                        </div>
                      </div>
                      <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-tight">
                        {selectedRecording.title}
                      </h2>
                      <div className="flex items-center gap-6 text-[11px] font-black uppercase tracking-widest text-zinc-500">
                        <span className="flex items-center gap-2">
                          <Calendar size={14} className="text-blue-500" />
                          {new Date(selectedRecording.startTime).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock size={14} className="text-blue-500" />
                          {new Date(selectedRecording.startTime).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/20">
                        <Play size={14} /> PLAY
                      </button>
                      <button className="p-3 rounded-xl bg-white/5 border border-white/10 text-zinc-400">
                        <Download size={16} />
                      </button>
                      <button className="p-3 rounded-xl bg-white/5 border border-white/10 text-zinc-400">
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Video Mockup / Placeholder */}
                  <div className="relative aspect-video rounded-[40px] overflow-hidden border border-white/10 bg-zinc-900 group">
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-blue-600/90 flex items-center justify-center shadow-2xl scale-95 group-hover:scale-100 transition-transform">
                        <Play size={32} className="text-white fill-current ml-1" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Summary Section */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-black uppercase tracking-tighter italic flex items-center gap-3">
                      <MessageSquare size={18} className="text-blue-400" /> AI Executive Summary
                    </h3>
                    <div className="p-8 rounded-[32px] bg-white/[0.03] border border-white/5 space-y-4">
                      <p className="text-zinc-400 text-sm leading-relaxed italic font-medium">
                        "{selectedRecording.summary || "The neural engines are currently distilling the core insights from this session. Check back shortly for the optimized summary."}"
                      </p>
                    </div>
                  </div>

                  {/* Metadata / Participants */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-black uppercase tracking-tighter italic flex items-center gap-3">
                      <FileText size={18} className="text-blue-400" /> Intelligence Data
                    </h3>
                    <div className="p-8 rounded-[32px] bg-white/[0.03] border border-white/5 space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Platform Payload</label>
                        <p className="text-white font-black text-sm uppercase">{selectedRecording.platform || "General Video Session"}</p>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest pl-1">Identified Signals</label>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {(selectedRecording.participants || ["User"]).map((p, i) => (
                            <div key={i} className="px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400">
                              {p}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
