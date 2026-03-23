"use client";

import MeetingHistoryPanel from "../MeetingHistoryPanel";

export default function HistoryPage() {
  return (
    <div className="min-h-screen px-4 py-5 md:px-6">
      <div className="mx-auto max-w-350 space-y-5">
        <div className="animate-fade-in rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Meeting History</h1>
          <p className="mt-1 text-sm text-slate-500">View past meetings and revisit their insights.</p>
        </div>

        <div className="animate-fade-in" style={{ animationDelay: "80ms" }}>
          <MeetingHistoryPanel />
        </div>
      </div>
    </div>
  );
}
