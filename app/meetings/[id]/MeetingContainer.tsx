"use client";

import { useState } from "react";
import AudioPlayer from "./AudioPlayer";
import { MeetingTabs } from "./MeetingTabs";

export default function MeetingContainer({
    meeting,
    transcript,
    meetingId,
    formatTimestamp,
    getInitials
}: {
    meeting: any;
    transcript: any;
    meetingId: string;
    formatTimestamp: (s: number) => string;
    getInitials: (n: string) => string;
}) {
    const handleSeek = (seconds: number) => {
        const audio = document.querySelector('audio');
        if (audio) {
            audio.currentTime = seconds;
            audio.play().catch(() => { }); // catch to avoid error if no source loaded
        }
    };

    return (
        <div className="flex-1 w-full min-w-0">
            {meeting.recordingUrl && (
                <AudioPlayer
                    url={meeting.recordingUrl as string}
                    chapters={meeting.chapters}
                />
            )}
            <MeetingTabs
                meeting={meeting}
                transcript={transcript}
                formatTimestamp={formatTimestamp}
                getInitials={getInitials}
                meetingId={meetingId}
                onSeek={handleSeek}
            />
        </div>
    );
}
