"use client";

import MeetingHistoryPanel from "../MeetingHistoryPanel";

export default function HistoryPage() {
    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Meeting History</h1>
                <p className="text-slate-600">View past meetings and their details</p>
            </div>

            <div className="grid gap-6">
                <MeetingHistoryPanel />
            </div>
        </div>
    );
}
