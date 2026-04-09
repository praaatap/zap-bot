"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  Loader2,
  Play,
  Video,
  ChevronRight,
  History,
  Monitor,
  Sparkles,
  Bot,
  Square,
  RefreshCw,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMeetingsPipeline } from "./hooks/useMeetingsPipeline";
import MeetingDialog from "@/components/MeetingDialog";

export default function MeetingsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {
    activeTab,
    currentList,
    isLoading,
    isProcessingMeetingId,
    isBotActionMeetingId,
    error,
    lastSyncedAt,
    setActiveTab,
    clearError,
    fetchMeetings,
    runAiPipeline,
    toggleMeetingBot,
    stopMeetingBot,
  } = useMeetingsPipeline();

  const syncedAtLabel = useMemo(() => {
    if (!lastSyncedAt) return "Never";
    return format(new Date(lastSyncedAt), "MMM d, h:mm a");
  }, [lastSyncedAt]);

  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-slate-50 text-slate-900 selection:bg-blue-500/30 font-sans">
      
      {/* BACKGROUND GRID */}
      <div className="absolute inset-0 z-0 opacity-40 [background-image:radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-12 space-y-10">
        
        {/* Header & Tabs */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-500">
              <Monitor size={14} strokeWidth={1.5} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Database</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Session <span className="text-slate-400">Archive</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDialogOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
            >
              <Plus size={16} />
              Schedule Bot
            </button>
            <div className="flex p-1 bg-white border border-slate-200 rounded-xl shadow-sm">
              {["upcoming", "past"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as "upcoming" | "past")}
                  className={cn(
                    "px-6 py-2 rounded-lg text-[12px] font-bold transition-all",
                    activeTab === tab
                      ? "bg-slate-100 text-slate-900 shadow-sm border border-slate-200/50"
                      : "text-slate-500 hover:text-slate-700 bg-transparent border border-transparent"
                  )}
                >
                  {tab === "upcoming" ? "Scheduled" : "Completed"}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-sm px-4 py-3 shadow-sm">
          <p className="text-[12px] font-semibold text-slate-500">
            Last Sync: <span className="text-slate-800">{syncedAtLabel}</span>
          </p>
          <button
            onClick={() => void fetchMeetings()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-sm"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50/50 px-4 py-3 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-red-600">{error}</p>
            <button onClick={clearError} className="text-xs font-bold text-red-500 hover:text-red-700 bg-white px-2 py-1 rounded-md border border-red-100 shadow-sm">
              Dismiss
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-slate-500">
              <Loader2 className="animate-spin text-blue-600" size={28} strokeWidth={2} />
              <p className="text-[12px] font-bold uppercase tracking-wider">Syncing session history...</p>
            </div>
          ) : currentList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center rounded-3xl border border-dashed border-slate-300 bg-white/50">
              <History className="text-slate-400 mb-4" size={40} strokeWidth={1.5} />
              <p className="text-sm font-medium text-slate-500">No session data found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentList.map((meeting) => (
                <article
                  key={meeting.id}
                  className="group flex flex-col bg-white border border-slate-200 rounded-[24px] p-6 transition-all duration-300 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/50 ring-1 ring-slate-900/5"
                >
                  <div className="flex items-start justify-between mb-8">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                      <Video size={18} strokeWidth={1.5} />
                    </div>
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border transition-colors shadow-sm",
                      meeting.botScheduled || meeting.transcriptReady
                        ? "bg-blue-50 text-blue-700 border-blue-100"
                        : "bg-slate-50 text-slate-600 border-slate-200"
                    )}>
                      {activeTab === "upcoming" 
                        ? (meeting.botScheduled ? "Bot Active" : "Manual") 
                        : (meeting.transcriptReady ? "Neural Linked" : "Raw Data")}
                    </span>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-900 transition-colors">
                        {meeting.title || "Internal Sync"}
                      </h3>
                      <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                        <span className="flex items-center gap-1.5"><CalendarIcon size={14} strokeWidth={1.5} className="text-slate-400" /> {format(new Date(meeting.startTime), "MMM do")}</span>
                        <span className="flex items-center gap-1.5"><Clock size={14} strokeWidth={1.5} className="text-slate-400" /> {format(new Date(meeting.startTime), "h:mm a")}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                      <div className="flex -space-x-1.5">
                        {(meeting.participants || ["U"]).slice(0, 3).map((p, i) => (
                          <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase shadow-sm">
                            {p[0]}
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Participants</span>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center gap-2">
                    {activeTab === "upcoming" ? (
                      <>
                        {meeting.meetingUrl ? (
                          <a
                            href={meeting.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white text-[12px] font-bold shadow-sm transition-transform active:scale-95 hover:bg-slate-800"
                          >
                            Join Session
                          </a>
                        ) : (
                          <div className="flex-1 h-10 flex items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-[12px] font-bold text-slate-400">
                            No Link
                          </div>
                        )}

                        {meeting.botSent ? (
                          <button
                            onClick={() => void stopMeetingBot(meeting.id)}
                            disabled={isBotActionMeetingId === meeting.id}
                            className="h-10 px-3 inline-flex items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-100 shadow-sm text-[12px] font-bold hover:bg-red-100 disabled:opacity-50 transition-colors"
                          >
                            {isBotActionMeetingId === meeting.id ? <Loader2 size={16} className="animate-spin" /> : <Square size={14} fill="currentColor" />}
                          </button>
                        ) : (
                          <button
                            onClick={() => void toggleMeetingBot(meeting.id, true)}
                            disabled={isBotActionMeetingId === meeting.id}
                            className="h-10 px-3 inline-flex items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20 text-[12px] font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                          >
                            {isBotActionMeetingId === meeting.id ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />}
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        {meeting.recordingUrl ? (
                          <a
                            href={meeting.recordingUrl}
                            className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white text-[12px] font-bold shadow-sm transition-transform active:scale-95 hover:bg-slate-800"
                          >
                            <Play size={14} fill="currentColor" strokeWidth={0} /> Playback
                          </a>
                        ) : (
                          <button
                            onClick={() => void runAiPipeline(meeting.id)}
                            disabled={isProcessingMeetingId === meeting.id}
                            className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-[12px] font-bold shadow-sm hover:bg-slate-200 disabled:opacity-50 transition-all"
                          >
                            {isProcessingMeetingId === meeting.id ? (
                              <>
                                <Loader2 size={14} className="animate-spin text-blue-600" /> Running
                              </>
                            ) : (
                              <>
                                <Sparkles size={14} className="text-blue-600" /> Run AI
                              </>
                            )}
                          </button>
                        )}
                        
                        {meeting.transcriptReady && (
                          <a
                            href={`/dashboard/meetings/${meeting.id}`}
                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-90"
                          >
                            <ChevronRight size={20} />
                          </a>
                        )}
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Meeting Dialog */}
      <MeetingDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={() => {
          void fetchMeetings();
        }}
      />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}