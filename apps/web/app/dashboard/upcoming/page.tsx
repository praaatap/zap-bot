"use client";

import Link from "next/link";
import { CalendarCheck2, Sparkles } from "lucide-react";
import UpcomingRecordingPanel from "../UpcomingRecordingPanel";

export default function UpcomingPage() {
    return (
        <div className="min-h-screen px-4 py-5 md:px-6">
            <div className="mx-auto max-w-350 space-y-5">
                <div className="animate-fade-in rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-900">
                                <CalendarCheck2 className="h-7 w-7 text-indigo-600" />
                                Upcoming Meetings
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">See all your upcoming scheduled meetings.</p>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                            <Sparkles className="h-3.5 w-3.5" />
                            Live Sync
                        </span>
                    </div>
                </div>

                <div className="animate-fade-in grid grid-cols-1 gap-3 md:grid-cols-3" style={{ animationDelay: "50ms" }}>
                    <Link href="/dashboard/calendar" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                        Open Calendar
                    </Link>
                    <Link href="/dashboard/meetings" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                        Manage Meetings
                    </Link>
                    <Link href="/dashboard" className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
                        Back to Dashboard
                    </Link>
                </div>

                <div className="animate-fade-in" style={{ animationDelay: "80ms" }}>
                    <UpcomingRecordingPanel />
                </div>
            </div>
        </div>
    );
}
