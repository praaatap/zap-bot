"use client";

import UpcomingRecordingPanel from "../UpcomingRecordingPanel";

export default function UpcomingPage() {
    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Upcoming Meetings</h1>
                <p className="text-slate-600">See all your upcoming scheduled meetings</p>
            </div>

            <div className="grid gap-6">
                <UpcomingRecordingPanel />
            </div>
        </div>
    );
}
