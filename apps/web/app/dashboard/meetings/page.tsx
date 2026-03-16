"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  Link as LinkIcon,
  Loader2,
  Play,
  Users,
  Video,
  Bot,
  FileText,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useZapStore } from "@/lib/store";
import type { Meeting } from "@/lib/store";

// Helper Functions
function formatMeetingDuration(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const m = Math.round((e.getTime() - s.getTime()) / 60000);
  return `${m} min`;
}

function getPlatformIcon(platform?: string) {
  switch (platform) {
    case "google_meet": return <Video size={16} className="text-green-600" />;
    case "zoom": return <Video size={16} className="text-blue-500" />;
    case "microsoft_teams": return <Video size={16} className="text-indigo-600" />;
    default: return <Video size={16} className="text-slate-500" />;
  }
}

export default function MeetingsPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  // Zustand global state
  const {
    upcomingMeetings,
    pastMeetings,
    isLoadingMeetings,
    setUpcomingMeetings,
    setPastMeetings,
    setLoadingMeetings
  } = useZapStore();

  useEffect(() => {
    async function fetchMeetings() {
      setLoadingMeetings(true);
      try {
        // Fetch upcoming
        const upRes = await fetch("/api/meetings/upcoming-recordings");
        if (upRes.ok) {
          const upData = await upRes.json();
          if (upData.success) setUpcomingMeetings(upData.data || []);
        }

        // Fetch past
        const pastRes = await fetch("/api/meetings");
        if (pastRes.ok) {
          const pastData = await pastRes.json();
          if (pastData.success) {
            const now = new Date();
            const all: Meeting[] = pastData.data || [];
            const pastM = all.filter(m => new Date(m.endTime) < now);
            setPastMeetings(pastM);
          }
        }
      } catch (err) {
        console.error("Error fetching meetings:", err);
      } finally {
        setLoadingMeetings(false);
      }
    }

    // Simple caching: fetch if lists are empty
    if (upcomingMeetings.length === 0 && pastMeetings.length === 0) {
      void fetchMeetings();
    }
  }, [setLoadingMeetings, setUpcomingMeetings, setPastMeetings, upcomingMeetings.length, pastMeetings.length]);

  return (
    <div className="min-h-screen px-4 py-5 md:px-6">
      <div className="mx-auto max-w-7xl space-y-5">
        
        {/* Header Section */}
        <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Meetings & Recordings</h1>
              <p className="mt-1 text-sm text-slate-500">Track upcoming calls and review completed sessions.</p>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              <Sparkles className="h-3.5 w-3.5" />
              User Dashboard View
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Upcoming</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{upcomingMeetings.length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Past</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{pastMeetings.length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Bots Active</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {upcomingMeetings.filter((m) => m.botScheduled).length}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Ready Transcripts</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {pastMeetings.filter((m) => m.transcriptReady).length}
              </p>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-semibold transition",
                activeTab === "upcoming"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              Upcoming Calls
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-semibold transition",
                activeTab === "past"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              Past Recordings
            </button>
          </div>
        </div>

        {/* Content Area */}
        {isLoadingMeetings ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-slate-500">
            <Loader2 className="mb-1 animate-spin" size={30} />
            <p className="text-sm font-medium">Loading your meetings...</p>
          </div>
        ) : activeTab === "upcoming" ? (
          <div className="space-y-4">
            {upcomingMeetings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
                <CalendarIcon size={42} className="mx-auto mb-4 text-slate-300" />
                <h3 className="mb-1 text-lg font-semibold text-slate-900">No Upcoming Meetings</h3>
                <p className="text-sm">You do not have scheduled meetings that require Zap Bot yet.</p>
              </div>
            ) : (
              upcomingMeetings.map((meeting) => (
                <article
                  key={meeting.id}
                  className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:flex-row md:items-center"
                >
                  <div className="shrink-0 md:w-48">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        {format(new Date(meeting.startTime), "MMM do")}
                      </p>
                      <p className="text-lg font-bold text-slate-900">
                        {format(new Date(meeting.startTime), "h:mm a")}
                      </p>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      {getPlatformIcon(meeting.platform)}
                      <h3 className="truncate text-lg font-semibold text-slate-900">{meeting.title}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={14} />
                        {formatMeetingDuration(meeting.startTime, meeting.endTime)}
                      </span>
                      {Array.isArray(meeting.participants) && meeting.participants.length > 0 && (
                        <span className="inline-flex items-center gap-1.5">
                          <Users size={14} />
                          {meeting.participants.length} Participant{meeting.participants.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col gap-3 md:items-end">
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-medium",
                      meeting.botScheduled 
                        ? "border border-blue-100 bg-blue-50 text-blue-600" 
                        : "border border-slate-200 bg-slate-50 text-slate-500"
                    )}>
                      <Bot size={14} />
                      {meeting.botScheduled ? "Bot Joining" : "Bot Disabled"}
                    </span>
                    {meeting.meetingUrl && (
                      <a
                        href={meeting.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                      >
                        <LinkIcon size={14} />
                        Join Call
                      </a>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {pastMeetings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
                <Video size={42} className="mx-auto mb-4 text-slate-300" />
                <h3 className="mb-1 text-lg font-semibold text-slate-900">No Past Recordings</h3>
                <p className="text-sm">Recordings and transcripts from Zap Bot will appear here.</p>
              </div>
            ) : (
              pastMeetings.map((meeting) => (
                <article
                  key={meeting.id}
                  className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:flex-row md:items-center"
                >
                  <div className="shrink-0 md:w-36">
                    <p className="text-sm font-medium text-slate-500">
                      {format(new Date(meeting.startTime), "MMM do, yyyy")}
                    </p>
                    <p className="text-sm text-slate-400">
                      {format(new Date(meeting.startTime), "h:mm a")}
                    </p>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="mb-2 truncate text-lg font-semibold text-slate-900">{meeting.title}</h3>
                    <div className="flex flex-wrap items-center gap-2.5">
                      {meeting.transcriptReady ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-green-200 bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                          <CheckCircle2 size={12} />
                          Transcribed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                          <Loader2 size={12} className="animate-spin" />
                          Processing
                        </span>
                      )}
                      {meeting.summary && (
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
                          <FileText size={12} />
                          Summary Ready
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex w-full shrink-0 flex-col gap-2 sm:flex-row md:w-auto">
                    {meeting.recordingUrl ? (
                      <a
                        href={meeting.recordingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
                      >
                        <Play size={14} />
                        Play
                      </a>
                    ) : (
                      <button disabled className="inline-flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-400">
                        <Play size={14} />
                        Play
                      </button>
                    )}
                    {meeting.transcriptReady && (
                      <a
                        href={`/dashboard/meetings/${meeting.id}`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                      >
                        <FileText size={14} />
                        View
                      </a>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}